import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { DataStoreService } from '../../database/data-store.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRecord } from '../../database/types';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly dataStore: DataStoreService) {}

  @Get()
  getMyNotifications(
    @CurrentUser() user: UserRecord,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const myList = this.dataStore.notifications
      .filter((n) => n.userId === user.id)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

    const unreadCount = myList.filter((n) => !n.isRead).length;
    const paginated = this.dataStore.paginate(myList, page, limit);

    return {
      ...paginated,
      unreadCount,
    };
  }

  @Post('read')
  @HttpCode(HttpStatus.OK)
  markNotificationsRead(
    @CurrentUser() user: UserRecord,
    @Body() body?: { ids?: string[] },
  ) {
    const targetIds =
      Array.isArray(body?.ids) && body!.ids.length > 0
        ? new Set(body!.ids)
        : null;

    for (const notif of this.dataStore.notifications) {
      if (notif.userId === user.id) {
        if (!targetIds || targetIds.has(notif.id)) {
          notif.isRead = true;
        }
      }
    }

    this.dataStore.save();

    const unreadCount = this.dataStore.notifications.filter(
      (n) => n.userId === user.id && !n.isRead,
    ).length;

    return { unreadCount };
  }
}
