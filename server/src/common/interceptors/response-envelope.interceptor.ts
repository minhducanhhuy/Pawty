import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseEnvelopeInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    const response = context.switchToHttp().getResponse();

    return next.handle().pipe(
      map((payload) => {
        const statusCode = response.statusCode || 200;

        if (
          payload &&
          typeof payload === 'object' &&
          'success' in payload &&
          'statusCode' in payload &&
          'timestamp' in payload &&
          ('data' in payload || 'error' in payload)
        ) {
          return payload;
        }

        return {
          success: true,
          statusCode,
          data: payload ?? null,
          message: 'Thành công',
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
