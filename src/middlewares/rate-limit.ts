import { Context, Next } from 'hono';
import { RateLimiterMemory } from 'rate-limiter-flexible';

const rateLimiter = new RateLimiterMemory({
    points: 100, // Number of points
    duration: 60, // Per 60 seconds
});

export const rateLimitMiddleware = async (c: Context, next: Next) => {
    try {
        const ip = c.req.header('x-forwarded-for') ||
            c.env?.ip ||
            'unknown';

        await rateLimiter.consume(ip);

        await next();
    } catch (error) {
        return c.json({
            error: 'Too Many Requests',
            message: 'Rate limit exceeded. Please try again later.'
        }, 429);
    }
};
