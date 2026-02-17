import express from "express";

import { UserController } from "./user.controller";
import { UserRole } from "./user.model";
import auth from "../../middlewares/auth.middleware";
const router = express.Router();
//
router.patch("/update-user", auth(UserRole.USER), UserController.updateUser);

router.delete("/delete/:id", auth(UserRole.ADMIN), UserController.deleteUser);
router.get("/me", auth(), UserController.getMyProfile);
router.get("/", UserController.getUsers);

router.get("/:id", auth(), UserController.getUserById);

export const UserRoutes = router;
