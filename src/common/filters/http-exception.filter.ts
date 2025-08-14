import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import type { Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    const status = exception.getStatus();
    const response = exception.getResponse() as
      | string
      | {
          message?: string | string[];
          error?: string;
          [key: string]: unknown;
        };

    const message =
      typeof response === 'object' && response && 'message' in response
        ? (response.message as string | string[])
        : exception.message;

    res.status(status).json({
      success: false,
      error: true,
      statusCode: status,
      message,
      errorName: exception.name,
      ...(typeof response === 'object' && response && 'error' in response
        ? { error: (response as { error?: string }).error }
        : {}),
      timestamp: new Date().toISOString(),
    });
  }
}
