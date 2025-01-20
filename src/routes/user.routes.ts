import { Hono } from "hono";
import { getUsers, createUser, getUser, getUserPreferences, updateUserPreferences } from "../modules/user";
import { adminAccessMiddleware, resourceAccessMiddleware } from "../middlewares/auth";

const app = new Hono(
    { strict: true }
);

app.get("/", adminAccessMiddleware, getUsers);
app.post("/", createUser);
app.get("/:userId", resourceAccessMiddleware, getUser);
app.get("/:userId/preferences", resourceAccessMiddleware, getUserPreferences);
app.patch("/:userId/preferences", resourceAccessMiddleware, updateUserPreferences);

export default app;
