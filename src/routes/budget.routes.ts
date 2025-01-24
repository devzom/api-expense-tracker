import { Hono } from "hono";
import { createBudget } from "../modules/budget";
import { authMiddleware } from "../middlewares/auth";

const budget = new Hono(
    { strict: true }
);

budget.use("*", authMiddleware);

budget.post("/", createBudget);

export default budget;
