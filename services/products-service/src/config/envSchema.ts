import z from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]),
  PORT: z.string().default("8000"),
  CORS_ORIGINS: z.string().default("http://localhost:8011"),
  DATABASE_URL: z.string(),
  FRONTEND_URL: z.string().url(),
  BACKEND_URL: z.string().url(),
  BACKEND_IMAGE_URL: z.string().url(),
  BACKEND_PAYMENT_URL: z.string().url(),
  END_POINT_PREFIX: z.string(),

  JWT_SECRET: z.string().min(10),
  EXPIRES_IN: z.string().default("1h"),
  REFRESH_TOKEN_SECRET: z.string().min(10),
  JWT_OTP_SECRET: z.string(),
  OTP_EXPIRES_IN: z.string().default("5m"),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default("7d"),
  PASSWORD_SALT: z.string(),
  CSRF_SECRET: z.string(),
  EMAIL: z.string().email(),
  APP_PASS: z.string().min(8),
  CONTACT_EMAIL: z.string().email(),

  AWS_ACCESS_KEY_ID: z.string().min(1),
  AWS_SECRET_ACCESS_KEY: z.string().min(1),
  AWS_REGION: z.string().min(1),
  AWS_BUCKET_NAME: z.string().min(1),
  DO_SPACE_ENDPOINT: z.string().url(),
  SUPERADMIN_PASSWORD: z.string().min(8),
  CLOUDINARY_CLOUD_NAME: z.string().min(1),
  CLOUDINARY_API_KEY: z.string().min(1),
  CLOUDINARY_API_SECRET: z.string().min(1),
});

export default envSchema;
