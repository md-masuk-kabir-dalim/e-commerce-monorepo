import Redis from "ioredis";
const REDIS_HOST = process.env.REDIS_HOST || "localhost";
const REDIS_PORT = Number(process.env.REDIS_PORT || 6379);
const REDIS_PASSWORD =
  process.env.REDIS_PASSWORD || "yourStrongRedisPassword123";

export const createRedisClient = (serviceName: string) => {
  const client = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    password: REDIS_PASSWORD,
    maxRetriesPerRequest: 5,
    connectTimeout: 10000,
    keyPrefix: `${serviceName}:`,
  });

  client.on("connect", () => console.log(`${serviceName} Redis connected`));
  client.on("error", (err) => console.error(`${serviceName} Redis error`, err));

  return client;
};
