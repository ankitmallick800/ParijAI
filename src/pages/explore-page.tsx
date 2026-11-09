import { useLocation, Outlet, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, RotateCcw } from "lucide-react";
import { useExplore } from "@/context/explore.context";

const stepLabels = ["Preferences", "Places", "Routes"];

export default function ExplorePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { resetWizard } = useExplore();

  const stepIndex = location.pathname.includes("preferences") ? 0
    : location.pathname.includes("places") ? 1
      : location.pathname.includes("routes") ? 2 : 0;

  const handleStartOver = () => {
    resetWizard();
    navigate("/explore/preferences");
  };

  return (
    <div className="min-h-full" style={{ background: "var(--t-bg)" }}>
      <div
        className="sticky z-40 border-b backdrop-blur-md"
        style={{
          top: "var(--nav-h)",
          background: "rgba(254, 243, 226, 0.92)",
          borderColor: "var(--t-border)",
        }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-center gap-1 px-3 py-3 sm:gap-2 sm:px-6">
          {stepLabels.map((label, i) => (
            <div key={label} className="flex min-w-0 items-center gap-1 sm:gap-2">
              {i > 0 && (
                <div
                  className="h-px w-4 shrink-0 transition-colors duration-300 sm:w-10"
                  style={{ background: i <= stepIndex ? "#d4621a" : "#e0c090" }}
                />
              )}
              <div
                className="flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-xs font-semibold transition-colors duration-300 sm:px-3"
                style={{
                  background: i === stepIndex ? "#d4621a" : i < stepIndex ? "#fde8d6" : "#f6e6cc",
                  color: i === stepIndex ? "#fef3e2" : i < stepIndex ? "#9a4514" : "#a07c62",
                }}
                aria-current={i === stepIndex ? "step" : undefined}
              >
                {i < stepIndex ? <Check className="size-3" /> : null}
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{i + 1}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
        <Outlet />

        {stepIndex > 0 && (
          <div className="mt-6 text-center">
            <Button variant="ghost" size="sm" onClick={handleStartOver} style={{ color: "var(--t-stone-500)" }}>
              <RotateCcw className="size-4" /> Start over
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
