import { createRedisClient } from "shared/redis/redis.client";


const redisClient = createRedisClient("auth-service");

export { redisClient };
