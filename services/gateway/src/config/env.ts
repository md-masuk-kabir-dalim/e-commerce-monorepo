export const config = {
  port: process.env.PORT || 5000,
  env: process.env.NODE_ENV || "development",
  cors_origin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",")
    : ["http://localhost:3000"],
  redis_url: process.env.REDIS_URL || "redis://localhost:6379",
  sentry_dsn: process.env.SENTRY_DSN || "",
  sentry_traces_sample_rate:
    Number(process.env.SENTRY_TRACES_SAMPLE_RATE) || 0.05,
  AUTH_SERVICE: process.env.AUTH_SERVICE || "http://localhost:5001/api/v1/auth",
  ORDER_SERVICE: process.env.ORDER_SERVICE || "http://localhost:5002",
  PRODUCT_SERVICE: process.env.PRODUCT_SERVICE || "http://localhost:5003",
  PAYMENT_SERVICE: process.env.PAYMENT_SERVICE || "http://localhost:5004",
  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
  KAFKA_BROKERS: process.env.KAFKA_BROKERS?.split(",") || ["localhost:9092"],
  JWT_SECRET: process.env.JWT_SECRET || "supersecret",
};
