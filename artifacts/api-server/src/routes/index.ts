import { Router, type IRouter } from "express";
import healthRouter from "./health";
import categoriesRouter from "./categories";
import productsRouter from "./products";
import statsRouter from "./stats";
import ordersRouter from "./orders";

const router: IRouter = Router();

router.use(healthRouter);
router.use(categoriesRouter);
router.use(productsRouter);
router.use(statsRouter);
router.use(ordersRouter);

export default router;
