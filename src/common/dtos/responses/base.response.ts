export class ResponseDto<T> {
  statusCode: number;
  message: string;
  data?: T;
  constructor(
    statusCode: number,
    message: string,
    data?: T
  ) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }
}


export class PaginationDto {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;

  constructor(page: number, limit: number, total: number) {
    this.page = page;
    this.limit = limit;
    this.total = total;
    this.totalPages = Math.ceil(total / limit);
    this.hasNext = page < this.totalPages;
    this.hasPrev = page > 1;
  }
}

export class PaginatedResponseDto<T> {
  items: T[];
  pagination: PaginationDto;

  constructor(items: T[], page: number, limit: number, total: number) {
    this.items = items;
    this.pagination = new PaginationDto(page, limit, total);
  }
}



export type SafeUser = {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  picture?: string;
  roles?: string[]
};

