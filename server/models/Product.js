import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: "" },

    categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],

    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, default: null, min: 0 },

    images: [{ type: String }], // Cloudinary URLs

    specifications: {
      // ----- Common -----
      brand: String,
      color: String,
      weight: String,
      dimensions: String,

      // ----- Frame specs (Sunglasses, Eyeglasses, Frames) -----
      frameSize: String,
      frameMaterial: String,
      gender: { type: String, enum: ["Men", "Women", "Kids", "Unisex"], default: "Unisex" },
      shape: String,

      // ----- Lens specs (Eyeglasses, Lenses) -----
      lensType: String,
      lensColor: { type: String, default: "" },
      coating: String,       // e.g. Anti-Glare, Anti-Scratch, Hydrophobic
      index: String,         // e.g. 1.50, 1.56, 1.67, 1.74

      // ----- Contact Lens specs -----
      power: String,         // e.g. -2.50, +1.00, Plano
      baseCurve: String,     // e.g. 8.6mm
      diameter: String,      // e.g. 14.2mm
      waterContent: String,  // e.g. 38%
      wearingSchedule: String, // e.g. Daily, Monthly, Yearly

      // ----- Accessory specs -----
      accessoryType: String, // e.g. Case, Cleaning Cloth, Lens Cleaner, Chain, Repair Kit
    },

    stock: { type: Number, required: true, default: 0, min: 0 },
    prescriptionRequired: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.index({ categories: 1, isActive: 1 });
productSchema.index({ name: "text", description: "text" }); // powers the search bar

export default mongoose.model("Product", productSchema);