import { Context } from "hono";
import { ExpenseSchema, ExpenseQuerySchema } from "../schemas/validation";
import { z } from "zod";
import prisma from "../client";
import { userIdentifier } from "../constans";
import { handleError } from "../utils/error-handler";

export const createExpense = async (c: Context) => {
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
        currency: validatedData.currency,
        type: validatedData.type,
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
          }
        }
      }
    });

    return c.json(expense, 201);
  } catch (error) {
    return handleError(c, error)
  }
};

export const updateExpense = async (c: Context) => {
  const id = c.req.param("id");

  try {
    const body = await c.req.json();
    const validatedData = ExpenseSchema.partial().parse(body);

    const expense = await prisma.expense.update({
      where: { id },
      data: validatedData,
      include: {
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

    return c.json(expense);
  } catch (error) {
    handleError(c, error);
  }
};

export const deleteExpense = async (c: Context) => {
  const id = c.req.param("id");

  try {
    await prisma.expense.delete({
      where: { id },
    });

    return c.json({ message: "Expense deleted successfully" });
  } catch (error) {
    return handleError(c, error);
  }
};

export const getExpense = async (c: Context) => {
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

    if (!expense) return c.json({ error: "Expense not found" }, 404);

    return c.json(expense);
  } catch (error) {
    return handleError(c, error);
  }
};

export const getUserExpenses = async (c: Context) => {
  const userId = c.req.param(userIdentifier);

  try {
    const query = c.req.query();
    const {
      page,
      limit,
      sortBy,
      sortOrder,
      startDate,
      endDate,
      category,
      type,
      currency,
      minAmount,
      maxAmount
    } = ExpenseQuerySchema.parse(query);

    const skip = (page - 1) * limit;
    const whereClause: any = { userId };

    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) whereClause.date.gte = new Date(startDate);
      if (endDate) whereClause.date.lte = new Date(endDate);
    }

    if (category) {
      whereClause.category = { name: category };
    }

    if (type) {
      whereClause.type = type;
    }

    if (currency) {
      whereClause.currency = currency;
    }

    if (minAmount || maxAmount) {
      whereClause.amount = {};
      if (minAmount) whereClause.amount.gte = minAmount;
      if (maxAmount) whereClause.amount.lte = maxAmount;
    }

    const total = await prisma.expense.count({
      where: whereClause
    });

    const expenses = await prisma.expense.findMany({
      where: whereClause,
      orderBy: {
        [sortBy]: sortOrder
      },
      skip,
      take: limit,
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

    return c.json({
      data: expenses,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + expenses.length < total
      },
      filters: {
        startDate,
        endDate,
        category,
        type,
        currency,
        minAmount,
        maxAmount
      },
      sorting: {
        sortBy,
        sortOrder
      }
    });
  } catch (error) {
    return handleError(c, error);
  }
};


export const getUserSummary = async (c: Context) => {
  const userId = c.req.param(userIdentifier);

  try {
    const expenses = await prisma.expense.aggregate({
      where: { userId },
      _sum: { amount: true },
      _count: { id: true }
    });

    if (!expenses) return c.json({ error: "User not found" }, 404);

    return c.json({
      total: expenses._sum.amount,
      count: expenses._count.id
    });
  } catch (error) {
    return handleError(c, error);
  }
}