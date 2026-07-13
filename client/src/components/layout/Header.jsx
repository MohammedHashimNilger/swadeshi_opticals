import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  IconSearch,
  IconUser,
  IconMoon,
  IconSun,
  IconShoppingCart,
  IconMenu2,
  IconX,
  IconPackage,
  IconLogout,
} from "@tabler/icons-react";
import { useTheme } from "../../context/ThemeContext";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";

const NAV_LINKS = [
  { label: "Eyeglasses", to: "/shop/eyeglasses" },
  { label: "Sunglasses", to: "/shop/sunglasses" },
  { label: "Lenses", to: "/shop/lenses" },
  { label: "Contact Lenses", to: "/shop/contact-lenses" },
  { label: "Accessories", to: "/shop/accessories" },
];

export default function Header() {
  const { isDark, toggleTheme } = useTheme();
  const { items } = useCart();
  const { isLoggedIn, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  function isActiveLink(linkTo) {
    if (linkTo === "/shop" || linkTo === "/shop/") {
      return (
        location.pathname === "/shop" || location.pathname.startsWith("/shop/")
      );
    }
    return location.pathname === linkTo;
  }

  function handleLogout() {
    logout();
    setAccountOpen(false);
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-20 border-b border-navy-100 bg-white/90 backdrop-blur dark:border-navy-700 dark:bg-navy-900/90">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/images/logo.png?v=2"
            alt="Swadeshi Opticals"
            className="h-10 w-auto"
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden gap-6 text-sm md:flex">
          {NAV_LINKS.map((link) => {
            const active = isActiveLink(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`relative font-medium transition ${
                  active
                    ? "text-navy-900 dark:text-white"
                    : "text-navy-600 dark:text-navy-200 hover:text-navy-900 dark:hover:text-white"
                }`}
              >
                {link.label}
                {active && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-navy-700 dark:bg-navy-300" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4 text-navy-600 dark:text-navy-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const q = e.target.elements.q.value.trim();
              if (q) navigate(`/shop?search=${encodeURIComponent(q)}`);
            }}
            className="hidden sm:flex items-center"
          >
            <input
              name="q"
              type="text"
              placeholder="Search products..."
              className="rounded-l-md border border-navy-200 px-3 py-1.5 text-sm focus:border-navy-400 focus:outline-none dark:border-navy-700 dark:bg-navy-900 dark:text-navy-100"
            />
            <button
              type="submit"
              aria-label="Search"
              className="rounded-r-md border border-l-0 border-navy-200 bg-navy-50 px-3 py-1.5 hover:bg-navy-100 dark:border-navy-700 dark:bg-navy-800 dark:hover:bg-navy-700"
            >
              <IconSearch size={18} />
            </button>
          </form>
          {isLoggedIn ? (
            <div className="relative">
              <button
                aria-label="Account"
                onClick={() => setAccountOpen((prev) => !prev)}
                className="hover:text-navy-900 dark:hover:text-white"
              >
                <IconUser size={20} />
              </button>
              {accountOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setAccountOpen(false)}
                  />
                  <div className="absolute right-0 top-8 z-20 w-48 rounded-lg border border-navy-100 bg-white py-1 shadow-lg dark:border-navy-700 dark:bg-navy-800">
                    <p className="truncate px-3 py-2 text-xs text-navy-400">
                      {user?.name}
                    </p>
                    <Link
                      to="/my-orders"
                      onClick={() => setAccountOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-navy-600 hover:bg-navy-50 dark:text-navy-200 dark:hover:bg-navy-700"
                    >
                      <IconPackage size={16} /> My orders
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-navy-600 hover:bg-navy-50 dark:text-navy-200 dark:hover:bg-navy-700"
                    >
                      <IconLogout size={16} /> Log out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              aria-label="Account"
              className="hover:text-navy-900 dark:hover:text-white"
            >
              <IconUser size={20} />
            </Link>
          )}
          <button
            aria-label="Toggle dark mode"
            onClick={toggleTheme}
            className="hover:text-navy-900 dark:hover:text-white"
          >
            {isDark ? <IconSun size={20} /> : <IconMoon size={20} />}
          </button>
          <Link
            to="/cart"
            aria-label="Cart"
            className="relative hover:text-navy-900 dark:hover:text-white"
          >
            <IconShoppingCart size={20} />
            {itemCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-navy-700 text-[10px] text-white dark:bg-navy-400">
                {itemCount}
              </span>
            )}
          </Link>

          {/* Mobile menu toggle */}
          <button
            aria-label="Open menu"
            className="md:hidden"
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            {mobileOpen ? <IconX size={22} /> : <IconMenu2 size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile nav panel */}
      {mobileOpen && (
        <nav className="flex flex-col gap-1 border-t border-navy-100 px-4 py-4 text-sm dark:border-navy-700 md:hidden">
          {NAV_LINKS.map((link) => {
            const active = isActiveLink(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`rounded-lg px-3 py-2 font-medium transition ${
                  active
                    ? "bg-navy-50 text-navy-900 dark:bg-navy-400/10 dark:text-navy-50"
                    : "text-navy-600 hover:bg-navy-50 dark:text-navy-200 dark:hover:bg-navy-800"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      )}
    </header>
  );
}
