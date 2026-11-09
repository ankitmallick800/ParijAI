import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Navbar from "@/components/navbar";
import LandingPage from "@/pages/landing-page";
import ExplorePage from "@/pages/explore-page";
import ResultsPage from "@/pages/results-page";
import { ExploreProvider } from "@/context/explore-provider";
import PreferencesPage from "./pages/explore/preferences-page";
import PlacesPage from "./pages/explore/places-page";
import RoutesPage from "./pages/explore/routes-page";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
    mutations: {
      retry: 0,
    },
  },
});

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <div key={location.pathname} className="t-page-enter">
      <Routes location={location}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/explore" element={<ExplorePage />}>
          <Route index element={<Navigate to="preferences" replace />} />
          <Route path="preferences" element={<PreferencesPage />} />
          <Route path="places" element={<PlacesPage />} />
          <Route path="routes" element={<RoutesPage />} />
        </Route>
        <Route path="/results" element={<ResultsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ExploreProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, "") || undefined}>
          <Navbar />
          <main className="min-h-[calc(100vh-var(--nav-h))]">
            <AnimatedRoutes />
          </main>
        </BrowserRouter>
      </ExploreProvider>
    </QueryClientProvider>
  );
}

export default App;
