"use client";

import Link from "next/link";

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row md:justify-between gap-8">
          {/* Brand - Left Side */}
          <div className="md:max-w-md">
            <Link
              href="/"
              onClick={scrollToTop}
              className="flex items-center gap-2"
            >
              <div className="relative h-10 w-10 rounded-lg bg-linear-to-br from-[#bf5700] to-[#ffa060] overflow-hidden">
                <span
                  className="text-2xl absolute top-px left-[px] z-0 scale-105 opacity-95"
                >
                  🤘
                </span>
                <span
                  className="text-2xl absolute bottom-px right-0.5 z-10 scale-95 opacity-95"
                >
                  🏠
                </span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                Longhorn<span className="text-burnt-orange">Housing</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-gray-500">
              Your complete resource for off-campus housing near UT Austin.
              Browse, compare, and discover your ideal apartment.
            </p>
          </div>

          {/* Right Side - Quick Links and Resources */}
          <div className="flex flex-col sm:flex-row gap-8 md:gap-16">
            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Quick Links</h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/apartments"
                    className="text-sm text-gray-500 hover:text-burnt-orange transition-colors"
                  >
                    Browse Apartments
                  </Link>
                </li>
                <li>
                  <Link
                    href="/map"
                    className="text-sm text-gray-500 hover:text-burnt-orange transition-colors"
                  >
                    Map View
                  </Link>
                </li>
                <li>
                  <Link
                    href="/compare"
                    className="text-sm text-gray-500 hover:text-burnt-orange transition-colors"
                  >
                    Compare Apartments
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Resources</h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="https://housing.utexas.edu/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-500 hover:text-burnt-orange transition-colors"
                  >
                    UT Housing
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.capmetro.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-500 hover:text-burnt-orange transition-colors"
                  >
                    CapMetro Transit
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.utexas.edu/maps"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-500 hover:text-burnt-orange transition-colors"
                  >
                    UT Campus Map
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-center text-sm text-gray-400">
            © {new Date().getFullYear()} LonghornHousing
            <br />
            <span className="text-xs">
              Not affiliated with The University of Texas at Austin.
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
