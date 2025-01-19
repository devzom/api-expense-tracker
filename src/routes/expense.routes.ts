import { Hono } from "hono";
import { createExpense, updateExpense, deleteExpense, getExpense, getUserExpenses } from "../modules/expense";
import { resourceAccessMiddleware } from "../middlewares/auth";

const app = new Hono(
    { strict: true }
);

app.post("/", createExpense);
app.put("/:id", updateExpense);
app.delete("/:id", deleteExpense);
app.get("/:id", getExpense);

// Get user expenses with pagination and filters
app.get("/users/:userId", resourceAccessMiddleware, getUserExpenses);

export default app;
