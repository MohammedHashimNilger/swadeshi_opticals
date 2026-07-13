import express from "express";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { adminProtect } from "../middleware/adminAuth.js";

const router = express.Router();

router.get("/", getCategories);
router.post("/", adminProtect, createCategory);
router.put("/:id", adminProtect, updateCategory);
router.delete("/:id", adminProtect, deleteCategory);

// Prevent Next.js from serving this route as a static page
router.get("/*", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

export default router;
