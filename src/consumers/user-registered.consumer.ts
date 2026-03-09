import amqplib from 'amqplib';
import pino from 'pino';
import { config } from '../utils/config.ts';
import { USER_EVENTS_EXCHANGE, USER_REGISTERED, REGISTRATION_EMAIL_QUEUE } from '../events.ts';
import { sendRegistrationConfirmation } from '../services/email.service.ts';

const logger = pino();

interface UserRegisteredEvent {
  userId: number;
  name: string;
  email: string;
  registeredAt: string;
}

let connection: amqplib.ChannelModel | null = null;

export async function startConsumer(): Promise<void> {
  connection = await amqplib.connect(config.rabbitmq.url);
  const channel = await connection.createChannel();

  await channel.assertExchange(
    USER_EVENTS_EXCHANGE,
    'topic',
    { durable: true }
  );
  
  await channel.assertQueue(
    REGISTRATION_EMAIL_QUEUE,
    { durable: true }
  );

  await channel.bindQueue(
    REGISTRATION_EMAIL_QUEUE,
    USER_EVENTS_EXCHANGE,
    USER_REGISTERED
  );

  channel.prefetch(1);

  channel.consume(REGISTRATION_EMAIL_QUEUE, (msg) => {
    if (!msg) return;

    void (async () => {
      try {
        const event = JSON.parse(msg.content.toString()) as UserRegisteredEvent;
        await sendRegistrationConfirmation(event.email, event.name);
        channel.ack(msg);
        logger.info({ userId: event.userId }, 'Registration email sent');
      } catch (err) {
        logger.error(err, 'Failed to process user.registered event');
        channel.nack(msg, false, false);
      }
    })();
  });

  logger.info('Consumer bound to queue "%s"', REGISTRATION_EMAIL_QUEUE);
}

export async function stopConsumer(): Promise<void> {
  await connection?.close();
}
