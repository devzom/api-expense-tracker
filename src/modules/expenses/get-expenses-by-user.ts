import { Context } from "hono";
import { ExpenseQuerySchema } from "../../schemas/expense.schema";
import prisma from "../../client";
import { handleError } from "../../utils/error-handler";
import { resourceOwnerId } from "../../middlewares/auth";

const getExpensesByUser = async (c: Context) => {
    const query = c.req.query();

    try {
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
        const whereClause: any = {

        };

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
            where: {
                user: {
                    id: {
                        equals: resourceOwnerId(c)
                    }
                }, ...whereClause
            },
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
                    }
                },
                paymentMethod: {
                    select: {
                        name: true,
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

export default getExpensesByUser;