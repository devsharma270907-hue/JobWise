import winston from 'winston';
import { env } from '../config/env.js';

// Keys that must NEVER appear in logs (PII & secrets protection)
const REDACTED_KEYS = new Set([
  'password',
  'token',
  'accesstoken',
  'refreshtoken',
  'jwt',
  'authorization',
  'cookie',
  'secret',
  'key',
  'rawtext',
  'resumetext',
  'extractedtext',
  'content',
  'phonenumber',
  'address',
]);

function sanitizeData(data: unknown): unknown {
  if (data === null || data === undefined) return data;
  if (typeof data !== 'object') return data;
  if (Array.isArray(data)) return data.map(sanitizeData);

  const sanitized: Record<string | symbol, unknown> = {};
  for (const sym of Object.getOwnPropertySymbols(data)) {
    sanitized[sym] = (data as Record<string | symbol, unknown>)[sym];
  }
  for (const [key, val] of Object.entries(data as Record<string, unknown>)) {
    if (REDACTED_KEYS.has(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = sanitizeData(val);
    }
  }
  return sanitized;
}

const piiFilterFormat = winston.format((info) => {
  for (const [key, val] of Object.entries(info)) {
    if (REDACTED_KEYS.has(key.toLowerCase())) {
      info[key] = '[REDACTED]';
    } else if (typeof val === 'object' && val !== null) {
      info[key] = sanitizeData(val);
    }
  }
  return info;
});

const logFormat = winston.format.combine(
  piiFilterFormat(),
  winston.format.timestamp(),
  env.NODE_ENV === 'development'
    ? winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, ...meta }) => {
          const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
          return `[${timestamp}] ${level}: ${message}${metaStr}`;
        })
      )
    : winston.format.json()
);

export const logger = winston.createLogger({
  level: env.NODE_ENV === 'development' ? 'debug' : 'info',
  format: logFormat,
  transports: [
    new winston.transports.Console(),
  ],
});
