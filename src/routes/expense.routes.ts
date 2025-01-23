import { Hono } from "hono";
import { createExpense, updateExpense, deleteExpense, getExpense, getUserExpenses, getUserSummary } from "../modules/expense";
import { resourceAccessMiddleware } from "../middlewares/auth";
import { userIdentifier } from "../constans";

const app = new Hono(
    { strict: true }
);

// Routes that need user verification
app.get(`/users/:${userIdentifier}/expenses/:id`, resourceAccessMiddleware, getExpense);
app.post(`/users/:${userIdentifier}/expenses`, resourceAccessMiddleware, createExpense);
app.put(`/users/:${userIdentifier}/expenses/:id`, resourceAccessMiddleware, updateExpense);
app.delete(`/users/:${userIdentifier}/expenses/:id`, resourceAccessMiddleware, deleteExpense);

// Get user expenses with pagination and filters
app.get(`/users/:${userIdentifier}`, resourceAccessMiddleware, getUserExpenses);
app.get(`/users/:${userIdentifier}/summary`, resourceAccessMiddleware, getUserSummary);
export default app;
