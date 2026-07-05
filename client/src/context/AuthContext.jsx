import React, { createContext, useContext, useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const AuthContext = createContext();
const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);

  const connectSocket = (user) => {
    if (!user) return;
    const newSocket = io(backendUrl, { query: { userId: user._id } });
    newSocket.on("getOnlineUsers", (userIds) => setOnlineUsers(userIds));
    setSocket(newSocket);
  };

  const disconnectSocket = () => {
    socket?.disconnect();
    setSocket(null);
  };

  const checkAuth = async () => {
    try {
      const { data } = await axiosInstance.get("/api/auth/check");
      setAuthUser(data);
      connectSocket(data);
    } catch (error) {
      setAuthUser(null);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const signup = async (formData) => {
    try {
      const { data } = await axiosInstance.post("/api/auth/signup", formData);
      setAuthUser(data);
      connectSocket(data);
      toast.success("Account created successfully");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
      return false;
    }
  };

  const login = async (formData) => {
    try {
      const { data } = await axiosInstance.post("/api/auth/login", formData);
      setAuthUser(data);
      connectSocket(data);
      toast.success("Logged in successfully");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed");
      return false;
    }
  };

  const logout = async () => {
    try {
      await axiosInstance.post("/api/auth/logout");
    } finally {
      setAuthUser(null);
      disconnectSocket();
      toast.success("Logged out successfully");
    }
  };

  const updateProfile = async (formData) => {
    try {
      const { data } = await axiosInstance.put("/api/auth/update-profile", formData);
      setAuthUser(data);
      toast.success("Profile updated successfully");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
      return false;
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value = { authUser, isCheckingAuth, onlineUsers, socket, signup, login, logout, updateProfile };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);