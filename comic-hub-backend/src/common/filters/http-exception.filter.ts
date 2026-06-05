import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';
import type { Request, Response } from 'express';
import type { ApiErrorResponse } from '../types/api-response.type';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

type RequestUser = {
  id?: number;
  email?: string;
  role?: string;
};

type RequestWithUser = Request & {
  user?: RequestUser;
};

const MIN_SENTRY_CAPTURE_STATUS = 500;

function captureServerException(
  exception: unknown,
  request: RequestWithUser,
  statusCode: number,
): void {
  if (statusCode < MIN_SENTRY_CAPTURE_STATUS) {
    return;
  }

  Sentry.withScope((scope) => {
    scope.setTag('http.status_code', String(statusCode));
    scope.setTag('http.method', request.method);
    scope.setTag('http.path', request.originalUrl);

    if (request.user?.id !== undefined) {
      scope.setUser({
        id: String(request.user.id),
        email: request.user.email,
        role: request.user.role,
      });
    }

    Sentry.captureException(exception);
  });
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter<unknown> {
  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<RequestWithUser>();
    const response = http.getResponse<Response>();
    const isHttpException = exception instanceof HttpException;
    const statusCode = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse = isHttpException
      ? exception.getResponse()
      : 'Internal server error';

    let message = isHttpException ? exception.message : 'Internal server error';
    let error = isHttpException ? exception.name : 'Internal Server Error';
    let details: unknown;

    if (typeof exceptionResponse === 'string') {
      message = exceptionResponse;
    }

    if (isRecord(exceptionResponse)) {
      if (typeof exceptionResponse.error === 'string') {
        error = exceptionResponse.error;
      }

      const responseMessage = exceptionResponse.message;

      if (typeof responseMessage === 'string') {
        message = responseMessage;
      } else if (Array.isArray(responseMessage)) {
        message = 'Validation failed';
        details = responseMessage;
      }

      if ('details' in exceptionResponse) {
        details = exceptionResponse.details;
      }
    }

    const body: ApiErrorResponse = {
      success: false,
      statusCode,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.originalUrl,
      ...(details === undefined ? {} : { details }),
    };

    captureServerException(exception, request, statusCode);

    response.status(statusCode).json(body);
  }
}
