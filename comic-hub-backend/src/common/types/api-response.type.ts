export type ApiSuccessResponse<T> = {
  success: true;
  statusCode: number;
  message: string;
  data: T;
  timestamp: string;
  path: string;
};

export type ApiErrorResponse = {
  success: false;
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path: string;
  details?: unknown;
};
