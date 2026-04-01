import { Router, type IRouter } from "express";
import healthRouter from "./health";
import expensesRouter from "./expenses";
import investmentsRouter from "./investments";
import budgetsRouter from "./budgets";
import transactionsRouter from "./transactions";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(dashboardRouter);
router.use(expensesRouter);
router.use(investmentsRouter);
router.use(budgetsRouter);
router.use(transactionsRouter);

export default router;
