const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io = null;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  // Graceful Handshake Middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token || token === 'null' || token === 'undefined') {
      // Anonymous Guest User
      socket.user = null;
      return next();
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        // Invalid or expired token -> fallback to anonymous
        socket.user = null;
      } else {
        socket.user = decoded;
      }
      next();
    });
  });

  io.on('connection', (socket) => {
    if (socket.user) {
      const userId = socket.user.id || socket.user._id;
      if (userId) {
        socket.join(`user:${userId.toString()}`);
      }

      if (socket.user.isAdmin) {
        socket.join('admin');
      }
    }

    socket.on('disconnect', () => {
      // Connection closed cleanly
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io has not been initialized yet.');
  }
  return io;
};

/**
 * Dispatch real-time notification to target room(s)
 */
const notifyClients = ({ forAdmin = false, userId = null, notification }) => {
  if (!io) return;

  if (forAdmin) {
    io.to('admin').emit('new_notification', notification);
  }

  if (userId) {
    io.to(`user:${userId.toString()}`).emit('new_notification', notification);
  }
};

module.exports = {
  initSocket,
  getIO,
  notifyClients,
};
