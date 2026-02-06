import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-20 py-8 border-t border-gray-200">
      <div className="max-w-5xl mx-auto px-6">
        <nav className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 text-sm">
          <Link
            href="/mentions-legales"
            className="text-gray-500 hover:text-gray-900 transition-colors duration-150"
          >
            Mentions légales
          </Link>
          <span className="hidden sm:block text-gray-300">|</span>
          <Link
            href="/cgv"
            className="text-gray-500 hover:text-gray-900 transition-colors duration-150"
          >
            CGV
          </Link>
          <span className="hidden sm:block text-gray-300">|</span>
          <Link
            href="/contact"
            className="text-gray-500 hover:text-gray-900 transition-colors duration-150"
          >
            Contact
          </Link>
        </nav>
        <p className="text-center text-sm text-gray-400 mt-4">
          © {new Date().getFullYear()} Guidassur
        </p>
      </div>
    </footer>
  );
}
