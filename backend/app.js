const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const app = express();

// ----- Middleware (order matters) -----
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);
app.use(morgan('dev'));
app.use(express.json());

// ----- CORS -----
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

// ----- Static uploads -----
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// ----- Routes -----
app.get('/', (req, res) => {
  res.json({ message: 'ShopVerse backend is running' });
});

const authRoutes = require('./src/features/auth/auth.routes');
app.use('/auth', authRoutes);

const productsRoutes = require('./src/features/products/products.routes');
app.use('/products', productsRoutes);

const categoriesRoutes = require('./src/features/categories/categories.routes');
app.use('/categories', categoriesRoutes);

const ordersRoutes = require('./src/features/orders/orders.routes');
app.use('/orders', ordersRoutes);

const adminRoutes = require('./src/features/admin/admin.routes');
app.use('/admin', adminRoutes);

const { testDbConnection } = require('./src/config/db');
const asyncHandler = require('./src/utils/asyncHandler');

app.get(
  '/db-test',
  asyncHandler(async (req, res) => {
    const result = await testDbConnection();
    res.json({ ok: true, dbTime: result.now });
  })
);

app.get('/health', (req, res) => {
  res.json({
    ok: true,
    status: 'ok',
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

app.get(
  '/health/db',
  asyncHandler(async (req, res) => {
    const result = await testDbConnection();
    res.json({
      ok: true,
      status: 'ok',
      db: 'connected',
      dbTime: result.now,
      timestamp: new Date().toISOString(),
    });
  })
);

// ----- Error handling -----
const errorHandler = require('./src/middlewares/errorHandler');
const AppError = require('./src/utils/AppError');

app.use((req, res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
});

app.use(errorHandler);

module.exports = app;
