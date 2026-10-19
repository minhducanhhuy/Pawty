import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { DataStoreService } from '../../database/data-store.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly dataStore: DataStoreService) {}

  @Post('send-otp')
  @HttpCode(HttpStatus.OK)
  sendOtp(@Body() body: { phone: string }) {
    return {
      success: true,
      message: `Mã OTP đã được gửi đến số ${body.phone} qua Firebase Auth SDK.`,
      sessionInfo: `mock_session_${Date.now()}`,
    };
  }

  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  verifyOtp(@Body() body: { phone: string; otpCode: string }) {
    // Look up or create user
    let user = this.dataStore.users.find((u) => u.phone === body.phone);
    if (!user) {
      user = {
        id: `usr_${Date.now()}`,
        phone: body.phone,
        fullName: 'Chủ Nuôi Mới',
        nickname: 'Sen Mới',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        isVerified: true,
        isVip: false,
        dailySwipesCount: 0,
        latitude: 10.7951,
        longitude: 106.7218,
        condoComplex: 'Vinhomes Central Park',
        flakeReportsCount: 0,
        isBannedSwiping: false,
        banUntil: null,
      };
      this.dataStore.users.push(user);
    } else {
      user.isVerified = true;
    }

    return {
      success: true,
      token: `jwt_session_token_pawty_${user.id}_${Date.now()}`,
      user,
    };
  }
}
