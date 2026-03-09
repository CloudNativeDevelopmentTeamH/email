function getEnv(name: string): string {
  if (!process.env[name]) {
    throw new Error(`Missing env: ${name}`);
  }
  return process.env[name];
} 

function buildRabbitMqUrl(): string {
  const user = getEnv('RABBITMQ_USER');
  const pass = getEnv('RABBITMQ_PASSWORD');
  const host = getEnv('RABBITMQ_HOST');
  const port = getEnv('RABBITMQ_PORT');
  return `amqp://${user}:${pass}@${host}:${port}`;
}

export const config = {
  rabbitmq: {
    url: buildRabbitMqUrl(),
  },
  smtp: {
    host: getEnv('SMTP_HOST'),
    port: parseInt(getEnv('SMTP_PORT'), 10),
    user: getEnv('SMTP_USER'),
    pass: getEnv('SMTP_PASS'),
    from: getEnv('SMTP_FROM'),
  },
};
