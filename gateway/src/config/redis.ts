import Redis from "ioredis";
import { config } from "./env";

export const redisClient = new Redis(config.REDIS_URL);

redisClient.on("connect", () => console.log("Redis connected"));
redisClient.on("error", (err) => console.error("Redis error", err));
