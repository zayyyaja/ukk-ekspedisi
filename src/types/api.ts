export type ApiResponseMeta = Record<string, unknown> | null;

export type ValidationErrors = Record<string, string[]>;

export type ApiSuccessResponse<T = unknown> = {
  success: true;
  message: string;
  data: T | null;
  meta: ApiResponseMeta;
};

export type ApiErrorResponse = {
  success: false;
  message: string;
  errors: Record<string, unknown>;
};
