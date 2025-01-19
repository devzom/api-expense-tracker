import { Hono } from "hono";
import { serve } from "@hono/node-server";
import expenseRoutes from "./routes/expense.routes";
import userRoutes from "./routes/user.routes";

const app = new Hono(
  { strict: true }
);

app.get("/", (c) => c.text("healthcheck"));

app.route('/expenses', expenseRoutes)
app.route('/users', userRoutes)

serve(app);
