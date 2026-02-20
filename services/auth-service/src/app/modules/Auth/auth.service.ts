import httpStatus from "http-status";
import ApiError from "../../../errors/ApiErrors";
import { otpEmail } from "../../../emails/otpEmail";
import config from "../../../config";
import userModel, { UserRole, UserStatus } from "../User/user.model";
import { IUser } from "../User/user.interface";
import {
  comparePassword,
  hashPassword,
} from "../../../helpers/password.helpers";
import generateOtp from "../../../helpers/generate.otp";
import otpModel, { OtpType } from "./otp.model";
import emailSender from "../../../helpers/email.helper";
import { jwtHelpers } from "../../../helpers/jwtHelpers";
import { Types } from "mongoose";
import { publishUserCreated } from "services/auth-service/src/config/kafka/publisher";

/*==============================
      ADMIN LOGIN
===============================*/
const loginAdmin = async (email: string, password: string) => {
  const user = await userModel.findOne({ email });
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found");

  if (user.status === UserStatus.DELETED)
    throw new ApiError(httpStatus.FORBIDDEN, "Your account is deleted");

  // Only allow admin roles
  if (![UserRole.ADMIN].includes(user.role)) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "You are not authorized as admin",
    );
  }

  const isCorrect = await comparePassword(password, user.password);
  if (!isCorrect)
    throw new ApiError(httpStatus.UNAUTHORIZED, "Password is incorrect");

  user.tokenVersion += 1;
  const updateUser = await user.save();

  const accessToken = jwtHelpers.generateToken(
    { id: user._id, email: user.email, role: user.role },
    config.jwt.access_secret,
    config.jwt.access_expires_in,
  );

  const refreshToken = jwtHelpers.generateToken(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      tokenVersion: updateUser.tokenVersion,
    },
    config.jwt.refresh_secret,
    config.jwt.refresh_expires_in,
  );
  const { password: _password, tokenVersion, ...userData } = user.toObject();
  return {
    message: "Admin login successful",
    isVerify: user.isVerified,
    data: { accessToken, refreshToken, user: userData },
  };
};

/*==============================
      REGISTER USER
===============================*/
const registerUser = async (payload: IUser) => {
  const existingUser = await userModel.findOne({ email: payload.email });
  if (existingUser)
    throw new ApiError(httpStatus.BAD_REQUEST, "Email already in use");

  const hashedPassword = await hashPassword(payload.password);
  const { otp, expiry } = generateOtp();
  const userId = new Types.ObjectId().toString();

  await userModel.create({
    _id: userId,
    fullName: payload.fullName,
    email: payload.email,
    password: hashedPassword,
    role: UserRole.USER,
    isVerified: false,
    status: UserStatus.ACTIVE,
  });

  await otpModel.create({
    identifier: payload.email,
    otpCode: otp,
    type: OtpType.EMAIL_VERIFICATION,
    expiresAt: expiry,
    userId,
  });

  publishUserCreated({
    userId,
    email: payload.email,
  });

  emailSender(
    "Verify your email",
    payload.email,
    otpEmail(payload.fullName, otp),
  );
  return { message: "OTP sent to email" };
};

/*==============================
      VERIFY USER OTP
===============================*/
const verifyUserByOTP = async (email: string, otp: string) => {
  const user = await userModel.findOne({ email });
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found");

  const otpRecord = await otpModel.findOne({ identifier: email, otpCode: otp });
  if (!otpRecord) throw new ApiError(httpStatus.BAD_REQUEST, "Invalid OTP");
  if (otpRecord.expiresAt < new Date())
    throw new ApiError(httpStatus.BAD_REQUEST, "OTP expired");

  await otpModel.deleteMany({ identifier: email });

  user.isVerified = true;
  user.tokenVersion += 1;

  const updateUser = await user.save();

  const accessToken = jwtHelpers.generateToken(
    { id: user._id, email: user.email, role: user.role },
    config.jwt.access_secret,
    config.jwt.access_expires_in,
  );

  const refreshToken = jwtHelpers.generateToken(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      tokenVersion: updateUser.tokenVersion,
    },
    config.jwt.refresh_secret,
    config.jwt.refresh_expires_in,
  );

  return { accessToken, refreshToken };
};

/*==============================
      LOGIN USER
===============================*/
const loginUser = async (email: string, password: string) => {
  const user = await userModel.findOne({ email });
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found");

  if (user.status === UserStatus.DELETED)
    throw new ApiError(httpStatus.FORBIDDEN, "Your account is deleted");

  const isCorrect = await comparePassword(password, user.password);

  if (!isCorrect)
    throw new ApiError(httpStatus.UNAUTHORIZED, "Password is incorrect");

  if (!user.isVerified) {
    const { otp, expiry } = generateOtp();

    await otpModel.findOneAndUpdate(
      { identifier: email },
      {
        otpCode: otp,
        expiresAt: expiry,
        userId: user._id,
        type: OtpType.EMAIL_VERIFICATION,
      },
      { upsert: true },
    );

    emailSender("Verify your email", email, otpEmail(user.fullName, otp));

    return { message: "Please verify your email with OTP" };
  }

  user.tokenVersion += 1;
  const updateUser = await user.save();

  const accessToken = jwtHelpers.generateToken(
    { id: user._id, email: user.email, role: user.role },
    config.jwt.access_secret,
    config.jwt.access_expires_in,
  );

  const refreshToken = jwtHelpers.generateToken(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      tokenVersion: updateUser.tokenVersion,
    },
    config.jwt.refresh_secret,
    config.jwt.refresh_expires_in,
  );

  return {
    message: "Login successful",
    isVerify: user.isVerified,
    data: { accessToken, refreshToken },
  };
};

/*==============================
      REFRESH TOKEN
===============================*/
const refreshToken = async (token: string) => {
  const decoded = jwtHelpers.verifyToken(
    token,
    config.jwt.refresh_secret,
  ) as any;
  const user = await userModel.findById(decoded.id);
  if (!user) throw new ApiError(httpStatus.UNAUTHORIZED, "User not found");

  // Validate tokenVersion
  if (decoded.tokenVersion !== user.tokenVersion) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Refresh token is invalid");
  }

  user.tokenVersion += 1;
  const updateUser = await user.save();

  const accessToken = jwtHelpers.generateToken(
    { id: user._id, email: user.email, role: user.role },
    config.jwt.access_secret,
    config.jwt.access_expires_in,
  );

  const newRefreshToken = jwtHelpers.generateToken(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      tokenVersion: updateUser.tokenVersion,
    },
    config.jwt.refresh_secret,
    config.jwt.refresh_expires_in,
  );

  return { accessToken, refreshToken: newRefreshToken, user };
};

/*==============================
      FORGOT PASSWORD
===============================*/
const forgetPassword = async (email: string) => {
  const user = await userModel.findOne({ email });

  if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found");

  const { otp, expiry } = generateOtp();
  await otpModel.findOneAndUpdate(
    { identifier: email },
    {
      otpCode: otp,
      expiresAt: expiry,
      userId: user._id,
      type: OtpType.PASSWORD_RESET,
    },
    { upsert: true },
  );

  emailSender("Reset Password", email, otpEmail(user.fullName, otp));
  return { message: "OTP sent" };
};

/*==============================
      RESET PASSWORD
===============================*/
const resetPassword = async (email: string, newPassword: string) => {
  const user = await userModel.findOne({ email });
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found");

  const hashedPassword = await hashPassword(newPassword);
  user.password = hashedPassword;

  // Invalidate old refresh tokens
  user.tokenVersion += 1;

  const updateUser = await user.save();

  const accessToken = jwtHelpers.generateToken(
    { id: user._id, email: user.email, role: user.role },
    config.jwt.access_secret,
    config.jwt.access_expires_in,
  );

  const refreshToken = jwtHelpers.generateToken(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      tokenVersion: updateUser.tokenVersion,
    },
    config.jwt.refresh_secret,
    config.jwt.refresh_expires_in,
  );

  return {
    message: "Login successful",
    isVerify: user.isVerified,
    data: { accessToken, refreshToken },
  };
};

/*==============================
      CHANGE PASSWORD
===============================*/
const changePassword = async (
  userId: string,
  oldPassword: string,
  newPassword: string,
) => {
  const user = await userModel.findById(userId);
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found");

  const isCorrect = await comparePassword(oldPassword, user.password);
  if (!isCorrect)
    throw new ApiError(httpStatus.UNAUTHORIZED, "Old password incorrect");

  const hashedPassword = await hashPassword(newPassword);
  user.password = hashedPassword;

  await user.save();
  return { message: "Password changed successfully" };
};

/* ===========================
        LOGOUT USER
=========================== */
const logout = async (userId: string) => {
  const user = await userModel.findById(userId);
  if (!user) throw new ApiError(httpStatus.NOT_FOUND, "User not found");

  user.tokenVersion += 1;
  await user.save();

  return { message: "Logged out successfully" };
};

export const AuthServices = {
  registerUser,
  verifyUserByOTP,
  loginUser,
  refreshToken,
  forgetPassword,
  resetPassword,
  changePassword,
  loginAdmin,
  logout,
};
