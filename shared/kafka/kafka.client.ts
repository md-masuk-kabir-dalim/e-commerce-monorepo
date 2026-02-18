import { Kafka, Producer, Consumer, EachMessagePayload } from "kafkajs";

const KAFKA_BROKERS = (process.env.KAFKA_BROKERS || "localhost:9092").split(
  ",",
);
const CLIENT_ID = process.env.KAFKA_CLIENT_ID || "microservice-client";

const kafka = new Kafka({
  clientId: CLIENT_ID,
  brokers: KAFKA_BROKERS,
  connectionTimeout: 3000,
  retry: {
    initialRetryTime: 300,
    retries: 10,
  },
});

// Cache for producers and consumers
const producers: Record<string, Producer> = {};
const consumers: Record<string, Consumer> = {};

/**
 * Get or create a producer for a service
 */
export const getKafkaProducer = async (
  serviceName: string,
): Promise<Producer> => {
  if (producers[serviceName]) return producers[serviceName];

  const producer = kafka.producer();
  await producer.connect();
  console.log(`[Kafka] Producer connected for service: ${serviceName}`);
  producers[serviceName] = producer;
  return producer;
};

/**
 * Get or create a consumer for a service
 */
export const getKafkaConsumer = async (
  serviceName: string,
  groupId: string,
  topics: string[],
  eachMessage: (payload: EachMessagePayload) => Promise<void>,
): Promise<Consumer> => {
  if (consumers[serviceName]) return consumers[serviceName];

  const consumer = kafka.consumer({ groupId });
  await consumer.connect();

  for (const topic of topics) {
    await consumer.subscribe({ topic, fromBeginning: true });
  }

  await consumer.run({ eachMessage });

  console.log(
    `[Kafka] Consumer connected for service: ${serviceName}, topics: ${topics.join(", ")}`,
  );
  consumers[serviceName] = consumer;
  return consumer;
};

/**
 * Send message to a Kafka topic
 */
export const sendMessage = async (
  topic: string,
  messages: { key?: string; value: string }[],
) => {
  const producer = await getKafkaProducer("global-producer");
  await producer.send({ topic, messages });
  console.log(`[Kafka] Message sent to topic "${topic}"`);
};
