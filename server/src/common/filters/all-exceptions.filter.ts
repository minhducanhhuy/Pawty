import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { DomainException } from '../errors';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    if (host.getType() !== 'http') {
      return;
    }

    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_SERVER_ERROR';
    let message = 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.';
    let extraDetails: Record<string, any> = {};

    if (exception instanceof DomainException) {
      statusCode = exception.getStatus();
      code = exception.code;
      message = exception.message;
      extraDetails = exception.details || {};
    } else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const res = exception.getResponse() as any;
      if (typeof res === 'string') {
        message = res;
      } else if (res && typeof res === 'object') {
        message = Array.isArray(res.message)
          ? res.message.join(', ')
          : res.message || exception.message;
        if (res.code) {
          code = res.code;
        }
      }
      if (code === 'INTERNAL_SERVER_ERROR') {
        if (statusCode === HttpStatus.UNAUTHORIZED) code = 'UNAUTHORIZED';
        else if (statusCode === HttpStatus.FORBIDDEN) code = 'FORBIDDEN';
        else if (statusCode === HttpStatus.NOT_FOUND) code = 'NOT_FOUND';
        else if (statusCode === HttpStatus.BAD_REQUEST) code = 'BAD_REQUEST';
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(
        `Unhandled Error on ${request?.method} ${request?.url}: ${exception.message}`,
        exception.stack,
      );
    }

    response.status(statusCode).json({
      success: false,
      statusCode,
      error: {
        code,
        message,
        ...extraDetails,
      },
      timestamp: new Date().toISOString(),
    });
  }
}
