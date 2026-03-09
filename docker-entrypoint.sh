#!/bin/sh
set -e

echo "Running RabbitMQ setup…"
node ./dist/messaging/setup-rabbitmq.js

echo "Starting email service…"
exec node ./dist/server.js
