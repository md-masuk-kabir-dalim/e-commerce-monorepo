import mongoose, { Schema } from "mongoose";
import { IOtp } from "./auth.interface";

export enum OtpType {
  EMAIL_VERIFICATION = "EMAIL_VERIFICATION",
  PHONE_NUMBER_VERIFICATION = "PHONE_NUMBER_VERIFICATION",
  PASSWORD_RESET = "PASSWORD_RESET",
  TWO_FACTO = "TWO_FACTO",
}

const OtpSchema: Schema<IOtp> = new Schema(
  {
    identifier: { type: String, required: true, unique: true },
    otpCode: { type: String, required: true, unique: true },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    type: {
      type: String,
      enum: Object.values(OtpType),
      required: true,
    },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// Explicit indexes
OtpSchema.index({ type: 1 });

export default mongoose.model<IOtp>("Otp", OtpSchema, "otps");
