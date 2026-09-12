const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// ---------------------
// Middleware
// ---------------------
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// ---------------------
// Routes
// ---------------------
app.use('/api/health', require('./routes/health'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/expenses', require('./routes/expense'));
app.use('/api/activities', require('./routes/activity'));
app.use('/api/songs', require('./routes/song'));
app.use('/api/reminders', require('./routes/reminder'));
app.use('/api/other-activities', require('./routes/otherActivity'));
app.use('/api/statistics', require('./routes/statistics'));
app.use('/api/goals', require('./routes/goal'));

// Future route mounts will go here:
// app.use('/api/users',      require('./routes/users'));

// ---------------------
// 404 Handler
// ---------------------
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ---------------------
// Global Error Handler
// ---------------------
app.use((err, req, res, next) => {
  console.error('🔥 Server Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ---------------------
// Start Server
// ---------------------
const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    app.listen(PORT, () => {
      console.log(`\n🚀 LifeTrack Server running on port ${PORT}`);
      console.log(`   Environment: ${process.env.NODE_ENV}`);
      console.log(`   Health check: http://localhost:${PORT}/api/health\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
