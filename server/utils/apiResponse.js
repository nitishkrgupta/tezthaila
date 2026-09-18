/**
 * Standard API Success Response
 * @param {import('express').Response} res
 * @param {number} statusCode
 * @param {string} message
 * @param {any} data
 */
export const sendSuccess = (res, statusCode = 200, message = 'Success', data = null) => {
  const response = {
    success: true,
    message
  };

  if (data !== null && data !== undefined) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Standard API Error Response helper
 * @param {import('express').Response} res
 * @param {number} statusCode
 * @param {string} message
 * @param {any} errors
 */
export const sendError = (res, statusCode = 500, message = 'An unexpected error occurred', errors = null) => {
  const response = {
    success: false,
    message
  };

  if (errors) {
    response.errors = errors;
  }

  return res.status(statusCode).json(response);
};
