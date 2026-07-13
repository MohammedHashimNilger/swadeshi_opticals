import Product from "../models/Product.js";
import Category from "../models/Category.js";
import { uploadBufferToCloudinary } from "../middleware/upload.js";

// GET /api/products/meta/colors — public, powers the color filter option list
export async function getDistinctColors(req, res, next) {
  try {
    const colors = await Product.distinct("specifications.color", {
      isActive: true,
      "specifications.color": { $nin: [null, ""] },
    });
    res.json(colors.sort());
  } catch (err) {
    next(err);
  }
}

// GET /api/products/meta/lens-colors — public, powers the lens color filter
export async function getDistinctLensColors(req, res, next) {
  try {
    const lensColors = await Product.distinct("specifications.lensColor", {
      isActive: true,
      "specifications.lensColor": { $nin: [null, ""] },
    });
    res.json(lensColors.sort());
  } catch (err) {
    next(err);
  }
}

// GET /api/products?category=&gender=&material=&lensType=&color=&minPrice=&maxPrice=&sort=&page=&search=
// Public — powers the Shop listing page and its filter sidebar.
export async function getProducts(req, res, next) {
  try {
    const {
      category,
      gender,
      material,
      lensType,
      shape,
      color,
      lensColor,
      minPrice,
      maxPrice,
      sort = "newest",
      page = 1,
      search,
    } = req.query;

    const filter = { isActive: true };

    if (category) {
      // If category looks like a slug (not a 24-char hex ObjectId), resolve it first
      filter.categories = /^[0-9a-fA-F]{24}$/.test(category)
        ? category
        : await Category.findOne({ slug: category }).then((c) => c?._id);
    }
    if (gender) {
      if (gender === "Men" || gender === "Women") {
        filter["specifications.gender"] = { $in: [gender, "Unisex"] };
      } else {
        filter["specifications.gender"] = gender;
      }
    }
    if (material) filter["specifications.frameMaterial"] = material;
    if (lensType) filter["specifications.lensType"] = lensType;
    if (shape) filter["specifications.shape"] = shape;
    if (color) filter["specifications.color"] = color;
    if (lensColor) filter["specifications.lensColor"] = lensColor;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (search) {
      filter.$text = { $search: search };
    }

    const sortMap = {
      newest: { createdAt: -1 },
      discount: { discountPrice: -1 },
      "price-low": { price: 1 },
      "price-high": { price: -1 },
    };

    const PAGE_SIZE = 12;
    const skip = (Number(page) - 1) * PAGE_SIZE;

    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sortMap[sort] || sortMap.newest)
        .skip(skip)
        .limit(PAGE_SIZE)
        .populate("categories", "name slug"),
      Product.countDocuments(filter),
    ]);

    res.json({
      products,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / PAGE_SIZE),
    });
  } catch (err) {
    console.error("Products fetch error:", err);
    res.json({ products: [], total: 0, page: 1, totalPages: 0 });
  }
}

// GET /api/products/:slug — public, product detail page
export async function getProductBySlug(req, res, next) {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true }).populate(
      "categories",
      "name slug"
    );
    if (!product) return res.status(404).json({ message: "Product not found." });
    res.json(product);
  } catch (err) {
    next(err);
  }
}

// POST /api/admin/products — admin only, multipart/form-data with up to 6 "images"
export async function createProduct(req, res, next) {
  try {
    const { name, slug, description, categories, price, discountPrice, stock, prescriptionRequired } =
      req.body;
    const specifications = JSON.parse(req.body.specifications || "{}");

    let imageUrls = [];
    if (req.files?.length) {
      imageUrls = await Promise.all(
        req.files.map((file) => uploadBufferToCloudinary(file.buffer, "swadeshi-opticals/products"))
      );
    }

    const product = await Product.create({
      name,
      slug,
      description,
      categories: categories ? JSON.parse(categories) : [],
      price,
      discountPrice: discountPrice || null,
      stock,
      prescriptionRequired: prescriptionRequired === "true",
      specifications,
      images: imageUrls,
    });

    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
}

// PUT /api/admin/products/:id — admin only. New images (if any) are
// ADDED to existing ones; deleting individual images is a separate,
// smaller endpoint a UI can wire up later if needed.
export async function updateProduct(req, res, next) {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found." });

    const fields = ["name", "slug", "description", "price", "discountPrice", "stock", "isActive"];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) product[field] = req.body[field];
    });

    if (req.body.prescriptionRequired !== undefined) {
      product.prescriptionRequired = req.body.prescriptionRequired === "true";
    }
    if (req.body.categories) {
      product.categories = JSON.parse(req.body.categories);
    }
    if (req.body.specifications) {
      product.specifications = {
        ...product.specifications.toObject(),
        ...JSON.parse(req.body.specifications),
      };
    }

    if (req.files?.length) {
      const newUrls = await Promise.all(
        req.files.map((file) => uploadBufferToCloudinary(file.buffer, "swadeshi-opticals/products"))
      );
      product.images.push(...newUrls);
    }

    await product.save();
    res.json(product);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/admin/products/:id — admin only
export async function deleteProduct(req, res, next) {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found." });
    res.json({ message: "Product deleted." });
  } catch (err) {
    next(err);
  }
}
