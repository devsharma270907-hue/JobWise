import bcrypt from 'bcryptjs';
import { UserModel, IUser } from '../users/user.model.js';
import { RegisterInput, LoginInput } from './auth.schema.js';
import { AppError } from '../../utils/ownershipCheck.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  TokenPayload,
} from '../../utils/jwt.js';
import { logger } from '../../utils/logger.js';

const BCRYPT_ROUNDS = 10;
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export class AuthService {
  async register(input: RegisterInput): Promise<{
    user: IUser;
    accessToken: string;
    refreshToken: string;
  }> {
    const existing = await UserModel.findOne({ email: input.email, isDeleted: false });
    if (existing) {
      throw new AppError('An account with this email already exists', 409, 'CONFLICT');
    }

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

    const user = new UserModel({
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role || 'student',
    });

    const tokenPayload: TokenPayload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    const refreshTokenHash = await bcrypt.hash(refreshToken, BCRYPT_ROUNDS);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    user.refreshTokens.push({
      tokenHash: refreshTokenHash,
      createdAt: new Date(),
      expiresAt,
    });

    await user.save();

    return { user, accessToken, refreshToken };
  }

  async login(input: LoginInput): Promise<{
    user: IUser;
    accessToken: string;
    refreshToken: string;
  }> {
    const user = await UserModel.findOne({ email: input.email, isDeleted: false });
    if (!user || !user.passwordHash) {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    // Check account lockout
    if (user.lockUntil && user.lockUntil > new Date()) {
      const remainingMinutes = Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000);
      throw new AppError(
        `Account locked due to consecutive failed attempts. Try again in ${remainingMinutes} minute(s).`,
        403,
        'ACCOUNT_LOCKED'
      );
    }

    const isValidPassword = await bcrypt.compare(input.password, user.passwordHash);
    if (!isValidPassword) {
      user.failedLoginAttempts += 1;
      if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
        user.lockUntil = new Date(Date.now() + LOCKOUT_DURATION_MS);
        logger.warn('User account locked due to excessive failed attempts', {
          userId: user._id.toString(),
        });
      }
      await user.save();
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
    }

    // Reset lockout counters on success
    user.failedLoginAttempts = 0;
    user.lockUntil = null;

    const tokenPayload: TokenPayload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = signAccessToken(tokenPayload);
    const refreshToken = signRefreshToken(tokenPayload);

    const refreshTokenHash = await bcrypt.hash(refreshToken, BCRYPT_ROUNDS);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Prune expired refresh tokens and add new one
    const now = new Date();
    user.refreshTokens = user.refreshTokens.filter((t) => t.expiresAt > now);
    user.refreshTokens.push({
      tokenHash: refreshTokenHash,
      createdAt: now,
      expiresAt,
    });

    try {
      await user.save();
    } catch (saveErr: any) {
      if (saveErr?.name === 'VersionError') {
        await UserModel.findByIdAndUpdate(user._id, {
          $set: {
            failedLoginAttempts: 0,
            lockUntil: null,
            refreshTokens: user.refreshTokens,
          },
        });
      } else {
        throw saveErr;
      }
    }

    return { user, accessToken, refreshToken };
  }

  async refresh(oldRefreshToken: string): Promise<{
    accessToken: string;
    newRefreshToken: string;
  }> {
    let payload: TokenPayload;
    try {
      payload = verifyRefreshToken(oldRefreshToken);
    } catch {
      throw new AppError('Refresh token expired or invalid', 401, 'REFRESH_TOKEN_INVALID');
    }

    const user = await UserModel.findOne({ _id: payload.sub, isDeleted: false });
    if (!user) {
      throw new AppError('User not found', 401, 'UNAUTHORIZED');
    }

    // Check if the provided refresh token matches any of the stored hashes
    let matchedIndex = -1;
    for (let i = 0; i < user.refreshTokens.length; i++) {
      const stored = user.refreshTokens[i];
      if (stored && (await bcrypt.compare(oldRefreshToken, stored.tokenHash))) {
        matchedIndex = i;
        break;
      }
    }

    // Breach detection: Token was verified cryptographically, but not found in active tokens!
    // This implies an attacker or race condition replaying an old rotated token.
    if (matchedIndex === -1) {
      logger.error('Breach detected: Reused refresh token submitted. Revoking all active sessions.', {
        userId: user._id.toString(),
      });
      user.refreshTokens = [];
      await user.save();
      throw new AppError(
        'Suspicious session activity detected. Please log in again.',
        401,
        'REFRESH_TOKEN_REUSED'
      );
    }

    // Rotate: remove old token
    user.refreshTokens.splice(matchedIndex, 1);

    const tokenPayload: TokenPayload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    const accessToken = signAccessToken(tokenPayload);
    const newRefreshToken = signRefreshToken(tokenPayload);

    const newHash = await bcrypt.hash(newRefreshToken, BCRYPT_ROUNDS);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    user.refreshTokens.push({
      tokenHash: newHash,
      createdAt: new Date(),
      expiresAt,
    });

    try {
      await user.save();
    } catch (saveErr: any) {
      if (saveErr?.name === 'VersionError') {
        await UserModel.findByIdAndUpdate(user._id, {
          $set: { refreshTokens: user.refreshTokens },
        });
      } else {
        throw saveErr;
      }
    }

    return { accessToken, newRefreshToken };
  }

  async logout(userId: string, refreshToken?: string): Promise<void> {
    const user = await UserModel.findById(userId);
    if (!user) return;

    if (refreshToken) {
      // Remove specific token
      for (let i = 0; i < user.refreshTokens.length; i++) {
        const stored = user.refreshTokens[i];
        if (stored && (await bcrypt.compare(refreshToken, stored.tokenHash))) {
          user.refreshTokens.splice(i, 1);
          break;
        }
      }
    } else {
      // Clear all
      user.refreshTokens = [];
    }

    await user.save();
  }
}

export const authService = new AuthService();
