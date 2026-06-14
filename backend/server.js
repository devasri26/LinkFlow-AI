require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');

const authRoutes = require('./routes/auth');
const urlRoutes = require('./routes/url');
const redirectRoutes = require('./routes/redirect');

const app = express();

// Configure middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB Atlas (or fallback to local file system db if not config'd)
connectDB();

// Register routers
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes); // Support prefix without /api (e.g. /auth/login)
app.use('/api/url', urlRoutes);
app.use('/', redirectRoutes); // Catch shortcodes at root level

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server Unhandled Exception:', err.stack);
  res.status(500).json({ message: 'Internal server error occurred' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🛸 LinkFlow Server active and listening on port ${PORT}`);
});
