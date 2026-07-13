import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchCategories } from "../../services/categoryService";
import {
  fetchAdminProductBySlug,
  createProduct,
  updateProduct,
} from "../../services/adminProductService";

const GENDERS = ["Men", "Women", "Kids", "Unisex"];

const FRAME_SHAPES = [
  "Round",
  "Rectangle",
  "Square",
  "Cat-Eye",
  "Aviator",
  "Oval",
  "Geometric",
  "Oversized",
  "Clubmaster",
  "Rimless",
  "Wayfarer",
  "Browline",
];

const LENS_COLORS = [
  "Gray",
  "Brown",
  "Green",
  "Blue",
  "Purple",
  "Pink",
  "Red",
  "Yellow",
  "Clear",
  "Tinted",
  "Mirrored",
  "Gradient",
];

const LENS_TYPES = [
  "Single Vision",
  "Bifocal",
  "Progressive",
  "Blue Cut",
  "Computer Glasses",
  "Anti-Glare",
  "UV Protection",
  "Photochromic",
  "High Index",
];

const COATINGS = [
  "Anti-Glare",
  "Anti-Scratch",
  "Hydrophobic",
  "Anti-Reflective",
  "Mirror Coating",
  "None",
];

const LENS_INDICES = ["1.50", "1.56", "1.60", "1.67", "1.74"];

const WEARING_SCHEDULES = ["Daily", "Weekly", "Monthly", "Yearly"];

const ACCESSORY_TYPES = [
  "Case",
  "Cleaning Cloth",
  "Lens Cleaner",
  "Chain",
  "Repair Kit",
  "Other",
];

// Map product type → parent category slug
const PRODUCT_TYPE_MAP = {
  sunglasses: "sunglasses",
  eyeglasses: "eyeglasses",
  frames: "frames",
  lenses: "lenses",
  "contact-lenses": "contact-lenses",
  accessories: "accessories",
};

const EMPTY_FORM = {
  name: "",
  slug: "",
  description: "",
  price: "",
  discountPrice: "",
  stock: "",
  prescriptionRequired: false,
  categories: [],
  specifications: {
    frameSize: "",
    frameMaterial: "",
    lensType: "",
    gender: "Unisex",
    brand: "",
    color: "",
    weight: "",
    dimensions: "",
    shape: "",
    lensColor: "",
    coating: "",
    index: "",
    power: "",
    baseCurve: "",
    diameter: "",
    waterContent: "",
    wearingSchedule: "",
    accessoryType: "",
  },
};

export default function ProductForm() {
  const { productId: slug } = useParams();
  const isEditMode = !!slug;
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [existingProductId, setExistingProductId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [productType, setProductType] = useState("");

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    if (!isEditMode) return;
    fetchAdminProductBySlug(slug)
      .then((product) => {
        setExistingProductId(product._id);

        // Determine product type from categories
        const parentSlug = determineProductType(product.categories, categories);
        if (parentSlug) setProductType(parentSlug);

        setForm({
          name: product.name,
          slug: product.slug,
          description: product.description || "",
          price: product.price,
          discountPrice: product.discountPrice || "",
          stock: product.stock,
          prescriptionRequired: product.prescriptionRequired,
          categories: product.categories.map((c) => c._id || c),
          specifications: {
            ...EMPTY_FORM.specifications,
            ...product.specifications,
          },
        });
      })
      .catch((err) => console.error(err));
  }, [slug, isEditMode, categories]);

  function determineProductType(productCategories, allCats) {
    const parentIds = allCats
      .filter((c) => !c.parentCategory)
      .map((c) => c._id);
    for (const cat of productCategories) {
      const catId = cat._id || cat;
      if (parentIds.includes(catId)) {
        const found = allCats.find((c) => c._id === catId);
        if (found) return found.slug;
      }
    }
    return "";
  }

  // Get parent categories for the product type selector
  const parentCategories = categories.filter((c) => !c.parentCategory);

  // Get child categories for the selected product type
  const selectedParent = categories.find(
    (c) => !c.parentCategory && c.slug === productType,
  );
  const childCategories = categories.filter(
    (c) => c.parentCategory === selectedParent?._id,
  );

  function handleTypeSelect(type) {
    setProductType(type);
    // Reset form when type changes
    setForm(EMPTY_FORM);
    setImageFiles([]);
    setError("");
  }

  function updateField(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateSpec(field, value) {
    setForm((prev) => ({
      ...prev,
      specifications: { ...prev.specifications, [field]: value },
    }));
  }

  function toggleCategory(id) {
    setForm((prev) => ({
      ...prev,
      categories: prev.categories.includes(id)
        ? prev.categories.filter((c) => c !== id)
        : [...prev.categories, id],
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("slug", form.slug);
      formData.append("description", form.description);
      formData.append("price", form.price);
      formData.append("discountPrice", form.discountPrice || "");
      formData.append("stock", form.stock);
      formData.append("prescriptionRequired", form.prescriptionRequired);
      formData.append("categories", JSON.stringify(form.categories));
      formData.append("specifications", JSON.stringify(form.specifications));
      imageFiles.forEach((file) => formData.append("images", file));

      if (isEditMode) {
        await updateProduct(existingProductId, formData);
      } else {
        await createProduct(formData);
      }
      navigate("/admin/products");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save product.");
    } finally {
      setSubmitting(false);
    }
  }

  const isFrameType =
    productType === "sunglasses" ||
    productType === "eyeglasses" ||
    productType === "frames";

  const isLensType = productType === "lenses";
  const isContactLensType = productType === "contact-lenses";
  const isAccessoryType = productType === "accessories";

  // Type selector step (shown when no type is selected and not editing)
  if (!isEditMode && !productType) {
    return (
      <div className="max-w-4xl">
        <p className="mb-6 text-lg font-medium text-navy-900 dark:text-navy-50">
          Add new product
        </p>

        <div className="rounded-xl border border-navy-200 bg-white p-8 dark:border-navy-700 dark:bg-navy-800">
          <h2 className="mb-6 text-center text-base font-semibold text-navy-900 dark:text-navy-50">
            Select product type
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {Object.entries(PRODUCT_TYPE_MAP).map(([key, slug]) => {
              const cat = parentCategories.find((c) => c.slug === slug);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleTypeSelect(key)}
                  className="flex flex-col items-center gap-3 rounded-xl border-2 border-navy-200 bg-white p-6 transition hover:border-navy-400 hover:bg-navy-50 dark:border-navy-700 dark:bg-navy-800 dark:hover:border-navy-500 dark:hover:bg-navy-700"
                >
                  <span className="text-lg font-semibold text-navy-900 dark:text-navy-50">
                    {cat?.name || slug}
                  </span>
                  <span className="text-xs text-navy-500 dark:text-navy-400">
                    {getTypeDescription(key)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-6 flex items-center gap-3">
        <p className="text-lg font-medium text-navy-900 dark:text-navy-50">
          {isEditMode ? "Edit product" : "Add new product"}
        </p>
        {!isEditMode && productType && (
          <button
            type="button"
            onClick={() => setProductType("")}
            className="rounded-lg border border-navy-200 px-3 py-1 text-xs font-medium text-navy-600 transition hover:bg-navy-50 dark:border-navy-700 dark:text-navy-300 dark:hover:bg-navy-800"
          >
            Change type
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Product Information Section */}
        <section className="rounded-xl border border-navy-200 bg-white p-6 dark:border-navy-700 dark:bg-navy-800">
          <h2 className="mb-4 text-base font-semibold text-navy-900 dark:text-navy-50">
            Product Information
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-navy-700 dark:text-navy-300">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                required
                placeholder="Enter product name"
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm dark:border-navy-700 dark:bg-navy-900 dark:text-navy-50"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-navy-700 dark:text-navy-300">
                URL Slug <span className="text-red-500">*</span>
              </label>
              <input
                required
                placeholder="url-friendly-name"
                value={form.slug}
                onChange={(e) => updateField("slug", e.target.value)}
                className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm dark:border-navy-700 dark:bg-navy-900 dark:text-navy-50"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-navy-700 dark:text-navy-300">
                Description
              </label>
              <textarea
                placeholder="Enter product description"
                value={form.description}
                onChange={(e) => updateField("description", e.target.value)}
                className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm dark:border-navy-700 dark:bg-navy-900 dark:text-navy-50"
                rows={4}
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-1.5 block text-xs font-medium text-navy-700 dark:text-navy-300">
                Categories
              </label>
              <div className="flex flex-wrap gap-2">
                {selectedParent && (
                  <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border-2 border-navy-400 bg-navy-50 px-3 py-2 text-xs font-semibold dark:border-navy-500 dark:bg-navy-700">
                    <input
                      type="checkbox"
                      checked={form.categories.includes(selectedParent._id)}
                      onChange={() => toggleCategory(selectedParent._id)}
                      className="rounded border-navy-300"
                    />
                    <span className="text-navy-700 dark:text-navy-200">
                      {selectedParent.name}
                    </span>
                  </label>
                )}
                {childCategories.map((c) => (
                  <label
                    key={c._id}
                    className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-navy-200 px-3 py-2 text-xs transition hover:border-navy-300 dark:border-navy-700 dark:hover:border-navy-600"
                  >
                    <input
                      type="checkbox"
                      checked={form.categories.includes(c._id)}
                      onChange={() => toggleCategory(c._id)}
                      className="rounded border-navy-300"
                    />
                    <span className="text-navy-700 dark:text-navy-300">
                      {c.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="rounded-xl border border-navy-200 bg-white p-6 dark:border-navy-700 dark:bg-navy-800">
          <h2 className="mb-4 text-base font-semibold text-navy-900 dark:text-navy-50">
            Pricing
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-navy-700 dark:text-navy-300">
                Price (₹) <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="number"
                placeholder="0.00"
                value={form.price}
                onChange={(e) => updateField("price", e.target.value)}
                className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm dark:border-navy-700 dark:bg-navy-900 dark:text-navy-50"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-navy-700 dark:text-navy-300">
                Discount Price (₹)
              </label>
              <input
                type="number"
                placeholder="Optional"
                value={form.discountPrice}
                onChange={(e) => updateField("discountPrice", e.target.value)}
                className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm dark:border-navy-700 dark:bg-navy-900 dark:text-navy-50"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-navy-700 dark:text-navy-300">
                Stock Quantity <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="number"
                placeholder="0"
                value={form.stock}
                onChange={(e) => updateField("stock", e.target.value)}
                className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm dark:border-navy-700 dark:bg-navy-900 dark:text-navy-50"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="flex items-center gap-2 text-sm text-navy-700 dark:text-navy-300">
              <input
                type="checkbox"
                checked={form.prescriptionRequired}
                onChange={(e) =>
                  updateField("prescriptionRequired", e.target.checked)
                }
                className="rounded border-navy-300"
              />
              Prescription required
            </label>
          </div>
        </section>

        {/* Frame Specifications - for Sunglasses, Eyeglasses, Frames */}
        {isFrameType && (
          <section className="rounded-xl border border-navy-200 bg-white p-6 dark:border-navy-700 dark:bg-navy-800">
            <h2 className="mb-4 text-base font-semibold text-navy-900 dark:text-navy-50">
              Frame Specifications
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-navy-700 dark:text-navy-300">
                  Frame Shape
                </label>
                <select
                  value={form.specifications.shape}
                  onChange={(e) => updateSpec("shape", e.target.value)}
                  className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm dark:border-navy-700 dark:bg-navy-900 dark:text-navy-50"
                >
                  <option value="">Select shape</option>
                  {FRAME_SHAPES.map((shape) => (
                    <option key={shape} value={shape}>
                      {shape}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-navy-700 dark:text-navy-300">
                  Gender
                </label>
                <select
                  value={form.specifications.gender}
                  onChange={(e) => updateSpec("gender", e.target.value)}
                  className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm dark:border-navy-700 dark:bg-navy-900 dark:text-navy-50"
                >
                  {GENDERS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-navy-700 dark:text-navy-300">
                  Frame Material
                </label>
                <input
                  placeholder="e.g., Metal, Plastic, Titanium"
                  value={form.specifications.frameMaterial}
                  onChange={(e) => updateSpec("frameMaterial", e.target.value)}
                  className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm dark:border-navy-700 dark:bg-navy-900 dark:text-navy-50"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-navy-700 dark:text-navy-300">
                  Frame Size
                </label>
                <input
                  placeholder="e.g., Small, Medium, Large"
                  value={form.specifications.frameSize}
                  onChange={(e) => updateSpec("frameSize", e.target.value)}
                  className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm dark:border-navy-700 dark:bg-navy-900 dark:text-navy-50"
                />
              </div>

              {productType === "eyeglasses" && (
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-navy-700 dark:text-navy-300">
                    Lens Type
                  </label>
                  <select
                    value={form.specifications.lensType}
                    onChange={(e) => updateSpec("lensType", e.target.value)}
                    className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm dark:border-navy-700 dark:bg-navy-900 dark:text-navy-50"
                  >
                    <option value="">Select lens type</option>
                    {LENS_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {productType === "sunglasses" && (
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-navy-700 dark:text-navy-300">
                    Lens Color
                  </label>
                  <select
                    value={form.specifications.lensColor}
                    onChange={(e) => updateSpec("lensColor", e.target.value)}
                    className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm dark:border-navy-700 dark:bg-navy-900 dark:text-navy-50"
                  >
                    <option value="">Select lens color</option>
                    {LENS_COLORS.map((color) => (
                      <option key={color} value={color}>
                        {color}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-xs font-medium text-navy-700 dark:text-navy-300">
                  Brand
                </label>
                <input
                  placeholder="Brand name"
                  value={form.specifications.brand}
                  onChange={(e) => updateSpec("brand", e.target.value)}
                  className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm dark:border-navy-700 dark:bg-navy-900 dark:text-navy-50"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-navy-700 dark:text-navy-300">
                  Frame Color
                </label>
                <input
                  placeholder="Frame color"
                  value={form.specifications.color}
                  onChange={(e) => updateSpec("color", e.target.value)}
                  className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm dark:border-navy-700 dark:bg-navy-900 dark:text-navy-50"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-navy-700 dark:text-navy-300">
                  Weight
                </label>
                <input
                  placeholder="e.g., 25g"
                  value={form.specifications.weight}
                  onChange={(e) => updateSpec("weight", e.target.value)}
                  className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm dark:border-navy-700 dark:bg-navy-900 dark:text-navy-50"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-navy-700 dark:text-navy-300">
                  Dimensions
                </label>
                <input
                  placeholder="e.g., 52-18-140"
                  value={form.specifications.dimensions}
                  onChange={(e) => updateSpec("dimensions", e.target.value)}
                  className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm dark:border-navy-700 dark:bg-navy-900 dark:text-navy-50"
                />
              </div>
            </div>
          </section>
        )}

        {/* Lens Specifications - for Lenses product type */}
        {isLensType && (
          <section className="rounded-xl border border-navy-200 bg-white p-6 dark:border-navy-700 dark:bg-navy-800">
            <h2 className="mb-4 text-base font-semibold text-navy-900 dark:text-navy-50">
              Lens Specifications
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-navy-700 dark:text-navy-300">
                  Lens Type
                </label>
                <select
                  value={form.specifications.lensType}
                  onChange={(e) => updateSpec("lensType", e.target.value)}
                  className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm dark:border-navy-700 dark:bg-navy-900 dark:text-navy-50"
                >
                  <option value="">Select lens type</option>
                  {LENS_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-navy-700 dark:text-navy-300">
                  Lens Color
                </label>
                <select
                  value={form.specifications.lensColor}
                  onChange={(e) => updateSpec("lensColor", e.target.value)}
                  className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm dark:border-navy-700 dark:bg-navy-900 dark:text-navy-50"
                >
                  <option value="">Select lens color</option>
                  {LENS_COLORS.map((color) => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-navy-700 dark:text-navy-300">
                  Coating
                </label>
                <select
                  value={form.specifications.coating}
                  onChange={(e) => updateSpec("coating", e.target.value)}
                  className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm dark:border-navy-700 dark:bg-navy-900 dark:text-navy-50"
                >
                  <option value="">Select coating</option>
                  {COATINGS.map((coating) => (
                    <option key={coating} value={coating}>
                      {coating}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-navy-700 dark:text-navy-300">
                  Lens Index
                </label>
                <select
                  value={form.specifications.index}
                  onChange={(e) => updateSpec("index", e.target.value)}
                  className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm dark:border-navy-700 dark:bg-navy-900 dark:text-navy-50"
                >
                  <option value="">Select index</option>
                  {LENS_INDICES.map((index) => (
                    <option key={index} value={index}>
                      {index}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-navy-700 dark:text-navy-300">
                  Brand
                </label>
                <input
                  placeholder="Brand name"
                  value={form.specifications.brand}
                  onChange={(e) => updateSpec("brand", e.target.value)}
                  className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm dark:border-navy-700 dark:bg-navy-900 dark:text-navy-50"
                />
              </div>
            </div>
          </section>
        )}

        {/* Contact Lens Specifications */}
        {isContactLensType && (
          <section className="rounded-xl border border-navy-200 bg-white p-6 dark:border-navy-700 dark:bg-navy-800">
            <h2 className="mb-4 text-base font-semibold text-navy-900 dark:text-navy-50">
              Contact Lens Specifications
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-navy-700 dark:text-navy-300">
                  Power
                </label>
                <input
                  placeholder="e.g., -2.50, +1.00, Plano"
                  value={form.specifications.power}
                  onChange={(e) => updateSpec("power", e.target.value)}
                  className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm dark:border-navy-700 dark:bg-navy-900 dark:text-navy-50"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-navy-700 dark:text-navy-300">
                  Base Curve
                </label>
                <input
                  placeholder="e.g., 8.6mm"
                  value={form.specifications.baseCurve}
                  onChange={(e) => updateSpec("baseCurve", e.target.value)}
                  className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm dark:border-navy-700 dark:bg-navy-900 dark:text-navy-50"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-navy-700 dark:text-navy-300">
                  Diameter
                </label>
                <input
                  placeholder="e.g., 14.2mm"
                  value={form.specifications.diameter}
                  onChange={(e) => updateSpec("diameter", e.target.value)}
                  className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm dark:border-navy-700 dark:bg-navy-900 dark:text-navy-50"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-navy-700 dark:text-navy-300">
                  Water Content
                </label>
                <input
                  placeholder="e.g., 38%"
                  value={form.specifications.waterContent}
                  onChange={(e) => updateSpec("waterContent", e.target.value)}
                  className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm dark:border-navy-700 dark:bg-navy-900 dark:text-navy-50"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-navy-700 dark:text-navy-300">
                  Material
                </label>
                <input
                  placeholder="e.g., Silicone Hydrogel"
                  value={form.specifications.frameMaterial}
                  onChange={(e) => updateSpec("frameMaterial", e.target.value)}
                  className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm dark:border-navy-700 dark:bg-navy-900 dark:text-navy-50"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-navy-700 dark:text-navy-300">
                  Wearing Schedule
                </label>
                <select
                  value={form.specifications.wearingSchedule}
                  onChange={(e) =>
                    updateSpec("wearingSchedule", e.target.value)
                  }
                  className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm dark:border-navy-700 dark:bg-navy-900 dark:text-navy-50"
                >
                  <option value="">Select schedule</option>
                  {WEARING_SCHEDULES.map((schedule) => (
                    <option key={schedule} value={schedule}>
                      {schedule}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-navy-700 dark:text-navy-300">
                  Brand
                </label>
                <input
                  placeholder="Brand name"
                  value={form.specifications.brand}
                  onChange={(e) => updateSpec("brand", e.target.value)}
                  className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm dark:border-navy-700 dark:bg-navy-900 dark:text-navy-50"
                />
              </div>
            </div>
          </section>
        )}

        {/* Accessory Specifications */}
        {isAccessoryType && (
          <section className="rounded-xl border border-navy-200 bg-white p-6 dark:border-navy-700 dark:bg-navy-800">
            <h2 className="mb-4 text-base font-semibold text-navy-900 dark:text-navy-50">
              Accessory Specifications
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-navy-700 dark:text-navy-300">
                  Accessory Type
                </label>
                <select
                  value={form.specifications.accessoryType}
                  onChange={(e) => updateSpec("accessoryType", e.target.value)}
                  className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm dark:border-navy-700 dark:bg-navy-900 dark:text-navy-50"
                >
                  <option value="">Select type</option>
                  {ACCESSORY_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-navy-700 dark:text-navy-300">
                  Brand
                </label>
                <input
                  placeholder="Brand name"
                  value={form.specifications.brand}
                  onChange={(e) => updateSpec("brand", e.target.value)}
                  className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm dark:border-navy-700 dark:bg-navy-900 dark:text-navy-50"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-navy-700 dark:text-navy-300">
                  Material
                </label>
                <input
                  placeholder="e.g., Microfiber, Silicone, Plastic"
                  value={form.specifications.frameMaterial}
                  onChange={(e) => {
                    // Store in frameMaterial for now - it's the same field reused
                    updateSpec("frameMaterial", e.target.value);
                  }}
                  className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm dark:border-navy-700 dark:bg-navy-900 dark:text-navy-50"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-navy-700 dark:text-navy-300">
                  Color
                </label>
                <input
                  placeholder="Color"
                  value={form.specifications.color}
                  onChange={(e) => updateSpec("color", e.target.value)}
                  className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm dark:border-navy-700 dark:bg-navy-900 dark:text-navy-50"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-navy-700 dark:text-navy-300">
                  Weight
                </label>
                <input
                  placeholder="e.g., 50g"
                  value={form.specifications.weight}
                  onChange={(e) => updateSpec("weight", e.target.value)}
                  className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm dark:border-navy-700 dark:bg-navy-900 dark:text-navy-50"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-medium text-navy-700 dark:text-navy-300">
                  Dimensions
                </label>
                <input
                  placeholder="e.g., 15x8x3cm"
                  value={form.specifications.dimensions}
                  onChange={(e) => updateSpec("dimensions", e.target.value)}
                  className="w-full rounded-lg border border-navy-200 px-3 py-2 text-sm dark:border-navy-700 dark:bg-navy-900 dark:text-navy-50"
                />
              </div>
            </div>
          </section>
        )}

        {/* Images Section */}
        <section className="rounded-xl border border-navy-200 bg-white p-6 dark:border-navy-700 dark:bg-navy-800">
          <h2 className="mb-4 text-base font-semibold text-navy-900 dark:text-navy-50">
            Product Images
          </h2>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-navy-700 dark:text-navy-300">
              {isEditMode
                ? "Upload new images (will be added to existing)"
                : "Upload images"}
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setImageFiles(Array.from(e.target.files))}
              className="block w-full text-sm text-navy-600 file:mr-4 file:rounded-lg file:border-0 file:bg-navy-800 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-navy-700 dark:file:bg-navy-600 dark:hover:file:bg-navy-500"
            />
            <p className="mt-1.5 text-xs text-navy-500 dark:text-navy-400">
              You can select multiple images. Supported formats: JPG, PNG, WEBP
            </p>
          </div>
        </section>

        {/* Error Message */}
        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-navy-800 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-navy-700 disabled:opacity-50 dark:bg-navy-600 dark:hover:bg-navy-500"
          >
            {submitting
              ? "Saving..."
              : isEditMode
                ? "Update product"
                : "Create product"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/admin/products")}
            className="rounded-lg border border-navy-200 px-6 py-2.5 text-sm font-medium text-navy-700 transition hover:border-navy-300 hover:bg-navy-50 dark:border-navy-700 dark:text-navy-300 dark:hover:bg-navy-800"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function getTypeDescription(type) {
  const descriptions = {
    sunglasses: "Polarized, UV protection & more",
    eyeglasses: "Prescription glasses for daily use",
    frames: "Full rim, half rim, rimless & more",
    lenses: "Single vision, progressive, blue cut & more",
    "contact-lenses": "Daily, monthly, yearly disposables",
    accessories: "Cases, cleaners, chains & more",
  };
  return descriptions[type] || "";
}
