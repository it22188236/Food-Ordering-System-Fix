const amqp = require("amqplib");

const connectRabbitMQ = async () => {
  const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://rabbitmq:5672";

  for (let i = 0; i < 10; i++) {
    try {
      const connection = await amqp.connect(RABBITMQ_URL);
      console.log("✅ Connected to RabbitMQ");
      return connection;
    } catch (err) {
      console.error(`⏳ RabbitMQ connection failed, retrying in 5s... (${i + 1}/10)`);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  throw new Error("❌ Failed to connect to RabbitMQ after retries");
};

module.exports = connectRabbitMQ;
