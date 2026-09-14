import { Router, type IRouter } from "express";
import healthRouter from "./health";
import categoriesRouter from "./categories";
import productsRouter from "./products";
import statsRouter from "./stats";
import ordersRouter from "./orders";
import settingsRouter from "./settings"; // 1. Import new router

const router: IRouter = Router();

router.use(healthRouter);
router.use(categoriesRouter);
router.use(productsRouter);
router.use(statsRouter);
router.use(ordersRouter);
router.use("/settings", settingsRouter); // 2. Mount settings endpoint

export default router;