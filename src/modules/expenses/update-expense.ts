import { Context } from "hono";
import { ExpenseSchema, } from "../../schemas/expense.schema";
import prisma from "../../client";
import { handleError } from "../../utils/error-handler";
import { resourceOwnerId } from "../../middlewares/auth";

const updateExpense = async (c: Context) => {
    const id = c.req.param("id");

    try {
        const body = await c.req.json();
        const validatedData = ExpenseSchema.partial().parse(body);

        const expense = await prisma.expense.update({
            where: { id, user: { id: resourceOwnerId(c) } },
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

export default updateExpense