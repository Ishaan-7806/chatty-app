import React, { createContext, useContext, useState, useEffect } from "react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});

  const { socket, authUser } = useAuth();

  const getUsersForSidebar = async () => {
    try {
      const { data } = await axiosInstance.get("/api/message/users");
      setUsers(data.users);
      setUnseenMessages(data.unseenMessages);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load users");
    }
  };

  const getMessages = async (userId) => {
    try {
      const { data } = await axiosInstance.get(`/api/message/${userId}`);
      setMessages(data);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load messages");
    }
  };

  const sendMessage = async (messageData) => {
    if (!selectedUser) return;
    try {
      const { data } = await axiosInstance.post(`/api/message/send/${selectedUser._id}`, messageData);
      setMessages((prev) => [...prev, data]);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    }
  };

  const subscribeToMessages = () => {
    if (!socket) return;

    socket.on("newMessage", (newMessage) => {
      if (selectedUser && newMessage.senderId === selectedUser._id) {
        // chat with this sender is open — mark seen immediately
        newMessage.seen = true;
        setMessages((prev) => [...prev, newMessage]);
        axiosInstance.put(`/api/message/mark-as-seen/${newMessage._id}`);
      } else {
        // message from someone not currently open — bump unseen count
        setUnseenMessages((prev) => ({
          ...prev,
          [newMessage.senderId]: (prev[newMessage.senderId] || 0) + 1,
        }));
      }
    });
  };

  const unsubscribeFromMessages = () => {
    socket?.off("newMessage");
  };

  useEffect(() => {
    subscribeToMessages();
    return () => unsubscribeFromMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, selectedUser]);

  const value = {
    messages,
    users,
    selectedUser,
    unseenMessages,
    setSelectedUser,
    setUnseenMessages,
    getUsersForSidebar,
    getMessages,
    sendMessage,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => useContext(ChatContext);