import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-border-base bg-surface-raised">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row md:justify-between gap-8">
          <div className="md:max-w-md">
            <Link href="/" className="flex items-center gap-2.5 group">
              <Image
                src="/lh-logo.png"
                alt="Logo"
                width={150}
                height={40}
                className="h-22 w-auto"
              />
              <span className="text-3xl font-bold text-text-primary">
                Longhorn<span className="text-burnt-orange">Housing</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-text-secondary">
              Your complete resource for off-campus housing near UT Austin.
              Browse, compare, find roommates, and discover subleases.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-8 md:gap-16">
            <div>
              <h3 className="font-semibold text-text-primary mb-4">Explore</h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/apartments"
                    className="text-sm text-text-secondary hover:text-burnt-orange transition-colors"
                  >
                    Browse Apartments
                  </Link>
                </li>
                <li>
                  <Link
                    href="/map"
                    className="text-sm text-text-secondary hover:text-burnt-orange transition-colors"
                  >
                    Map & Route Planner
                  </Link>
                </li>
                <li>
                  <Link
                    href="/compare"
                    className="text-sm text-text-secondary hover:text-burnt-orange transition-colors"
                  >
                    Compare Apartments
                  </Link>
                </li>
                <li>
                  <Link
                    href="/subleases"
                    className="text-sm text-text-secondary hover:text-burnt-orange transition-colors"
                  >
                    Subleases
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-text-primary mb-4">
                Community
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/roommates"
                    className="text-sm text-text-secondary hover:text-burnt-orange transition-colors"
                  >
                    Find Roommates
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard"
                    className="text-sm text-text-secondary hover:text-burnt-orange transition-colors"
                  >
                    My Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    href="/auth/signup"
                    className="text-sm text-text-secondary hover:text-burnt-orange transition-colors"
                  >
                    Create Account
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-text-primary mb-4">
                Resources
              </h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="https://housing.utexas.edu/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-text-secondary hover:text-burnt-orange transition-colors"
                  >
                    UT Housing
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.capmetro.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-text-secondary hover:text-burnt-orange transition-colors"
                  >
                    CapMetro Transit
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.utexas.edu/maps"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-text-secondary hover:text-burnt-orange transition-colors"
                  >
                    UT Campus Map
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border-base">
          <p className="text-center text-sm text-text-muted">
            &copy; {new Date().getFullYear()} Longhorn Housing
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
