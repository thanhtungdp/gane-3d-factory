/** Lỗi có mã + status để route trả JSON thống nhất cho client. */
export class AppError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const badRequest = (code: string, message: string, details?: unknown) =>
  new AppError(400, code, message, details);
export const unauthorized = (code = "UNAUTHORIZED", message = "Bạn không có quyền truy cập.") =>
  new AppError(401, code, message);
export const forbidden = (code = "FORBIDDEN", message = "Yêu cầu bị từ chối.") =>
  new AppError(403, code, message);
export const notFound = (code = "NOT_FOUND", message = "Không tìm thấy dữ liệu.") =>
  new AppError(404, code, message);
export const payloadTooLarge = (code = "PAYLOAD_TOO_LARGE", message = "Dữ liệu gửi lên quá lớn.") =>
  new AppError(413, code, message);
export const tooManyRequests = (message = "Bạn thao tác hơi nhanh. Chờ một chút rồi thử lại nhé.") =>
  new AppError(429, "RATE_LIMITED", message);
export const internalError = (message = "Máy chủ gặp sự cố. Bạn thử lại nhé.") =>
  new AppError(500, "INTERNAL", message);
export const unavailable = (code: string, message: string) => new AppError(503, code, message);
