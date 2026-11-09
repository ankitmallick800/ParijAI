import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, Sparkles, Navigation, ListChecks } from "lucide-react";

interface AgentLoadingDialogProps {
  isOpen: boolean;
  agentName: "Place Finder Agent" | "Route Finder Agent" | "Aggregator Agent";
}

const agentConfig = {
  "Place Finder Agent": {
    icon: <Sparkles className="size-8" style={{ color: "#f4ae52" }} />,
    color: "var(--t-amber-500)",
    messages: [
      "Initializing Place Finder Agent...",
      "Connecting to global tourism databases...",
      "Scanning local landmarks and hidden gems...",
      "Filtering results based on your preferences...",
      "Analyzing cost and time efficiency for each spot...",
      "Checking seasonal relevance and local events...",
      "Consulting historic popularity metrics...",
      "Matching group size constraints with venue capacities...",
      "Finalizing a list of recommended places for you...",
      "Verifying GPS coordinates and operational hours...",
    ],
  },
  "Route Finder Agent": {
    icon: <Navigation className="size-8" style={{ color: "#d4621a" }} />,
    color: "var(--t-sky-500)",
    messages: [
      "Initializing Route Finder Agent...",
      "Retrieving coordinate data for selected spots...",
      "Calculating travel times between all stop combinations...",
      "Optimizing routes for multiple transport modes...",
      "Checking real-time traffic patterns and congestion...",
      "Querying public transit availability and schedules...",
      "Minimizing total distance for fuel/time efficiency...",
      "Applying multi-destination pathfinding algorithms...",
      "Finalizing transportation logistics for your trip...",
      "Reviewing route safety and accessibility...",
    ],
  },
  "Aggregator Agent": {
    icon: <ListChecks className="size-8" style={{ color: "#c05616" }} />,
    color: "var(--t-forest-500)",
    messages: [
      "Initializing Aggregator Agent...",
      "Fetching detailed place descriptions and ratings...",
      "Organizing stops into a coherent daily schedule...",
      "Ensuring logical flow between geographic clusters...",
      "Calculating total budget and itemized time breakdown...",
      "Generating local tips and unique seasonal insights...",
      "Searching for high-quality visual assets for each stop...",
      "Reviewing the master plan for logical flow and pacing...",
      "Crafting your finalized personalized itinerary...",
      "Synthesizing final travel expert recommendations...",
    ],
  },
};

function AgentLoadingBody({ agentName }: { agentName: AgentLoadingDialogProps["agentName"] }) {
  const config = agentConfig[agentName];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 1800);
    return () => window.clearInterval(interval);
  }, []);

  const shownCount = Math.min(currentIndex, 5);
  const activeMessages = Array.from({ length: shownCount }, (_, offset) => {
    const messageIndex = (currentIndex - shownCount + offset) % config.messages.length;
    return config.messages[messageIndex] ?? "";
  });

  return (
      <DialogContent showCloseButton={false} className="max-h-[min(640px,90vh)] w-[calc(100%-1.5rem)] overflow-y-auto rounded-3xl border-none p-0 shadow-2xl sm:max-w-md">
        <div className="relative flex flex-col justify-between bg-[#fffbf4] p-5 text-center sm:p-8">
          {/* Animated Background Element */}
          <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
             <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full blur-3xl animate-pulse" style={{ background: config.color }} />
             <div className="absolute -bottom-24 -right-24 w-64 h-64 rounded-full blur-3xl animate-pulse" style={{ background: config.color, animationDelay: "1s" }} />
          </div>

          <div className="relative z-10 flex flex-col items-center gap-6">
            <div className="relative mt-2">
              <div className="absolute inset-0 rounded-full blur-xl opacity-20 animate-pulse" style={{ background: config.color }} />
              <div className="relative rounded-2xl border p-4 shadow-xl" style={{ background: "#fffbf4", borderColor: "#edd4ae" }}>
                {config.icon}
              </div>
              <div className="absolute -right-1 -bottom-1 rounded-full border p-1 shadow-md" style={{ background: "#fffbf4", borderColor: "#f6e6cc" }}>
                <Loader2 className="w-4 h-4 animate-spin" style={{ color: config.color }} />
              </div>
            </div>

            <div className="w-full space-y-4">
              <DialogHeader>
                <DialogTitle className="text-center text-xl font-bold sm:text-2xl" style={{ color: "var(--brand-ink)" }}>
                  {agentName} <span className="font-normal" style={{ color: "var(--t-stone-400)" }}>at work</span>
                </DialogTitle>
              </DialogHeader>
              
              {/* Streaming Terminal Effect - Fixed Height */}
              <div className="flex h-40 flex-col justify-end overflow-hidden rounded-2xl border p-4 sm:h-48" style={{ background: "#fef3e2", borderColor: "#edd4ae" }}>
                <div className="space-y-2 text-left">
                  {activeMessages.map((msg, i) => (
                    <div 
                      key={`${msg}-${i}`} 
                      className="text-sm font-medium animate-in fade-in slide-in-from-bottom-2 duration-500"
                      style={{ 
                        color: i === activeMessages.length - 1 ? "var(--t-stone-800)" : "var(--t-stone-400)",
                        opacity: 1 - (activeMessages.length - 1 - i) * 0.2
                      }}
                    >
                      <span className="mr-2" style={{ color: config.color }}>›</span>
                      {msg}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="w-full space-y-4">
              <p className="text-sm font-medium animate-pulse" style={{ color: "var(--t-stone-500)" }}>
                Please wait while we are preparing your itinerary...
              </p>
              
              <div className="pt-2">
                <p className="text-[10px] uppercase font-bold opacity-30 text-center" style={{ color: "var(--t-stone-400)" }}>
                  Multi-Agent Neural Processing • Step {currentIndex + 1}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
  );
}

export function AgentLoadingDialog({ isOpen, agentName }: AgentLoadingDialogProps) {
  return (
    <Dialog open={isOpen}>
      {isOpen ? <AgentLoadingBody agentName={agentName} /> : null}
    </Dialog>
  );
}
