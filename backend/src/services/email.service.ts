import nodemailer, { Transporter } from 'nodemailer';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

export class EmailService {
  private transporter: Transporter | null = null;

  constructor() {
    if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: env.SMTP_PORT || 465,
        secure: (env.SMTP_PORT || 465) === 465,
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      });
    }
  }

  async sendFollowUpReminder(
    to: string,
    jobTitle: string,
    company: string,
    daysSinceApplied: number
  ): Promise<void> {
    const subject = `JobWise Follow-Up Reminder: ${jobTitle} at ${company}`;
    const text = `Hi there,\n\nIt has been ${daysSinceApplied} days since you applied for ${jobTitle} at ${company}.\nConsider sending a polite follow-up email or connecting with the hiring manager on LinkedIn.\n\nBest,\nYour JobWise AI Career Agent`;

    if (!this.transporter) {
      logger.info('Simulated email dispatch (SMTP not configured):', {
        to,
        subject,
      });
      return;
    }

    try {
      await this.transporter.sendMail({
        from: env.EMAIL_FROM,
        to,
        subject,
        text,
      });
      logger.info('Follow-up reminder email sent', { to, company });
    } catch (error) {
      logger.error('Failed to send email notification', {
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}

export const emailService = new EmailService();
