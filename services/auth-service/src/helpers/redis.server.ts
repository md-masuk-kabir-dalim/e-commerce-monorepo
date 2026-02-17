import { Queue, Worker } from "bullmq";
import Redis, { RedisOptions } from "ioredis";
import { otpEmail } from "../emails/otpEmail";
import emailSender from "./email.helper";

const redisOptions: RedisOptions = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379,
  retryStrategy: (times: number) => {
    if (times > 5) return undefined;
    return Math.min(times * 100, 3000);
  },
  connectTimeout: 10000,
  keepAlive: 30000,
  maxRetriesPerRequest: null,
};

const redis = new Redis(redisOptions);

redis.on("connect", () => console.log("✅ Redis connected successfully"));
redis.on("error", (err: any) => console.error("❌ Redis error:", err));
const otpQueue = new Queue("otp-queue", { connection: redis });

const otpWorker = new Worker(
  "otp-queue",
  async (job) => {
    const { otpCode, identifier, username } = job.data;
    const html = otpEmail(username, otpCode);
    await emailSender("OTP", identifier, html);
    return "OTP job completed";
  },
  { connection: redis }
);

const cleanQueues = async () => {
  await Promise.all([
    otpQueue.clean(0, 1000, "completed"),
    otpQueue.clean(0, 1000, "failed"),
    otpQueue.clean(0, 1000, "delayed"),
    otpQueue.clean(0, 1000, "wait"),
  ]);
};

// Run cleanup at startup
(async () => {
  try {
    await cleanQueues();
    console.log("🧹 [Queue] All queues cleaned successfully.");
  } catch (err) {
    console.error("❌ Failed to clean queues:", err);
  }
})();

// Helper function to handle failed jobs cleanup
const handleJobFailure = async (job: any, err: any) => {
  try {
    await job.remove();
  } catch (removeErr) {
    console.error(`Failed to remove job ${job.id}:`, removeErr);
  }
};

otpWorker.on("completed", (job) => {
  console.log(`✅ OTP job completed: ${job.id}`);
});

otpWorker.on("failed", handleJobFailure);

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("🚨 Gracefully shutting down...");
  await otpQueue.close();
  await otpWorker.close();
  await redis.quit();
  console.log("✅ Workers and Queues closed gracefully");
  process.exit(0);
});

export { otpQueue, otpWorker, redis };
