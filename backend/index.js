const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(cors());
app.use(express.json());

const waiting = new Map();
const rooms = new Map();
let roomId = 0;

function tryMatch(socket) {
  const me = waiting.get(socket.id);
  if (!me) return;

  for (const [sid, other] of waiting) {
    if (sid === socket.id) continue;

    const match = (
      (!me.mode || !other.mode || me.mode === other.mode) &&
      (!me.city || !other.city || me.city === other.city) &&
      (!me.ageFrom || !other.ageTo || me.ageFrom <= other.ageTo) &&
      (!me.ageTo || !other.ageFrom || me.ageTo >= other.ageFrom)
    );

    if (match) {
      roomId++;
      const rid = `room_${roomId}`;
      rooms.set(rid, { users: [socket.id, sid], userIds: [me.userId, other.userId], mode: me.mode || other.mode });

      waiting.delete(socket.id);
      waiting.delete(sid);

      const data = { id: rid, mode: me.mode || other.mode, user1_id: me.userId, user2_id: other.userId };
      io.to(socket.id).emit("partner_found", data);
      io.to(sid).emit("partner_found", data);
      console.log(`Room ${rid}: ${me.userId} <-> ${other.userId}`);
      return;
    }
  }
}

io.on("connection", (socket) => {
  socket.on("find_partner", (data) => {
    waiting.set(socket.id, { ...data, socketId: socket.id });
    tryMatch(socket);
  });

  socket.on("cancel_search", () => {
    waiting.delete(socket.id);
  });

  socket.on("send_message", ({ roomId, content }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    const other = room.users.find((id) => id !== socket.id);
    if (!other) return;
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    const senderIdx = room.users.indexOf(socket.id);
    const senderId = room.userIds[senderIdx];
    io.to(socket.id).emit("new_message", { id, content, sender_id: senderId, mine: true });
    io.to(other).emit("new_message", { id, content, sender_id: senderId, mine: false });
  });

  socket.on("signal", ({ roomId, type, payload }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    const other = room.users.find((id) => id !== socket.id);
    if (other) io.to(other).emit("signal", { type, payload });
  });

  socket.on("next", (roomId) => {
    const room = rooms.get(roomId);
    if (room) {
      const other = room.users.find((id) => id !== socket.id);
      if (other) io.to(other).emit("partner_left");
      rooms.delete(roomId);
    }
  });

  socket.on("disconnect", () => {
    waiting.delete(socket.id);
    for (const [rid, room] of rooms) {
      if (room.users.includes(socket.id)) {
        const other = room.users.find((id) => id !== socket.id);
        if (other) io.to(other).emit("partner_left");
        rooms.delete(rid);
        break;
      }
    }
  });
});

app.get("/api/online", (_, res) => res.json({ count: rooms.size }));

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`AnonAZ on :${PORT}`));
