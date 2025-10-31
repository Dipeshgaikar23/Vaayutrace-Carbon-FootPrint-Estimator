import dotenv from "dotenv";
dotenv.config();
// console.log("✅ OPENAI_API_KEY loaded:", process.env.OPENAI_API_KEY);

import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import connectDB from "./src/config/mongodb.config.js";
import errorHandler from "./src/middlewares/error.handler.js";
import routes from "./src/routes/index.js";

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}))
app.use(morgan("dev")); // morgan is used for api logs in terminal
app.use(cookieParser())

// Routes
app.use("/api", routes);

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Connect DB & start server
connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
});
