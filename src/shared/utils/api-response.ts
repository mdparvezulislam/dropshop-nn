import { NextResponse } from "next/server";

export interface ApiResponsePayload<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
  meta?: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
}

export class ApiResponse {
  static success<T>(data: T, message: string = "Success", statusCode: number = 200) {
    const payload: ApiResponsePayload<T> = {
      success: true,
      message,
      data,
    };
    return NextResponse.json(payload, { status: statusCode });
  }

  static error(
    message: string = "Error",
    statusCode: number = 500,
    errors?: Record<string, string[]>,
  ) {
    const payload: ApiResponsePayload<never> = {
      success: false,
      message,
      ...(errors ? { errors } : {}),
    };
    return NextResponse.json(payload, { status: statusCode });
  }

  static paginated<T>(
    data: T[],
    page: number,
    limit: number,
    totalCount: number,
    message: string = "Success",
  ) {
    const totalPages = Math.ceil(totalCount / limit);
    const payload: ApiResponsePayload<T[]> = {
      success: true,
      message,
      data,
      meta: {
        page,
        limit,
        totalCount,
        totalPages,
      },
    };
    return NextResponse.json(payload, { status: 200 });
  }
}
export default ApiResponse;
