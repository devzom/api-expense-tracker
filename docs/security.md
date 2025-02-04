# Security

## Rate limiting

Limits requests to 100 requests per minute per IP address, return `429`.
Protect all routes with rate limiting by Hono, it's in-memory storage (resets on server restart).
