import { Currency } from "@prisma/client";
import { z } from "zod";

export const BudgetSchema = z.object({
    userId: z.string().uuid(),
    title: z.string().min(1, 'Title is required'),
    amount: z.number().positive('Amount must be positive'),
    currency: z.nativeEnum(Currency),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    categoryId: z.string().uuid().optional(),
    isOverall: z.boolean().default(false)
}).refine(
    (data) => {
        const start = new Date(data.startDate);
        const end = new Date(data.endDate);
        return end > start;
    },
    {
        message: "End date must be after start date",
        path: ["endDate"]
    }
);

export type BudgetInput = z.infer<typeof BudgetSchema>;
