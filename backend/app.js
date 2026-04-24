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
function parseAllowedOrigins() {
  const rawOrigins = [
    process.env.CLIENT_URL,
    process.env.FRONTEND_URL,
    process.env.RENDER_EXTERNAL_URL,
    ...(process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : []),
  ];

  return [
    ...new Set(
      rawOrigins.map((origin) => origin && origin.trim()).filter(Boolean)
    ),
  ];
}

const allowedOrigins = parseAllowedOrigins();

const corsOptions = {
  origin(origin, callback) {
    // allow server-to-server / curl / Postman requests with no origin
    if (!origin) return callback(null, true);

    // local dev fallback if no env origins are set
    if (allowedOrigins.length === 0) {
      const localAllowed = ['http://localhost:5173', 'http://127.0.0.1:5173'];
      if (localAllowed.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
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

const paymentsRoutes = require('./src/features/payments/payments.routes');
app.use('/payments', paymentsRoutes);

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
