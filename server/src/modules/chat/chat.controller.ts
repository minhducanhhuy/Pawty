import { Controller, Get, Post, Param, Body } from '@nestjs/common';
import { DataStoreService } from '../../database/data-store.service';
import { ChatGateway } from './chat.gateway';

@Controller('chat')
export class ChatController {
  constructor(
    private readonly dataStore: DataStoreService,
    private readonly chatGateway: ChatGateway,
  ) {}

  @Get('rooms')
  getChatRooms() {
    const matched = this.dataStore.matches.filter((m) => m.status === 'matched');
    const rooms = matched.map((match) => {
      const partner = this.dataStore.pets.find((p) => p.id === match.targetPetId);
      const lastApt = this.dataStore.appointments.find((a) => a.receiverPetId === match.targetPetId || a.senderPetId === match.targetPetId);
      return {
        id: `room_${match.targetPetId}`,
        targetPet: partner,
        lastMessage: lastApt ? 'Lời mời hẹn dắt Boss dạo công viên...' : 'Hai Boss vừa tương hợp! Nhắn tin làm quen ngay 🐾',
        unreadCount: 1,
        updatedAt: match.matchedAt || '17:30',
        activeAppointment: lastApt || null,
      };
    });

    return {
      success: true,
      data: rooms,
    };
  }

  @Get('rooms/:roomId/messages')
  getRoomMessages(@Param('roomId') roomId: string) {
    // Initial seeded messages for demo
    const defaultMessages = [
      {
        id: 'msg_01',
        senderPetId: 'pet_mochi_02',
        senderName: 'Mochi (Shiba)',
        senderAvatar: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=600&q=80',
        text: 'Gâu gâu! Chào bé Bơ chân ngắn đáng yêu nha! Chiều nay Sen có rảnh dắt đi dạo không?',
        timestamp: '17:32',
        isMe: false,
      },
      {
        id: 'msg_02',
        senderPetId: 'pet_bo_01',
        senderName: 'Bơ Lùn',
        senderAvatar: 'https://images.unsplash.com/photo-1612536057832-2ff7ead58194?auto=format&fit=crop&w=600&q=80',
        text: 'Dạ chào chị Mochi xinh gái! Bơ vừa ngủ dậy, chiều nay định ra Landmark 81 nè.',
        timestamp: '17:35',
        isMe: true,
      },
    ];

    return {
      success: true,
      roomId,
      data: defaultMessages,
    };
  }

  @Post('rooms/:roomId/messages')
  sendMessage(
    @Param('roomId') roomId: string,
    @Body() body: { text: string; senderPetId: string; senderName?: string; senderAvatar?: string },
  ) {
    const newMsg = {
      id: `msg_${Date.now()}`,
      roomId,
      senderPetId: body.senderPetId,
      senderName: body.senderName || 'Bơ Lùn',
      senderAvatar: body.senderAvatar || 'https://images.unsplash.com/photo-1612536057832-2ff7ead58194?auto=format&fit=crop&w=600&q=80',
      text: body.text,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    };

    // Broadcast via Socket.io
    if (this.chatGateway.server) {
      this.chatGateway.server.to(roomId).emit('receive_message', newMsg);
    }

    return {
      success: true,
      data: newMsg,
    };
  }
}
