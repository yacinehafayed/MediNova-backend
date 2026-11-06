const errorMiddleware = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;

  console.error(err);

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error.',
  });
};

module.exports = errorMiddleware;