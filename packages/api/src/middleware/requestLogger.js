const winston = require('winston');

/**
 * Request logger middleware — logs HTTP requests with method, path, status, duration, and IP.
 * Helps trace slow operations and detect suspicious patterns.
 */
const logger = require('../utils/logger');

const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 500 ? 'error'
      : res.statusCode >= 400 ? 'warn'
      : 'info';

    logger[level](`${req.method} ${req.originalUrl}`, {
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip || req.connection?.remoteAddress,
    });
  });

  next();
};

module.exports = requestLogger;
