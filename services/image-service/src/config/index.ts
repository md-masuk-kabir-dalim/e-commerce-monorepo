import dotenv from "dotenv";
import path from "path";
import envSchema from "./envSchema";

dotenv.config({ path: path.join(process.cwd(), ".env") });

let env;
try {
  env = envSchema.parse(process.env);
} catch (err) {
  console.error("❌ Invalid environment variables!");
  if (err instanceof Error) console.error(err.message);
  else console.error(err);
  process.exit(1);
}

export default {
  env: env.NODE_ENV,
  port: Number(env.PORT) || 8000,
  cors_origin: env.CORS_ORIGINS.split(","),
  database_url: env.DATABASE_URL,
  url: {
    frontend_url: env.FRONTEND_URL,
    backend_url: env.BACKEND_URL,
    image_url: env.BACKEND_IMAGE_URL,
    payment_url: env.BACKEND_PAYMENT_URL,
    end_point_prefix: env.END_POINT_PREFIX,
  },

  jwt: {
    access_secret: env.JWT_SECRET!,
    refresh_secret: env.REFRESH_TOKEN_SECRET!,
    otp_secret: env.JWT_OTP_SECRET!,
    access_expires_in: env.EXPIRES_IN,
    refresh_expires_in: env.REFRESH_TOKEN_EXPIRES_IN,
    otp_expires_in: env.OTP_EXPIRES_IN || "10m",
    CSRF_SECRET: env.CSRF_SECRET,
  },
  emailSender: {
    email: env.EMAIL,
    app_pass: env.APP_PASS,
    contact_email: env.CONTACT_EMAIL,
  },

  aws: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    region: env.AWS_REGION,
    bucketName: env.AWS_BUCKET_NAME,
    space_endpoint: env.DO_SPACE_ENDPOINT,
  },
  password: {
    password_salt: env.PASSWORD_SALT,
    superadmin_password: env.SUPERADMIN_PASSWORD,
  },
  cloudinary: {
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  },
};
