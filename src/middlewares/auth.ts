import { Context, Next } from "hono";
import { bearerAuth } from 'hono/bearer-auth';

const token = 'trackerToken';

export const authMiddleware = async (c: Context, next: Next) => bearerAuth({ token })(c, next);

export const resourceAccessMiddleware = async (c: Context, next: Next) => {
  const requestUserId = c.req.header('X-User-Id');

  if (!requestUserId) return c.json({ error: 'User ID not provided' }, 401);

  await next();
};


export const adminAccessMiddleware = async (c: Context, next: Next) => {
  const adminId = c.req.header('X-Admin-Id');
  if (!adminId) return c.json({ error: 'Admin ID not provided' }, 401);
  if (adminId !== 'admin') return c.json({ error: 'Unauthorized access to this resource' }, 403);

  await next();
};

export const resourceOwnerId = (c: Context): string | undefined => c.req.header('X-User-Id');