import { Context } from "hono";
import { ExpenseSchema, } from "../../schemas/expense.schema";
import prisma from "../../client";
import { handleError } from "../../utils/error-handler";
import { checkBudgetLimit } from "./../budget";
import { Currency } from "@prisma/client";

const createExpense = async (c: Context) => {
    try {
        const body = await c.req.json();
        const validatedData = ExpenseSchema.parse(body);

        // Check budget before creating expense
        const expenseDate = validatedData.date ? new Date(validatedData.date) : new Date();
        const budgetStatus = await checkBudgetLimit(
            validatedData.userId,
            validatedData.amount,
            validatedData.currency || Currency.USD,
            expenseDate
        );

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
                currency: validatedData.currency || Currency.USD,
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


        const budgetWarning = budgetStatus.exceeded ? {
            message: "Budget limit exceeded!",
            budget: Number(budgetStatus.budget?.toFixed(2)),
            spent: Number(budgetStatus.newTotal?.toFixed(2)),
            remaining: Number(((budgetStatus?.budget || 0) - (budgetStatus?.newTotal || 0)).toFixed(2))
        } : null

        return c.json({
            expense: {
                id: expense.id,
                amount: expense.amount,
                currency: expense.currency,
                description: expense.description,
                category: expense.category?.name,
                paymentMethod: expense.paymentMethod?.name,
            },
            budgetWarning
        }, 201);
    } catch (error) {
        return handleError(c, error);
    }
};


export default createExpense