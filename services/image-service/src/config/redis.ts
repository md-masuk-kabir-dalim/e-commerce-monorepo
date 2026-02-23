import { createRedisClient } from "shared/redis/redis.client";

const redisClient = createRedisClient("images-service");

export { redisClient };
