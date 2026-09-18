import { ApiError } from '../utils/apiError.js';

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || null;

  // Handle Prisma Known Request Errors
  if (err.code) {
    switch (err.code) {
      case 'P2002': {
        statusCode = 409;
        const target = err.meta?.target ? ` (${err.meta.target})` : '';
        message = `Unique constraint failed: A record with this information already exists${target}.`;
        break;
      }
      case 'P2025': {
        statusCode = 404;
        message = 'Requested record was not found.';
        break;
      }
      case 'P2003': {
        statusCode = 400;
        message = 'Foreign key constraint failed on the referenced entity.';
        break;
      }
      default: {
        if (err.code.startsWith('P')) {
          statusCode = 400;
          message = 'Database operation failed.';
        }
        break;
      }
    }
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid or expired authorization token.';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authorization token has expired. Please sign in again.';
  }

  // Handle express-validation / syntax errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Malformed JSON payload provided in request.';
  }

  const response = {
    success: false,
    message
  };

  if (errors) {
    response.errors = errors;
  }

  if (process.env.NODE_ENV === 'development' && !(err instanceof ApiError)) {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
};

export const notFoundHandler = (req, res, next) => {
  return res.status(404).json({
    success: false,
    message: `API Route not found: [${req.method}] ${req.originalUrl}`
  });
};
