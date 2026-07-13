import { useEffect, useState, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  IconAdjustmentsHorizontal,
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconMoodSad,
  IconX,
} from "@tabler/icons-react";
import { fetchProducts } from "../services/productService";
import ProductCard from "../components/product/ProductCard";
import FilterSidebar from "../components/product/FilterSidebar";
import {
  SITE_NAME,
  SITE_URL,
  formatPageTitle,
  breadcrumbJsonLd,
} from "../config/seo";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "discount", label: "Discount" },
];

const CATEGORY_META = {
  eyeglasses: {
    title: "Eyeglasses",
    description:
      "Shop premium eyeglasses online at Swadeshi Opticals. Browse rectangle, round, cat-eye, aviator, and square frames for men, women, and kids in Chittorgarh, Rajasthan.",
  },
  sunglasses: {
    title: "Sunglasses",
    description:
      "Explore stylish sunglasses at Swadeshi Opticals. Aviator, wayfarer, cat-eye, and sport sunglasses available online with Cash on Delivery in Chittorgarh, Rajasthan.",
  },
  "contact-lenses": {
    title: "Contact Lenses",
    description:
      "Buy contact lenses online from Swadeshi Opticals. Daily, weekly, and monthly disposable lenses available. Order with prescription support in Chittorgarh, Rajasthan.",
  },
  accessories: {
    title: "Accessories",
    description:
      "Shop eyewear accessories online at Swadeshi Opticals. Cases, cleaning cloths, lens solutions, and more available in Chittorgarh, Rajasthan.",
  },
  lenses: {
    title: "Lenses",
    description:
      "Browse lens options at Swadeshi Opticals. Prescription lenses, blue-cut, anti-glare, and photochromic lenses available in Chittorgarh, Rajasthan.",
  },
  kids: {
    title: "Kids Glasses",
    description:
      "Shop durable and stylish glasses for kids at Swadeshi Opticals. Fun frames for children available online in Chittorgarh, Rajasthan.",
  },
};

function getCategoryMeta(categorySlug) {
  if (!categorySlug) return null;
  const slug = categorySlug.toLowerCase();
  return CATEGORY_META[slug] || null;
}

export default function Shop() {
  const { categorySlug } = useParams();
  const pageRef = useRef(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [result, setResult] = useState({
    products: [],
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Derive the filters object straight from the URL — this IS the state.
  const filters = {
    ...Object.fromEntries(searchParams.entries()),
    ...(categorySlug ? { category: categorySlug } : {}),
  };

  // Scroll to top immediately on mount before anything renders
  useEffect(() => {
    window.scroll(0, 0);
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchProducts(filters)
      .then(setResult)
      .catch((err) => console.error("Failed to load products:", err))
      .finally(() => setLoading(false));
    // Scroll to the top on every category or filter change
    window.scroll(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString(), categorySlug]);

  function updateFilter(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== "page") next.delete("page"); // any filter change resets pagination
    setSearchParams(next);
  }

  const categoryMeta = getCategoryMeta(categorySlug);
  const pageTitle = categoryMeta
    ? `Shop ${categoryMeta.title}`
    : "Shop Eyewear Online";
  const pageDescription =
    categoryMeta?.description ||
    "Shop premium eyewear online at Swadeshi Opticals in Chittorgarh, Rajasthan. Browse eyeglasses, sunglasses, contact lenses, and accessories with Cash on Delivery.";
  const canonicalUrl = categorySlug
    ? `${SITE_URL}/shop/${categorySlug}`
    : `${SITE_URL}/shop`;

  return (
    <div ref={pageRef} className="mx-auto max-w-6xl px-4 py-10">
      <Helmet>
        <title>{formatPageTitle(pageTitle)}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={`${pageTitle} | ${SITE_NAME}`} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta name="twitter:title" content={`${pageTitle} | ${SITE_NAME}`} />
        <meta name="twitter:description" content={pageDescription} />
        <script type="application/ld+json">
          {JSON.stringify(
            breadcrumbJsonLd([
              { name: "Home", url: "/" },
              {
                name: categoryMeta?.title || "Shop",
                url: categorySlug ? `/shop/${categorySlug}` : "/shop",
              },
            ]),
          )}
        </script>
      </Helmet>

      <p className="mb-2 text-xs text-navy-400">
        Home <span className="mx-1.5 text-navy-200 dark:text-navy-700">/</span>{" "}
        {categoryMeta?.title || "Shop"}
      </p>

      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl font-medium text-navy-900 dark:text-navy-50">
            {categoryMeta?.title || "All eyewear"}
          </h1>
          <p className="mt-1 text-xs text-navy-400">
            {loading
              ? "Loading..."
              : `${result.total} ${result.total === 1 ? "product" : "products"}`}
          </p>
        </div>
      </div>

      <div className="mb-5 flex items-center justify-between rounded-xl border border-navy-100 px-3 py-2.5 dark:border-navy-700 md:hidden">
        <div className="flex items-center gap-2">
          <button
            className="flex items-center gap-1.5 text-xs font-medium text-navy-600 dark:text-navy-200"
            onClick={() => setMobileFiltersOpen(true)}
          >
            <IconAdjustmentsHorizontal size={16} /> Filters
          </button>
          {/* Show active filter count on mobile */}
          {Object.entries(filters).filter(
            ([k, v]) => !["category", "page", "sort"].includes(k) && v,
          ).length > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-navy-800 text-[10px] font-bold text-white dark:bg-navy-200 dark:text-navy-900">
              {
                Object.entries(filters).filter(
                  ([k, v]) => !["category", "page", "sort"].includes(k) && v,
                ).length
              }
            </span>
          )}
        </div>
        <SortDropdown
          value={filters.sort}
          onChange={(v) => updateFilter("sort", v)}
        />
      </div>

      <div className="grid grid-cols-1 gap-10 md:grid-cols-[220px_1fr]">
        <div className={mobileFiltersOpen ? "block" : "hidden md:block"}>
          <div className="md:sticky md:top-24">
            <FilterSidebar
              filters={filters}
              onChange={updateFilter}
              category={categorySlug}
              mobileOpen={mobileFiltersOpen}
              onMobileClose={() => setMobileFiltersOpen(false)}
            />
          </div>
        </div>

        <div>
          <div className="mb-5 hidden justify-end md:flex">
            <SortDropdown
              value={filters.sort}
              onChange={(v) => updateFilter("sort", v)}
            />
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="mb-2 aspect-square rounded-xl bg-navy-50 dark:bg-navy-800" />
                  <div className="mb-1.5 h-3 w-3/4 rounded bg-navy-50 dark:bg-navy-800" />
                  <div className="h-3 w-1/3 rounded bg-navy-50 dark:bg-navy-800" />
                </div>
              ))}
            </div>
          ) : result.products.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
              <IconMoodSad
                size={32}
                className="text-navy-200 dark:text-navy-700"
              />
              <p className="text-sm text-navy-400">
                No products match these filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {result.products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}

          {result.totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-1.5 text-xs">
              <button
                disabled={Number(filters.page || 1) <= 1}
                onClick={() =>
                  updateFilter("page", Number(filters.page || 1) - 1)
                }
                className="flex h-7 w-7 items-center justify-center rounded-full text-navy-400 transition hover:bg-navy-50 disabled:opacity-30 disabled:hover:bg-transparent dark:hover:bg-navy-800"
              >
                <IconChevronLeft size={14} />
              </button>
              {Array.from({ length: result.totalPages }, (_, i) => i + 1).map(
                (pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => updateFilter("page", pageNum)}
                    className={`flex h-7 w-7 items-center justify-center rounded-full font-medium transition ${
                      Number(filters.page || 1) === pageNum
                        ? "bg-navy-900 text-white dark:bg-navy-400 dark:text-navy-900"
                        : "text-navy-500 hover:bg-navy-50 dark:text-navy-400 dark:hover:bg-navy-800"
                    }`}
                  >
                    {pageNum}
                  </button>
                ),
              )}
              <button
                disabled={Number(filters.page || 1) >= result.totalPages}
                onClick={() =>
                  updateFilter("page", Number(filters.page || 1) + 1)
                }
                className="flex h-7 w-7 items-center justify-center rounded-full text-navy-400 transition hover:bg-navy-50 disabled:opacity-30 disabled:hover:bg-transparent dark:hover:bg-navy-800"
              >
                <IconChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SortDropdown({ value, onChange }) {
  return (
    <div className="relative">
      <select
        value={value || "newest"}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-full border border-navy-200 bg-white py-1.5 pl-3 pr-8 text-xs font-medium text-navy-600 outline-none transition hover:border-navy-300 dark:border-navy-700 dark:bg-navy-800 dark:text-navy-200"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            Sort: {opt.label}
          </option>
        ))}
      </select>
      <IconChevronDown
        size={12}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-navy-400"
      />
    </div>
  );
}
