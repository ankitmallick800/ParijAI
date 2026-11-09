import PlaceCard from "@/components/place-card";
import RouteInfo from "@/components/route-info";
import { Clock } from "lucide-react";
import type { ItineraryItem } from "@/interfaces/recommend.interface";

interface ItineraryTimelineProps {
  items: ItineraryItem[];
}

export default function ItineraryTimeline({ items }: ItineraryTimelineProps) {
  return (
    <div className="space-y-1">
      <h3 className="text-xl font-semibold mb-4" style={{ color: "var(--t-stone-800)" }}>
        Your Itinerary
      </h3>

      {items.map((item, idx) => (
        <div key={item.order} className="relative">
          {/* Route connector */}
          {item.route && idx > 0 && (
            <div className="ml-8 my-3 pl-6" style={{ borderLeft: "2px dashed var(--t-sand-300)" }}>
              <RouteInfo route={item.route} />
            </div>
          )}

          {/* Place */}
          <div className="relative pl-10">
            {/* Timeline line */}
            <div
              className="absolute left-[14px] top-0 bottom-0 w-px"
              style={{ background: "linear-gradient(to bottom, var(--t-forest-300), var(--t-forest-100))" }}
            />

            {/* Numbered dot */}
            <div
              className="absolute left-0 top-6 w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center z-10"
              style={{ background: "var(--t-gradient-primary)", boxShadow: "var(--t-shadow-glow)" }}
            >
              {item.order}
            </div>

            {/* Time tags */}
            {(item.estimatedArrival || item.estimatedDeparture) && (
              <div className="mb-2 flex flex-wrap gap-2 text-xs">
                {item.estimatedArrival && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: "var(--t-sand-100)", color: "var(--t-stone-600)" }}>
                    <Clock className="w-3 h-3" /> Arrive: {item.estimatedArrival}
                  </span>
                )}
                {item.estimatedDeparture && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: "var(--t-sand-100)", color: "var(--t-stone-600)" }}>
                    <Clock className="w-3 h-3" /> Depart: {item.estimatedDeparture}
                  </span>
                )}
              </div>
            )}

            <div className="t-card p-4">
              <PlaceCard place={item.place} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
