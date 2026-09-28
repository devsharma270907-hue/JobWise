import { Model, Types } from 'mongoose';

export class AppError extends Error {
  statusCode: number;
  code: string;
  fields?: Record<string, string[]>;

  constructor(message: string, statusCode: number, code: string, fields?: Record<string, string[]>) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.fields = fields;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Asserts resource ownership. Always returns 404 (never 403) to avoid confirming resource existence.
 */
export async function assertOwnership<T>(
  ModelClass: Model<T>,
  resourceId: string,
  userId: string
): Promise<T> {
  if (!Types.ObjectId.isValid(resourceId)) {
    throw new AppError('Resource not found', 404, 'NOT_FOUND');
  }

  const doc = await ModelClass.findOne({
    _id: new Types.ObjectId(resourceId),
    userId: new Types.ObjectId(userId),
    isDeleted: { $ne: true },
  } as unknown as Record<string, unknown>);

  if (!doc) {
    throw new AppError('Resource not found', 404, 'NOT_FOUND');
  }

  return doc as unknown as T;
}
