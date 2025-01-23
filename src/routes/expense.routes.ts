import { Hono } from "hono";
import { createExpense, updateExpense, deleteExpense, getExpense, getUserExpenses, getUserSummary } from "../modules/expense";
import { resourceAccessMiddleware } from "../middlewares/auth";
import { userIdentifier } from "../constans";

const app = new Hono(
    { strict: true }
);

app.use("*", resourceAccessMiddleware);

app.get("/:id", getExpense);
app.post("/", createExpense);
app.put("/:id", updateExpense);
app.delete("/:id", deleteExpense);

// Get user expenses with pagination and filters
app.get(`/users/:${userIdentifier}`, getUserExpenses);
app.get(`/users/:${userIdentifier}/summary`, getUserSummary);
export default app;
