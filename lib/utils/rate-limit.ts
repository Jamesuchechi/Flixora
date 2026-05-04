import { NextRequest } from 'next/server';

const rateLimitMap = new Map<string, { count: number; lastReset: number }>();

/**
 * Extremely lightweight rate limiter for API routes.
 * Note: In serverless environments, this is best-effort unless backed by Redis.
 */
export function rateLimit(req: NextRequest, limit: number = 10, windowMs: number = 60000) {
  const ip = req.headers.get('x-forwarded-for') || 'anonymous';
  const now = Date.now();
  
  const record = rateLimitMap.get(ip) || { count: 0, lastReset: now };

  if (now - record.lastReset > windowMs) {
    record.count = 1;
    record.lastReset = now;
    rateLimitMap.set(ip, record);
    return { success: true, count: 1, limit };
  }

  if (record.count >= limit) {
    return { success: false, count: record.count, limit };
  }

  record.count += 1;
  rateLimitMap.set(ip, record);
  return { success: true, count: record.count, limit };
}
