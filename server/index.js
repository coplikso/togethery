const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://togetherly.vercel.app",
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
    rooms[roomCode] = {
      users: [{ id: socket.id, username }],
      videoId: '',
      currentTime: 0,
      isPlaying: false,
      pdfData: null,
      currentPage: 1,
    };
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

    socket.emit('room_state', {
      videoId: room.videoId,
      currentTime: room.currentTime,
      isPlaying: room.isPlaying
    });
  });

  socket.on('video_action', ({ roomCode, action, currentTime }) => {
    const room = rooms[roomCode];
    if (room) {
      room.currentTime = currentTime;
      room.isPlaying = action === 'play';
    }
    socket.to(roomCode).emit('video_action', { action, currentTime });
  });

  socket.on('load_video', ({ roomCode, videoId }) => {
    const room = rooms[roomCode];
    if (room) {
      room.videoId = videoId;
      room.currentTime = 0;
      room.isPlaying = false;
    }
    socket.to(roomCode).emit('load_video', { videoId });
  });

  socket.on('load_pdf', ({ roomCode, pdfData }) => {
    const room = rooms[roomCode];
    if (room) {
      room.pdfData = pdfData;
      room.currentPage = 1;
    }
    socket.to(roomCode).emit('load_pdf', { pdfData });
  });

  socket.on('sync_page', ({ roomCode, page }) => {
    const room = rooms[roomCode];
    if (room) {
      room.currentPage = page;
    }
    socket.to(roomCode).emit('sync_page', { page });
  });

  socket.on('sync_time', ({ roomCode, currentTime }) => {
    const room = rooms[roomCode];
    if (room) {
      room.currentTime = currentTime;
    }
  });

  socket.on('chat_message', ({ roomCode, username, text, timestamp }) => {
    socket.to(roomCode).emit('chat_message', { username, text, timestamp });
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
