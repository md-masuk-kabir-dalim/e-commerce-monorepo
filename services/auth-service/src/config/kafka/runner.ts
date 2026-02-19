import { initAuthKafka } from "./init.kafka";

const startKafkaWorker = async () => {
  try {
    await initAuthKafka();
    console.log("Auth service Kafka worker initialized ✅");
  } catch (err) {
    console.error("Kafka worker startup failed", err);
    process.exit(1);
  }
};

export default startKafkaWorker;
