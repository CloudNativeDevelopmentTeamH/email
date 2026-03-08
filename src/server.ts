import 'dotenv/config';
import pino from 'pino';
import { startConsumer, stopConsumer } from './consumers/user-registered.consumer.ts';

const logger = pino();

try {
  await startConsumer();
  logger.info('Email service started — listening for events');
} catch (err) {
  logger.error(err, 'Failed to start email service');
  process.exit(1);
}

const shutdown = async (signal: string): Promise<void> => {
  logger.info(`${signal} received — shutting down`);
  await stopConsumer();
  process.exit(0);
};

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
