import { z } from "zod";
import { Currency, ExpenseType } from "@prisma/client";


// Expense validation schemas
export const ExpenseSchema = z.object({
    amount: z.number().positive(),
    description: z.string().optional(),
    category: z.string().min(4),
    paymentMethod: z.enum(['cash', 'card', 'transfer']).optional(),
    userId: z.string().uuid(),
    currency: z.nativeEnum(Currency).optional(),
    type: z.nativeEnum(ExpenseType).optional(),
    date: z.string().datetime().optional()
});


// Query parameters validation schema
export const ExpenseQuerySchema = z.object({
    page: z.string().regex(/^\d+$/).transform(Number).default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).default('10'),
    sortBy: z.enum(['date', 'amount', 'createdAt']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    category: z.string().optional(),
    paymentMethod: z.enum(['cash', 'card', 'transfer']).optional(),
    minAmount: z.string().regex(/^\d+$/).transform(Number).optional(),
    maxAmount: z.string().regex(/^\d+$/).transform(Number).optional(),
}).merge(ExpenseSchema.pick({ type: true, currency: true }));
