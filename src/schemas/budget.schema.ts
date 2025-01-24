import { Currency } from "@prisma/client";
import { z } from "zod";

export const BudgetSchema = z.object({
    userId: z.string().uuid(),
    title: z.string().min(3).max(50),
    amount: z.number().positive(),
    currency: z.nativeEnum(Currency),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    category: z.string().optional(),
});

