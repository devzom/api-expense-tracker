import { WeekDay } from "@prisma/client";
import { z } from "zod";

export const UserCreateSchema = z.object({
    email: z.string().email(),
    name: z.string().min(2).max(50),
    surname: z.string().min(2).max(50).optional(),
    avatar: z.string().url().optional(),
});

export const UserUpdateSchema = UserCreateSchema.omit({ email: true });

export const UserPreferencesSchema = z.object({
    notificationsEnabled: z.boolean().optional(),
    weekStartsOn: z.nativeEnum(WeekDay).optional(),
    language: z.string().min(2).max(5).optional(),
    dateFormat: z.string().min(8).max(10).optional(),
    timeFormat: z.enum(['12h', '24h']).optional(),
});