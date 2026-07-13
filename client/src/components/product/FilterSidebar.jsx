import { useEffect, useState } from "react";
import {
  IconCheck,
  IconChevronDown,
  IconX,
  IconFilter,
} from "@tabler/icons-react";
import {
  fetchProductColors,
  fetchLensColors,
} from "../../services/productService";

const GENDERS = ["Men", "Women", "Kids", "Unisex"];
const MATERIALS = ["Metal", "Plastic", "Titanium", "TR90", "Acetate"];
const SHAPES = [
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

const FILTER_KEYS = [
  "gender",
  "material",
  "lensType",
  "shape",
  "color",
  "lensColor",
  "minPrice",
  "maxPrice",
];

const LENS_CATEGORIES = ["lenses", "contact-lenses"];
const FRAME_CATEGORIES = ["eyeglasses", "sunglasses"];
const LENS_COLOR_CATEGORIES = ["lenses", "contact-lenses"];
const LENS_TYPE_EXCLUDED = ["accessories"];

const FILTER_LABELS = {
  gender: "Gender",
  material: "Frame material",
  lensType: "Lens type",
  shape: "Shape",
  color: "Frame color",
  lensColor: "Lens color",
  minPrice: "Min price",
  maxPrice: "Max price",
};

const FRAME_QUICK_FILTERS = [
  { label: "Blue Cut", filters: { lensType: "Blue Cut" } },
  { label: "Geometric", filters: { shape: "Geometric" } },
  { label: "Anti-Glare", filters: { lensType: "Anti-Glare" } },
  { label: "Round", filters: { shape: "Round" } },
  { label: "Cat-Eye", filters: { shape: "Cat-Eye" } },
  { label: "Metal Frame", filters: { material: "Metal" } },
  { label: "Titanium", filters: { material: "Titanium" } },
  { label: "Photochromic", filters: { lensType: "Photochromic" } },
];

const LENS_QUICK_FILTERS = [
  { label: "Blue Cut", filters: { lensType: "Blue Cut" } },
  { label: "Anti-Glare", filters: { lensType: "Anti-Glare" } },
  { label: "Photochromic", filters: { lensType: "Photochromic" } },
  { label: "Progressive", filters: { lensType: "Progressive" } },
  { label: "UV Protection", filters: { lensType: "UV Protection" } },
];

export default function FilterSidebar({
  filters,
  onChange,
  category,
  mobileOpen,
  onMobileClose,
}) {
  const [colors, setColors] = useState([]);
  const [lensColors, setLensColors] = useState([]);
  const [expandedSections, setExpandedSections] = useState({
    price: false,
    shape: false,
    gender: false,
    material: false,
    lensType: false,
    lensColor: false,
    frameColor: false,
    quickFilters: false,
  });

  useEffect(() => {
    Promise.allSettled([fetchProductColors(), fetchLensColors()]).then(
      ([colorsResult, lensColorsResult]) => {
        if (colorsResult.status === "fulfilled") setColors(colorsResult.value);
        if (lensColorsResult.status === "fulfilled")
          setLensColors(lensColorsResult.value);
      },
    );
  }, []);

  function toggleValue(key, value) {
    onChange(key, filters[key] === value ? "" : value);
  }

  const hasActiveFilters = FILTER_KEYS.some((key) => filters[key]);

  function clearAll() {
    FILTER_KEYS.forEach((key) => onChange(key, ""));
  }

  function removeFilter(key) {
    onChange(key, "");
  }

  function toggleSection(section) {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  }

  function applyQuickFilter(presetFilters) {
    Object.entries(presetFilters).forEach(([key, value]) => {
      onChange(key, value);
    });
  }

  function isQuickFilterActive(presetFilters) {
    return Object.entries(presetFilters).every(
      ([key, value]) => filters[key] === value,
    );
  }

  const isLensCategory = category && LENS_CATEGORIES.includes(category);
  const isFrameCategory = !category || FRAME_CATEGORIES.includes(category);
  const showLensColor = !category || LENS_COLOR_CATEGORIES.includes(category);
  const showLensType = !category || !LENS_TYPE_EXCLUDED.includes(category);
  const quickFilters = isFrameCategory
    ? FRAME_QUICK_FILTERS
    : LENS_QUICK_FILTERS;

  // Build active chips list
  const activeChips = Object.entries(filters)
    .filter(([key, value]) => value && FILTER_LABELS[key])
    .map(([key, value]) => ({
      key,
      label: FILTER_LABELS[key],
      value:
        key === "minPrice"
          ? `₹${value}+`
          : key === "maxPrice"
            ? `Upto ₹${value}`
            : value,
    }));

  // Sidebar content
  const sidebarContent = (
    <div className="flex flex-col space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-navy-100 pb-4 dark:border-navy-800">
        <div className="flex items-center gap-2">
          <IconFilter size={16} className="text-navy-600 dark:text-navy-400" />
          <p className="font-display text-base font-bold text-navy-900 dark:text-navy-50">
            Filters
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={clearAll}
              className="text-xs font-semibold text-navy-600 transition hover:text-red-600 dark:text-navy-400"
            >
              Clear All
            </button>
          )}
          {mobileOpen && onMobileClose && (
            <button
              onClick={onMobileClose}
              className="rounded-full p-1 text-navy-400 hover:bg-navy-100 hover:text-navy-600 dark:hover:bg-navy-700"
            >
              <IconX size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Active filter chips */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {activeChips.map((chip) => (
            <span
              key={chip.key}
              className="inline-flex animate-fadeIn items-center gap-1 rounded-full bg-navy-100 px-2.5 py-1 text-xs font-medium text-navy-700 dark:bg-navy-700 dark:text-navy-200"
            >
              <span>
                {chip.label}: {chip.value}
              </span>
              <button
                onClick={() => removeFilter(chip.key)}
                className="ml-0.5 rounded-full p-0.5 text-navy-500 hover:bg-navy-200 hover:text-navy-900 dark:text-navy-400 dark:hover:bg-navy-600"
              >
                <IconX size={12} />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Quick filter buttons */}
      {quickFilters.length > 0 && (
        <div className="space-y-3">
          <button
            onClick={() => toggleSection("quickFilters")}
            className="flex w-full items-center justify-between text-xs font-bold text-navy-900 dark:text-navy-50"
          >
            <span>Quick Filters</span>
            <IconChevronDown
              size={14}
              className={`transform transition-transform duration-200 ${
                expandedSections.quickFilters ? "rotate-0" : "-rotate-90"
              }`}
            />
          </button>
          {expandedSections.quickFilters && (
            <div className="flex flex-wrap gap-1.5">
              {quickFilters.map((qf) => {
                const isActive = isQuickFilterActive(qf.filters);
                return (
                  <button
                    key={qf.label}
                    onClick={() => applyQuickFilter(qf.filters)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
                      isActive
                        ? "bg-navy-800 text-white shadow-sm dark:bg-navy-200 dark:text-navy-900"
                        : "border border-navy-200 text-navy-600 hover:border-navy-400 hover:bg-navy-50 dark:border-navy-700 dark:text-navy-300 dark:hover:border-navy-500 dark:hover:bg-navy-800"
                    }`}
                  >
                    {qf.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Price Range */}
      <div className="space-y-3">
        <button
          onClick={() => toggleSection("price")}
          className="flex w-full items-center justify-between text-xs font-bold text-navy-900 dark:text-navy-50"
        >
          <span>Price Range</span>
          <IconChevronDown
            size={14}
            className={`transform transition-transform duration-200 ${
              expandedSections.price ? "rotate-0" : "-rotate-90"
            }`}
          />
        </button>
        {expandedSections.price && (
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-navy-400 dark:text-navy-500">
                ₹
              </span>
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice || ""}
                onChange={(e) => onChange("minPrice", e.target.value)}
                className="w-full rounded-lg border-2 border-navy-200 bg-white py-2.5 pl-8 pr-3 text-sm font-medium text-navy-700 outline-none transition hover:border-navy-300 focus:border-navy-700 focus:ring-2 focus:ring-navy-700/20 dark:border-navy-700 dark:bg-navy-800 dark:text-navy-100"
              />
            </div>
            <span className="text-sm font-medium text-navy-400 dark:text-navy-600">
              to
            </span>
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-navy-400 dark:text-navy-500">
                ₹
              </span>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice || ""}
                onChange={(e) => onChange("maxPrice", e.target.value)}
                className="w-full rounded-lg border-2 border-navy-200 bg-white py-2.5 pl-8 pr-3 text-sm font-medium text-navy-700 outline-none transition hover:border-navy-300 focus:border-navy-700 focus:ring-2 focus:ring-navy-700/20 dark:border-navy-700 dark:bg-navy-800 dark:text-navy-100"
              />
            </div>
          </div>
        )}
      </div>

      {/* Frame shape filter */}
      {isFrameCategory && (
        <CollapsibleFilterGroup
          title="Shape"
          isOpen={expandedSections.shape}
          onToggle={() => toggleSection("shape")}
        >
          <FilterGroup
            options={SHAPES}
            activeValue={filters.shape}
            onSelect={(v) => toggleValue("shape", v)}
          />
        </CollapsibleFilterGroup>
      )}

      {/* Gender filter */}
      {isFrameCategory && (
        <CollapsibleFilterGroup
          title="Gender"
          isOpen={expandedSections.gender}
          onToggle={() => toggleSection("gender")}
        >
          <FilterGroup
            options={GENDERS}
            activeValue={filters.gender}
            onSelect={(v) => toggleValue("gender", v)}
          />
        </CollapsibleFilterGroup>
      )}

      {/* Frame material filter */}
      {isFrameCategory && (
        <CollapsibleFilterGroup
          title="Frame material"
          isOpen={expandedSections.material}
          onToggle={() => toggleSection("material")}
        >
          <FilterGroup
            options={MATERIALS}
            activeValue={filters.material}
            onSelect={(v) => toggleValue("material", v)}
          />
        </CollapsibleFilterGroup>
      )}

      {/* Lens type filter - hidden for accessories */}
      {showLensType && (
        <CollapsibleFilterGroup
          title="Lens type"
          isOpen={expandedSections.lensType}
          onToggle={() => toggleSection("lensType")}
        >
          <FilterGroup
            options={LENS_TYPES}
            activeValue={filters.lensType}
            onSelect={(v) => toggleValue("lensType", v)}
          />
        </CollapsibleFilterGroup>
      )}

      {/* Lens color filter - show for sunglasses, lenses, contact-lenses, but NOT eyeglasses */}
      {showLensColor && (
        <CollapsibleFilterGroup
          title="Lens color"
          isOpen={expandedSections.lensColor}
          onToggle={() => toggleSection("lensColor")}
        >
          <LensColorFilter
            colors={lensColors}
            activeValue={filters.lensColor}
            onSelect={(v) => toggleValue("lensColor", v)}
            alwaysShow={isLensCategory}
          />
        </CollapsibleFilterGroup>
      )}

      {/* Frame color filter */}
      {isFrameCategory && colors.length > 0 && (
        <CollapsibleFilterGroup
          title="Frame color"
          isOpen={expandedSections.frameColor}
          onToggle={() => toggleSection("frameColor")}
        >
          <FilterGroup
            options={colors}
            activeValue={filters.color}
            onSelect={(v) => toggleValue("color", v)}
          />
        </CollapsibleFilterGroup>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:block">{sidebarContent}</aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300"
            onClick={onMobileClose}
          />
          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] animate-slideInLeft overflow-y-auto border-r border-navy-200 bg-white p-5 shadow-xl dark:border-navy-700 dark:bg-navy-900">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}

function CollapsibleFilterGroup({ title, isOpen, onToggle, children }) {
  return (
    <div className="space-y-3">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between text-xs font-bold text-navy-900 dark:text-navy-50"
      >
        <span>{title}</span>
        <IconChevronDown
          size={14}
          className={`transform transition-transform duration-200 ${
            isOpen ? "rotate-0" : "-rotate-90"
          }`}
        />
      </button>
      {isOpen && <div>{children}</div>}
    </div>
  );
}

function LensColorFilter({ colors, activeValue, onSelect, alwaysShow }) {
  const COMMON_LENS_COLORS = [
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

  const availableColors = alwaysShow
    ? COMMON_LENS_COLORS
    : COMMON_LENS_COLORS.filter((c) => colors.includes(c));

  if (availableColors.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {availableColors.map((color) => {
        const active = activeValue === color;
        return (
          <button
            key={color}
            onClick={() => onSelect(color)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
              active
                ? "bg-navy-800 text-white shadow-sm dark:bg-navy-200 dark:text-navy-900"
                : "border border-navy-200 text-navy-600 hover:border-navy-400 hover:bg-navy-50 dark:border-navy-700 dark:text-navy-300 dark:hover:border-navy-500 dark:hover:bg-navy-800"
            }`}
          >
            {color}
          </button>
        );
      })}
    </div>
  );
}

function FilterGroup({ options, activeValue, onSelect }) {
  return (
    <div className="flex flex-col gap-1">
      {options.map((option) => {
        const active = activeValue === option;
        return (
          <button
            key={option}
            onClick={() => onSelect(option)}
            className={`group flex items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm font-medium transition-all duration-150 ${
              active
                ? "bg-navy-50 text-navy-900 dark:bg-navy-900/20 dark:text-navy-50"
                : "text-navy-600 hover:bg-navy-50 dark:text-navy-300 dark:hover:bg-navy-800"
            }`}
          >
            <span
              className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md border-2 transition-all duration-150 ${
                active
                  ? "border-navy-700 bg-navy-700 text-white"
                  : "border-navy-300 bg-transparent group-hover:border-navy-400 dark:border-navy-600"
              }`}
            >
              {active && <IconCheck size={14} strokeWidth={3} />}
            </span>
            <span className="flex-1 text-left">{option}</span>
          </button>
        );
      })}
    </div>
  );
}
