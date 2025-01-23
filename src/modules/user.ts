import { Context } from "hono";
import { UserCreateSchema, UserPreferencesSchema, UserUpdateSchema } from "../schemas/validation";
import prisma from "../client";
import { userIdentifier } from "../constans";
import { handleError, NotFoundError } from "../utils/error-handler";

export const getUsers = async (c: Context) => {
  try {
    const users = await prisma.user.findMany();
    return c.json(users);
  } catch (error) {
    return handleError(c, error);
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
      throw new Error("Email already registered");
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
    return handleError(c, error);
  }
};

export const getUser = async (c: Context) => {
  const userId = c.req.param(userIdentifier);

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundError("User");
    }

    return c.json(user);
  } catch (error) {
    return handleError(c, error);
  }
};

export const updateUser = async (c: Context) => {
  const userId = c.req.param(userIdentifier);
  const body = await c.req.json();

  try {
    const validatedData = UserUpdateSchema.parse(body);

    const user = await prisma.user.update({
      where: { id: userId },
      data: validatedData,
      select: {
        id: true,
        email: true,
        name: true,
        surname: true,
        avatar: true,
        updatedAt: true
      }
    });

    return c.json(user);
  } catch (error) {
    return handleError(c, error);
  }
};

export const getUserPreferences = async (c: Context) => {
  const userId = c.req.param(userIdentifier);

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundError("User");
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
    return handleError(c, error);
  }
};

export const updateUserPreferences = async (c: Context) => {
  const userId = c.req.param(userIdentifier);
  const body = await c.req.json();

  try {
    const validatedData = UserPreferencesSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) throw new NotFoundError("User");

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
    return handleError(c, error);
  }
};