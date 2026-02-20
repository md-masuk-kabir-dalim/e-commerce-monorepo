import cluster from "cluster";
import os from "os";
import http from "http";
import app from "./app";
import config from "./config";
import { initAuthServiceDb } from "./config/database";
import { createKafkaTopics } from "shared/kafka/kafka.admin";
import { Topics } from "./config/kafka/events";
import startKafkaWorker from "./config/kafka/runner";

const numCPUs = 1; // For dev, change to os.cpus().length - 1 for production

if (cluster.isPrimary) {
  console.log(`🚀 Master ${process.pid} is running`);
  console.log(`📌 Starting ${numCPUs} workers...`);

  // --------------------------
  // Kafka Admin - run only in master
  // --------------------------
  (async () => {
    try {
      await createKafkaTopics(Object.values(Topics));
    } catch (err) {
      process.exit(1);
    }
  })();

  // Fork workers for each CPU core
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  // Restart worker if it crashes
  cluster.on("exit", (worker, code, signal) => {
    console.warn(`⚠️ Worker ${worker.process.pid} died. Restarting...`);
    cluster.fork();
  });
} else {
  // --------------------------
  // Worker process
  // --------------------------
  async function main() {
    try {
      // Connect DB
      await initAuthServiceDb();

      // Start Kafka consumer only
      await startKafkaWorker();

      // Create HTTP server
      const server = http.createServer(app);
      server.listen(config.port, () => {
        console.log(`✅ Worker ${process.pid} running on port ${config.port}`);
      });

      // Graceful exit
      const exitHandler = () => {
        server.close(() => {
          console.info(`❌ Worker ${process.pid} closed`);
          process.exit(1);
        });
      };

      process.on("uncaughtException", (err) => {
        console.error("❌ Uncaught Exception:", err);
        exitHandler();
      });

      process.on("unhandledRejection", (err) => {
        console.error("❌ Unhandled Rejection:", err);
        exitHandler();
      });
    } catch (err) {
      console.error(`❌ Worker ${process.pid} failed to start:`, err);
      process.exit(1);
    }
  }

  main();
}
