import { Hono } from "hono";
import { serve } from "@hono/node-server";
import expenseRoutes from "./routes/expense.routes";
import userRoutes from "./routes/user.routes";
import budgetRoutes from "./routes/budget.routes";
import { authMiddleware } from "./middlewares/auth";

const app = new Hono(
  { strict: true }
);

app.get("/", (c) => c.text("Healthcheck of expenses-tracker!"));

app.use("*", authMiddleware);

app.route('/users', userRoutes)
app.route('/expenses', expenseRoutes)
app.route('/budget', budgetRoutes)

serve(app);
