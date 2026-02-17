import express from "express";
import { AuthController } from "./auth.controller";

const router = express.Router();

/*==============================
    admin login
==============================
*/
router.post("/admin/login", AuthController.loginAdmin);

// ------------------------------
// REGISTER USER
// ------------------------------
router.post("/register", AuthController.registerUser);

// ------------------------------
// LOGIN USER
// ------------------------------
router.post("/login", AuthController.loginUser);

// ------------------------------
// LOGOUT USER
// ------------------------------
router.post("/logout", AuthController.logout);

// ------------------------------
// FORGOT PASSWORD
// ------------------------------
router.post("/forgot-password", AuthController.forgetPassword);

// ------------------------------
// RESET PASSWORD//
// ------------------------------
router.patch(
  "/reset-password",

  AuthController.resetPassword,
);

// ------------------------------
// VERIFY OTP
// ------------------------------
router.patch("/verify-otp", AuthController.verifyUserByOTP);

// ------------------------------
// REFRESH TOKEN
// ------------------------------
router.post("/refresh-token", AuthController.refreshToken);

// ------------------------------
// CHANGE PASSWORD
// ------------------------------
router.patch(
  "/change-password",

  AuthController.changePassword,
);

export const AuthRoutes = router;
