import { Context } from "hono";
import { BudgetSchema } from "../schemas/budget.schema";
import prisma from "../client";
import { handleError } from "../utils/error-handler";
import { Currency } from "@prisma/client";

export const createBudget = async (c: Context) => {
    try {
        const body = await c.req.json();
        const data = BudgetSchema.parse(body);

        // Check if there's an existing overall budget for the same period
        if (data.isOverall) {
            const existingOverall = await prisma.budget.findFirst({
                where: {
                    userId: data.userId,
                    isOverall: true,
                    AND: [
                        { startDate: { lte: new Date(data.endDate) } },
                        { endDate: { gte: new Date(data.startDate) } }
                    ]
                }
            });

            if (existingOverall) {
                return c.json({
                    error: 'Validation Error',
                    message: 'An overall budget already exists for this period'
                }, 400);
            }
        }

        // Check if there's an existing category budget for the same period
        if (data.categoryId) {
            const existingCategory = await prisma.budget.findFirst({
                where: {
                    userId: data.userId,
                    categoryId: data.categoryId,
                    AND: [
                        { startDate: { lte: new Date(data.endDate) } },
                        { endDate: { gte: new Date(data.startDate) } }
                    ]
                }
            });

            if (existingCategory) {
                return c.json({
                    error: 'Validation Error',
                    message: 'A budget for this category already exists in this period'
                }, 400);
            }
        }

        const budget = await prisma.budget.create({
            data: {
                ...data,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate)
            },
            include: {
                category: true
            }
        });

        return c.json(budget, 201);
    } catch (error) {
        return handleError(c, error);
    }
};

export const getBudgets = async (c: Context) => {
    try {
        const userId = c.req.param('userId');
        const budgets = await prisma.budget.findMany({
            where: { userId },
            include: {
                category: true
            },
            orderBy: {
                startDate: 'desc'
            }
        });

        return c.json(budgets);
    } catch (error) {
        return handleError(c, error);
    }
};

export const getBudgetStatus = async (c: Context) => {
    try {
        const budgetId = c.req.param('id');
        const budget = await prisma.budget.findUnique({
            where: { id: budgetId },
            include: { category: true }
        });

        if (!budget) {
            return c.json({ error: 'Budget not found' }, 404);
        }

        // Calculate total expenses for the budget period
        const expenses = await prisma.expense.findMany({
            where: {
                userId: budget.userId,
                date: {
                    gte: budget.startDate,
                    lte: budget.endDate
                },
                ...(budget.categoryId ? { categoryId: budget.categoryId } : {}),
                type: 'expense'
            }
        });

        const totalSpent = getTotalSpent(expenses, budget.currency);

        return c.json({
            budget,
            totalSpent,
            remaining: budget.amount - totalSpent,
            percentageUsed: (totalSpent / budget.amount) * 100
        });
    } catch (error) {
        return handleError(c, error);
    }
};

export const checkBudgetLimit = async (userId: string, amount: number, currency: Currency, date: Date, categoryId?: string) => {
    const budgets = await prisma.budget.findMany({
        where: {
            userId,
            currency,
            startDate: { lte: date },
            endDate: { gte: date },
            OR: [
                { isOverall: true },
                { categoryId: categoryId }
            ]
        }
    });

    for (const budget of budgets) {
        const expenses = await prisma.expense.findMany({
            where: {
                userId,
                date: {
                    gte: budget.startDate,
                    lte: budget.endDate
                },
                ...(budget.categoryId ? { categoryId: budget.categoryId } : {}),
                type: 'expense'
            }
        });

        const totalSpent = getTotalSpent(expenses, budget.currency);

        if (totalSpent + amount > budget.amount) {
            return {
                exceeded: true,
                budget,
                currentSpent: totalSpent,
                newTotal: totalSpent + amount
            };
        }
    }

    return { exceeded: false };
};

export const getTotalSpent = (expenses: { amount: number; currency: Currency }[], currency: Currency) =>
    expenses.reduce((sum, expense) => {
        if (expense.currency === currency) return sum + expense.amount;
        // TODO: Add currency conversion logic here
        return sum;
    }, 0)