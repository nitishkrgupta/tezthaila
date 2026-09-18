export class ApiError extends Error {
  constructor(statusCode, message, errors = null) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const badRequest = (message = 'Bad Request', errors = null) => new ApiError(400, message, errors);
export const unauthorized = (message = 'Unauthorized access') => new ApiError(401, message);
export const forbidden = (message = 'Forbidden resource') => new ApiError(403, message);
export const notFound = (message = 'Resource not found') => new ApiError(404, message);
export const conflict = (message = 'Resource already exists') => new ApiError(409, message);
export const unprocessable = (message = 'Validation error', errors = null) => new ApiError(422, message, errors);
export const internal = (message = 'Internal server error') => new ApiError(500, message);
