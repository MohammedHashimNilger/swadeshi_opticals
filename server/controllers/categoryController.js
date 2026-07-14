import Category from "../models/Category.js";

// GET /api/categories — public, used to build nav + filter sidebar
export async function getCategories(req, res, next) {
  console.log("Controller START");

  try {
    console.log("Before DB");

    const categories = await Category.find({ isActive: true }).sort("displayOrder");

    console.log("After DB:", categories.length);

    res.json(categories);

    console.log("Response Sent");
  } catch (err) {
    console.error("Controller Error:", err);
    next(err);
  }
}

// POST /api/admin/categories — admin only
export async function createCategory(req, res, next) {
  try {
    const { name, slug, parentCategory, icon, displayOrder } = req.body;
    const category = await Category.create({ name, slug, parentCategory, icon, displayOrder });
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
}

// PUT /api/admin/categories/:id — admin only
export async function updateCategory(req, res, next) {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!category) return res.status(404).json({ message: "Category not found." });
    res.json(category);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/admin/categories/:id — admin only
export async function deleteCategory(req, res, next) {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found." });
    res.json({ message: "Category deleted." });
  } catch (err) {
    next(err);
  }
}
