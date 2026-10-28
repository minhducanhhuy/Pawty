import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { DataStoreService } from '../../database/data-store.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { DomainException } from '../../common/errors';
import {
  ReminderKindType,
  ReminderRecord,
  UserRecord,
} from '../../database/types';

@Controller('reminders')
export class RemindersController {
  constructor(private readonly dataStore: DataStoreService) {}

  @Get()
  getMyReminders(@CurrentUser() user: UserRecord) {
    const myPetIds = new Set(
      this.dataStore.pets.filter((p) => p.userId === user.id).map((p) => p.id),
    );
    return this.dataStore.reminders
      .filter((r) => myPetIds.has(r.petId))
      .sort(
        (a, b) =>
          new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
      );
  }

  @Post()
  createReminder(
    @CurrentUser() user: UserRecord,
    @Body()
    body: {
      petId: string;
      kind: ReminderKindType;
      title: string;
      dueDate: string;
    },
  ) {
    if (!body?.petId || !body?.title || !body?.dueDate) {
      throw new DomainException(
        'BAD_REQUEST',
        'Thiếu thông tin nhắc lịch (petId, title, dueDate).',
        HttpStatus.BAD_REQUEST,
      );
    }

    const pet = this.dataStore.pets.find(
      (p) => p.id === body.petId && p.userId === user.id,
    );
    if (!pet) {
      throw new DomainException(
        'FORBIDDEN',
        'Không tìm thấy Boss thuộc sở hữu của bạn.',
        HttpStatus.FORBIDDEN,
      );
    }

    const kind: ReminderKindType =
      body.kind === 'vaccine' || body.kind === 'deworm'
        ? body.kind
        : 'custom';

    const reminder: ReminderRecord = {
      id: `rem_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      petId: pet.id,
      kind,
      title: body.title.trim(),
      dueDate: body.dueDate,
      isDone: false,
      lastNotifiedOffset: null,
    };

    this.dataStore.reminders.push(reminder);
    this.dataStore.save();
    return reminder;
  }

  @Patch(':id')
  updateReminder(
    @CurrentUser() user: UserRecord,
    @Param('id') id: string,
    @Body() body: { isDone?: boolean; dueDate?: string; title?: string },
  ) {
    const reminder = this.dataStore.reminders.find((r) => r.id === id);
    if (!reminder) {
      throw new DomainException(
        'NOT_FOUND',
        'Không tìm thấy lời nhắc.',
        HttpStatus.NOT_FOUND,
      );
    }

    const pet = this.dataStore.pets.find(
      (p) => p.id === reminder.petId && p.userId === user.id,
    );
    if (!pet) {
      throw new DomainException(
        'FORBIDDEN',
        'Bạn không có quyền sửa lời nhắc này.',
        HttpStatus.FORBIDDEN,
      );
    }

    if (typeof body.isDone === 'boolean') reminder.isDone = body.isDone;
    if (body.dueDate !== undefined) reminder.dueDate = body.dueDate;
    if (body.title !== undefined) reminder.title = body.title;

    this.dataStore.save();
    return reminder;
  }
}
