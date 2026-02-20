import { Router } from "express";
import { authProxy } from "../proxy/auth.proxy";

const router = Router();

router.get("/health", (req, res) => {
  res.send({ status: "ok" });
});

router.use("/auth", authProxy);

export default router;
