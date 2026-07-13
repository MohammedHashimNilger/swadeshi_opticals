import express from "express";
import cors from "cors";
import helmet from "helmet";
import { sanitizeBody } from "./middleware/sanitize.js";
import { connectDB, isDBConnected } from "./config/db.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import prescriptionRoutes from "./routes/prescriptionRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import bannerRoutes from "./routes/bannerRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import contactRoutes from "./routes/contactRoutes.js";

const app = express();

// Connect to MongoDB. In serverless environments (like Vercel),
// we don't block startup if the connection fails - routes will
// gracefully handle the absence of a database connection.
connectDB().catch(() => {
  // Error already logged inside connectDB(); nothing further needed here.
});

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json({ limit: "1mb" }));
app.use(sanitizeBody);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// Middleware to check DB connection for routes that need it
const requireDB = (req, res, next) => {
  if (!isDBConnected()) {
    return res.status(503).json({ message: "Database connection unavailable. Please try again later." });
  }
  next();
};

app.use("/api/auth", requireDB, authRoutes);
app.use("/api/admin", requireDB, adminRoutes);
app.use("/api/categories", requireDB, categoryRoutes);
app.use("/api/products", requireDB, productRoutes);
app.use("/api/orders", requireDB, orderRoutes);
app.use("/api/admin/prescriptions", requireDB, prescriptionRoutes);
app.use("/api/settings", requireDB, settingsRoutes);
app.use("/api/banners", requireDB, bannerRoutes);
app.use("/api/admin/customers", requireDB, customerRoutes);
app.use("/api/contact", requireDB, contactRoutes);

app.use(notFound);
app.use(errorHandler);

// Deliberately NO app.listen() here — see server/index.js (local dev)
// and api/index.js (Vercel serverless) for the two ways this app runs.
export default app;
