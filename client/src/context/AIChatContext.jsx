import React, { createContext, useContext, useState } from "react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

const AiChatContext = createContext();

export const AiChatProvider = ({ children }) => {
  const [aiMessages, setAiMessages] = useState([]);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);

  const getAiHistory = async () => {
    try {
      const { data } = await axiosInstance.get("/api/ai/history");
      setAiMessages(data);
      setIsHistoryLoaded(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load AI chat history");
    }
  };

  const sendMessageToAi = async (message) => {
    // optimistically show the user's message immediately
    const userMsg = { role: "user", text: message, createdAt: new Date().toISOString() };
    setAiMessages((prev) => [...prev, userMsg]);
    setIsAiTyping(true);

    try {
      const { data } = await axiosInstance.post("/api/ai/send", { message });
      const aiMsg = { role: "assistant", text: data.reply, createdAt: new Date().toISOString() };
      setAiMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      toast.error(error.response?.data?.message || "AI failed to respond");
    } finally {
      setIsAiTyping(false);
    }
  };

  const value = { aiMessages, isAiTyping, isHistoryLoaded, getAiHistory, sendMessageToAi };
  return <AiChatContext.Provider value={value}>{children}</AiChatContext.Provider>;
};

export const useAiChat = () => useContext(AiChatContext);