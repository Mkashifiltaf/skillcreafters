const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

// Routes
const authRoutes = require('./routes/auth');
const courseRoutes = require('./routes/courses');
const roadmapRoutes = require('./routes/roadmap');
const practiceRoutes = require('./routes/practice');
const groupRoutes = require('./routes/group');
const interviewRoutes = require('./routes/interview');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Database connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('joinRoom', (roomId) => {
    socket.join(roomId);
    io.to(roomId).emit('userJoined', socket.id);
  });

  socket.on('leaveRoom', (roomId) => {
    socket.leave(roomId);
    io.to(roomId).emit('userLeft', socket.id);
  });

  socket.on('codeChange', ({ roomId, code }) => {
    socket.to(roomId).emit('codeUpdate', code);
  });

  socket.on('chatMessage', ({ roomId, message }) => {
    io.to(roomId).emit('newMessage', {
      id: Date.now(),
      text: message,
      sender: socket.id,
    });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/practice', practiceRoutes);
app.use('/api/group', groupRoutes);
app.use('/api/interview', interviewRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
