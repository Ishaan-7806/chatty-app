import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { sendMessageToAI, getAIChatHistory, summarizeChat } from "../controllers/ai.controller.js";

const aiRouter = express.Router();

aiRouter.post("/send", protectRoute, sendMessageToAI);
aiRouter.get("/history", protectRoute, getAIChatHistory);
aiRouter.post("/summarize-chat", protectRoute, summarizeChat);

export default aiRouter;