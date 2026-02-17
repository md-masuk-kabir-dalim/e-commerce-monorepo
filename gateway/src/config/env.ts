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
};
