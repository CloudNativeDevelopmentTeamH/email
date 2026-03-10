# Email Service

A transactional email microservice built with TypeScript. Built as part of the Cloud Native Development lecture. This service listens for domain events published by the Auth service via RabbitMQ and sends the corresponding emails.

## Features

- 📨 **Event-Driven**: Consumes `user.registered` events from RabbitMQ
- 📧 **Transactional Emails**: Sends registration confirmation emails via SMTP (Nodemailer)
- 🛡️ **Reliable Delivery**: Manual ack/nack with dead-letter support
- 📝 **Logging**: Structured logging with Pino
- 🐳 **Docker Support**: Multi-stage Dockerfile with non-root user
- 🔧 **Topology Bootstrap**: Setup script to declare RabbitMQ exchange, queue and binding

## Tech Stack

- **Runtime**: Node.js with TypeScript
- **Message Broker**: RabbitMQ (amqplib)
- **Email Transport**: Nodemailer
- **Logging**: Pino
- **Containerization**: Docker + Docker Compose

## Architecture

The project follows a simple MVC-style structure:

```
src/
├── server.ts                          # Entry point — starts the consumer
├── events.ts                          # RabbitMQ constants (exchange, queue, routing key)
├── consumers/
│   └── user-registered.consumer.ts   # RabbitMQ listener for user.registered events
├── services/
│   └── email.service.ts              # Nodemailer email sending logic
├── messaging/
│   └── setup-rabbitmq.ts             # Bootstrap script — declares topology
└── utils/
    └── config.ts                     # Environment-based configuration
```

Additional project structure:

```
├── docker-compose.yml     # RabbitMQ & email service containers
├── docker-entrypoint.sh   # Runs setup-rabbitmq then starts the server
├── Dockerfile             # Multi-stage container image
└── package.json
```

### Event Flow

```
Auth Service
    │
    │  publishes: user.registered
    ▼
RabbitMQ (exchange: user.events, type: topic)
    │
    │  binding: user.registered → email.user.registered
    ▼
Email Service (consumer)
    │
    │  sendRegistrationConfirmation()
    ▼
SMTP Server (Nodemailer)
```

## Getting Started

### Prerequisites

- Node.js 22+
- Docker and Docker Compose
- An SMTP server/service

### Development Mode (with hot reload)

1. Install dependencies
```bash
npm install
```

2. Set up environment variables
Create a `.env` file in the root directory:
```env
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_UI_PORT=15672
RABBITMQ_USER=test
RABBITMQ_PASSWORD=test

SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=your_mailtrap_user
SMTP_PASS=your_mailtrap_pass
SMTP_FROM=noreply@focusboard.app
```
This `.env` configures both the Node.js server and Docker Compose to have matching configuration.

3. Start RabbitMQ
```bash
docker compose up -d queue
```

4. Declare the RabbitMQ topology
```bash
npm run setup:rabbitmq
```

5. Start the development server
```bash
npm run dev
```

### Run Locally

1. Install dependencies
```bash
npm install
```

2. Set up environment variables
Create a `.env` file in the root directory:
```env
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_UI_PORT=15672
RABBITMQ_USER=test
RABBITMQ_PASSWORD=test

SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=587
SMTP_USER=your_mailtrap_user
SMTP_PASS=your_mailtrap_pass
SMTP_FROM=noreply@focusboard.app
```
This `.env` configures both the Node.js server and Docker Compose to have matching configuration.

3. Start RabbitMQ & application
```bash
docker compose up
```
The entrypoint of the application will automaticall setup the topology for RabbitMQ.

## Development

### Available Scripts

**Setup**
- `npm run setup:rabbitmq` — Declare RabbitMQ exchange, queue and binding

**Development**
- `npm run dev` — Start development server with hot reload

**Build & Run**
- `npm run build` — Compile TypeScript to JavaScript
- `npm start` — Run production build

**Linting**
- `npm run lint` — Check for lint errors
- `npm run lint:fix` — Auto-fix lint errors
