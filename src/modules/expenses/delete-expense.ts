import { Context } from "hono";
import prisma from "../../client";
import { handleError } from "../../utils/error-handler";
import { resourceOwnerId } from "../../middlewares/auth";

const deleteExpense = async (c: Context) => {
    const id = c.req.param("id");

    try {
        await prisma.expense.delete({
            where: {
                id, user: {
                    id: {
                        equals: resourceOwnerId(c)
                    }
                }
            },
        });

        return c.json({ message: "Expense deleted successfully" });
    } catch (error) {
        return handleError(c, error);
    }
};


export default deleteExpense
