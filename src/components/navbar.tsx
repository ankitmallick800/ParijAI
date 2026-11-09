import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Compass } from "lucide-react";

export default function Navbar() {
  const { pathname } = useLocation();
  const onExplore = pathname.startsWith("/explore") || pathname.startsWith("/results");

  return (
    <header
      className="sticky top-0 z-50 h-16 border-b backdrop-blur-xl"
      style={{
        background: "rgba(254, 243, 226, 0.88)",
        borderColor: "var(--t-border)",
      }}
    >
      <div className="mx-auto flex h-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link to="/" className="min-w-0 text-xl font-bold tracking-tight sm:text-2xl" style={{ fontFamily: "var(--font-display)", color: "var(--brand-ink)" }}>
          Pari<span className="t-gradient-text">jAI</span>
        </Link>

        <nav className="flex items-center">
          <Link to="/explore">
            <Button
              size="sm"
              variant={onExplore ? "secondary" : "default"}
              className={onExplore ? "rounded-xl" : "t-btn-primary gap-1.5 rounded-xl"}
              aria-current={onExplore ? "page" : undefined}
            >
              <Compass className="size-4" />
              Explore
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
