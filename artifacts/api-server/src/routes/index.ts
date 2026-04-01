import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import expensesRouter from "./expenses";
import investmentsRouter from "./investments";
import budgetsRouter from "./budgets";
import transactionsRouter from "./transactions";
import dashboardRouter from "./dashboard";
import analyticsRouter from "./analytics";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(dashboardRouter);
router.use(expensesRouter);
router.use(investmentsRouter);
router.use(budgetsRouter);
router.use(transactionsRouter);
router.use(analyticsRouter);

export default router;
