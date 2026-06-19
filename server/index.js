import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import cookieParser from "cookie-parser";
import { PORT, FRONTEND_URL } from "./config/env.js";
import { connectDB } from "./config/db-connection.js";
import authRoutes from "./routes/auth-routes.js";
import clientRoutes from "./routes/client-routes.js";
import lawyerRoutes from "./routes/lawyer-routes.js";
import adminRoutes from "./routes/admin-route.js";
import caseRoutes from "./routes/case-route.js";
import clerkRoutes from "./routes/clerk-route.js";
import courtOfficerRoutes from "./routes/court-officer-route.js";
import messagesRoutes from "./routes/message-route.js";
import notificationRoutes from "./routes/notification-route.js";
import errorMiddleware from "./middlewares/error.middleware.js";

import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
app.set("trust proxy", 1);

const httpServer = createServer(app);

// Restrict CORS to the known frontend origin — never use `true` with credentials
const allowedOrigins = FRONTEND_URL
  ? [FRONTEND_URL]
  : ["http://localhost:3000"];

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

app.use(bodyParser.json());
app.use(cookieParser());

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  }),
);

// Socket.IO: room-based, user-targeted messaging
io.on("connection", (socket) => {
  const userId = socket.handshake.query?.userId;

  if (userId) {
    // Each user joins a personal room — enables direct targeted delivery
    socket.join(userId);
    console.log(`Socket Connected: ${socket.id} | User: ${userId}`);
  } else {
    console.log(`Socket Connected (no userId): ${socket.id}`);
  }

  // Client joins a conversation room when they open a chat
  socket.on("conversation:join", (conversationId) => {
    if (conversationId) {
      socket.join(`conversation:${conversationId}`);
    }
  });

  // Client leaves the room when they navigate away
  socket.on("conversation:leave", (conversationId) => {
    if (conversationId) {
      socket.leave(`conversation:${conversationId}`);
    }
  });

  // Route messages only to the conversation room — NOT a global broadcast
  socket.on("message:send", (data) => {
    const { conversationId, text, senderId, tempId } = data;
    if (!conversationId) return;

    io.to(`conversation:${conversationId}`).emit("message:receive", {
      conversationId,
      text,
      content: text,
      senderId,
      tempId,
      timestamp: new Date().toISOString(),
    });
  });

  socket.on("disconnect", () => {
    console.log(`Socket Disconnected: ${socket.id} | User: ${userId}`);
  });
});

httpServer.listen(PORT || 5000, async () => {
  console.log(`Server is running on port ${PORT}`);
  await connectDB();
});

app.use("/api/auth", authRoutes);
app.use("/api/client", clientRoutes);
app.use("/api/lawyer", lawyerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/case", caseRoutes);
app.use("/api/clerk", clerkRoutes);
app.use("/api/court-officer", courtOfficerRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/test", (req, res) => {
  res.send("API Running");
});

app.use(errorMiddleware);
