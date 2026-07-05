import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
export const chatModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export default genAI;