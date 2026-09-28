import cron from 'node-cron';
import { env } from '../config/env.js';
import { jobFeedService } from './jobFeed.service.js';
import { ApplicationModel } from '../modules/applications/application.model.js';
import { UserModel } from '../modules/users/user.model.js';
import { emailService } from './email.service.js';
import { logger } from '../utils/logger.js';

export function startCronJobs(): void {
  // 1. Partner job feed poll cron
  if (env.JOB_FEED_POLL_CRON && cron.validate(env.JOB_FEED_POLL_CRON)) {
    cron.schedule(env.JOB_FEED_POLL_CRON, async () => {
      logger.info('Cron triggering job feed poll...');
      await jobFeedService.pollAndIngest();
    });
    logger.info(`Cron registered: Job feed ingestion (${env.JOB_FEED_POLL_CRON})`);
  }

  // 2. Application follow-up nudge scan: runs every day at 09:00
  cron.schedule('0 9 * * *', async () => {
    try {
      logger.info('Cron scanning applications for follow-up reminders...');
      const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);

      const staleApplications = await ApplicationModel.find({
        status: 'applied',
        appliedAt: { $lte: tenDaysAgo },
        isDeleted: false,
      });

      for (const app of staleApplications) {
        const user = await UserModel.findById(app.userId);
        if (user && user.email) {
          const daysElapsed = Math.floor(
            (Date.now() - (app.appliedAt?.getTime() || Date.now())) / (24 * 60 * 60 * 1000)
          );
          await emailService.sendFollowUpReminder(
            user.email,
            app.jobTitle,
            app.company,
            daysElapsed
          );
        }
      }
    } catch (error) {
      logger.error('Error during follow-up cron scan', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });

  logger.info('Cron registered: Daily application follow-up nudge scan');
}
