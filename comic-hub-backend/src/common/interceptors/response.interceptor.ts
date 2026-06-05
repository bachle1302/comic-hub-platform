import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import type { ApiSuccessResponse } from '../types/api-response.type';

type ResponseWithMessage = {
  message: string;
  data: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getDefaultMessage(method: string): string {
  switch (method.toUpperCase()) {
    case 'GET':
      return 'Fetched successfully';
    case 'POST':
      return 'Created successfully';
    case 'PATCH':
    case 'PUT':
      return 'Updated successfully';
    case 'DELETE':
      return 'Deleted successfully';
    default:
      return 'Request successful';
  }
}

function extractMessageAndData(
  value: unknown,
  defaultMessage: string,
): ResponseWithMessage {
  if (!isRecord(value) || typeof value.message !== 'string') {
    return {
      message: defaultMessage,
      data: value,
    };
  }

  const { message, ...data } = value;

  return {
    message,
    data,
  };
}

@Injectable()
export class ResponseInterceptor implements NestInterceptor<
  unknown,
  ApiSuccessResponse<unknown>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<unknown>,
  ): Observable<ApiSuccessResponse<unknown>> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const defaultMessage = getDefaultMessage(request.method);

    return next.handle().pipe(
      map((value: unknown) => {
        const { message, data } = extractMessageAndData(value, defaultMessage);

        return {
          success: true,
          statusCode: response.statusCode,
          message,
          data,
          timestamp: new Date().toISOString(),
          path: request.originalUrl,
        };
      }),
    );
  }
}
