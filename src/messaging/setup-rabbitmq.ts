/**
 * Bootstrap script — declares the RabbitMQ topology (exchange + queue + binding)
 * so that messages published by the auth service are never lost when the
 * email service is not yet running.
 *
 * Run: npm run setup:rabbitmq
 */

import 'dotenv/config';
import amqplib from 'amqplib';
import { config } from '../utils/config.ts';
import { USER_EVENTS_EXCHANGE, USER_REGISTERED, REGISTRATION_EMAIL_QUEUE } from '../events.ts';

async function setup(): Promise<void> {
  const url = config.rabbitmq.url;
  console.log(`Connecting to RabbitMQ at ${url.replace(/:[^:@]+@/, ':***@')} …`);

  const connection = await amqplib.connect(url);
  const channel = await connection.createChannel();

  await channel.assertExchange(USER_EVENTS_EXCHANGE, 'topic', { durable: true });
  console.log(`✓ Exchange  "${USER_EVENTS_EXCHANGE}" (topic, durable)`);

  await channel.assertQueue(REGISTRATION_EMAIL_QUEUE, { durable: true });
  console.log(`✓ Queue     "${REGISTRATION_EMAIL_QUEUE}" (durable)`);

  await channel.bindQueue(REGISTRATION_EMAIL_QUEUE, USER_EVENTS_EXCHANGE, USER_REGISTERED);
  console.log(`✓ Binding   "${REGISTRATION_EMAIL_QUEUE}" ← "${USER_EVENTS_EXCHANGE}" [${USER_REGISTERED}]`);

  await channel.close();
  await connection.close();

  console.log('\nRabbitMQ topology ready.');
}

await setup().catch((err) => {
  console.error('Setup failed:', err);
  process.exit(1);
});
