import { Controller, Get, Post, Param, Body, Query, BadRequestException } from '@nestjs/common';
import { DataStoreService } from '../../database/data-store.service';

@Controller('moments')
export class MomentsController {
  constructor(private readonly dataStore: DataStoreService) {}

  @Get()
  getMoments(@Query('petId') petId?: string) {
    let list = this.dataStore.moments;
    if (petId) {
      list = list.filter((m) => m.petId === petId);
    }
    return {
      success: true,
      total: list.length,
      data: list,
    };
  }

  @Post()
  createMoment(@Body() body: { petId: string; mediaUrl: string; caption: string }) {
    if (!body.mediaUrl || !body.caption) {
      throw new BadRequestException('Ảnh và lời bình caption là bắt buộc.');
    }

    const newMoment = {
      id: `moment_${Date.now()}`,
      petId: body.petId,
      mediaUrl: body.mediaUrl,
      mediaType: 'image',
      caption: body.caption,
      likesCount: 1,
      createdAt: new Date().toISOString(),
    };

    this.dataStore.moments.unshift(newMoment);
    return {
      success: true,
      message: 'Đăng khoảnh khắc bựa thành công!',
      data: newMoment,
    };
  }

  @Post(':id/like')
  toggleLikeMoment(@Param('id') id: string) {
    const moment = this.dataStore.moments.find((m) => m.id === id);
    if (!moment) {
      throw new BadRequestException('Không tìm thấy khoảnh khắc');
    }

    moment.likesCount += 1;
    return {
      success: true,
      likesCount: moment.likesCount,
    };
  }
}
