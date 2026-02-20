import { CookieOptions, Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { AuthServices } from "./auth.service";
import ApiError from "../../../errors/ApiErrors";
import config from "../../../config";

/* =======================
   ADMIN LOGIN
======================= */
const loginAdmin = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const result = await AuthServices.loginAdmin(email, password);

  const { accessToken, refreshToken, user } = result.data;
  const isProd = config.env === "production";

  const baseCookie: CookieOptions = {
    httpOnly: true,
    secure: isProd, // secure only in prod
    sameSite: isProd ? "none" : "lax",
    path: "/",
    ...(isProd && { domain: ".deshidesign.com" }), // only set domain in prod
  };

  // Set cookies
  res.cookie("accessToken", accessToken, {
    ...baseCookie,
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  });

  res.cookie("refreshToken", refreshToken, {
    ...baseCookie,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: { user },
  });
});

/* =======================
   REGISTER USER
======================= */
const registerUser = catchAsync(async (req: Request, res: Response) => {
  const data = req.body;
  const result = await AuthServices.registerUser(data);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Check your email for OTP to verify your account",
    data: result,
  });
});

/* =======================
   VERIFY USER BY OTP
======================= */
const verifyUserByOTP = catchAsync(async (req: Request, res: Response) => {
  const { email, otp } = req.body;
  const result = await AuthServices.verifyUserByOTP(email, otp);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "User verified successfully",
    data: result,
  });
});

/* =======================
   LOGIN USER
======================= */
const loginUser = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await AuthServices.loginUser(email, password);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.message,
    data: result.data || null,
  });
});

/* =======================
   REFRESH TOKEN WITH COOKIES
======================= */
const refreshToken = catchAsync(async (req: Request, res: Response) => {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    token = req.cookies?.refreshToken;
  }

  if (!token) {
    res.clearCookie("refreshToken");
    throw new ApiError(httpStatus.UNAUTHORIZED, "Refresh token missing");
  }

  const result = await AuthServices.refreshToken(token);

  const { accessToken, refreshToken, user } = result;

  res.clearCookie("refreshToken");

  const isProd = config.env === "production";
  const baseCookie: CookieOptions = {
    httpOnly: true,
    secure: isProd ? true : false, // secure only in prod
    sameSite: isProd ? "none" : "lax",
    path: "/",
    ...(isProd && { domain: ".deshidesign.com" }), // only set domain in prod
  };

  // Set cookies
  res.cookie("accessToken", accessToken, {
    ...baseCookie,
    maxAge: 1000 * 60 * 60 * 24, // 1 day
  }); // 15 min
  res.cookie("refreshToken", refreshToken, {
    ...baseCookie,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  }); // 7 days

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Token refreshed successfully",
    data: { user },
  });
});

/* =======================
   FORGOT PASSWORD
======================= */
const forgetPassword = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body;
  const result = await AuthServices.forgetPassword(email);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Forget password OTP sent successfully",
    data: result,
  });
});

/* =======================
   RESET PASSWORD
======================= */
const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const { password } = req.body;
  const userEmail = req.user?.email;
  if (!userEmail) throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized");

  const result = await AuthServices.resetPassword(userEmail, password);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password reset successfully",
    data: result,
  });
});

/* =======================
   CHANGE PASSWORD
======================= */
const changePassword = catchAsync(async (req: Request, res: Response) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user?.id;
  if (!userId) throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized");

  const result = await AuthServices.changePassword(
    userId,
    newPassword,
    oldPassword,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Password changed successfully",
    data: result,
  });
});

/* =======================
        LOGOUT
======================= */
const logout = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new ApiError(httpStatus.UNAUTHORIZED, "Unauthorized");

  await AuthServices.logout(userId);

  const isProd = config.env === "production";
  const baseCookie: CookieOptions = {
    httpOnly: true,
    secure: isProd ? true : false, // secure only in prod
    sameSite: isProd ? "none" : "lax",
    path: "/",
    ...(isProd && { domain: ".deshidesign.com" }), // only set domain in prod
  };

  // Clear cookies
  res.clearCookie("accessToken", baseCookie);
  res.clearCookie("refreshToken", baseCookie);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Logout successful",
    data: null,
  });
});

export const AuthController = {
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
