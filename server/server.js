import express from 'express';
import cors from 'cors';
import http from 'http';
import cookieParser from 'cookie-parser';
import "dotenv/config";
import { connectDB } from "./lib/db.js";
import { Server } from 'socket.io';
import userRouter from "./routes/user.route.js";
import messageRouter from "./routes/message.route.js";
import aiRouter from "./routes/ai.route.js";

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:5173",
  // we'll add your Vercel URL here after deploying the frontend
];

export const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

// store online users: { userId: socketId }
export const userSocketMap = {};

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  console.log("User connected:", userId);

  if (userId) userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("User disconnected:", userId);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

app.use(express.json({ limit: '4mb' }));
app.use(cookieParser());
app.use(cors({ origin: allowedOrigins, credentials: true }));

app.use("/api/status", (req, res) => res.send("server is live ... 😊"));
app.use("/api/auth", userRouter);
app.use("/api/message", messageRouter);
app.use("/api/ai", aiRouter);

await connectDB();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));