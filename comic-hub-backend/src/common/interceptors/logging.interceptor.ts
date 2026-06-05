import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable, catchError, tap, throwError } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const startedAt = Date.now();
    const method = request.method;
    const path = request.originalUrl;

    return next.handle().pipe(
      tap(() => {
        const durationMs = Date.now() - startedAt;
        this.logger.log(
          `${method} ${path} ${response.statusCode} ${durationMs}ms`,
        );
      }),
      catchError((error: unknown) => {
        const durationMs = Date.now() - startedAt;
        const statusCode =
          error instanceof HttpException
            ? error.getStatus()
            : response.statusCode >= 400
              ? response.statusCode
              : 500;

        this.logger.error(`${method} ${path} ${statusCode} ${durationMs}ms`);

        return throwError(() => error);
      }),
    );
  }
}
