import express from "express";
import { AuthController } from "./auth.controller";
import rateLimiter from "../../middlewares/rateLimiter.middleware";
import auth from "../../middlewares/auth.middleware";

const router = express.Router();

/*==============================
    admin login
==============================
*/
router.post("/admin/login", AuthController.loginAdmin);

// ------------------------------
// REGISTER USER
// ------------------------------
router.post("/register", rateLimiter(10), AuthController.registerUser);

// ------------------------------
// LOGIN USER
// ------------------------------
router.post("/login", rateLimiter(10), AuthController.loginUser);

// ------------------------------
// LOGOUT USER
// ------------------------------
router.post("/logout", auth(), rateLimiter(10), AuthController.logout);

// ------------------------------
// FORGOT PASSWORD
// ------------------------------
router.post("/forgot-password", rateLimiter(10), AuthController.forgetPassword);

// ------------------------------
// RESET PASSWORD//
// ------------------------------
router.patch(
  "/reset-password",
  auth(),
  rateLimiter(10),
  AuthController.resetPassword,
);

// ------------------------------
// VERIFY OTP
// ------------------------------
router.patch("/verify-otp", rateLimiter(10), AuthController.verifyUserByOTP);

// ------------------------------
// REFRESH TOKEN
// ------------------------------
router.post("/refresh-token", AuthController.refreshToken);

// ------------------------------
// CHANGE PASSWORD
// ------------------------------
router.patch(
  "/change-password",
  rateLimiter(10),
  auth(),
  AuthController.changePassword,
);

export const AuthRoutes = router;
