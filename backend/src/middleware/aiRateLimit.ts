import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/ownershipCheck.js';
import { UserModel } from '../modules/users/user.model.js';
import { env } from '../config/env.js';

export async function aiRateLimit(req: Request, _res: Response, next: NextFunction): Promise<void> {
  if (!req.user) {
    throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
  }

  const userId = req.user._id;
  const user = await UserModel.findById(userId);

  if (!user) {
    throw new AppError('User not found', 404, 'NOT_FOUND');
  }

  const now = new Date();
  const resetAt = user.aiUsage?.budgetResetAt || now;

  // Reset monthly budget if a month has elapsed
  if (now >= resetAt) {
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    user.aiUsage = {
      monthlyTokensUsed: 0,
      monthlyBudget: user.aiUsage?.monthlyBudget || env.AI_MONTHLY_TOKEN_BUDGET_PER_USER,
      budgetResetAt: nextMonth,
    };
    await user.save();
  }

  const budget = user.aiUsage?.monthlyBudget || env.AI_MONTHLY_TOKEN_BUDGET_PER_USER;
  const used = user.aiUsage?.monthlyTokensUsed || 0;

  if (used >= budget) {
    throw new AppError(
      'Monthly AI usage limit reached. Please upgrade your plan or wait for the next billing cycle.',
      429,
      'AI_BUDGET_EXCEEDED'
    );
  }

  next();
}
