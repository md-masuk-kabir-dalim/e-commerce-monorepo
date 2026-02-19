import { Kafka, logLevel } from "kafkajs";

const KAFKA_BROKERS = (process.env.KAFKA_BROKERS || "localhost:9094").split(
  ",",
);
const CLIENT_ID = process.env.KAFKA_CLIENT_ID || "microservice-client";

const kafka = new Kafka({
  clientId: CLIENT_ID,
  brokers: KAFKA_BROKERS,
  logLevel: logLevel.ERROR,
});

// -------------------------------
// Create topics
// -------------------------------
export const createKafkaTopics = async (topics: string[]) => {
  const admin = kafka.admin();
  await admin.connect();

  try {
    const existingTopics = await admin.listTopics();
    const topicsToCreate = topics.filter((t) => !existingTopics.includes(t));

    if (topicsToCreate.length === 0) {
      console.log("[Kafka Admin] All topics already exist ✅");
      return;
    }

    await admin.createTopics({
      topics: topicsToCreate.map((topic) => ({
        topic,
        numPartitions: 1,
        replicationFactor: 1,
      })),
    });

    console.log("[Kafka Admin] Created topics:", topicsToCreate);
  } catch (err) {
    console.warn("[Kafka Admin] Error creating topics", err);
  } finally {
    await admin.disconnect();
  }
};
