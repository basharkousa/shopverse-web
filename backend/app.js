const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const app = express();

// Middleware
app.use(helmet());          // adds security headers
app.use(cors());            // allows cross-origin requests (frontend -> backend)
app.use(morgan("dev"));     // logs requests in terminal
app.use(express.json());    // parses JSON request bodies

// CORS config (safe default)
app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:5173", //which frontend is allowed to call the backend.
        credentials: true, //allows cookies/auth headers later (useful for login).
    })
);

// Simple route (temporary, for testing)
app.get('/', (req, res) => {
  res.json({ message: 'ShopVerse backend is running' });
});

const authRoutes = require('./src/features/auth/auth.routes');

app.use('/auth', authRoutes);


const { testDbConnection } = require("./src/config/db");
const asyncHandler = require("./src/utils/asyncHandler");




// DB test route (temporary for Sprint 1)
//before using asyncHandler
/*app.get("/db-test", async (req, res, next) => {
    try {
        const result = await testDbConnection();
        res.json({ ok: true, dbTime: result.now });
    } catch (err) {
        next(err);
    }
});
*/

app.get(
    "/db-test",
    asyncHandler(async (req, res) => {
        const result = await testDbConnection();
        res.json({ ok: true, dbTime: result.now });
    })
);

//Official one for Test Server
app.get("/health", (req, res) => {
    res.json({
        ok: true,
        status: "ok",
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
    });
});

//Official one for
app.get(
    "/health/db",
    asyncHandler(async (req, res) => {
        const result = await testDbConnection();
        res.json({
            ok: true,
            status: "ok",
            db: "connected",
            dbTime: result.now,
            timestamp: new Date().toISOString(),
        });
    })
);



const errorHandler = require("./src/middlewares/errorHandler");
const AppError = require("./src/utils/AppError");

// 404 handler (no route matched)
app.use((req, res, next) => {
    next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
});

// Global error handler (must be LAST)
app.use(errorHandler);


module.exports = app;