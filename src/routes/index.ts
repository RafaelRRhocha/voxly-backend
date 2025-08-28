import { Router } from "express";

import authRoutes from "./auth";
import storeRoutes from "./stores";
import userRoutes from "./users";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/stores", storeRoutes);

export default router;
