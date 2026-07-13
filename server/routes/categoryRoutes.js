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

export default router;
