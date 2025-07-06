import { Server } from 'socket.io';
import http from 'http';

let io; // globally accessible
const userSocketMap = {}; // globally accessible

export const initSocket = (app) => {
  const server = http.createServer(app);

  io = new Server(server, {
    cors: {
      origin: [process.env.CLIENT_URL, 'http://localhost:5173'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log('A user connected', socket.id);

    const userId = socket.handshake.query.userId;
    if (userId) userSocketMap[userId] = socket.id;

    io.emit('getOnlineUsers', Object.keys(userSocketMap));

    socket.on('disconnect', () => {
      console.log('A user disconnected', socket.id);
      delete userSocketMap[userId];
      io.emit('getOnlineUsers', Object.keys(userSocketMap));
    });
  });

  return server;
};

// ✅ export functions and values
export const getReceiverSocketId = (userId) => {
  return userSocketMap[userId];
};

export { io }; // ✅ io is now accessible everywhere it's imported
