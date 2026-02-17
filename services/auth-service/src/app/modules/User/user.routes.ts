import express from "express";
import { UserController } from "./user.controller";
const router = express.Router();

router.patch("/update-user", UserController.updateUser);
router.delete("/delete/:id", UserController.deleteUser);
router.get("/me", UserController.getMyProfile);
router.get("/", UserController.getUsers);

router.get("/:id", UserController.getUserById);

export const UserRoutes = router;
