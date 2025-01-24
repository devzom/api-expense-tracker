import { Context } from "hono";
import prisma from "../../client";
import { userIdentifier } from "../../constans";
import { handleError } from "../../utils/error-handler";
import { resourceOwnerId } from "../../middlewares/auth";

const getExpensesSummaryByUser = async (c: Context) => {
    const userId = c.req.param(userIdentifier);

    try {
        const expenses = await prisma.expense.aggregate({
            where: {
                userId, user: {
                    id: {
                        equals: resourceOwnerId(c)
                    }
                }
            },
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

export default getExpensesSummaryByUser;