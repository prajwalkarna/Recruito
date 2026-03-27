const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const compression = require('compression');

dotenv.config();

const app = express();
const server = http.createServer(app);

// CORS configuration
const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174'
].filter(Boolean);

// Socket.io setup
const io = new Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true
    }
});

const PORT = process.env.PORT || 5000;

// Database
const db = require('./db');

// Security middleware
const {
    securityHeaders,
    sanitizeData,
    apiLimiter
} = require('./middleware/security');

const { errorHandler, notFound } = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const jobRoutes = require('./routes/jobRoutes');
const cvRoutes = require('./routes/cvRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const userRoutes = require('./routes/userRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const savedJobRoutes = require('./routes/savedJobRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');
const messageRoutes = require('./routes/messageRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const adminRoutes = require('./routes/adminRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
const supportRoutes = require('./routes/supportRoutes');
// ============================================
// SECURITY MIDDLEWARE (MUST BE FIRST)
// ============================================
app.use(securityHeaders); // Security headers
app.use(compression()); // Compress responses

// CORS configuration
app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            return callback(new Error('The CORS policy for this site does not allow access from the specified Origin.'), false);
        }
        return callback(null, true);
    },
    credentials: true
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Data sanitization
app.use(sanitizeData);

// Static files
app.use('/uploads', express.static('uploads'));

// Make io accessible to routes
app.set('io', io);

// ============================================
// ROUTES (with rate limiting)
// ============================================
app.use('/api/auth', authRoutes); // Auth routes have their own rate limiting
app.use('/api/upload', apiLimiter, uploadRoutes);
app.use('/api/jobs', apiLimiter, jobRoutes);
app.use('/api/cvs', apiLimiter, cvRoutes);
app.use('/api/applications', apiLimiter, applicationRoutes);
app.use('/api/users', apiLimiter, userRoutes);
app.use('/api/dashboard', apiLimiter, dashboardRoutes);
app.use('/api/saved-jobs', apiLimiter, savedJobRoutes);
app.use('/api/portfolio', apiLimiter, portfolioRoutes);
app.use('/api/messages', apiLimiter, messageRoutes);
app.use('/api/notifications', apiLimiter, notificationRoutes);
app.use('/api/analytics', apiLimiter, analyticsRoutes);
app.use('/api/settings', apiLimiter, settingsRoutes);
app.use('/api/categories', apiLimiter, categoryRoutes);
app.use('/api/admin', apiLimiter, adminRoutes);
app.use('/api/ratings', apiLimiter, ratingRoutes);
app.use('/api/support', apiLimiter, supportRoutes);
// Test routes
app.get('/', (req, res) => {
    res.json({
        message: 'Recruito API is running',
        version: '1.0.0',
        status: 'healthy'
    });
});

app.get('/test-db', async (req, res) => {
    try {
        const result = await db.query('SELECT NOW()');
        res.json({
            success: true,
            message: 'Database connected',
            time: result.rows[0].now
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            error: 'Database connection failed'
        });
    }
});

// ============================================
// SOCKET.IO EVENTS
// ============================================
const activeUsers = new Map();

io.on('connection', (socket) => {
    console.log('✅ User connected:', socket.id);

    socket.on('user_connected', (userId) => {
        activeUsers.set(userId.toString(), socket.id);
        console.log(`👤 User ${userId} connected with socket ${socket.id}`);
        socket.broadcast.emit('user_online', userId);
    });

    socket.on('send_message', async (data) => {
        const { senderId, receiverId, message } = data;
        console.log(`📨 Message from ${senderId} to ${receiverId}`);

        const receiverSocketId = activeUsers.get(receiverId.toString());

        if (receiverSocketId) {
            io.to(receiverSocketId).emit('receive_message', {
                senderId,
                message,
                timestamp: new Date()
            });
        }

        const { notifyNewMessage } = require('./services/notificationService');
        notifyNewMessage(senderId, receiverId, io);
    });

    socket.on('typing', (data) => {
        const { receiverId, senderId } = data;
        const receiverSocketId = activeUsers.get(receiverId.toString());

        if (receiverSocketId) {
            io.to(receiverSocketId).emit('user_typing', { senderId });
        }
    });

    socket.on('stop_typing', (data) => {
        const { receiverId, senderId } = data;
        const receiverSocketId = activeUsers.get(receiverId.toString());

        if (receiverSocketId) {
            io.to(receiverSocketId).emit('user_stopped_typing', { senderId });
        }
    });

    socket.on('disconnect', () => {
        console.log('❌ User disconnected:', socket.id);

        for (let [userId, socketId] of activeUsers.entries()) {
            if (socketId === socket.id) {
                activeUsers.delete(userId);
                socket.broadcast.emit('user_offline', userId);
                console.log(`👋 User ${userId} went offline`);
                break;
            }
        }
    });
});

// ============================================
// ERROR HANDLING (MUST BE LAST)
// ============================================
app.use(notFound); // 404 handler
app.use(errorHandler); // Global error handler

// Start server
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔌 Socket.io server ready`);
    console.log(`🔒 Security enabled`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('SIGINT received. Shutting down gracefully...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
    process.exit(1);
});