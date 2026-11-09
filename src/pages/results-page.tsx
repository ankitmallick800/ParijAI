import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import PlaceCard from "@/components/place-card";
import ItineraryTimeline from "@/components/itinerary-timeline";
import MapView from "@/components/map-view";
import {
  type PlaceRecommendation,
  type AggregatedResponse,
  type ItineraryItem,
  type BudgetBreakdown,
} from "@/interfaces/recommend.interface";
import { type RecommendRequest } from "@/schemas/explore.schema";
import { useState, useMemo } from "react";
import { useExplore } from "@/context/explore.context";
import { Clock, Lightbulb, List, MapIcon, MapPin, Wallet } from "lucide-react";

interface ResultsState {
  result: {
    places: PlaceRecommendation[];
    itinerary: AggregatedResponse;
  };
  request: RecommendRequest;
}

function formatMinutes(minutes: number) {
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;
    return rest > 0 ? `${hours}h ${rest}m` : `${hours}h`;
  }
  return `${minutes}m`;
}

export default function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"itinerary" | "all-places">("itinerary");

  const {
    itinerary: contextItinerary,
    places: contextPlaces,
    savedRequest: contextRequest,
  } = useExplore();

  const state = location.state as ResultsState | null;

  const displayData = useMemo(() => {
    if (state) return state;
    if (contextItinerary && contextPlaces && contextRequest) {
      return {
        result: {
          itinerary: contextItinerary,
          places: contextPlaces.filter((place) =>
            contextItinerary.itinerary.some((item) => item.place.name === place.name)
          ),
        },
        request: contextRequest,
      };
    }
    return null;
  }, [state, contextItinerary, contextPlaces, contextRequest]);

  if (!displayData) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4" style={{ background: "var(--t-bg)" }}>
        <div className="space-y-4 text-center">
          <p style={{ color: "var(--t-stone-600)" }}>No itinerary yet.</p>
          <Button onClick={() => navigate("/explore")} className="t-btn-primary">
            <MapPin className="size-4" /> Go to explore
          </Button>
        </div>
      </div>
    );
  }

  const { result, request } = displayData;
  const { itinerary, places } = result;

  const mapMarkers = viewMode === "itinerary"
    ? itinerary.itinerary.map((item: ItineraryItem) => ({
      lat: item.place.location.lat,
      lng: item.place.location.lng,
      name: item.place.name,
      order: item.order,
    }))
    : places.map((place, index) => ({
      lat: place.location.lat,
      lng: place.location.lng,
      name: place.name,
      order: index + 1,
    }));

  const budgetTotal = itinerary.budgetBreakdown.reduce((sum: number, item: BudgetBreakdown) => sum + item.amount, 0);

  return (
    <div className="min-h-full pb-16" style={{ background: "var(--t-bg)" }}>
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 pt-4 sm:flex-row sm:justify-center sm:px-6">
        <Button
          variant={viewMode === "itinerary" ? "default" : "outline"}
          size="sm"
          className="min-h-10 flex-1 sm:flex-none"
          onClick={() => setViewMode("itinerary")}
          style={viewMode === "itinerary" ? { background: "#d4621a", color: "#fef3e2" } : undefined}
        >
          <List className="size-4" /> Itinerary
        </Button>
        <Button
          variant={viewMode === "all-places" ? "default" : "outline"}
          size="sm"
          className="min-h-10 flex-1 sm:flex-none"
          onClick={() => setViewMode("all-places")}
          style={viewMode === "all-places" ? { background: "#d4621a", color: "#fef3e2" } : undefined}
        >
          <MapIcon className="size-4" /> All places
        </Button>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div
          className="mb-6 rounded-3xl p-5 sm:p-7"
          style={{ background: "var(--t-gradient-hero)", border: "1px solid #f3b98a" }}
        >
          <p className="text-base leading-relaxed sm:text-lg" style={{ color: "var(--t-stone-700)" }}>
            {itinerary.summary}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm" style={{ background: "rgba(255, 251, 244, 0.8)" }}>
              <Clock className="size-4" style={{ color: "#d4621a" }} />
              <span className="font-medium">{formatMinutes(itinerary.totalEstimatedTime)}</span>
            </div>
            <div className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm" style={{ background: "rgba(255, 251, 244, 0.8)" }}>
              <Wallet className="size-4" style={{ color: "#a86e24" }} />
              <span className="font-medium">~{itinerary.totalEstimatedCost.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm" style={{ background: "rgba(255, 251, 244, 0.8)" }}>
              <MapPin className="size-4" style={{ color: "#c05616" }} />
              <span className="font-medium">{itinerary.itinerary.length} stops</span>
            </div>
          </div>
        </div>

        <div className="mb-6 h-64 overflow-hidden rounded-3xl sm:h-80 lg:h-[26rem]" style={{ border: "1px solid var(--t-border)" }}>
          <MapView center={request.location} markers={mapMarkers} />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {viewMode === "itinerary" ? (
              <ItineraryTimeline items={itinerary.itinerary} />
            ) : (
              <div className="space-y-4">
                <h3 className="text-2xl" style={{ color: "var(--brand-ink)" }}>All recommended places</h3>
                <div className="space-y-4">
                  {places.map((place, index) => (
                    <div
                      key={place.name}
                      className="t-card p-4"
                      style={{ animationDelay: `${index * 60}ms` }}
                    >
                      <PlaceCard place={place} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            {itinerary.budgetBreakdown.length > 0 && (
              <div className="t-card p-5">
                <h3 className="mb-3 flex items-center gap-2 text-lg" style={{ color: "var(--brand-ink)" }}>
                  <Wallet className="size-4" style={{ color: "#f4ae52" }} /> Budget
                </h3>
                <div className="space-y-2">
                  {itinerary.budgetBreakdown.map((item) => (
                    <div key={item.category} className="flex items-center justify-between gap-3">
                      <span className="text-sm" style={{ color: "var(--t-stone-500)" }}>{item.category}</span>
                      <span className="text-sm font-medium" style={{ color: "var(--t-stone-700)" }}>{item.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex items-center justify-between font-semibold" style={{ color: "var(--brand-ink)" }}>
                    <span>Total</span>
                    <span>{budgetTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}

            {itinerary.tips.length > 0 && (
              <div className="t-card p-5">
                <h3 className="mb-3 flex items-center gap-2 text-lg" style={{ color: "var(--brand-ink)" }}>
                  <Lightbulb className="size-4" style={{ color: "#f4ae52" }} /> Local tips
                </h3>
                <ul className="space-y-2">
                  {itinerary.tips.map((tip, index) => (
                    <li key={`${tip}-${index}`} className="flex gap-2 text-sm" style={{ color: "var(--t-stone-600)" }}>
                      <span className="font-bold" style={{ color: "#d4621a" }}>•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Button className="t-btn-primary h-auto min-h-11 w-full py-3" onClick={() => navigate("/explore")}>
              <MapPin className="size-4" /> Plan another trip
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
