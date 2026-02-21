import mongoose, { Connection, model, Schema } from "mongoose";
import { IUser } from "./user.interface";
import { getAuthConnection } from "../../../config/database";

export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  DELETED = "DELETED",
}

const imageSchema = new Schema(
  {
    url: { type: String },
    path: { type: String },
    altText: { type: String },
  },
  { _id: false },
);

const UserSchema: Schema<IUser> = new Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNo: { type: String },
    image: imageSchema,
    password: { type: String, required: true },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    isVerified: { type: Boolean, default: false },
    tokenVersion: { type: Number, default: 1 },
    status: {
      type: String,
      enum: Object.values(UserStatus),
      default: UserStatus.ACTIVE,
    },
  },
  {
    timestamps: true,
  },
);

UserSchema.index({ fullName: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ isVerified: 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ createdAt: 1 });
UserSchema.index({ updatedAt: 1 });

export function getUserModel(connection: Connection) {
  return connection.models.User || connection.model<IUser>("User", UserSchema);
}
