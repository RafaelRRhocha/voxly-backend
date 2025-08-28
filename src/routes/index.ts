import { Router } from "express";

import authRoutes from "./auth";
import sellerRoutes from "./sellers";
import storeRoutes from "./stores";
import userRoutes from "./users";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/stores", storeRoutes);
router.use("/sellers", sellerRoutes);

export default router;
