import { sendMessage } from "shared/kafka/kafka.client";
import { Topics } from "./events";

export const publishEvent = async (
  data: any,
  topics: Topics,
  key: string,
) => {
  await sendMessage(topics, [
    {
      key: key,
      value: JSON.stringify(data),
    },
  ]);
};
