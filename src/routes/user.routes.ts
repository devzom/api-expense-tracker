import { Hono } from "hono";
import { getUsers, createUser, getUserPreferences, updateUserPreferences } from "../modules/user";
import { resourceAccessMiddleware } from "../middlewares/auth";

const app = new Hono(
    { strict: true }
);

app.get("/", getUsers);
app.post("/", createUser);
app.get("/:userId/preferences", resourceAccessMiddleware, getUserPreferences);
app.patch("/:userId/preferences", resourceAccessMiddleware, updateUserPreferences);

export default app;
