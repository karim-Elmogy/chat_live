import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js"; ///  auth.js
import connectToMongoDB from "./db/connectToMongoDB.js";
import messageRoutes from "./routes/messages.route.js";
import { app, server } from "./socket/socket.js";

const PORT = process.env.PORT || 7000;
dotenv.config();
app.use(express.json());
app.use(express.static("uploads"));

app.use("/api/auth", authRoutes);
app.use("/api/chat", messageRoutes);

server.listen(PORT, () => {
  connectToMongoDB();
  console.log("server is running on port", PORT);
});
