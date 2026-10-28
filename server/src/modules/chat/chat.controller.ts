import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { DataStoreService } from '../../database/data-store.service';
import { IcebreakerAdapterService } from '../../adapters/icebreaker.adapter';
import { PushAdapterService } from '../../adapters/push.adapter';
import { ChatGateway } from './chat.gateway';
import {
  ActivePet,
  CurrentUser,
} from '../../common/decorators/current-user.decorator';
import { DomainException } from '../../common/errors';
import { BUSINESS_RULES } from '../../config/business-rules';
import { PetRecord, UserRecord } from '../../database/types';

@Controller('chat')
export class ChatController {
  constructor(
    private readonly dataStore: DataStoreService,
    private readonly chatGateway: ChatGateway,
    private readonly icebreakerAdapter: IcebreakerAdapterService,
    private readonly pushAdapter: PushAdapterService,
  ) {}

  @Get('rooms')
  getChatRooms(@CurrentUser() user: UserRecord) {
    const myPetIds = new Set(
      this.dataStore.pets.filter((p) => p.userId === user.id).map((p) => p.id),
    );

    return this.dataStore.chatRooms
      .filter((r) => myPetIds.has(r.petAId) || myPetIds.has(r.petBId))
      .map((room) => {
        const partnerPetId = myPetIds.has(room.petAId)
          ? room.petBId
          : room.petAId;
        const partnerPet = this.dataStore.pets.find(
          (p) => p.id === partnerPetId,
        );
        if (
          partnerPet &&
          this.dataStore.isBlockedEitherWay(user.id, partnerPet.userId)
        ) {
          return null;
        }

        const unreadCount = this.dataStore.chatMessages.filter(
          (m) =>
            m.roomId === room.id &&
            !myPetIds.has(m.senderPetId) &&
            !m.isRead,
        ).length;

        const activeAppointment =
          this.dataStore.appointments
            .filter((a) => a.roomId === room.id)
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            )[0] || null;

        return {
          id: room.id,
          petAId: room.petAId,
          petBId: room.petBId,
          targetPet: partnerPet || null,
          lastMessage:
            room.lastMessageText ||
            'Hai Boss vừa tương hợp! Nhắn tin làm quen ngay 🐾',
          lastMessageText: room.lastMessageText,
          lastMessageAt: room.lastMessageAt,
          updatedAt: room.lastMessageAt || room.createdAt,
          unreadCount,
          activeAppointment,
        };
      })
      .filter(Boolean);
  }

  @Get('rooms/:roomId/messages')
  getRoomMessages(
    @CurrentUser() user: UserRecord,
    @Param('roomId') roomId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const myPetIds = new Set(
      this.dataStore.pets.filter((p) => p.userId === user.id).map((p) => p.id),
    );

    const messages = this.dataStore.chatMessages
      .filter((m) => m.roomId === roomId)
      .map((m) => {
        const senderPet = this.dataStore.pets.find(
          (p) => p.id === m.senderPetId,
        );
        const appointment = m.appointmentId
          ? this.dataStore.appointments.find((a) => a.id === m.appointmentId) ||
            null
          : null;
        return {
          ...m,
          senderName: senderPet?.name || 'Boss',
          senderAvatar: senderPet?.avatarUrl || '',
          appointment,
          isMe: myPetIds.has(m.senderPetId),
          timestamp: new Date(m.createdAt).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        };
      });

    return this.dataStore.paginate(messages, page, limit);
  }

  @Post('rooms/:roomId/messages')
  async sendMessage(
    @CurrentUser() user: UserRecord,
    @ActivePet() activePet: PetRecord | undefined,
    @Param('roomId') roomId: string,
    @Body()
    body: {
      text: string;
      senderPetId?: string;
      appointmentId?: string;
    },
  ) {
    const senderPet =
      (body.senderPetId &&
        this.dataStore.pets.find(
          (p) => p.id === body.senderPetId && p.userId === user.id,
        )) ||
      activePet ||
      this.dataStore.pets.find((p) => p.userId === user.id);

    if (!senderPet) {
      throw new DomainException(
        'BAD_REQUEST',
        'Không tìm thấy Boss gửi tin nhắn.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const nowIso = new Date().toISOString();
    const newMsg = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      roomId,
      senderPetId: senderPet.id,
      text: body.text || null,
      appointmentId: body.appointmentId || null,
      isRead: false,
      status: 'delivered' as const,
      createdAt: nowIso,
    };

    this.dataStore.chatMessages.push(newMsg);

    const room = this.dataStore.chatRooms.find((r) => r.id === roomId);
    if (room) {
      room.lastMessageText = body.text || 'Lời mời hẹn dắt Boss đi dạo 📅';
      room.lastMessageAt = nowIso;
    }
    this.dataStore.save();

    const enriched = {
      ...newMsg,
      senderName: senderPet.name,
      senderAvatar: senderPet.avatarUrl,
      isMe: true,
      timestamp: new Date(nowIso).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    if (this.chatGateway.server) {
      this.chatGateway.server.to(roomId).emit('receive_message', enriched);
    }

    if (room) {
      const recipientPetId =
        room.petAId === senderPet.id ? room.petBId : room.petAId;
      const recipientPet = this.dataStore.pets.find(
        (p) => p.id === recipientPetId,
      );
      if (recipientPet && recipientPet.userId !== user.id) {
        await this.pushAdapter.sendPush(recipientPet.userId, {
          type: 'message',
          title: `💬 Tin nhắn mới từ ${senderPet.name}`,
          body: body.text || 'Đã gửi lời mời hẹn dắt dạo!',
          payload: { roomId, senderPetId: senderPet.id },
        });
      }
    }

    return enriched;
  }

  @Get('rooms/:roomId/icebreakers')
  async getRoomIcebreakers(
    @CurrentUser() user: UserRecord,
    @ActivePet() activePet: PetRecord | undefined,
    @Param('roomId') roomId: string,
  ) {
    const nowMs = Date.now();
    const oneHourAgo = nowMs - 60 * 60 * 1000;
    const recentCalls = (
      this.dataStore.icebreakerTimestamps.get(user.id) || []
    ).filter((t) => t > oneHourAgo);

    if (recentCalls.length >= BUSINESS_RULES.ai.icebreakerHourlyLimit) {
      throw new DomainException(
        'ICEBREAKER_RATE_LIMITED',
        'Bạn đã sử dụng hết 10 lượt gợi ý AI Icebreaker trong 1 giờ qua. Vui lòng thử lại sau!',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    recentCalls.push(nowMs);
    this.dataStore.icebreakerTimestamps.set(user.id, recentCalls);

    const room = this.dataStore.chatRooms.find((r) => r.id === roomId);
    const petA =
      (room && this.dataStore.pets.find((p) => p.id === room.petAId)) ||
      activePet ||
      this.dataStore.pets[0];
    const petB =
      (room && this.dataStore.pets.find((p) => p.id === room.petBId)) ||
      this.dataStore.pets[1] ||
      petA;

    const suggestions = await this.icebreakerAdapter.generateIcebreakers(
      petA,
      petB,
    );

    return { suggestions };
  }
}
