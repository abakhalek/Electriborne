const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
require('dotenv').config();

// Import database configuration
const connectDB = require('./config/database');
const seedDatabase = require('./config/seedData');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const companyRoutes = require('./routes/companies');
const requestRoutes = require('./routes/requests');
const quoteRoutes = require('./routes/quotes');

const reportRoutes = require('./routes/reports');
const siteCustomizationRoutes = require('./routes/siteCustomization');
const missionRoutes = require('./routes/missions');
const serviceTypesRoutes = require('./routes/serviceTypes');
const paymentRoutes = require('./routes/payments');
const dashboardRoutes = require('./routes/dashboard');
const equipmentRoutes = require('./routes/equipments');
const invoiceRoutes = require('./routes/invoices');
const productRoutes = require('./routes/products');
const notificationRoutes = require('./routes/notifications');

const app = express();
const http = require('http');
const { Server } = require('socket.io');

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:5173'],
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`⚡️ User connected: ${socket.id}`);

  socket.on('disconnect', () => {
    console.log(`🔌 User disconnected: ${socket.id}`);
  });
});

// Export io for use in other modules
module.exports.io = io;

// Import messageRoutes after io is initialized
const messageRoutes = require('./routes/messages')(io);

// Security middleware
app.use(helmet());
app.use(compression());

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : ['http://localhost:5173'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10000mb' }));
app.use(express.urlencoded({ extended: true, limit: '10000mb' }));

// Serve static uploaded files
app.use('/uploads', cors({ origin: allowedOrigins, credentials: true }), express.static(path.join(__dirname, 'public/uploads')));

// Test database connection
connectDB();

// Seed database if SEED_DB is true
if (process.env.SEED_DB === 'true') {
  seedDatabase();
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/site-customization', siteCustomizationRoutes);
app.use('/api/missions', missionRoutes);
app.use('/api/service-types', serviceTypesRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/equipments', equipmentRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/products', productRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API ELECTRIBORNE CRM opérationnelle',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint non trouvé'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('❌ Server error:', error);
  
  // Default error
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Start server
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`🔗 API URL: http://localhost:${PORT}/api`);
});

module.exports = app;