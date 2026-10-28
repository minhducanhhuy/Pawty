import { Global, Module } from '@nestjs/common';
import { OtpAdapterService } from './otp.adapter';
import { PushAdapterService } from './push.adapter';
import { MediaAdapterService } from './media.adapter';
import { PaymentAdapterService } from './payment.adapter';
import { PlacesAdapterService } from './places.adapter';
import { IcebreakerAdapterService } from './icebreaker.adapter';
import { OcrAdapterService } from './ocr.adapter';

export function getAdaptersHealthSummary() {
  return {
    otp: process.env.OTP_PROVIDER || 'sandbox',
    push: process.env.PUSH_PROVIDER || 'sandbox',
    media: process.env.MEDIA_PROVIDER || 'sandbox',
    payment: process.env.PAYMENT_GATEWAY || 'sandbox',
    places: process.env.PLACES_PROVIDER || 'sandbox',
    ai: process.env.AI_PROVIDER || 'sandbox',
    ocr: process.env.OCR_PROVIDER || 'sandbox',
  };
}

@Global()
@Module({
  providers: [
    OtpAdapterService,
    PushAdapterService,
    MediaAdapterService,
    PaymentAdapterService,
    PlacesAdapterService,
    IcebreakerAdapterService,
    OcrAdapterService,
  ],
  exports: [
    OtpAdapterService,
    PushAdapterService,
    MediaAdapterService,
    PaymentAdapterService,
    PlacesAdapterService,
    IcebreakerAdapterService,
    OcrAdapterService,
  ],
})
export class AdaptersModule {}
