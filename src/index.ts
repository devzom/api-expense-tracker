import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { z } from "zod";
import { Currency, ExpenseType, PrismaClient, WeekDay } from "@prisma/client";

// Validation schemas
const ExpenseSchema = z.object({
  amount: z.number().positive(),
  description: z.string().optional(),
  category: z.string().min(4),
  paymentMethod: z.enum(['cash', 'card', 'transfer']).optional(),
  userId: z.string().uuid(),
  currency: z.nativeEnum(Currency).optional(),
  type: z.nativeEnum(ExpenseType).optional(),
  date: z.string().datetime().optional()
});

const UserPreferencesSchema = z.object({
  notificationsEnabled: z.boolean().optional(),
  weekStartsOn: z.nativeEnum(WeekDay).optional(),
  language: z.string().min(2).max(5).optional(),
  dateFormat: z.string().min(8).max(10).optional(),
  timeFormat: z.enum(['12h', '24h']).optional(),
});

const prisma = new PrismaClient({ log: ["query", "error"] });

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
  Variables: {
    userId: string;
  };
}>(
  { strict: true }
);

app.get("/", (c) => c.text("Healthcheck of expenses-tracker!"));

/////// Expenses 
app.post("/expenses", async (c) => {
  try {
    const body = await c.req.json();
    const validatedData = ExpenseSchema.parse(body);

    // Find or create category
    const category = await prisma.category.upsert({
      where: { name: validatedData.category },
      create: { name: validatedData.category },
      update: {}
    });

    // Find payment method if provided
    let paymentMethod = null;
    if (validatedData.paymentMethod) {
      paymentMethod = await prisma.paymentMethod.findUnique({
        where: { name: validatedData.paymentMethod }
      });

      if (!paymentMethod) {
        return c.json({ error: `Payment method '${validatedData.paymentMethod}' not found` }, 400);
      }
    }

    const expense = await prisma.expense.create({
      data: {
        amount: validatedData.amount,
        description: validatedData.description,
        currency: validatedData.currency || "USD",
        type: validatedData.type || "EXPENSE",
        date: validatedData.date ? new Date(validatedData.date) : undefined,
        category: {
          connect: { id: category.id }
        },
        ...(paymentMethod && {
          paymentMethod: {
            connect: { id: paymentMethod.id }
          }
        }),
        user: {
          connect: { id: validatedData.userId }
        }
      },
      include: {
        category: {
          select: {
            name: true,
          }
        },
        paymentMethod: {
          select: {
            name: true,
          },
        }
      }
    });

    return c.json(expense, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: "Invalid expense data", details: error.errors }, 400);
    }
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
    // const validatedData = ExpenseSchema.partial().parse(body);

    const expense = await prisma.expense.update({
      where: { id },
      data: body,
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

app.get("/expenses/:id", async (c) => {
  const id = c.req.param("id");

  try {
    const expense = await prisma.expense.findUnique({
      where: { id },
      select: {
        id: true,
        date: true,
        amount: true,
        currency: true,
        type: true,
        description: true,
        category: {
          select: {
            name: true,
            color: true,
            icon: true
          }
        },
        paymentMethod: {
          select: {
            name: true,
            icon: true
          }
        }
      }
    });

    if (!expense) {
      return c.json({ error: "Expense not found" }, 404);
    }

    return c.json(expense);
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});

app.get("/expenses/users/:userId", async (c) => {
  const userId = c.req.param("userId");

  try {
    const expenses = await prisma.expense.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        date: true,
        amount: true,
        currency: true,
        type: true,
        description: true,
        category: {
          select: {
            name: true,
            color: true,
            icon: true
          }
        },
        paymentMethod: {
          select: {
            name: true,
            icon: true
          }
        }
      }
    });

    return c.json(expenses);
  } catch (error) {
    return c.json({ error: "Failed to fetch expenses" }, 500);
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

// Get user preferences
app.get("/users/:userId/preferences", async (c) => {
  const userId = c.req.param("userId");

  try {
    // check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    const preferences = await prisma.userPreferences.findUnique({
      where: { userId },
    });

    if (!preferences) {
      // add default preferences if they don't exist
      const defaultPreferences = await prisma.userPreferences.create({
        data: {
          userId,
        },
      });

      return c.json(defaultPreferences);
    }

    return c.json(preferences);
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json({ error: "An unexpected error occurred" }, 500);
  }
});

// Update user preferences
app.patch("/users/:userId/preferences", async (c) => {
  const userId = c.req.param("userId");

  try {
    const body = await c.req.json();

    // Validate input
    const validatedData = UserPreferencesSchema.parse(body);

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    const updatedPreferences = await prisma.userPreferences.upsert({
      where: { userId },
      create: {
        ...validatedData,
        userId,
      },
      update: validatedData,
    });

    return c.json(updatedPreferences);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: "Invalid preferences data", details: error.errors }, 400);
    }
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json({ error: "An unexpected error occurred" }, 500);
  }
});

serve(app);
