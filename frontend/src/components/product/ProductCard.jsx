import { Link, useNavigate } from "react-router-dom";
import { IconShoppingCartPlus, IconEye } from "@tabler/icons-react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { useToast } from "../../context/ToastContext";
import { formatCurrency } from "../../utils/formatCurrency";

export default function ProductCard({ product }) {
  const { isLoggedIn } = useAuth();
  const { addItem } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();

  function handleAddToCart(e) {
    e.preventDefault(); // don't follow the card's <Link> to the product page
    if (!isLoggedIn) {
      navigate("/login", { state: { redirectTo: `/product/${product.slug}` } });
      return;
    }
    addItem(product);
    addToast(`${product.name} added to cart`, "success");
  }

  const displayPrice = product.discountPrice ?? product.price;
  const discountPercent = product.discountPrice
    ? Math.round(100 - (product.discountPrice / product.price) * 100)
    : null;

  return (
    <Link
      to={`/product/${product.slug}`}
      className="hover-lift group relative block rounded-xl border border-navy-100 bg-white p-2.5 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-navy-200 dark:border-navy-700 dark:bg-navy-900 dark:hover:border-navy-500"
    >
      <div className="relative mb-2 aspect-square overflow-hidden rounded-lg bg-navy-50 ring-1 ring-transparent transition-all duration-300 group-hover:ring-navy-300/70 group-hover:shadow-inner dark:bg-navy-800">
        {product.images?.[0] ? (
          <img
            src={product.images[0]}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-navy-200">
            <svg
              className="h-8 w-8"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
        {discountPercent && (
          <span className="absolute left-2 top-2 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
            -{discountPercent}%
          </span>
        )}
        {/* Quick view button */}
        <Link
          to={`/product/${product.slug}`}
          onClick={(e) => e.stopPropagation()}
          className="absolute left-2 bottom-2 translate-y-2 rounded-full bg-white/90 p-1.5 text-navy-500 opacity-0 shadow transition-all duration-200 hover:text-navy-900 group-hover:translate-y-0 group-hover:opacity-100 dark:bg-navy-900/90 dark:text-navy-300"
        >
          <IconEye size={15} />
        </Link>
        <button
          aria-label="Add to cart"
          onClick={handleAddToCart}
          className="btn-press absolute right-2 top-2 rounded-full bg-white/95 p-1.5 text-navy-500 shadow transition hover:text-navy-900 hover:bg-white hover:shadow-md dark:bg-navy-900/90 dark:text-navy-300 dark:hover:bg-navy-800"
        >
          <IconShoppingCartPlus size={16} />
        </button>
        {/* Added animation indicator */}
        <span className="absolute right-12 top-2.5 scale-0 rounded-full bg-emerald-500 px-1.5 py-0.5 text-[9px] font-bold text-white transition-transform duration-200 group-active:scale-100">
          ✓
        </span>
      </div>

      <p className="truncate text-xs font-medium text-navy-500 dark:text-navy-300">
        {product.name}
      </p>
      <div className="mt-1 flex items-center gap-2">
        <p className="text-sm font-bold text-navy-900 dark:text-navy-50">
          {formatCurrency(displayPrice)}
        </p>
        {product.discountPrice && (
          <p className="text-[10px] text-navy-300 line-through">
            {formatCurrency(product.price)}
          </p>
        )}
      </div>
    </Link>
  );
}
