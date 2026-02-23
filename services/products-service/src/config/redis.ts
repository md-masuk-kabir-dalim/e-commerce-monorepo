import { createRedisClient } from "shared/redis/redis.client";

const redisClient = createRedisClient("product-service");

export { redisClient };
