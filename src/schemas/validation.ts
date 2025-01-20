import { z } from "zod";
import { Currency, ExpenseType, WeekDay } from "@prisma/client";

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

// User preferences validation schema
export const UserPreferencesSchema = z.object({
  notificationsEnabled: z.boolean().optional(),
  weekStartsOn: z.nativeEnum(WeekDay).optional(),
  language: z.string().min(2).max(5).optional(),
  dateFormat: z.string().min(8).max(10).optional(),
  timeFormat: z.enum(['12h', '24h']).optional(),
});

// User validation schema
export const UserCreateSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(50),
  surname: z.string().min(2).max(50).optional(),
  avatar: z.string().url().optional(),
});

export const UserUpdateSchema = UserCreateSchema.omit({ email: true });

// Query parameters validation schema
export const ExpenseQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default('1'),
  limit: z.string().regex(/^\d+$/).transform(Number).default('10'),
  sortBy: z.enum(['date', 'amount', 'createdAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  category: z.string().optional(),
  type: z.nativeEnum(ExpenseType).optional(),
  currency: z.nativeEnum(Currency).optional(),
  minAmount: z.string().regex(/^\d+$/).transform(Number).optional(),
  maxAmount: z.string().regex(/^\d+$/).transform(Number).optional(),
});
