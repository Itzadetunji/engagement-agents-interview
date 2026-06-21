export interface PaginationMeta {
  current_page: number;
  total_pages: number;
  total: number;
  per_page: number;
  from?: number;
  to?: number;
}

export interface SuccessResponse<T> {
  success: true;
  message: string;
  data: T;
  meta?: {
    pagination: PaginationMeta;
  };
}

export interface ErrorResponse {
  success: false;
  message: string;
  errors: string[];
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;
