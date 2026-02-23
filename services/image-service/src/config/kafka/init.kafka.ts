import { getKafkaConsumer } from "shared/kafka/kafka.client";
import { OrderCreatedEvent, UserCreatedEvent } from "./event.types";
import { Topics } from "./events";

const handlers: {
  [key in Topics]?: (data: any) => Promise<void>;
} = {
  [Topics.USER_CREATED]: async (data: UserCreatedEvent) => {
    console.log("Handle user created:", data);
  },

  [Topics.ORDER_CREATED]: async (data: OrderCreatedEvent) => {
    console.log("Handle order created:", data);
  },
};

export const initAuthKafka = async () => {
  await getKafkaConsumer(
    "auth-service",
    "auth-service-group",
    Object.values(Topics),
    async ({ topic, message }) => {
      if (!message.value) return;

      const parsed = JSON.parse(message.value.toString());

      const handler = handlers[topic as Topics];
      if (handler) {
        await handler(parsed);
      } else {
        console.warn(`[Kafka] No handler for topic ${topic}`);
      }
    },
  );
};
