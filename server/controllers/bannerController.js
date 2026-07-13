import Banner from "../models/Banner.js";
import { uploadBufferToCloudinary } from "../middleware/upload.js";

// GET /api/banners — public, homepage reads active banners only
export async function getBanners(req, res, next) {
  try {
    const now = new Date();
    const banners = await Banner.find({
      isActive: true,
      $or: [{ startDate: null }, { startDate: { $lte: now } }],
      $and: [{ $or: [{ endDate: null }, { endDate: { $gte: now } }] }],
    }).sort("displayOrder");
    res.json(banners);
  } catch (err) {
    console.error("Banners fetch error:", err);
    res.json([]); // Return empty array instead of 500
  }
}

// GET /api/admin/banners — admin sees ALL banners, including inactive/scheduled
export async function getAllBanners(req, res, next) {
  try {
    const banners = await Banner.find().sort("displayOrder");
    res.json(banners);
  } catch (err) {
    next(err);
  }
}

// POST /api/admin/banners — multipart/form-data, single "image" file
export async function createBanner(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ message: "Banner image is required." });

    const imageUrl = await uploadBufferToCloudinary(req.file.buffer, "swadeshi-opticals/banners");
    const { title, linkUrl, displayOrder, startDate, endDate } = req.body;

    const banner = await Banner.create({
      imageUrl,
      title,
      linkUrl,
      displayOrder,
      startDate: startDate || null,
      endDate: endDate || null,
    });
    res.status(201).json(banner);
  } catch (err) {
    next(err);
  }
}

// PUT /api/admin/banners/:id
export async function updateBanner(req, res, next) {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: "Banner not found." });

    if (req.file) {
      banner.imageUrl = await uploadBufferToCloudinary(req.file.buffer, "swadeshi-opticals/banners");
    }
    const fields = ["title", "linkUrl", "displayOrder", "isActive", "startDate", "endDate"];
    fields.forEach((field) => {
      if (req.body[field] !== undefined) banner[field] = req.body[field] || null;
    });

    await banner.save();
    res.json(banner);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/admin/banners/:id
export async function deleteBanner(req, res, next) {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) return res.status(404).json({ message: "Banner not found." });
    res.json({ message: "Banner deleted." });
  } catch (err) {
    next(err);
  }
}
