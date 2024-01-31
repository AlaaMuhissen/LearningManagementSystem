/**
 * Middleware for handling errors and sending appropriate JSON responses.
 *
 * @param {Error} error - The caught error.
 * @param {object} req - The Express request object.
 * @param {object} res - The Express response object.
 * @param {function} next - The next middleware function.
 */
export const errorHandler = (error, req, res, next) => {
  // Retrieve the current status code from the response object, default to 500 if not set.
  let statusCode = res.statusCode;

  // If no status code is set or it's less than 400 (indicating success or redirection),
  // set the status code to 500 (Internal Server Error).
  if (!statusCode || statusCode < 400) {
    statusCode = 500;
  }

  // Send a JSON response with the appropriate status code and an error message.
  res.status(statusCode).json({
    error: {
      message: error.message,
    },
  });
};


