import {
  CanActivate,
  ExecutionContext,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { IS_PARTNER_ONLY_KEY } from '../decorators/partner-only.decorator';
import { DataStoreService } from '../../database/data-store.service';
import { DomainException } from '../errors';

export function getJwtSecret(): string {
  return process.env.JWT_SECRET || 'pawty-dev-jwt-secret-2026';
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly dataStore: DataStoreService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    if (context.getType() !== 'http') {
      return true;
    }

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const isPartnerOnly = this.reflector.getAllAndOverride<boolean>(
      IS_PARTNER_ONLY_KEY,
      [context.getHandler(), context.getClass()],
    );

    const request = context.switchToHttp().getRequest();
    const authHeader: string | undefined = request.headers?.authorization;
    const token =
      authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.slice(7).trim()
        : undefined;

    if (isPublic && !token) {
      return true;
    }

    if (!token) {
      throw new DomainException(
        'UNAUTHORIZED',
        'Vui lòng đăng nhập để tiếp tục.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    let payload: any;
    try {
      payload = this.jwtService.verify(token, { secret: getJwtSecret() });
    } catch {
      if (isPublic) {
        return true;
      }
      throw new DomainException(
        'UNAUTHORIZED',
        'Token xác thực không hợp lệ hoặc đã hết hạn.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (isPartnerOnly) {
      if (payload.kind !== 'partner') {
        throw new DomainException(
          'FORBIDDEN',
          'Yêu cầu tài khoản Đối tác (Partner) để truy cập.',
          HttpStatus.FORBIDDEN,
        );
      }
      const partner = this.dataStore.partners.find((p) => p.id === payload.sub);
      if (!partner) {
        throw new DomainException(
          'UNAUTHORIZED',
          'Không tìm thấy tài khoản đối tác.',
          HttpStatus.UNAUTHORIZED,
        );
      }
      request.partner = partner;
      return true;
    }

    if (payload.kind === 'partner') {
      if (isPublic) return true;
      throw new DomainException(
        'FORBIDDEN',
        'Token đối tác không thể truy cập API người dùng.',
        HttpStatus.FORBIDDEN,
      );
    }

    const user = this.dataStore.users.find((u) => u.id === payload.sub);
    if (!user || user.isDeleted) {
      if (isPublic) return true;
      throw new DomainException(
        'UNAUTHORIZED',
        'Tài khoản không tồn tại hoặc đã bị xoá.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    request.user = user;
    const requestedPetId = request.headers?.['x-pet-id'] as string | undefined;
    const activePet = this.dataStore.getActivePetForUser(user.id, requestedPetId);
    request.activePet = activePet;
    request.activePetId = activePet?.id;

    return true;
  }
}
