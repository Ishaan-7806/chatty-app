import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { signup, login, checkAuth, updateProfile, logout } from "../controllers/user.controller.js";const userRouter = express.Router();

userRouter.post("/signup", signup);
userRouter.post("/login", login);
userRouter.put("/update-profile", protectRoute, updateProfile);
userRouter.get("/check", protectRoute, checkAuth);
userRouter.post("/logout", logout);
export default userRouter;