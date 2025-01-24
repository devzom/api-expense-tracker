import { Context } from "hono";
import prisma from "../../client";
import { handleError } from "../../utils/error-handler";
import { resourceOwnerId } from "../../middlewares/auth";

const getExpense = async (c: Context) => {
    const id = c.req.param("id");

    try {
        const expense = await prisma.expense.findUnique({
            where: {
                id, user: {
                    id: {
                        equals: resourceOwnerId(c)
                    }
                }
            },
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

export default getExpense