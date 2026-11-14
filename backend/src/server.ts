import http from 'http';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { connectDB, disconnectDB } from './config/db.js';
import { jobFeedService } from './services/jobFeed.service.js';
import { seedService } from './services/seed.service.js';
import { startCronJobs } from './services/cron.service.js';
import { logger } from './utils/logger.js';

async function bootstrap(): Promise<void> {
  // 1. Connect to MongoDB
  await connectDB();

  // 2. Seed initial sample jobs for immediate usability
  await jobFeedService.seedIfEmpty();

  // 3. Seed demo account & sample pipeline for immediate login usability
  await seedService.seedDemoUser();

  // 4. Start background cron jobs
  startCronJobs();

  // 4. Initialize Express App
  const app = createApp();
  const server = http.createServer(app);

  server.listen(env.PORT, () => {
    logger.info(`JobWise Backend Server running on port ${env.PORT} in [${env.NODE_ENV}] mode`);
    logger.info(`Health check: http://localhost:${env.PORT}/health`);
    logger.info(`Readiness: http://localhost:${env.PORT}/ready`);
    logger.info(`API Base: http://localhost:${env.PORT}/api/v1`);
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      logger.info('HTTP server closed');
      await disconnectDB();
      process.exit(0);
    });

    // Force exit if not closed within 10 seconds
    setTimeout(() => {
      logger.error('Forceful shutdown after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((error) => {
  logger.error('Fatal bootstrap error:', {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });
  process.exit(1);
});
