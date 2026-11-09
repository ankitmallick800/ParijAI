import type { RouteOption } from "@/interfaces/recommend.interface";
import { Badge } from "@/components/ui/badge";
import {
  Footprints, Car, Bike, TrainFront, Bus, Navigation, Info, Ship, Truck,
} from "lucide-react";

interface RouteInfoProps {
  route: RouteOption;
}

const modeIcons: Record<string, React.ReactNode> = {
  walk: <Footprints className="w-4 h-4" />,
  drive: <Car className="w-4 h-4" />,
  cycle: <Bike className="w-4 h-4" />,
  public_transit: <TrainFront className="w-4 h-4" />,
  metro: <TrainFront className="w-4 h-4" />,
  bus: <Bus className="w-4 h-4" />,
  cab: <Car className="w-4 h-4" />,
  auto: <Truck className="w-4 h-4" />,
  ferry: <Ship className="w-4 h-4" />,
  train: <TrainFront className="w-4 h-4" />,
};

export default function RouteInfo({ route }: RouteInfoProps) {
  const icon = modeIcons[route.mode] || <Navigation className="w-4 h-4" />;

  return (
    <div>
      <div className="flex items-center gap-2 text-sm flex-wrap">
        <span style={{ color: "var(--t-forest-600)" }}>{icon}</span>
        <span className="capitalize font-medium" style={{ color: "var(--t-stone-700)" }}>{route.mode}</span>
        <Badge className="t-badge-info text-xs">{route.duration} min</Badge>
        <span className="text-xs" style={{ color: "var(--t-stone-400)" }}>{route.distance} km</span>
        {route.estimatedCost > 0 && (
          <span className="text-xs" style={{ color: "var(--t-stone-400)" }}>~{route.estimatedCost}</span>
        )}
      </div>
      {route.localTip && (
        <div className="flex items-start gap-1.5 text-xs mt-1.5" style={{ color: "var(--t-sky-700)" }}>
          <Info className="w-3 h-3 mt-0.5 shrink-0" />
          <span>{route.localTip}</span>
        </div>
      )}
    </div>
  );
}
