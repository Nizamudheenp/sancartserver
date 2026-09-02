
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

// Stricter Rate Limiter for Auth: max 15 requests per 15 mins
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15,
  message: { error: "Too many requests , please try again later." }
});

// General pub+lic API limiter for public details/returns lookup and submit endpoints
const publicApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  message: { error: "Too many queries. Please try again later." }
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
