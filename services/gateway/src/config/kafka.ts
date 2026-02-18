import { Kafka } from "kafkajs";
import { config } from "./env";

const kafka = new Kafka({
  clientId: "gateway",
  brokers: config.KAFKA_BROKERS,
});

export const producer = kafka.producer();

export const connectKafka = async () => {
  await producer.connect();
  console.log("Kafka Producer connected");
};
