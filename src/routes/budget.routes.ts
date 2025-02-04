import { Hono } from "hono";
import { createBudget, getBudgets, getBudgetStatus } from "../modules/budget";
import { authMiddleware } from "../middlewares/auth";

const budget = new Hono(
    { strict: true }
);

budget.use("*", authMiddleware);

// Create a new budget (overall or category-specific)
budget.post("/", createBudget);

// Get all budgets for a user
budget.get("/user/:userId", getBudgets);

// Get specific budget status with spending analysis
budget.get("/:id/status", getBudgetStatus);

export default budget;
