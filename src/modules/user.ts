import { Context } from "hono";
import { UserCreateSchema, UserPreferencesSchema, UserUpdateSchema } from "../schemas/validation";
import { z } from "zod";
import prisma from "../client";
import { userIdentifier } from "../constans";


export const getUsers = async (c: Context) => {
  try {
    const users = await prisma.user.findMany();
    return c.json(users);
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json({ error: "An unexpected error occurred" }, 500);
  }
};


export const createUser = async (c: Context) => {
  try {
    const body = await c.req.json();
    const validatedData = UserCreateSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (existingUser) {
      return c.json({ error: "Email already registered" }, 400);
    }

    const user = await prisma.user.create({
      data: validatedData,
      select: {
        id: true,
        email: true,
        name: true,
        surname: true,
        avatar: true,
        createdAt: true
      }
    });

    return c.json(user, 201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: "Invalid user data", details: error.errors }, 400);
    }
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
};

export const getUser = async (c: Context) => {
  const userId = c.req.param(userIdentifier);

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) return c.json({ error: "User not found" }, 404);

    return c.json(user);
  } catch (error) {
    if (error instanceof Error) return c.json({ error: error.message }, 500);

    return c.json({ error: "An unexpected error occurred" }, 500);
  }
};

export const updateUser = async (c: Context) => {
  const userId = c.req.param(userIdentifier);

  try {
    const body = await c.req.json();

    const user = await prisma.user.update({
      where: { id: userId },
      data: UserUpdateSchema.parse(body)
    });

    return c.json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: "Invalid user data", details: error.errors }, 400);
    }
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json({ error: "An unexpected error occurred" }, 500);
  }
}


export const getUserPreferences = async (c: Context) => {
  const userId = c.req.param(userIdentifier);

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    const preferences = await prisma.userPreferences.findUnique({
      where: { userId },
    });

    if (!preferences) {
      // add default preferences
      const defaultPreferences = await prisma.userPreferences.create({
        data: {
          userId,
        },
      });

      return c.json(defaultPreferences);
    }

    return c.json(preferences);
  } catch (error) {
    if (error instanceof Error) return c.json({ error: error.message }, 500);

    return c.json({ error: "An unexpected error occurred" }, 500);
  }
};

export const updateUserPreferences = async (c: Context) => {
  const userId = c.req.param(userIdentifier);

  try {
    const body = await c.req.json();

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return c.json({ error: "User not found" }, 404);
    }

    const validatedData = UserPreferencesSchema.parse(body);

    const updatedPreferences = await prisma.userPreferences.upsert({
      where: { userId },
      create: {
        ...validatedData,
        userId,
      },
      update: validatedData,
    });

    return c.json(updatedPreferences);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: "Invalid preferences data", details: error.errors }, 400);
    }
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json({ error: "An unexpected error occurred" }, 500);
  }
};