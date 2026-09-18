import prisma from '../config/db.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

export const getHealthStatus = async (req, res, next) => {
  try {
    const startTime = Date.now();
    // Test live MySQL connection via Prisma
    const [dbResult] = await prisma.$queryRaw`SELECT 1 as live, VERSION() as version, NOW() as dbTime`;
    const responseTimeMs = Date.now() - startTime;

    const healthData = {
      app: 'Tez Thaila API',
      status: 'UP',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
      database: {
        status: 'CONNECTED',
        provider: 'MySQL',
        version: dbResult?.version || 'Unknown',
        queryLatencyMs: responseTimeMs,
        dbTimestamp: dbResult?.dbTime
      },
      environment: process.env.NODE_ENV || 'development'
    };

    return sendSuccess(res, 200, 'Tez Thaila API is healthy and operational', healthData);
  } catch (error) {
    return sendError(res, 503, 'Service Unavailable: Database connection failed', {
      database: 'DISCONNECTED',
      error: error.message
    });
  }
};
