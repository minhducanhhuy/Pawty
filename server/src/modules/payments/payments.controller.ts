import { Controller, Get, Post, Body } from '@nestjs/common';
import { DataStoreService } from '../../database/data-store.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly dataStore: DataStoreService) {}

  @Get('user-status')
  getUserStatus() {
    const user = this.dataStore.users[0];
    return {
      success: true,
      data: {
        id: user.id,
        phone: user.phone,
        fullName: user.fullName,
        isVerified: user.isVerified,
        isVip: user.isVip,
        dailySwipesCount: user.dailySwipesCount,
        maxFreeSwipesPerDay: 15,
        swipesLeft: user.isVip ? 9999 : Math.max(0, 15 - user.dailySwipesCount),
        flakeReportsCount: user.flakeReportsCount,
        isBannedSwiping: user.isBannedSwiping,
      },
    };
  }

  @Post('create-qr')
  createPaymentQr(
    @Body()
    body: {
      serviceType: 'sos_emergency' | 'vip_subscription';
      plan?: 'month' | 'year';
      petName?: string;
    },
  ) {
    const isSos = body.serviceType === 'sos_emergency';
    const amount = isSos ? 39000 : body.plan === 'year' ? 499000 : 49000;
    const orderCode = `PAWTY_${isSos ? 'SOS' : 'VIP'}_${Math.floor(100000 + Math.random() * 900000)}`;
    const bankName = 'MBBank (Ngân hàng Quân Đội)';
    const accountNo = '0908123456888';
    const accountName = 'CONG TY CP PAWTY VIETNAM';

    // Generate VietQR string and image URL via VietQR format standard
    const qrDescription = encodeURIComponent(orderCode);
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://qr.sepay.vn/img?acc=${accountNo}&bank=MBBank&amount=${amount}&des=${qrDescription}`;

    return {
      success: true,
      data: {
        orderCode,
        amount,
        serviceType: body.serviceType,
        plan: body.plan || 'month',
        bankName,
        accountNo,
        accountName,
        qrCodeUrl,
        expiresInSeconds: 900,
        instructions: `Quét mã VietQR bằng app ngân hàng bất kỳ để thanh toán ${amount.toLocaleString('vi-VN')} đ`,
      },
    };
  }

  @Post('webhook')
  handleWebhook(
    @Body()
    body: {
      orderCode: string;
      serviceType: 'sos_emergency' | 'vip_subscription';
      amount: number;
      sosData?: any;
    },
  ) {
    const user = this.dataStore.users[0];

    if (body.serviceType === 'vip_subscription') {
      user.isVip = true;
      return {
        success: true,
        message: 'Kích hoạt Gói Sen VIP thành công! Bạn đã có quyền quẹt vô hạn và vương miện VIP.',
        isVip: true,
      };
    }

    if (body.serviceType === 'sos_emergency') {
      const newAlert = {
        id: `sos_${Date.now()}`,
        petName: body.sosData?.petName || 'Bé Cún Lạc',
        species: body.sosData?.species || 'dog',
        breed: body.sosData?.breed || 'Thú cưng',
        petPhotoUrl:
          body.sosData?.petPhotoUrl ||
          'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80',
        latitude: body.sosData?.latitude || 10.7951,
        longitude: body.sosData?.longitude || 106.7218,
        lastSeenAddress: body.sosData?.lastSeenAddress || 'Khu vực Vinhomes Central Park',
        radiusKm: 3,
        rewardAmountVnd: body.sosData?.rewardAmountVnd || '3.000.000 VNĐ',
        contactPhone: body.sosData?.contactPhone || '0908 123 456',
        notes: body.sosData?.notes || 'Bé rất nhát, xin đừng đuổi theo',
        status: 'active',
        createdAt: 'Vừa xong',
      };
      this.dataStore.sosAlerts.unshift(newAlert);

      return {
        success: true,
        message: 'Đã kích hoạt còi báo động SOS và gửi cảnh báo tới tất cả Sen trong bán kính 3km!',
        data: newAlert,
      };
    }

    return {
      success: true,
      message: 'Giao dịch thành công',
    };
  }

  @Get('sos-alerts')
  getSosAlerts() {
    return {
      success: true,
      data: this.dataStore.sosAlerts,
    };
  }

  @Post('sos-alerts')
  createSosAlert(@Body() body: any) {
    const alert = {
      id: `sos_${Date.now()}`,
      petName: body.petName || 'Bé Cún',
      species: body.species || 'dog',
      breed: body.breed || 'Chưa rõ',
      petPhotoUrl: body.petPhotoUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80',
      latitude: body.latitude || 10.7951,
      longitude: body.longitude || 106.7218,
      lastSeenAddress: body.lastSeenAddress || 'Chung cư',
      radiusKm: 3,
      rewardAmountVnd: body.rewardAmountVnd || '2.000.000 VNĐ',
      contactPhone: body.contactPhone || '0908 123 456',
      notes: body.notes || '',
      status: 'active',
      createdAt: 'Vừa xong',
    };
    this.dataStore.sosAlerts.unshift(alert);

    return {
      success: true,
      message: 'Phát sóng cảnh báo SOS thành công',
      data: alert,
    };
  }
}
