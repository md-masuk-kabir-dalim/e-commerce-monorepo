import { getKafkaConsumer, sendMessage } from "shared/kafka/kafka.client";

export const publishUserCreated = async (userId: string, email: string) => {
  await sendMessage("user-created", [
    { key: userId, value: JSON.stringify({ userId, email }) },
  ]);
};

export const initAuthKafka = async () => {
  await getKafkaConsumer(
    "auth-service",
    "auth-service-group",
    ["user-created", "order-created"],
    async ({ topic, message }) => {
      const value = message.value?.toString();
      console.log(`[Kafka] Received message on topic "${topic}":`, value);

      switch (topic) {
        case "user-created":
          break;
        case "order-created":
          break;
      }
    },
  );
};
