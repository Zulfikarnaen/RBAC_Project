import type { Context } from "elysia";

type HttpStatus = NonNullable<Context["set"]["status"]>;

export function dataResponse<T>(data: T) {
  return { success: true, data };
}

export function createdDataResponse<T>(set: Context["set"], data: T) {
  set.status = 201;
  return dataResponse(data);
}

export function messageResponse(message: string) {
  return { success: true, message };
}

export function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Terjadi kesalahan.";
}

export function errorResponse(set: Context["set"], status: HttpStatus, error: unknown) {
  set.status = status;
  return { success: false, message: getErrorMessage(error) };
}
