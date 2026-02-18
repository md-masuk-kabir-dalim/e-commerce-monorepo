import Redis from "ioredis";
const REDIS_HOST = (process.env.REDIS_HOST || "127.0.0.1").trim();
const REDIS_PORT = Number(process.env.REDIS_PORT || 6380);

export const createRedisClient = (serviceName: string) => {
  const client = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    maxRetriesPerRequest: 5,
    connectTimeout: 10000,
    keyPrefix: `${serviceName}:`,
  });

  client.on("connect", () => console.log(`${serviceName} Redis connected`));
  client.on("error", (err) => console.error(`${serviceName} Redis error`, err));

  return client;
};
