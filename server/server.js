import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

import healthRoutes from './routes/healthRoutes.js';
import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import brandRoutes from './routes/brandRoutes.js';
import cartRoutes from './routes/cartRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import addressRoutes from './routes/addressRoutes.js';
import couponRoutes from './routes/couponRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import bannerRoutes from './routes/bannerRoutes.js';
import dealRoutes from './routes/dealRoutes.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import prisma from './config/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Security Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

// CORS Configuration
const allowedOrigins = [
  CLIENT_URL,
  'http://localhost:4200',
  'http://127.0.0.1:4200',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174'
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl) or allowed list or Netlify apps
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        origin.endsWith('.netlify.app') ||
        origin.includes('localhost')
      ) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

// Rate Limiter for general endpoints
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  }
});
app.use('/api/', generalLimiter);

// Parsers & Logging
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Static Uploads Directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/deals', dealRoutes);

// Serve Angular client if built (for full-stack deployment)
const clientDistPath = path.join(__dirname, '../client/dist/client-ng/browser');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
} else {
  // Root route for sanity check when client is hosted separately (e.g., Netlify)
  app.get('/', (req, res) => {
    res.json({
      app: 'Tez Thaila E-Commerce API',
      version: '1.0.0',
      status: 'Operational',
      healthCheck: '/api/health'
    });
  });
}

// Central 404 & Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Graceful Shutdown
const shutdown = async () => {
  console.log('\nGracefully shutting down Tez Thaila server...');
  try {
    await prisma.$disconnect();
    console.log('Prisma disconnected from MySQL.');
  } catch (err) {
    console.error('Error disconnecting Prisma:', err);
  }
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`===========================================`);
    console.log(` 🚀 TEZ THAILA BACKEND API SERVER RUNNING`);
    console.log(` 🌐 URL: http://localhost:${PORT}`);
    console.log(` 🩺 Health: http://localhost:${PORT}/api/health`);
    console.log(` 📦 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`===========================================`);
  });
}

export default app;
