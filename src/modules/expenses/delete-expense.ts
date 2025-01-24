import { Context } from "hono";
import prisma from "../../client";
import { handleError } from "../../utils/error-handler";
import { resourceOwnerId } from "../../middlewares/auth";

const deleteExpense = async (c: Context) => {
    const id = c.req.param("id");

    const expenseExist = await prisma.expense.findUnique({
        where: {
            id,
            user: {
                id: {
                    equals: resourceOwnerId(c)
                }
            }
        }
    })

    if (!expenseExist) return c.json({ error: "Expense not found" }, 404);


    try {
        await prisma.expense.delete({
            where: { id },
        });

        return c.json({ message: "Expense deleted successfully" });
    } catch (error) {
        return handleError(c, error);
    }
};


export default deleteExpense
