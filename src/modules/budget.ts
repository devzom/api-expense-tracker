import { Context } from "hono";
import { BudgetSchema } from "../schemas/budget.schema";
import prisma from "../client";
import { handleError } from "../utils/error-handler";
import { Currency } from "@prisma/client";

export const createBudget = async (c: Context) => {
  try {
    const body = await c.req.json();
    const {
      userId,
      title,
      amount,
      currency,
      startDate,
      endDate,
      category
    } = BudgetSchema.parse(body);

    const budget = await prisma.budget.create({
      data: {
        title,
        amount,
        currency,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        category,
        user: {
          connect: { id: userId }
        }
      }
    });

    return c.json({ budget }, 201);
  } catch (error) {
    return handleError(c, error);
  }
};

export const checkBudgetLimit = async (userId: string, amount: number, currency: Currency, date: Date) => {
  const budget = await prisma.budget.findFirst({
    where: {
      userId,
      startDate: { lte: date },
      endDate: { gte: date },
      currency
    }
  });

  if (!budget) return { exceeded: false };

  const expenses = await prisma.expense.aggregate({
    where: {
      userId,
      currency,
      date: {
        gte: budget.startDate,
        lte: budget.endDate
      }
    },
    _sum: {
      amount: true
    }
  });

  const totalSpent = expenses?._sum?.amount || 0;
  const newTotal = totalSpent + amount;
  const exceeded = newTotal > budget.amount;

  return {
    exceeded,
    budget: budget.amount,
    spent: totalSpent,
    remaining: budget.amount - totalSpent,
    newTotal
  };
};
