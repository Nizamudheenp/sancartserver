
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const connectDB = require("./config/db");

const authRoutes = require("./routes/AuthRoute");
const productRoutes = require("./routes/ProductsRoute");
const orderRoutes = require("./routes/OrderRoute");
const returnRoutes = require("./routes/ReturnRoute");

const app = express();

// Register helmet for secure HTTP headers
app.use(helmet());

connectDB();

// Auth Rate Limiter: max 30 requests per 15 mins
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  message: { error: "Too many authentication attempts. Please try again later." }
});

// General public API limiter for browsing, products, orders, and returns: max 300 requests per 15 mins
const publicApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { error: "Too many requests. Please try again later." }
});

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true 
  }));
app.use(express.json());

const errorHandler = require("./middleware/errorHandler");
const sitemapRoutes = require("./routes/SitemapRoute");

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/products', publicApiLimiter, productRoutes);
app.use('/api/orders', publicApiLimiter, orderRoutes);
app.use('/api/returns', publicApiLimiter, returnRoutes);
app.use('/', sitemapRoutes); 

// Register global error handler
app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
