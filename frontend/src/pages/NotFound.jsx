import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { IconEyeglassOff, IconArrowLeft } from "@tabler/icons-react";
import { formatPageTitle } from "../config/seo";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 py-20 text-center">
      <Helmet>
        <title>{formatPageTitle("404 Page Not Found")}</title>
        <meta
          name="description"
          content="The page you are looking for does not exist at Swadeshi Opticals. Browse our eyewear collection or return to the homepage."
        />
        <meta name="robots" content="noindex, follow" />
      </Helmet>

      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-navy-50 dark:bg-navy-800">
        <IconEyeglassOff
          size={48}
          className="text-navy-300 dark:text-navy-600"
        />
      </div>

      <p className="mt-6 font-display text-5xl font-bold text-navy-200 dark:text-navy-700">
        404
      </p>
      <p className="mt-2 text-lg font-semibold text-navy-900 dark:text-navy-50">
        Page not found
      </p>
      <p className="mt-2 max-w-xs text-sm leading-relaxed text-navy-400">
        Looks like you've wandered off the path. The page you're looking for
        doesn't exist or has been moved.
      </p>

      <div className="mt-8 flex items-center gap-3">
        <Link
          to="/"
          className="btn-press inline-flex items-center gap-2 rounded-lg bg-navy-800 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-navy-700 dark:bg-navy-600 dark:hover:bg-navy-500"
        >
          <IconArrowLeft size={16} />
          Back to home
        </Link>
        <Link
          to="/shop"
          className="btn-press inline-flex items-center rounded-lg border border-navy-200 px-5 py-2.5 text-sm font-medium text-navy-600 transition hover:bg-navy-50 dark:border-navy-700 dark:text-navy-300 dark:hover:bg-navy-800"
        >
          Browse shop
        </Link>
      </div>
    </div>
  );
}
