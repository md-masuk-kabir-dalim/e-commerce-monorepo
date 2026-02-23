import { initProductsKafka } from "./init.kafka";

const startKafkaWorker = async () => {
  try {
    await initProductsKafka();
    console.log("Products service Kafka worker initialized ✅");
  } catch (err) {
    console.error("Kafka worker startup failed", err);
    process.exit(1);
  }
};

export default startKafkaWorker;
