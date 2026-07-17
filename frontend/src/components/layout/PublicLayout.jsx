import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import Header from "./Header";
import Footer from "./Footer";

/**
 * Wraps every CUSTOMER-facing page with the shared Header + Footer.
 * <Outlet /> is React Router's placeholder for whichever child route
 * is currently active (Home, Shop, Cart, etc.) — this avoids repeating
 * <Header /> and <Footer /> in every single page file.
 *
 * Page transitions: applies a quick fade/slide-up on route change.
 */
export default function PublicLayout() {
  const location = useLocation();
  const mainRef = useRef(null);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.classList.remove("page-enter");
      // Force reflow to restart the animation
      void mainRef.current.offsetWidth;
      mainRef.current.classList.add("page-enter");
    }
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main ref={mainRef} className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
