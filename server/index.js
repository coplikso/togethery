const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.get('/', (req, res) => {
  res.send('Server is running');
});

const rooms = {};

function generateRoomCode() {
  return Math.random().toString(36).substring(2, 7).toUpperCase();
}

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('create_room', (username) => {
    const roomCode = generateRoomCode();
    rooms[roomCode] = { users: [{ id: socket.id, username }] };
    socket.join(roomCode);
    socket.emit('room_created', { roomCode, users: rooms[roomCode].users });
  });

  socket.on('join_room', ({ roomCode, username }) => {
    const room = rooms[roomCode];
    if (!room) {
      socket.emit('join_error', 'Room not found');
      return;
    }
    room.users.push({ id: socket.id, username });
    socket.join(roomCode);
    io.to(roomCode).emit('room_update', room.users);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    for (const code in rooms) {
      const room = rooms[code];
      room.users = room.users.filter(u => u.id !== socket.id);
      if (room.users.length === 0) {
        delete rooms[code];
      } else {
        io.to(code).emit('room_update', room.users);
      }
    }
  });
});

server.listen(3000, () => {
  console.log('Listening on port 3000');
});