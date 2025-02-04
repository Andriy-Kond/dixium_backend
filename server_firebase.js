import "dotenv/config";
import express from "express";
import cors from "cors";
import jwt from "jsonwebtoken";
import { createServer } from "http";
import { Server } from "socket.io";
import { db, bucket } from "./firebaseConfig.js";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

const { SECRET_KEY } = process.env;

// Генерація JWT токена
const generateToken = userId =>
  jwt.sign({ id: userId }, SECRET_KEY, { expiresIn: "23h" });

// Авторизація через JWT Middleware
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    req.user = jwt.verify(token, SECRET_KEY);
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Ендпоінт реєстрації гравця
app.post("/register", async (req, res) => {
  const { username } = req.body;
  const newUser = await db.collection("users").add({ username });
  const token = generateToken(newUser.id);
  res.json({ token });
});

// Завантаження картки у Firebase Storage
app.post("/upload-card", authMiddleware, async (req, res) => {
  const { filename, base64 } = req.body;
  const file = bucket.file(`cards/${filename}`);
  await file.save(Buffer.from(base64, "base64"), { contentType: "image/png" });

  const url = await file.getSignedUrl({
    action: "read",
    expires: "03-09-2026",
  });
  await db.collection("cards").add({ owner: req.user.id, url: url[0] });
  res.json({ url: url[0] });
});

// WebSocket логіка
io.on("connection", socket => {
  console.log("New player connected");

  socket.on("start-game", async () => {
    const cards = await db.collection("cards").get();
    const deck = cards.docs.map(doc => doc.data());
    io.emit("game-started", deck);
  });

  socket.on("chat-message", message => {
    socket.broadcast.emit("chat-message", message);
  });
});

httpServer.listen(3001, () => console.log("Server running on port 3001"));
