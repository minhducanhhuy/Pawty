import { HttpException, HttpStatus } from '@nestjs/common';

export type ErrorCode =
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'BAD_REQUEST'
  | 'INVALID_OTP'
  | 'PHONE_REQUIRED'
  | 'VIP_REQUIRED'
  | 'VIP_STORAGE_LIMIT_REACHED'
  | 'PET_LIMIT_REACHED'
  | 'CANNOT_DELETE_ONLY_PET'
  | 'SWIPE_LIMIT_REACHED'
  | 'SUPER_LIKE_EXHAUSTED'
  | 'SWIPING_BANNED'
  | 'NOTHING_TO_REWIND'
  | 'BOOST_ALREADY_ACTIVE'
  | 'BOOST_EXHAUSTED'
  | 'CHECKIN_WINDOW_CLOSED'
  | 'TOO_FAR_FROM_PLACE'
  | 'FLAKE_REPORT_NOT_ELIGIBLE'
  | 'EVENT_FULL'
  | 'CLUB_LIMIT_REACHED'
  | 'CLUB_NAME_TAKEN'
  | 'SELF_REFERRAL'
  | 'REFERRAL_LIMIT_REACHED'
  | 'REFERRAL_EXPIRED'
  | 'REFERRAL_ALREADY_USED'
  | 'ALREADY_SAVED'
  | 'VOUCHER_QUOTA_REACHED'
  | 'VOUCHER_INVALID'
  | 'VOUCHER_EXPIRED'
  | 'VOUCHER_ALREADY_REDEEMED'
  | 'PARTNER_NOT_APPROVED'
  | 'INSUFFICIENT_BALANCE'
  | 'ICEBREAKER_RATE_LIMITED'
  | 'INVALID_SIGNATURE'
  | 'SOS_PAYMENT_REQUIRED'
  | 'LOCATION_SHARE_NOT_ELIGIBLE'
  | 'NOT_CONFIGURED'
  | 'INTERNAL_SERVER_ERROR';

export class DomainException extends HttpException {
  public readonly code: ErrorCode;
  public readonly details?: Record<string, any>;

  constructor(
    code: ErrorCode,
    message: string,
    statusCode: HttpStatus = HttpStatus.BAD_REQUEST,
    details?: Record<string, any>,
  ) {
    super({ code, message, ...(details || {}) }, statusCode);
    this.code = code;
    this.details = details;
  }
}
