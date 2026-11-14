import dns from 'dns';
import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

// Fallback DNS servers for standard resolution
if (env.MONGODB_URI.startsWith('mongodb+srv://')) {
  try {
    dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
  } catch {
    // Keep default DNS if setServers is not permitted
  }
}

/**
 * Resolves mongodb+srv:// to standard mongodb:// using DNS-over-HTTPS (DoH).
 * Bypasses Node.js c-ares DNS UDP packet truncation/EBADRESP issues common on Windows & local ISP routers.
 */
async function resolveSrvUri(uri: string): Promise<string> {
  if (!uri.startsWith('mongodb+srv://')) return uri;

  const match = uri.match(/^mongodb\+srv:\/\/(?:([^:]+):([^@]+)@)?([^/?#]+)([^?#]*)(?:\?(.*))?$/);
  if (!match) return uri;

  const [, user, pass, host = '', path = '', search = ''] = match;
  try {
    const srvUrl = `https://dns.google/resolve?name=${encodeURIComponent('_mongodb._tcp.' + host)}&type=SRV`;
    const txtUrl = `https://dns.google/resolve?name=${encodeURIComponent(host)}&type=TXT`;

    const [srvRes, txtRes] = await Promise.all([
      fetch(srvUrl).then((r) => r.json() as Promise<any>),
      fetch(txtUrl).then((r) => r.json() as Promise<any>),
    ]);

    if (!srvRes.Answer || srvRes.Answer.length === 0) {
      return uri;
    }

    const hosts = srvRes.Answer
      .filter((a: any) => a.type === 33)
      .map((a: any) => {
        const parts = a.data.trim().split(/\s+/);
        const port = parts[2];
        const target = parts[3].replace(/\.$/, '');
        return `${target}:${port}`;
      });

    if (hosts.length === 0) return uri;

    let txtParams = '';
    if (txtRes.Answer && txtRes.Answer.length > 0) {
      const txtRecord = txtRes.Answer.find((a: any) => a.type === 16);
      if (txtRecord) {
        txtParams = txtRecord.data.replace(/^"|"$/g, '');
      }
    }

    const auth = user ? `${encodeURIComponent(user)}:${encodeURIComponent(pass || '')}@` : '';
    const params = new URLSearchParams(search);
    params.set('ssl', 'true');

    if (txtParams) {
      const txtParsed = new URLSearchParams(txtParams);
      for (const [k, v] of txtParsed.entries()) {
        if (!params.has(k)) {
          params.set(k, v);
        }
      }
    }

    return `mongodb://${auth}${hosts.join(',')}${path || '/'}?${params.toString()}`;
  } catch (err) {
    logger.warn('DoH SRV resolution encountered error, using default URI:', {
      error: err instanceof Error ? err.message : String(err),
    });
    return uri;
  }
}

let memoryServer: any = null;

export async function connectDB(): Promise<void> {
  mongoose.connection.on('connected', () => {
    logger.info('MongoDB connected successfully');
  });

  mongoose.connection.on('error', (err) => {
    logger.error('MongoDB connection error:', { error: err.message });
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });

  let uriToConnect = env.MONGODB_URI;
  if (uriToConnect.startsWith('mongodb+srv://')) {
    const resolved = await resolveSrvUri(uriToConnect);
    if (resolved !== uriToConnect) {
      logger.info('Successfully resolved MongoDB Atlas SRV URI via DNS-over-HTTPS');
      uriToConnect = resolved;
    }
  }

  try {
    await mongoose.connect(uriToConnect, { serverSelectionTimeoutMS: 3000 });
  } catch (initialErr) {
    logger.warn('Primary MongoDB connection failed. Attempting local development fallback...', {
      error: initialErr instanceof Error ? initialErr.message : String(initialErr),
    });

    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      try {
        memoryServer = await MongoMemoryServer.create({
          instance: { port: 27017, dbName: 'JobWise' },
        });
      } catch {
        memoryServer = await MongoMemoryServer.create({
          instance: { dbName: 'JobWise' },
        });
      }
      const memUri = memoryServer.getUri();
      logger.info(`Started embedded local MongoDB instance at: ${memUri} [Database: JobWise]`);
      await mongoose.connect(memUri.replace(/\/?$/, '/JobWise'));
    } catch (memErr) {
      logger.error('Failed to start both primary and fallback MongoDB instances', {
        error: memErr instanceof Error ? memErr.message : String(memErr),
      });
      process.exit(1);
    }
  }
}

export async function disconnectDB(): Promise<void> {
  try {
    await mongoose.disconnect();
    if (memoryServer) {
      await memoryServer.stop();
      logger.info('Embedded MongoDB instance stopped cleanly');
    }
    logger.info('MongoDB disconnected cleanly');
  } catch (error) {
    logger.error('Error during MongoDB disconnect', {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}


