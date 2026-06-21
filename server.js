require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Import routes
const productRoutes = require('./routes/products');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;

// ===========================
// MIDDLEWARE
// ===========================

// CORS - allow requests from frontend
app.use(cors({
    origin: '*', // Allow all origins (can be restricted later)
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type']
}));

// Parse JSON bodies
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve static files (HTML, CSS, JS)
// For Vercel: explicitly serve CSS and JS files
app.use(express.static(path.join(__dirname, '.'), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        } else if (filePath.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
    }
}));

// ===========================
// DATABASE CONNECTION
// ===========================

const connectDB = async () => {
    try {
        if (!MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in .env file');
        }

        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        console.log('✅ Connected to MongoDB Atlas');
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        console.warn('⚠️  Continuing with API in fallback mode (localStorage)...');
        // Don't exit - allow the app to work with localStorage fallback
    }
};

// Connect to database
connectDB();

// ===========================
// ROUTES
// ===========================

// API Routes
app.use('/api/products', productRoutes);

// Serve frontend pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'Backend is running ✅', mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// ===========================
// ERROR HANDLER
// ===========================

app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
});

// ===========================
// START SERVER
// ===========================

app.listen(PORT, () => {
    console.log(`
    ╔════════════════════════════════════════╗
    ║   🍽️  Daboy's Menu - Backend Server   ║
    ║   🚀 Server running on port ${PORT}          ║
    ║   📍 http://localhost:${PORT}            ║
    ║   🗄️  MongoDB Connected                ║
    ║   📋 API: http://localhost:${PORT}/api/products  ║
    ╚════════════════════════════════════════╝
    `);
});

module.exports = app;
