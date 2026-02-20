import cluster from "cluster";
import os from "os";
import http from "http";
import app from "./app";
import config from "./config";
import { initProductServiceDb } from "./config/database";

// const numCPUs = os.cpus().length - 2;
// console.log(numCPUs);
const numCPUs = 1;

if (cluster.isPrimary) {
  console.log(`🚀 Master ${process.pid} is running`);
  console.log(`📌 Starting ${numCPUs} workers...`);

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
  // Worker process code
  async function main() {
    try {
      // Check Redis
      // const pong = await redis.ping();
      // if (pong === "PONG")
      //   console.log(`✅ Worker ${process.pid} connected to Redis`);

      // Create HTTP server
      const server = http.createServer(app);
      initProductServiceDb();
      // Start server
      server.listen(config.port, () => {
        console.log(`✅ Worker ${process.pid} running on port ${config.port}`);
      });

      // Exit handler
      const exitHandler = () => {
        server.close(() => {
          console.info(`❌ Worker ${process.pid} closed`);
          process.exit(1);
        });
      };

      // Error handling
      process.on("uncaughtException", (error) => {
        console.error("❌ Uncaught Exception:", error);
        exitHandler();
      });

      process.on("unhandledRejection", (error) => {
        console.error("❌ Unhandled Rejection:", error);
        exitHandler();
      });
    } catch (err) {
      console.error(`❌ Worker ${process.pid} failed to start:`, err);
      process.exit(1);
    }
  }

  main();
}
