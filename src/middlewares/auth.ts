import { Context, Next } from "hono";
import { bearerAuth } from 'hono/bearer-auth';
import { userIdentifier } from "../constans";

const token = 'trackerToken';

export const authMiddleware = async (c: Context, next: Next) => bearerAuth({ token })(c, next);

// Additional middleware to check if user has access to the resource
export const resourceAccessMiddleware = async (c: Context, next: Next) => {
  const userId = c.req.param(userIdentifier);
  const requestUserId = c.req.header('X-User-Id'); // Assuming user ID is passed in header

  if (!requestUserId) return c.json({ error: 'User ID not provided' }, 401);
  if (userId !== requestUserId) return c.json({ error: 'Unauthorized access to this resource' }, 403);

  await next();
};

export const adminAccessMiddleware = async (c: Context, next: Next) => {
  const adminId = c.req.header('X-Admin-Id');
  if (!adminId) return c.json({ error: 'Admin ID not provided' }, 401);
  if (adminId !== 'admin') return c.json({ error: 'Unauthorized access to this resource' }, 403);

  await next();
};
