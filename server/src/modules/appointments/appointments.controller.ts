import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { DataStoreService } from '../../database/data-store.service';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly dataStore: DataStoreService) {}

  @Get('suggestions')
  getPlaceSuggestions(@Query('petAId') petAId: string, @Query('petBId') petBId: string) {
    // Top 3 pet friendly places
    const suggestions = [
      {
        id: 'place_01',
        name: 'Công viên Landmark 81 ven sông',
        category: 'park',
        address: '208 Nguyễn Hữu Cảnh, Bình Thạnh',
        distanceMeters: 250,
        highlights: ['Bãi cỏ rộng mênh mông', 'Có thùng rác vệ sinh', 'Gió mát ven sông'],
        thumbnailUrl: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'place_02',
        name: 'Paws & Coffee Lounge Shophouse Park 2',
        category: 'cafe',
        address: 'Shophouse P2-01, Vinhomes Central Park',
        distanceMeters: 180,
        highlights: ['Cho thú cưng vào máy lạnh', 'Free bát nước & snack', 'Menu cà phê ngon'],
        thumbnailUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80',
      },
      {
        id: 'place_03',
        name: 'Sân chơi thú cưng nội khu Park 6',
        category: 'play_area',
        address: 'Khuôn viên giữa Park 6 & Landmark Plus',
        distanceMeters: 310,
        highlights: ['Hàng rào an toàn', 'Vòi xịt nước rửa chân', 'Nhiều cún giao lưu'],
        thumbnailUrl: 'https://images.unsplash.com/photo-1541599540903-216a46ca1dc0?auto=format&fit=crop&w=600&q=80',
      },
    ];

    return {
      success: true,
      message: 'Gợi ý 3 địa điểm thân thiện với thú cưng quanh trung điểm 2 Boss',
      data: suggestions,
    };
  }

  @Post()
  createAppointment(@Body() body: any) {
    const newApt = {
      id: `apt_${Date.now()}`,
      roomId: body.roomId,
      senderPetId: body.senderPetId,
      receiverPetId: body.receiverPetId,
      scheduledTime: body.scheduledTime || new Date().toISOString(),
      displayTime: body.displayTime || 'Tối nay • 19:30',
      placeName: body.placeName || 'Công viên Landmark 81',
      placeAddress: body.placeAddress || '208 Nguyễn Hữu Cảnh',
      placeThumbnail: body.placeThumbnail || 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=600&q=80',
      placeDistanceMeters: body.placeDistanceMeters || 250,
      note: body.note || '',
      status: 'pending',
      createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    this.dataStore.appointments.push(newApt);
    return {
      success: true,
      message: 'Đã gửi lời mời hẹn dắt Boss thành công!',
      data: newApt,
    };
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: 'confirmed' | 'rejected' | 'reported_flake' },
  ) {
    const apt = this.dataStore.appointments.find((a) => a.id === id);
    if (apt) {
      apt.status = body.status;
    }

    if (body.status === 'reported_flake') {
      const user = this.dataStore.users[0];
      user.flakeReportsCount += 1;
      let isBanned = false;
      if (user.flakeReportsCount >= 2) {
        user.isBannedSwiping = true;
        isBanned = true;
      }
      return {
        success: true,
        status: body.status,
        flakeReportsCount: user.flakeReportsCount,
        isBanned,
        message: isBanned
          ? 'Tài khoản vi phạm quy tắc cộng đồng: Đã bị tạm khóa quẹt thẻ 3 ngày do bùng hẹn 2 lần/tuần.'
          : 'Hệ thống đã ghi nhận báo cáo bùng kèo.',
      };
    }

    return {
      success: true,
      status: body.status,
      message: body.status === 'confirmed' ? 'Kèo dạo phố đã được chốt!' : 'Đã cập nhật trạng thái',
    };
  }
}
