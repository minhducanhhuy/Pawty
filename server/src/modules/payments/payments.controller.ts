import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { PaymentsService, PaymentServiceType } from './payments.service';
import { DataStoreService } from '../../database/data-store.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UserRecord } from '../../database/types';
import { enrichUserWithQuotas } from '../auth/auth.controller';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly dataStore: DataStoreService,
  ) {}

  @Get('user-status')
  getUserStatus(@CurrentUser() user: UserRecord) {
    return enrichUserWithQuotas(user, this.dataStore);
  }

  @Post('create-qr')
  @HttpCode(HttpStatus.OK)
  createPaymentQr(
    @CurrentUser() user: UserRecord,
    @Body()
    body: {
      serviceType: PaymentServiceType;
      plan?: 'month' | 'year';
    },
  ) {
    return this.paymentsService.createQrForUser(user, body);
  }

  @Public()
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  handleWebhook(
    @Body() body: any,
    @Headers('x-pawty-signature') signature?: string,
  ) {
    return this.paymentsService.handleWebhook(body, signature);
  }

  @Post('sandbox/confirm')
  @HttpCode(HttpStatus.OK)
  confirmSandbox(
    @CurrentUser() user: UserRecord,
    @Body() body: { transactionId?: string; paymentCode?: string },
  ) {
    return this.paymentsService.confirmSandboxPayment(user, body || {});
  }

  @Get(':transactionId')
  getPaymentStatus(
    @CurrentUser() user: UserRecord,
    @Param('transactionId') transactionId: string,
  ) {
    return this.paymentsService.getTransactionStatus(user, transactionId);
  }
}
