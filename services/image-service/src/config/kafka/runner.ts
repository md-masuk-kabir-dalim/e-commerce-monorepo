import { initImagesKafka } from "./init.kafka";

const startKafkaWorker = async () => {
  try {
    await initImagesKafka();
    console.log("Images service Kafka worker initialized ✅");
  } catch (err) {
    console.error("Kafka worker startup failed", err);
    process.exit(1);
  }
};

export default startKafkaWorker;
