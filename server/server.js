require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const { Server } = require("socket.io");
const connectDB = require("./config/db");

connectDB();

const app = express();
const server = http.createServer(app);

// real-time: each project board is a "room"
const io = new Server(server, { cors: { origin: "*" } });
app.set("io", io);
io.on("connection", (socket) => {
  socket.on("join", (projectId) => socket.join(String(projectId)));
});

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use("/api/auth", rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

app.get("/", (req, res) => res.send("TaskFlow API running"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/projects", require("./routes/projectRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));