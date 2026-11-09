import { Badge } from "@/components/ui/badge";
import type { PlaceRecommendation } from "@/interfaces/recommend.interface";
import { Star, Clock, Wallet, Sparkles, Tag } from "lucide-react";

interface PlaceCardProps {
  place: PlaceRecommendation;
  index?: number;
  compact?: boolean;
}

export default function PlaceCard({ place, index, compact = false }: PlaceCardProps) {
  return (
    <div className="group">
      <div className={compact ? "space-y-1" : "space-y-2"}>
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {index !== undefined && (
              <span
                className="shrink-0 w-8 h-8 rounded-full text-white text-sm font-bold flex items-center justify-center"
                style={{ background: "var(--t-gradient-primary)" }}
              >
                {index}
              </span>
            )}
            <div className="min-w-0">
              <h3 className={`font-semibold leading-snug text-balance ${compact ? "text-base" : "text-lg"}`} style={{ color: "var(--brand-ink)" }}>
                {place.name}
              </h3>
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs capitalize font-medium mt-0.5"
                style={{ background: "var(--t-sand-100)", color: "var(--t-stone-600)", border: "1px solid var(--t-sand-300)" }}
              >
                <Tag className="w-3 h-3" />
                {place.category}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0" style={{ color: "var(--t-amber-500)" }}>
            <Star className="w-4 h-4" style={{ fill: "var(--t-amber-500)" }} />
            <span className="text-sm font-semibold">{place.rating}</span>
          </div>
        </div>

        {/* Description */}
        {!compact && (
          <p className="text-sm leading-relaxed" style={{ color: "var(--t-stone-500)" }}>
            {place.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex flex-wrap gap-3 text-xs" style={{ color: "var(--t-stone-500)" }}>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" style={{ color: "var(--t-sky-500)" }} />
            {place.estimatedTimeToSpend >= 60
              ? `${Math.floor(place.estimatedTimeToSpend / 60)}h${place.estimatedTimeToSpend % 60 > 0 ? ` ${place.estimatedTimeToSpend % 60}m` : ""}`
              : `${place.estimatedTimeToSpend}m`}
          </span>
          <span className="flex items-center gap-1">
            <Wallet className="w-3 h-3" style={{ color: "var(--t-amber-500)" }} />
            {place.estimatedCostPerPerson > 0 ? `~${place.estimatedCostPerPerson}/person` : "Free"}
          </span>
          <span className="font-medium" style={{ color: "var(--t-forest-600)" }}>
            Score: {place.score}
          </span>
        </div>

        {/* Reason */}
        {!compact && (
          <p className="text-sm italic" style={{ color: "var(--t-forest-600)" }}>
            "{place.reasonToVisit}"
          </p>
        )}

        {/* Seasonal / Festive note */}
        {place.seasonalNote && (
          <div
            className="flex items-center gap-1.5 text-xs rounded-lg px-3 py-1.5"
            style={{ background: "var(--t-amber-50)", color: "var(--t-amber-700)", border: "1px solid var(--t-amber-200)" }}
          >
            <Sparkles className="w-3 h-3" />
            {place.seasonalNote}
          </div>
        )}

        {place.festiveRelevance && !place.seasonalNote && (
          <div
            className="flex items-center gap-1.5 text-xs rounded-lg px-3 py-1.5"
            style={{ background: "var(--t-forest-50)", color: "var(--t-forest-700)", border: "1px solid var(--t-forest-200)" }}
          >
            <Sparkles className="w-3 h-3" />
            {place.festiveRelevance}
          </div>
        )}

        {/* Tags */}
        {!compact && place.tags && place.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {place.tags.slice(0, 5).map((tag: string) => (
              <Badge key={tag} variant="secondary" className="text-xs capitalize" style={{ background: "var(--t-sand-100)", color: "var(--t-stone-600)" }}>
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
