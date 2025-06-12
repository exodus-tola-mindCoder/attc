import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';
import logger from '../utils/logger.js';

import dotenv from 'dotenv';  

dotenv.config();

// Create Redis client for rate limiting (optional - falls back to memory store)
let redisClient;
try {
  if (process.env.REDIS_URL) {
    redisClient = new Redis(process.env.REDIS_URL);
    logger.info('Redis connected for rate limiting');
  }
} catch (error) {
  logger.warn('Redis not available, using memory store for rate limiting');
}

// General rate limiter
const rateLimiter = rateLimit({
  store: redisClient ? new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }) : undefined,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes'
    });
  }
});

export default rateLimiter;

// Strict rate limiter for sensitive operations
export const strictRateLimiter = rateLimit({
  store: redisClient ? new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }) : undefined,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per windowMs
  message: {
    error: 'Too many sensitive requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn(`Strict rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many sensitive requests from this IP, please try again later.',
      retryAfter: '15 minutes'
    });
  }
});

// Auth rate limiter
export const authRateLimiter = rateLimit({
  store: redisClient ? new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }) : undefined,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: {
    error: 'Too many login attempts from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many login attempts from this IP, please try again later.',
      retryAfter: '15 minutes'
    });
  }
});