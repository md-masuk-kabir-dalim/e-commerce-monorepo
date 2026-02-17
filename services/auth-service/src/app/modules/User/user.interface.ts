import { UserRole, UserStatus } from "./user.model";

export interface IUser extends Document {
  fullName: string;
  email: string;
  phoneNo?: string;
  image?: string;
  password: string;
  tokenVersion: number;
  role: UserRole;
  isVerified: boolean;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}
