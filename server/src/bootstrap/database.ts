import mongoose from 'mongoose';
import { logger } from '../shared/utils/logger.js';

interface DatabaseHealth {
  status: 'connected' | 'disconnected' | 'connecting' | 'fallback_memory';
  host?: string;
  database?: string;
  poolSize?: number;
}

class DatabaseManager {
  private isConnected = false;
  private isFallbackMode = false;

  public async connect(): Promise<void> {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/dairymitra_production';
    const minPoolSize = parseInt(process.env.MONGODB_MIN_POOL_SIZE || '5', 10);
    const maxPoolSize = parseInt(process.env.MONGODB_MAX_POOL_SIZE || '50', 10);
    const connectTimeoutMS = parseInt(process.env.MONGODB_CONNECT_TIMEOUT_MS || '5000', 10);
    const socketTimeoutMS = parseInt(process.env.MONGODB_SOCKET_TIMEOUT_MS || '45000', 10);

    mongoose.set('strictQuery', true);

    mongoose.connection.on('connected', () => {
      this.isConnected = true;
      this.isFallbackMode = false;
      logger.info('MongoDB connection pool established successfully', 'Database', {
        minPoolSize,
        maxPoolSize,
      });
    });

    mongoose.connection.on('error', (err) => {
      if (this.isFallbackMode) return;
      logger.error('MongoDB connection error', 'Database', err);
    });

    mongoose.connection.on('disconnected', () => {
      this.isConnected = false;
      logger.warn('MongoDB disconnected. Reconnection will be attempted.', 'Database');
    });

    try {
      logger.info('Connecting to MongoDB connection pool...', 'Database', { uri: uri.replace(/:\/\/.*@/, '://[MASKED]@') });
      await mongoose.connect(uri, {
        minPoolSize,
        maxPoolSize,
        connectTimeoutMS,
        socketTimeoutMS,
        serverSelectionTimeoutMS: 5000,
      });
      this.isConnected = true;
    } catch (err: any) {
      this.isConnected = false;
      this.isFallbackMode = true;
      logger.warn(
        `MongoDB unavailable on ${uri}. Running in resilient resilient-mode (in-memory document store active for immediate development/testing).`,
        'Database',
        { error: err.message }
      );
    }
  }

  public getHealth(): DatabaseHealth {
    if (this.isFallbackMode) {
      return { status: 'fallback_memory', database: 'in-memory-datastore' };
    }
    const state = mongoose.connection.readyState;
    const states: Record<number, DatabaseHealth['status']> = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnected',
    };
    return {
      status: states[state] || 'disconnected',
      host: mongoose.connection.host,
      database: mongoose.connection.name,
    };
  }

  public async disconnect(): Promise<void> {
    if (this.isConnected) {
      await mongoose.connection.close(false);
      this.isConnected = false;
      logger.info('MongoDB connection pool closed gracefully', 'Database');
    }
  }

  public isUsingFallback(): boolean {
    return this.isFallbackMode;
  }
}

export const dbManager = new DatabaseManager();
