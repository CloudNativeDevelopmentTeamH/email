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
RABBITMQ_USER=user
RABBITMQ_PASSWORD=password

SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=user
SMTP_PASS=password
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
RABBITMQ_USER=user
RABBITMQ_PASSWORD=password

SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=user
SMTP_PASS=password
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

## Kubernetes Deployment

The project includes Helm charts for deploying to Kubernetes clusters with production-ready configurations.

### Helm Chart Structure

The Helm chart provides a complete Kubernetes deployment including:

- **Application Deployment**: Single replica deployment for the email consumer
- **ConfigMaps**: Environment configuration management (SMTP settings, RabbitMQ host)
- **Secrets**: Sensitive data management (encrypted SMTP and RabbitMQ credentials)

### Prerequisites

- Kubernetes cluster (tested on AWS EKS)
- Helm 3.x installed
- `kubectl` configured to access your cluster
- Container image pushed to ECR or container registry
- RabbitMQ service already running in the cluster (e.g., from the auth service)

### Configuration

The [values.yaml](helm/values.yaml) file contains all configurable parameters:

```yaml
namespace: email

email:
  name: email-app
  image:
    repository: ghcr.io/cloudnativedevelopmentteamh/focusboard/auth
    tag: latest
  replicas: 1
  smtp:
    host: "sandbox.smtp.mailtrap.io"
    port: 2525
    from: "noreply@focusboard.app"
  configmap:
    name: app-config

rabbitmq:
  host: "rabbitmq.auth.svc.cluster.local"
  port: 5672
```

### Secrets Management

The project includes an encrypted secrets file [secrets.enc.yaml](helm/templates/secrets.enc.yaml) managed with [SOPS](https://github.com/mozilla/sops).

**Decrypt secrets before deployment:**

```bash
# Decrypt the encrypted secrets file
export SOPS_AGE_KEY="age1q9w5v5l5j5k5l5m5n5o5p5q5r5s5t5u5v5w5x5y5z5a5b5c5d5e5f"
sops -d ./helm/secrets.enc.yaml > ./helm/secret_values.yaml
```

The decrypted `secret_values.yaml` should contain:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: email-secrets
  namespace: email
type: Opaque
stringData:
  RABBITMQ_USER: "rabbitmq_user"
  RABBITMQ_PASSWORD: "rabbitmq_password"
  SMTP_USER: "smtp_user"
  SMTP_PASS: "smtp_password"
```

### Deploy to Kubernetes

```bash
helm install email ./helm -n email --create-namespace -f ./helm/secret_values.yaml
```

### Update Deployment

To update the deployment with new configurations or image versions:

```bash
helm upgrade email ./helm -n email -f ./helm/secret_values.yaml
```

### Uninstall

To remove the deployment:

```bash
helm uninstall email -n email
kubectl delete namespace email
```
