import helmet from "helmet";
import dotenv from "dotenv";
import express from "express";
import compression from "compression";
import rateLimit from "express-rate-limit";
//
import { connectDatabase } from "./config/database";
import { connectRedis } from "./config/redis";
import productRoutes from "./routes/productRoutes";
import corsConfig from "./middleware/corsConfig";

const limiter = rateLimit({
  windowMs: 60 * 1000 * 1, // 1 minute
  max: 50, // 50 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: "Too many requests, please try again later.",
});

const app = express();
const PORT = process.env.PORT || 8080;

// config
dotenv.config();
connectDatabase();
connectRedis();
app.use(corsConfig);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Security middleware
app.use(helmet());
app.use(compression());
app.use(limiter);

app.get("/", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API routes
app.use("/api/products", productRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
