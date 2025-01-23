import { Hono } from "hono";
import { getUsers, createUser, getUser, updateUser, getUserPreferences, updateUserPreferences } from "../modules/user";
import { adminAccessMiddleware, resourceAccessMiddleware } from "../middlewares/auth";
import { userIdentifier } from "../constans";

const app = new Hono(
    { strict: true }
);

app.get("/", adminAccessMiddleware, getUsers);
app.post("/", createUser);

app.get(`/:${userIdentifier}`, resourceAccessMiddleware, getUser);
app.patch(`/:${userIdentifier}`, resourceAccessMiddleware, updateUser);

app.get(`/:${userIdentifier}/preferences`, resourceAccessMiddleware, getUserPreferences);
app.patch(`/:${userIdentifier}/preferences`, resourceAccessMiddleware, updateUserPreferences);

export default app;
