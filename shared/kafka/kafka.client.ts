// shared/kafka/kafka.client.ts
import { Kafka, Producer, Consumer, EachMessagePayload, logLevel } from "kafkajs";

const KAFKA_BROKERS = (process.env.KAFKA_BROKERS || "localhost:9094").split(",");
const CLIENT_ID = process.env.KAFKA_CLIENT_ID || "microservice-client";

const kafka = new Kafka({
  clientId: CLIENT_ID,
  brokers: KAFKA_BROKERS,
  connectionTimeout: 5000,
  retry: { initialRetryTime: 300, retries: 8 },
  logLevel: logLevel.ERROR,
});

// -------------------------------
// Internal caches
// -------------------------------
const producers: Record<string, Producer> = {};
const consumers: Record<string, Consumer> = {};

// -------------------------------
// Retry Helper
// -------------------------------
async function retry<T>(fn: () => Promise<T>, retries = 5, delay = 2000): Promise<T> {
  let lastError: any;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      console.error(`[Kafka] Retry ${i + 1}/${retries} failed`, err);
      await new Promise((res) => setTimeout(res, delay));
    }
  }
  throw lastError;
}

// -------------------------------
// Producer
// -------------------------------
export const getKafkaProducer = async (serviceName: string): Promise<Producer> => {
  if (producers[serviceName]) return producers[serviceName];

  const producer = kafka.producer({ allowAutoTopicCreation: true });
  await retry(() => producer.connect());
  console.log(`[Kafka] Producer connected: ${serviceName}`);

  producers[serviceName] = producer;
  return producer;
};

// -------------------------------
// Consumer
// -------------------------------
export const getKafkaConsumer = async (
  serviceName: string,
  groupId: string,
  topics: string[],
  eachMessage: (payload: EachMessagePayload) => Promise<void>,
): Promise<Consumer> => {
  const consumerKey = `${serviceName}-${groupId}-${topics.join(",")}`;
  if (consumers[consumerKey]) return consumers[consumerKey];

  const consumer = kafka.consumer({ groupId });
  await retry(() => consumer.connect());

  for (const topic of topics) {
    await consumer.subscribe({ topic, fromBeginning: false });
  }

  await consumer.run({
    eachMessage: async (payload) => {
      try {
        await eachMessage(payload);
      } catch (error) {
        console.error(`[Kafka] Consumer handler error in ${serviceName}`, error);
      }
    },
  });

  consumer.on("consumer.crash", async (event) => {
    console.error(`[Kafka] Consumer crashed`, event.payload.error);
    try {
      await retry(() => consumer.connect());
      console.log(`[Kafka] Consumer reconnected: ${serviceName}`);
    } catch (err) {
      console.error(`[Kafka] Failed to reconnect consumer: ${serviceName}`, err);
    }
  });

  console.log(`[Kafka] Consumer connected: ${serviceName}`);
  consumers[consumerKey] = consumer;
  return consumer;
};

// -------------------------------
// Send Message
// -------------------------------
export const sendMessage = async (
  topic: string,
  messages: { key?: string; value: string }[],
) => {
  const producer = await getKafkaProducer("global-producer");
  await retry(() => producer.send({ topic, messages }));
  console.log(`[Kafka] Sent → ${topic}`);
};

// -------------------------------
// Graceful Shutdown
// -------------------------------
export const disconnectKafka = async () => {
  console.log("[Kafka] Disconnecting...");

  for (const key in producers) {
    try {
      await producers[key].disconnect();
    } catch (err) {
      console.error(`[Kafka] Error disconnecting producer ${key}`, err);
    }
  }

  for (const key in consumers) {
    try {
      await consumers[key].disconnect();
    } catch (err) {
      console.error(`[Kafka] Error disconnecting consumer ${key}`, err);
    }
  }

  console.log("[Kafka] Disconnected cleanly");
};

// Handle termination signals
process.on("SIGINT", async () => {
  await disconnectKafka();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await disconnectKafka();
  process.exit(0);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", async (reason) => {
  console.error("[Kafka] Unhandled rejection", reason);
  await disconnectKafka();
  process.exit(1);
});
