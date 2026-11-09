import { Link } from "react-router-dom";
import {
  MapPin, Clock, Wallet, Globe, Sparkles,
  Navigation, Compass, SunMedium, ArrowRight,
  Star, Mountain, Trees, Waves,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Reveal } from "@/components/reveal";

const features = [
  {
    icon: Globe,
    title: "Any city",
    description: "From Kolkata to Kyoto, pick a place and get spots worth the trip.",
  },
  {
    icon: Clock,
    title: "Fit to your time",
    description: "One hour or two weeks. The plan matches the time you actually have.",
  },
  {
    icon: Wallet,
    title: "Stay in budget",
    description: "Set a number in rupees. Recommendations stay inside it.",
  },
  {
    icon: SunMedium,
    title: "Season and festival",
    description: "See what is blooming, open, or celebrating while you are there.",
  },
  {
    icon: Navigation,
    title: "Real routes",
    description: "Walk, drive, or ride, with distance and a local tip on each hop.",
  },
  {
    icon: Compass,
    title: "Three agents",
    description: "One finds places, one finds routes, one writes the day.",
  },
];

const steps = [
  {
    title: "Tell your preferences",
    description: "City, budget, time, and who you are traveling with.",
    icon: MapPin,
  },
  {
    title: "Choose the stops",
    description: "Keep the agent's picks or swap in the places you want.",
    icon: Sparkles,
  },
  {
    title: "Leave with a map",
    description: "A timed itinerary, a route, and the cost of the trip.",
    icon: Navigation,
  },
];

const destinations = [
  {
    name: "Kyoto, Japan",
    tag: "Zen and tradition",
    image: `${import.meta.env.BASE_URL}images/kyoto.png`,
    rating: "4.9",
    icon: Trees,
  },
  {
    name: "Santorini, Greece",
    tag: "Coastal light",
    image: `${import.meta.env.BASE_URL}images/santorini.png`,
    rating: "4.8",
    icon: Waves,
  },
  {
    name: "Swiss Alps",
    tag: "Mountain air",
    image: `${import.meta.env.BASE_URL}images/alps.png`,
    rating: "5.0",
    icon: Mountain,
  },
];

export default function LandingPage() {
  return (
    <div className="overflow-x-clip" style={{ background: "var(--t-bg)" }}>
      <section className="relative overflow-hidden t-section-bg">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <div
            className="t-blob absolute -top-24 -left-16 size-72 rounded-full blur-3xl sm:size-96"
            style={{ background: "#f4ae52", opacity: 0.35 }}
          />
          <div
            className="t-blob absolute -right-20 bottom-0 size-80 rounded-full blur-3xl sm:size-[28rem]"
            style={{ background: "#d4621a", opacity: 0.18, animationDelay: "1.5s" }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-4 py-16 text-center sm:px-6 sm:py-24 lg:py-32">

          <h1 className="mx-auto max-w-4xl text-4xl leading-[1.05] font-bold sm:text-6xl lg:text-7xl">
            <span className="t-gradient-text">Explore smarter.</span>
            <br />
            <span style={{ color: "var(--brand-ink)" }}>Travel better.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed sm:text-xl" style={{ color: "var(--t-stone-600)" }}>
            Share your time, budget, and city. ParijAI finds the stops and the route between them.
          </p>

          <div className="mt-10 flex justify-center">
            <Link to="/explore" className="w-full sm:w-auto">
              <Button size="lg" className="t-btn-primary h-auto min-h-12 w-full rounded-2xl px-8 py-4 text-base sm:w-auto sm:text-lg">
                <MapPin className="size-5" />
                Start exploring
                <ArrowRight className="size-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <Reveal>
          <div className="max-w-2xl">
            <p className="text-sm font-semibold tracking-[0.18em] uppercase" style={{ color: "var(--brand-ember)" }}>
              What you get
            </p>
            <h2 className="mt-3 text-3xl sm:text-5xl" style={{ color: "var(--brand-ink)" }}>
              A day that fits the trip you can actually take.
            </h2>
          </div>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Reveal key={feature.title} delay={index * 70}>
              <article className="t-card h-full p-5 sm:p-6">
                <div
                  className="mb-4 flex size-11 items-center justify-center rounded-2xl"
                  style={{ background: "#fde8d6", color: "#d4621a" }}
                >
                  <feature.icon className="size-5" />
                </div>
                <h3 className="text-xl" style={{ color: "var(--brand-ink)" }}>{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--t-stone-600)" }}>
                  {feature.description}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="border-y" style={{ borderColor: "var(--t-border)", background: "#fffbf4" }}>
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <Reveal>
            <h2 className="text-3xl sm:text-5xl" style={{ color: "var(--brand-ink)" }}>Three steps, then you are out the door.</h2>
          </Reveal>
          <ol className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <Reveal key={step.title} delay={index * 90}>
                <li className="t-card h-full p-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold" style={{ color: "var(--brand-gold)" }}>
                      0{index + 1}
                    </span>
                    <step.icon className="size-5" style={{ color: "var(--brand-ember)" }} />
                  </div>
                  <h3 className="mt-6 text-2xl" style={{ color: "var(--brand-ink)" }}>{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: "var(--t-stone-600)" }}>{step.description}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <Reveal>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <h2 className="text-3xl sm:text-5xl" style={{ color: "var(--brand-ink)" }}>Places people keep going back to.</h2>
            <p className="max-w-sm text-sm" style={{ color: "var(--t-stone-600)" }}>
              Start with a city you already love, or type any other name in the planner.
            </p>
          </div>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {destinations.map((place, index) => (
            <Reveal key={place.name} delay={index * 80}>
              <Link to="/explore" className="group block h-full">
                <article className="t-card h-full overflow-hidden">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={place.image}
                      alt={place.name}
                      className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <span
                      className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
                      style={{ background: "rgba(254, 243, 226, 0.92)", color: "var(--brand-ink)" }}
                    >
                      <place.icon className="size-3.5" />
                      {place.tag}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 p-4">
                    <h3 className="text-lg" style={{ color: "var(--brand-ink)" }}>{place.name}</h3>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold" style={{ color: "var(--brand-ember)" }}>
                      <Star className="size-4" style={{ fill: "var(--brand-gold)", color: "var(--brand-gold)" }} />
                      {place.rating}
                    </span>
                  </div>
                </article>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 sm:pb-24">
        <Reveal>
          <div
            className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 rounded-[28px] px-6 py-10 sm:flex-row sm:items-center sm:px-10"
            style={{ background: "var(--brand-ink)", color: "var(--brand-cream)" }}
          >
            <div>
              <h2 className="text-3xl sm:text-4xl" style={{ color: "var(--brand-cream)" }}>Ready when you are.</h2>
              <p className="mt-2 max-w-md text-sm sm:text-base" style={{ color: "#f4ae52" }}>
                No account. Open the planner and build the day.
              </p>
            </div>
            <Link to="/explore" className="w-full sm:w-auto">
              <Button size="lg" className="t-btn-primary h-auto min-h-12 w-full rounded-2xl px-6 py-4 text-base sm:w-auto">
                Plan a trip
                <ArrowRight className="size-5" />
              </Button>
            </Link>
          </div>
        </Reveal>
      </section>

      <footer className="border-t px-4 py-8 text-center text-sm" style={{ borderColor: "var(--t-border)", color: "var(--t-stone-500)" }}>
        made by ANKIT MALLICK
      </footer>
    </div>
  );
}
