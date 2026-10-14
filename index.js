
require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const connectDB = require("./config/db");
const { initSocket } = require("./socket");

const authRoutes = require("./routes/AuthRoute");
const productRoutes = require("./routes/ProductsRoute");
const orderRoutes = require("./routes/OrderRoute");
const returnRoutes = require("./routes/ReturnRoute");
const notificationRoutes = require("./routes/NotificationRoute");

const app = express();
app.set('trust proxy', 1);
const server = http.createServer(app);

initSocket(server);

app.use(helmet());

connectDB();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 15,
  message: { error: "Too many authentication attempts. Please try again later." }
});

const publicApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
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
app.use('/api/notifications', publicApiLimiter, notificationRoutes);
app.use('/', sitemapRoutes); 

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

