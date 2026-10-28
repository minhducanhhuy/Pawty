import { SetMetadata } from '@nestjs/common';

export const IS_PARTNER_ONLY_KEY = 'isPartnerOnly';
export const PartnerOnly = () => SetMetadata(IS_PARTNER_ONLY_KEY, true);
