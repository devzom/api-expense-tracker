import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { compress } from 'hono/compress'
import expenseRoutes from "./routes/expense.routes";
import userRoutes from "./routes/user.routes";
import budgetRoutes from "./routes/budget.routes";
import { authMiddleware } from "./middlewares/auth";
import { rateLimitMiddleware } from "./middlewares/rate-limit";

const app = new Hono(
  { strict: true }
);

app.use("*", compress())

app.get("/", (c) => c.text("Healthcheck of expenses-tracker!"));

// Apply rate limiting before auth middleware
app.use("*", authMiddleware);
app.use("*", rateLimitMiddleware);

app.route('/users', userRoutes)
app.route('/expenses', expenseRoutes)
app.route('/budget', budgetRoutes)

serve(app);
