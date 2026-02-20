import { createRedisClient } from "shared/redis/redis.client";

const redisClient = createRedisClient("gateway-service");

export { redisClient };
