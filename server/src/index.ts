import helmet from "helmet";
import dotenv from "dotenv";
import express from "express";
import compression from "compression";
//
import { connectDatabase } from "./config/database";
import { connectRedis } from "./config/redis";
import productRoutes from "./routes/productRoutes";
import corsConfig from "./middleware/corsConfig";

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
