export class ResponseDto<T> {
  success: boolean;
  error: boolean;
  statusCode: number;
  message: string;
  data?: T;
  constructor(statusCode: number, message: string, data?: T) {
    this.success = true;
    this.error = false;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
}

export class PaginationDto {
  page: number;
  limit: number;
  total: number; // number of items in the current page
  totalItems: number; // overall number of items matching the query
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;

  constructor(page: number, limit: number, totalItems: number, count: number) {
    this.page = page;
    this.limit = limit;
    this.total = count;
    this.hasNext = page < this.totalPages;
    this.hasPrev = page > 1;
  }
}

export class PaginatedResponseDto<T> {
  items: T[];
  pagination: PaginationDto;

  constructor(items: T[], page: number, limit: number, total: number) {
    this.items = items;
    this.pagination = new PaginationDto(page, limit, total, items.length);
  }
}

export type SafeUser = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  picture?: string;
  roles?: string[];
};
