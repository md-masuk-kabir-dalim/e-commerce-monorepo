import { sendMessage } from "shared/kafka/kafka.client";
import { UserCreatedEvent } from "./event.types";
import { Topics } from "./events";

export const publishUserCreated = async (data: UserCreatedEvent) => {
  await sendMessage(Topics.USER_CREATED, [
    {
      key: data.userId,
      value: JSON.stringify(data),
    },
  ]);
};
