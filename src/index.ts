import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { z } from "zod";
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

// Expense validation schema
const ExpenseSchema = z.object({
  amount: z.number().positive(),
  description: z.string().max(100),
  category: z.string().min(3).max(50),
  userId: z.string().uuid(),
  paymentMethod: z.string().uuid().optional(),
});

const prisma = new PrismaClient().$extends(withAccelerate());

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
  Variables: {
    userId: string;
  };
}>();

app.get("/", (c) => c.text("Healthcheck of expenses-tracker!"));


/////// Expenses 
app.post("/expenses", async (c) => {
  try {
    const body = await c.req.json();
    const validatedData = ExpenseSchema.parse(body);

    const expense = await prisma.expense.create({
      data: body,
    });

    return c.json(expense, 201);
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      400
    );
  }
});

app.get("/expenses/:userId", async (c) => {
  const userId = c.req.param("userId");

  try {
    const expenses = await prisma.expense.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    });

    return c.json(expenses);
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});

app.put("/expenses/:id", async (c) => {
  const id = c.req.param("id");

  try {
    const body = await c.req.json();
    const validatedData = ExpenseSchema.partial().parse(body);

    const expense = await prisma.expense.update({
      where: { id },
      data: validatedData,
    });

    return c.json(expense);
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      400
    );
  }
});

app.delete("/expenses/:id", async (c) => {
  const id = c.req.param("id");

  try {
    await prisma.expense.delete({
      where: { id },
    });

    return c.json({ message: "Expense deleted successfully" });
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});

/////// User 

app.post("/users", async (c) => {
  try {
    const body = await c.req.json();
    const user = await prisma.user.create({
      data: {
        email: body.email,
        name: body.name,
      },
    });

    return c.json(user, 201);
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      400
    );
  }
});

serve(app);
