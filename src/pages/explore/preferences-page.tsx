import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useGeolocation } from "@/hooks/use-geolocation";
import {
  useFindPlaces,
  useGeocodeForward,
  useGeocodeReverse,
} from "@/hooks/use-recommendations";
import {
  type ExploreFormData,
  type RecommendRequest,
  type GroupType,
  exploreSchema,
  MAX_DURATION_MINUTES,
  MIN_DURATION_MINUTES,
} from "@/schemas/explore.schema";
import type {
  GeocodeResult,
} from "@/interfaces/geocode.interface";
import type {
  PlaceRecommendation,
} from "@/interfaces/recommend.interface";
import {
  MapPin, Clock, Wallet, Users, Search, Loader2,
  Navigation, ArrowRight, Sparkles, Leaf, Heart, TreePine, User,
} from "lucide-react";
import { useExplore } from "@/context/explore.context";
import { AgentLoadingDialog } from "@/components/agent-loading-dialog";

const categories = [
  "heritage", "temple", "park", "museum", "market",
  "food", "waterfront", "art", "entertainment", "nature", "landmark",
];

const groupTypes: { value: GroupType; label: string; icon: React.ReactNode }[] = [
  { value: "solo", label: "Solo", icon: <User className="w-5 h-5" /> },
  { value: "couple", label: "Couple", icon: <Heart className="w-5 h-5" /> },
  { value: "family", label: "Family", icon: <Users className="w-5 h-5" /> },
  { value: "friends", label: "Friends", icon: <TreePine className="w-5 h-5" /> },
];

export default function PreferencesPage() {
  const navigate = useNavigate();
  const { location: geoLoc, loading: geoLoading, requestLocation } = useGeolocation();
  const {
    formData, setFormData,
    location: storedLocation, setLocation,
    resolvedCity, setResolvedCity,
    sourceLocation, setSourceLocation,
    sourceCity, setSourceCity,
    setPlaces, setSelectedPlaces, setSavedRequest
  } = useExplore();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ExploreFormData>({
    resolver: zodResolver(exploreSchema),
    defaultValues: formData,
  });

  const cityQuery = watch("cityQuery");
  const time = watch("time");
  const groupType = watch("groupType");
  const selectedCategories = watch("selectedCategories");

  const placesOp = useFindPlaces();
  const geocodeOp = useGeocodeForward();
  const geocodeReverseOp = useGeocodeReverse();
  const sourceGeocodeOp = useGeocodeForward();

  const effectiveLocation = geoLoc || storedLocation;

  // Auto-resolve city name when current location is fetched
  useEffect(() => {
    if (geoLoc && (!storedLocation || geoLoc.lat !== storedLocation.lat || geoLoc.lng !== storedLocation.lng)) {
      setLocation(geoLoc);
      geocodeReverseOp.mutate(geoLoc, {
        onSuccess: (result: { data: { cityName: string } }) => {
          setResolvedCity(result.data.cityName);
        },
      });
    }
  }, [geoLoc, storedLocation, geocodeReverseOp, setLocation, setResolvedCity]);

  const [sourceQuery, setSourceQuery] = useState("");

  const handleCitySearch = useCallback(() => {
    if (!cityQuery.trim()) return;
    geocodeOp.mutate(cityQuery, {
      onSuccess: (result: { data: GeocodeResult }) => {
        if (result.data) {
          const loc = { lat: result.data.lat, lng: result.data.lng };
          setLocation(loc);
          setResolvedCity(result.data.displayName);
        }
      },
    });
  }, [cityQuery, geocodeOp, setLocation, setResolvedCity]);

  const handleSourceSearch = useCallback(() => {
    if (!sourceQuery.trim()) return;
    sourceGeocodeOp.mutate(sourceQuery, {
      onSuccess: (result: { data: GeocodeResult }) => {
        if (result.data) {
          setSourceLocation({ lat: result.data.lat, lng: result.data.lng });
          setSourceCity(result.data.displayName);
        }
      },
    });
  }, [sourceQuery, sourceGeocodeOp, setSourceLocation, setSourceCity]);

  const handleSourceGeolocation = useCallback(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setSourceLocation(loc);
        setSourceCity("My Location");
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [setSourceLocation, setSourceCity]);

  const onSubmit = (data: ExploreFormData) => {
    if (!effectiveLocation) return;
    setFormData(data);

    const request: RecommendRequest = {
      location: effectiveLocation,
      cityName: resolvedCity || undefined,
      availableTimeMinutes: data.time[0]!,
      budgetINR: parseFloat(data.budget),
      groupType: data.groupType,
      groupSize: parseInt(data.groupSize) || 1,
      preferences: data.selectedCategories.length > 0 ? data.selectedCategories : undefined,
    };

    setSavedRequest(request);
    placesOp.mutate(request, {
      onSuccess: (result: { data: PlaceRecommendation[] }) => {
        setPlaces(result.data);
        const recommended = result.data.slice(0, 2).map((p: PlaceRecommendation) => p.name);
        setSelectedPlaces(recommended);
        navigate("/explore/places");
      },
    });
  };

  const toggleCategory = (cat: string) => {
    const next = selectedCategories.includes(cat)
      ? selectedCategories.filter((c) => c !== cat)
      : [...selectedCategories, cat];
    setValue("selectedCategories", next);
  };

  const formatTime = (minutes: number) => {
    const days = Math.floor(minutes / 1440);
    const hours = Math.floor((minutes % 1440) / 60);
    if (days > 0 && hours === 0) return days === 1 ? "1 day" : `${days} days`;
    if (days > 0) return `${days}d ${hours}h`;
    if (hours <= 1) return "1 hour";
    return `${hours} hours`;
  };

  const currentError = placesOp.error?.message || geocodeOp.error?.message || "";

  return (
    <>
      <AgentLoadingDialog isOpen={placesOp.isPending} agentName="Place Finder Agent" />
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="mb-8 text-center sm:mb-10">
          <h2 className="mb-3 text-3xl sm:text-5xl" style={{ color: "var(--brand-ink)" }}>
            Plan your <span className="t-gradient-text">adventure</span>
          </h2>
          <p className="mx-auto max-w-2xl text-base sm:text-lg" style={{ color: "var(--t-stone-600)" }}>
            Set your constraints. The agents will draft a day that fits.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Location & Preferences */}
          <div className="lg:col-span-7 space-y-6">
            {/* Location */}
            <Card className="t-card h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="w-5 h-5" style={{ color: "var(--t-forest-500)" }} /> Location
                </CardTitle>
                <CardDescription>Where do you want to explore?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search a city (e.g., Kolkata, Paris, Tokyo)"
                    {...register("cityQuery")}
                    onKeyDown={(e: React.KeyboardEvent) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleCitySearch();
                      }
                    }}
                    className="h-11 min-w-0 flex-1"
                  />
                  <Button variant="secondary" onClick={handleCitySearch} disabled={geocodeOp.isPending} type="button" className="size-11 shrink-0">
                    {geocodeOp.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  </Button>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1" style={{ background: "var(--t-border)" }} />
                  <span className="text-xs" style={{ color: "var(--t-stone-400)" }}>or</span>
                  <div className="h-px flex-1" style={{ background: "var(--t-border)" }} />
                </div>
                <Button variant="outline" className="h-11 w-full" onClick={requestLocation} disabled={geoLoading} type="button">
                  {geoLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Navigation className="w-4 h-4 mr-2" />}
                  Use My Current Location
                </Button>
                {effectiveLocation && (
                  <div className="space-y-1 rounded-xl border p-3" style={{ background: "#fde8d6", borderColor: "#f3b98a", color: "#9a4514" }}>
                    <div className="flex items-center gap-2 text-sm font-bold">
                      <MapPin className="size-4" />
                      {geocodeReverseOp.isPending ? (
                        <span className="flex items-center gap-2 italic font-normal opacity-60">
                          <Loader2 className="w-3 h-3 animate-spin" /> Resolving location...
                        </span>
                      ) : (
                        resolvedCity || "Location Selected"
                      )}
                    </div>
                    <div className="text-xs ml-6 flex items-center gap-1">
                      <Navigation className="w-2.5 h-2.5" />
                      {effectiveLocation.lat.toFixed(6)}, {effectiveLocation.lng.toFixed(6)}
                    </div>
                  </div>
                )}

                <div className="h-px" style={{ background: "var(--t-border)" }} />

                <div className="space-y-3">
                  <span className="text-xs font-semibold" style={{ color: "var(--t-stone-400)" }}>FROM (YOUR STARTING POINT)</span>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., Delhi, Mumbai"
                      value={sourceQuery}
                      onChange={(e) => setSourceQuery(e.target.value)}
                      onKeyDown={(e: React.KeyboardEvent) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleSourceSearch();
                        }
                      }}
                      className="h-11 min-w-0 flex-1"
                    />
                    <Button variant="secondary" onClick={handleSourceSearch} disabled={sourceGeocodeOp.isPending} type="button" size="sm">
                      {sourceGeocodeOp.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleSourceGeolocation} type="button" className="w-full text-xs">
                    <Navigation className="w-3 h-3 mr-1" /> Use My Current Location
                  </Button>
                  {sourceLocation && (
                    <div className="flex items-center gap-2 rounded-xl border p-2 text-sm" style={{ background: "#fff6e8", borderColor: "#f4ae52", color: "#8a4a1c" }}>
                      <Navigation className="w-3.5 h-3.5 shrink-0" />
                      <span className="font-medium truncate">{sourceCity || "Location set"}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card className="t-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-5 h-5" style={{ color: "var(--t-amber-500)" }} /> Preferences
                  <span className="text-xs font-normal" style={{ color: "var(--t-stone-400)" }}>(optional)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => toggleCategory(cat)}
                      className="min-h-10 rounded-xl px-4 py-2 text-sm font-semibold capitalize transition-transform duration-200 active:scale-95"
                      style={{
                        background: selectedCategories.includes(cat) ? "var(--t-forest-600)" : "var(--t-sand-50)",
                        color: selectedCategories.includes(cat) ? "white" : "var(--t-stone-600)",
                        border: `1px solid ${selectedCategories.includes(cat) ? "var(--t-forest-600)" : "var(--t-sand-200)"}`,
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Time, Budget, Group */}
          <div className="lg:col-span-5 space-y-6">
            {/* Time */}
            <Card className="t-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5" style={{ color: "var(--t-sky-600)" }} /> Time
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm" style={{ color: "var(--t-stone-500)" }}>Available duration?</span>
                  <Badge className="t-badge-nature text-base px-3 py-1 font-mono">{formatTime(time[0]!)}</Badge>
                </div>
                <Controller
                  name="time"
                  control={control}
                  render={({ field }) => (
                    <Slider
                      value={field.value}
                      onValueChange={field.onChange}
                      min={MIN_DURATION_MINUTES}
                      max={MAX_DURATION_MINUTES}
                      step={60}
                    />
                  )}
                />
                <div className="flex justify-between text-xs" style={{ color: "var(--t-stone-400)" }}>
                  <span>1 hour</span><span>14 days</span>
                </div>
              </CardContent>
            </Card>

            {/* Budget */}
            <Card className="t-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Wallet className="w-5 h-5" style={{ color: "var(--t-amber-600)" }} /> Budget
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
                  <Label style={{ color: "var(--t-stone-500)" }} className="whitespace-nowrap">Total budget</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 2000"
                    {...register("budget")}
                    className="h-11 flex-1"
                    style={errors.budget ? { borderColor: "#b04010" } : undefined}
                  />
                </div>
                {errors.budget && <p className="mt-1 text-xs" style={{ color: "#b04010" }}>{errors.budget.message}</p>}
              </CardContent>
            </Card>

            {/* Group */}
            <Card className="t-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Users className="w-5 h-5" style={{ color: "var(--t-terra-500)" }} /> Group
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {groupTypes.map((gt) => (
                    <button
                      key={gt.value}
                      type="button"
                      onClick={() => {
                        setValue("groupType", gt.value);
                        if (gt.value === "solo") setValue("groupSize", "1");
                        if (gt.value === "couple") setValue("groupSize", "2");
                      }}
                      className="min-h-16 rounded-xl border p-3 text-center transition-transform duration-200 active:scale-95"
                      style={{
                        borderColor: groupType === gt.value ? "var(--t-forest-400)" : "var(--t-border)",
                        background: groupType === gt.value ? "var(--t-forest-50)" : "transparent",
                        color: groupType === gt.value ? "var(--t-forest-700)" : "var(--t-stone-600)",
                      }}
                    >
                      <div className="flex justify-center mb-1">{gt.icon}</div>
                      <div className="text-xs font-medium">{gt.label}</div>
                    </button>
                  ))}
                </div>
                {(groupType === "family" || groupType === "friends") && (
                  <div className="flex gap-3 items-center">
                    <Label style={{ color: "var(--t-stone-500)" }} className="whitespace-nowrap">Group size</Label>
                    <Input
                      type="number"
                      min="2"
                      max="50"
                      {...register("groupSize")}
                      className="w-24"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {currentError && (
          <div className="text-sm text-center rounded-xl p-3 mt-8" style={{ background: "var(--t-terra-50)", color: "var(--t-terra-700)", border: "1px solid var(--t-terra-200)" }}>
            {currentError}
          </div>
        )}

        <div className="mx-auto mt-8 max-w-2xl sm:mt-10">
          <Button
            type="submit"
            size="lg"
            className="t-btn-primary h-auto min-h-14 w-full rounded-2xl px-4 py-4 text-base whitespace-normal sm:py-5 sm:text-lg"
            disabled={placesOp.isPending || !effectiveLocation}
          >
            {placesOp.isPending ? (
              "Finding places..."
            ) : (
              <><Leaf className="size-5" /> Start discovery <ArrowRight className="size-5" /></>
            )}
          </Button>
        </div>
      </form>
    </>
  );
}
