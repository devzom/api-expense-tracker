import { Hono } from "hono";
import { createExpense, updateExpense, deleteExpense, getExpense, getExpensesByUser, getExpensesSummaryByUser } from "../modules/expenses";
import { resourceAccessMiddleware } from "../middlewares/auth";

const app = new Hono(
    { strict: true }
);

app.use("*", resourceAccessMiddleware);

app.post("/", createExpense);

// Get user expenses with pagination and filters
app.get(`/`, getExpensesByUser);
app.get(`/summary`, getExpensesSummaryByUser);

app.get("/:id", getExpense);
app.put("/:id", updateExpense);
app.delete("/:id", deleteExpense);

export default app;
