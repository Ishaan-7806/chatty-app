import axios from "axios";

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

export const axiosInstance = axios.create({
  baseURL: backendUrl,
  withCredentials: true, // sends the httpOnly JWT cookie with every request
});