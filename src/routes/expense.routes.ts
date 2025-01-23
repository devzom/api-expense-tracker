import { Hono } from "hono";
import { createExpense, updateExpense, deleteExpense, getExpense, getUserExpenses, getUserSummary } from "../modules/expense";
import { resourceAccessMiddleware } from "../middlewares/auth";

const app = new Hono(
    { strict: true }
);

app.use("*", resourceAccessMiddleware);

app.post("/", createExpense);

// Get user expenses with pagination and filters
app.get(`/`, getUserExpenses);
app.get(`/summary`, getUserSummary);

app.get("/:id", getExpense);
app.put("/:id", updateExpense);
app.delete("/:id", deleteExpense);

export default app;
