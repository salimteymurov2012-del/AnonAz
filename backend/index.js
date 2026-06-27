const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

const waiting = [];
const rooms = new Map();
const nicks = new Map();

io.on("connection", (socket) => {
  socket.on("chat:find", ({ nickname }) => {
    const nick = (nickname || `anon_${Math.random().toString(36).slice(2, 8)}`).slice(0, 20);
    nicks.set(socket.id, nick);

    const partner = waiting.find((s) => s.id !== socket.id);
    if (partner) {
      const roomId = `room_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const idx = waiting.indexOf(partner);
      if (idx !== -1) waiting.splice(idx, 1);

      rooms.set(socket.id, partner.id);
      rooms.set(partner.id, socket.id);

      io.to(socket.id).emit("chat:paired", { partnerId: partner.id, partnerNickname: nicks.get(partner.id) });
      io.to(partner.id).emit("chat:paired", { partnerId: socket.id, partnerNickname: nick });
    } else {
      waiting.push(socket);
      socket.emit("chat:waiting");
    }
  });

  socket.on("chat:cancel", () => {
    const idx = waiting.indexOf(socket);
    if (idx !== -1) waiting.splice(idx, 1);
    socket.emit("chat:cancelled");
  });

  socket.on("chat:next", () => {
    const partnerId = rooms.get(socket.id);
    if (partnerId) {
      io.to(partnerId).emit("chat:partner_left");
      rooms.delete(socket.id);
      rooms.delete(partnerId);
    }
    nicks.delete(socket.id);
    socket.emit("chat:disconnected");
  });

  socket.on("chat:message", ({ text }) => {
    const partnerId = rooms.get(socket.id);
    if (!partnerId) return;
    const msg = {
      from: socket.id,
      text: String(text).slice(0, 500),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    io.to(partnerId).emit("chat:message", msg);
  });

  socket.on("chat:typing", ({ typing }) => {
    const partnerId = rooms.get(socket.id);
    if (partnerId) io.to(partnerId).emit("chat:typing", { typing });
  });

  socket.on("disconnect", () => {
    const idx = waiting.indexOf(socket);
    if (idx !== -1) waiting.splice(idx, 1);
    const partnerId = rooms.get(socket.id);
    if (partnerId) {
      io.to(partnerId).emit("chat:partner_left");
      rooms.delete(socket.id);
      rooms.delete(partnerId);
    }
    nicks.delete(socket.id);
  });
});

app.get("/api/online", (_, res) => res.json({ count: rooms.size / 2 }));

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`AnonAZ on :${PORT}`));
