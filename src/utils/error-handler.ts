import { Context } from "hono";
import { z } from "zod";

export type ErrorResponse = {
  error: string;
  details?: unknown;
};

export class NotFoundError extends Error {
  constructor(resource: string) {
    super(`${resource} not found`);
    this.name = "NotFoundError";
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export const handleError = (c: Context, error: unknown): Response => {
  // Handle Zod validation errors
  if (error instanceof z.ZodError) {
    return c.json({
      error: "Validation error",
      details: error.errors
    }, 400);
  }

  // Handle Prisma errors
  if (error instanceof Error && error.name === "PrismaClientKnownRequestError") {
    return c.json({
      error: "Database error",
      details: error.message
    }, 400);
  }

  // Handle NotFoundError
  if (error instanceof Error && error.name === "NotFoundError") {
    return c.json({
      error: "Resource not found",
      details: error.message
    }, 404);
  }

  // Handle general errors
  if (error instanceof Error) {
    return c.json({
      error: error.message
    }, 500);
  }

  // Handle unknown errors
  return c.json({
    error: "An unexpected error occurred"
  }, 500);
};