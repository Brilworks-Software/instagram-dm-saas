"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { Search, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
// Helper to get current accent color from CSS variable
function getAccentColor() {
  if (typeof window === "undefined") return "#ec4899"; // fallback
  const color = getComputedStyle(document.documentElement).getPropertyValue("--accent-color");
  return color?.trim() || "#ec4899";
}

import { Badge } from "@/components/ui/badge";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsivePie } from "@nivo/pie";
import { ResponsiveLine } from "@nivo/line";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getCurrentUserFromClientSide } from "@/hooks/use-user-workspace";

type Overview = { totalUsage: number; uniqueInstaIds: number; toolTypes: number };
type Location = { country: string; total: number };
type ToolBreakdown = { toolType: string; total: number };
type UsageTrend = { day: string; total: number };
type Recent = { id: string; toolType: string; instaId: string; createdAt: string; location: any };

// Searchable Country Selector Component
interface SearchableCountrySelectorProps {
  value: string;
  onChange: (country: string) => void;
  countries: Location[];
  accentColor: string;
}

function SearchableCountrySelector({
  value,
  onChange,
  countries,
  accentColor,
}: SearchableCountrySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedCountry = countries.find((c) => c.country === value);
  const selectedLabel = selectedCountry
    ? `${selectedCountry.country} (${selectedCountry.total})`
    : "All Countries";

  // Filter countries based on search query
  const filteredCountries = countries.filter((c) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return c.country?.toLowerCase()?.includes(query) || false;
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
        setHighlightedIndex(0);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "Escape":
        setIsOpen(false);
        setSearchQuery("");
        setHighlightedIndex(0);
        break;
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          Math.min(prev + 1, filteredCountries.length)
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex === 0) {
          // "All Countries" option
          onChange("");
          setIsOpen(false);
          setSearchQuery("");
          setHighlightedIndex(0);
        } else if (filteredCountries[highlightedIndex - 1]) {
          onChange(filteredCountries[highlightedIndex - 1].country);
          setIsOpen(false);
          setSearchQuery("");
          setHighlightedIndex(0);
        }
        break;
    }
  };

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && listRef.current) {
      const highlightedElement = listRef.current.querySelector(
        `[data-index="${highlightedIndex}"]`
      );
      if (highlightedElement) {
        highlightedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleSelect = (country: string) => {
    onChange(country);
    setIsOpen(false);
    setSearchQuery("");
    setHighlightedIndex(0);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSearchQuery("");
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div ref={containerRef} className="relative min-w-[250px]">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className="w-full px-4 py-2.5 rounded-lg bg-background-secondary border border-border text-foreground focus:border-accent outline-none focus:ring-2 focus:ring-accent/20 flex items-center justify-between transition-colors hover:border-accent/50"
        style={{ borderColor: value ? accentColor : undefined }}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="Select country">
        <span className="text-left truncate text-sm font-medium">{selectedLabel}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-foreground-muted transition-transform flex-shrink-0 ml-2",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-background-secondary border !border-border-hover rounded-lg shadow-xl max-h-80 overflow-hidden" style={{ borderColor: accentColor }}>
          {/* Search Input */}
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setHighlightedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search countries..."
                className="w-full pl-9 pr-8 py-2 rounded-md bg-background border border-border text-foreground placeholder:text-foreground-muted focus:border-accent !outline-none !ring-0 text-sm"
                aria-label="Search countries"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-background-elevated rounded"
                  aria-label="Clear search">
                  <X className="h-3 w-3 text-foreground-muted" />
                </button>
              )}
            </div>
          </div>

          {/* Country List */}
          <div
            ref={listRef}
            className="overflow-y-auto max-h-64"
            role="listbox"
            aria-label="Country options">
            {filteredCountries.length === 0 && searchQuery ? (
              <div className="px-4 py-8 text-center text-sm text-foreground-muted">
                No countries found
              </div>
            ) : (
              <>
                {/* "All Countries" option */}
                <button
                  type="button"
                  data-index={0}
                  onClick={() => handleSelect("")}
                  className={cn(
                    "w-full px-4 py-2.5 text-left text-sm transition-colors",
                    "hover:bg-background-elevated focus:bg-background-elevated focus:outline-none",
                    !value && "bg-accent/10 font-medium",
                    highlightedIndex === 0 &&
                      value &&
                      "bg-background-elevated"
                  )}
                  style={!value ? { color: accentColor } : {}}
                  role="option"
                  aria-selected={!value}>
                  All Countries
                </button>
                {filteredCountries.map((country, index) => {
                  const itemIndex = index + 1;
                  const isSelected = country.country === value;
                  const isHighlighted = itemIndex === highlightedIndex;

                  return (
                    <button
                      key={country.country}
                      type="button"
                      data-index={itemIndex}
                      onClick={() => handleSelect(country.country)}
                      className={cn(
                        "w-full px-4 py-2.5 text-left text-sm transition-colors",
                        "hover:bg-background-elevated focus:bg-background-elevated focus:outline-none",
                        isSelected && "bg-accent/10 font-medium",
                        isHighlighted &&
                          !isSelected &&
                          "bg-background-elevated"
                      )}
                      style={isSelected ? { color: accentColor } : {}}
                      role="option"
                      aria-selected={isSelected}>
                      <div className="flex items-center justify-between">
                        <span>{country.country}</span>
                        <span className="text-xs text-foreground-muted ml-2">
                          {country.total}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  // Accent color state (update on mount and when theme changes)
  const [accentColor, setAccentColor] = useState("#ec4899");
  useEffect(() => {
    function updateAccent() {
      setAccentColor(getAccentColor());
    }
    updateAccent();
    // Listen for theme/accent changes (optional: use a MutationObserver for more robustness)
    window.addEventListener("storage", updateAccent);
    return () => window.removeEventListener("storage", updateAccent);
  }, []);

  // Replace direct call with async state management
  const [user, setUser] = useState<any>(null);
  const [userLoading, setUserLoading] = useState(true);

  useEffect(() => {
    getCurrentUserFromClientSide()
      .then(u => setUser(u))
      .catch(() => setUser(null))
      .finally(() => setUserLoading(false));
  }, []);

  useEffect(() => {
    if(user) console.log("Current user:", user);
  }, [user]);

  const [overview, setOverview] = useState<Overview | null>(null);
  const [location, setLocation] = useState<Location[]>([]);
  const [toolBreakdown, setToolBreakdown] = useState<ToolBreakdown[]>([]);
  const [usageTrend, setUsageTrend] = useState<UsageTrend[]>([]);
  const [recent, setRecent] = useState<Recent[]>([]);

  // Add loading states for each API
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [loadingToolBreakdown, setLoadingToolBreakdown] = useState(true);
  const [loadingUsageTrend, setLoadingUsageTrend] = useState(true);
  const [loadingRecent, setLoadingRecent] = useState(true);

  // Country filter state
  const [selectedCountry, setSelectedCountry] = useState<string>("");

  // Fetch each API independently with country filter
  useEffect(() => {
    setLoadingOverview(true);
    const url = selectedCountry 
      ? `/api/analytics/overview?country=${encodeURIComponent(selectedCountry)}`
      : "/api/analytics/overview";
    fetch(url)
      .then(r => r.json())
      .then(res => setOverview(res.data))
      .catch(() => setOverview(null))
      .finally(() => setLoadingOverview(false));
  }, [selectedCountry]);
  // Always fetch all countries for the dropdown (don't filter)
  useEffect(() => {
    setLoadingLocation(true);
    fetch("/api/analytics/location")
      .then(r => r.json())
      .then(res => setLocation(Array.isArray(res.data) ? res.data : []))
      .catch(() => setLocation([]))
      .finally(() => setLoadingLocation(false));
  }, []);
  useEffect(() => {
    setLoadingToolBreakdown(true);
    const url = selectedCountry 
      ? `/api/analytics/tool-breakdown?country=${encodeURIComponent(selectedCountry)}`
      : "/api/analytics/tool-breakdown";
    fetch(url)
      .then(r => r.json())
      .then(res => setToolBreakdown(Array.isArray(res.data) ? res.data : []))
      .catch(() => setToolBreakdown([]))
      .finally(() => setLoadingToolBreakdown(false));
  }, [selectedCountry]);
  useEffect(() => {
    setLoadingUsageTrend(true);
    const url = selectedCountry 
      ? `/api/analytics/usage-trend?country=${encodeURIComponent(selectedCountry)}`
      : "/api/analytics/usage-trend";
    fetch(url)
      .then(r => r.json())
      .then(res => setUsageTrend(Array.isArray(res.data) ? res.data : []))
      .catch(() => setUsageTrend([]))
      .finally(() => setLoadingUsageTrend(false));
  }, [selectedCountry]);
  useEffect(() => {
    setLoadingRecent(true);
    const url = selectedCountry 
      ? `/api/analytics/recent?country=${encodeURIComponent(selectedCountry)}`
      : "/api/analytics/recent";
    fetch(url)
      .then(r => r.json())
      .then(res => setRecent(Array.isArray(res.data) ? res.data : []))
      .catch(() => setRecent([]))
      .finally(() => setLoadingRecent(false));
  }, [selectedCountry]);

  // Always fallback to empty array if location is not array
  const safeLocation = Array.isArray(location) ? location : [];
  const barData = safeLocation.map(l => ({ country: l.country, usage: l.total }));

  // Pie chart data: top 9 tool types, rest grouped as "Other"
  const safeToolBreakdown = Array.isArray(toolBreakdown) ? toolBreakdown : [];
  const pieData = useMemo(() => {
    if (!Array.isArray(safeToolBreakdown) || safeToolBreakdown.length === 0) {
      return [];
    }
    if (safeToolBreakdown.length <= 9) {
      return safeToolBreakdown.map(t => ({ id: t.toolType, value: t.total }));
    }
    const sorted = [...safeToolBreakdown].sort((a, b) => b.total - a.total);
    const top9 = sorted.slice(0, 9);
    const otherTotal = sorted.slice(9).reduce((sum, t) => sum + t.total, 0);
    return [
      ...top9.map(t => ({ id: t.toolType, value: t.total })),
      { id: "Other", value: otherTotal }
    ];
  }, [safeToolBreakdown]);

  const safeUsageTrend = Array.isArray(usageTrend) ? usageTrend : [];
  const lineData = [
    {
      id: "Usage",
      data: safeUsageTrend.map(u => ({
        x: u && u.day ? new Date(u.day).toLocaleDateString() : "-",
        y: u && typeof u.total === "number" ? u.total : 0
      })),
    },
  ];

  // Memoized sorted tool breakdown for ranking table
  const rankedTools = useMemo(
    () =>
      Array.isArray(safeToolBreakdown)
        ? [...safeToolBreakdown]
            .sort((a, b) => b.total - a.total)
            .map((t, i) => ({
              rank: i + 1,
              ...t,
            }))
        : [],
    [safeToolBreakdown]
  );

  // Helper for recent activity country (move outside component for lint)
  function getCountry(loc: any) {
    if (!loc) return "-";
    if (typeof loc === "object" && loc.country_name) return loc.country_name;
    if (typeof loc === "string") try { const o = JSON.parse(loc); return o.country_name || "-"; } catch { return "-"; }
    return "-";
  }

  // Add fade-in animation styles (no accent shadow)
  const fadeInClass = "animate-fade-in";
  const fadeInKeyframes = `
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(16px);}
    to { opacity: 1; transform: none;}
  }
  .animate-fade-in {
    animation: fade-in 0.7s cubic-bezier(.4,0,.2,1) both;
  }
  `;

  // Loader component (simple spinner)
  function Loader() {
    return (
      <div className="flex items-center justify-center h-24">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2" style={{ borderColor: `${accentColor} ${accentColor} #e5e7eb #e5e7eb` }}></div>
      </div>
    );
  }

  // Fallback UI for empty/error states
  function Fallback({ message }: { message: string }) {
    return (
      <div className="flex items-center justify-center h-24 text-zinc-400 text-base font-semibold">
        {message}
      </div>
    );
  }

  // Always fallback to empty array if recent is not array
  const safeRecent = Array.isArray(recent) ? recent : [];

  // Access control logic
  if (userLoading) {
    return (
      <>
        <style>{fadeInKeyframes}</style>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg text-white"><Loader /></div>
        </div>
      </>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return (
      <>
        <style>{fadeInKeyframes}</style>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-2xl font-bold text-red-500">Only admin is allowed to access this page</div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{fadeInKeyframes}</style>
      <div className="p-4 md:p-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-extrabold mb-1 text-white tracking-tight drop-shadow-lg" style={{ color: accentColor }}>Admin Analytics Dashboard</h1>
            <p className="text-foreground-muted font-medium">Rich analytics, world map, and detailed breakdowns</p>
          </div>
            <SearchableCountrySelector
              value={selectedCountry}
              onChange={setSelectedCountry}
              countries={safeLocation}
              accentColor={accentColor}
            />
      </div>

        {/* Stats Cards */}
  <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${fadeInClass}`}>
          {/* Total Usage */}
          <Card className="rounded-2xl border border-border bg-gradient-to-br from-zinc-900/80 to-zinc-800/80 shadow-xl hover:scale-[1.025] hover:shadow-2xl transition-all duration-300 group">
            <CardHeader className="font-bold text-white">Total Usage</CardHeader>
            <CardContent>
              {loadingOverview ? <Loader /> : (
                overview && typeof overview.totalUsage === "number"
                  ? <>
                      <div className="text-3xl font-extrabold text-white mb-2">{overview.totalUsage}</div>
                      <Badge variant="accent" >All time</Badge>
                    </>
                  : <Fallback message="No data available" />
              )}
            </CardContent>
          </Card>
          {/* Unique Users */}
          <Card className="rounded-2xl border border-border bg-gradient-to-br from-zinc-900/80 to-zinc-800/80 shadow-xl hover:scale-[1.025] hover:shadow-2xl transition-all duration-300 group">
            <CardHeader className="font-bold text-white">Unique Users</CardHeader>
            <CardContent>
              {loadingOverview ? <Loader /> : (
                overview && typeof overview.uniqueInstaIds === "number"
                  ? <>
                      <div className="text-3xl font-extrabold text-white mb-2">{overview.uniqueInstaIds}</div>
                      <Badge variant="success" >All time</Badge>
                    </>
                  : <Fallback message="No data available" />
              )}
            </CardContent>
          </Card>
          {/* Tool Types */}
          <Card className="rounded-2xl border border-border bg-gradient-to-br from-zinc-900/80 to-zinc-800/80 shadow-xl hover:scale-[1.025] hover:shadow-2xl transition-all duration-300 group">
            <CardHeader className="font-bold text-white">Tool Types</CardHeader>
            <CardContent>
              {loadingOverview ? <Loader /> : (
                overview && typeof overview.toolTypes === "number"
                  ? <>
                      <div className="text-3xl font-extrabold text-white mb-2">{overview.toolTypes}</div>
                      <Badge variant="warning" >Distinct</Badge>
                    </>
                  : <Fallback message="No data available" />
              )}
            </CardContent>
          </Card>
          {/* Countries */}
          <Card className="rounded-2xl border border-border bg-gradient-to-br from-zinc-900/80 to-zinc-800/80 shadow-xl hover:scale-[1.025] hover:shadow-2xl transition-all duration-300 group">
            <CardHeader className="font-bold text-white">Countries</CardHeader>
            <CardContent>
              {loadingLocation ? <Loader /> : (
                safeLocation.length > 0
                  ? <>
                      <div className="text-3xl font-extrabold text-white mb-2">{safeLocation.length}</div>
                      <Badge variant="default" >Global Reach</Badge>
                    </>
                  : <Fallback message="No data available" />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Usage by Country Bar Chart - Hidden when filtering by specific country */}
        {!selectedCountry && (
          <div className={`grid grid-cols-1 lg:grid-cols-1 gap-8 ${fadeInClass}`}>
            <Card className="h-[400px] rounded-2xl border border-border bg-gradient-to-br from-zinc-900/80 to-zinc-800/80 shadow-xl">
              <CardHeader className="font-bold text-white">Usage by Country</CardHeader>
              <CardContent className="h-full">
                {loadingLocation ? <Loader /> : (
                  barData.length > 0
                    ? <div className="h-72">
                        <ResponsiveBar
                          data={barData}
                          keys={["usage"]}
                          indexBy="country"
                          margin={{ top: 20, right: 30, bottom: 40, left: 50 }}
                          padding={0.3}
                          colors={[accentColor]}
                          axisBottom={{
                            tickSize: 5,
                            tickPadding: 5,
                            tickRotation: 0,
                            legend: "Country",
                            legendPosition: "middle",
                            legendOffset: 32
                          }}
                          axisLeft={{
                            tickSize: 5,
                            tickPadding: 5,
                            tickRotation: 0,
                            legend: "Usage",
                            legendPosition: "middle",
                            legendOffset: -40
                          }}
                          theme={{
                            axis: { ticks: { text: { fill: accentColor } }, legend: { text: { fill: accentColor } } },
                            legends: { text: { fill: accentColor } },
                            tooltip: {
                              container: { 
                                background: "#18181b", 
                                color: "#fff", 
                                borderRadius: 10, 
                                border: `1px solid ${accentColor}`,
                                padding: "12px 16px",
                                fontWeight: 600,
                                fontSize: "0.6rem"
                              }
                            }
                          }}
                          animate={true}
                          motionConfig="wobbly"
                          enableLabel={false}
                          tooltip={({ id, value, indexValue }) => (
                            <div style={{
                              background: "#18181b",
                              color: "#fff",
                              borderRadius: 10,
                              boxShadow: "0 4px 32px #0008",
                              border: `1px solid ${accentColor}`,
                              padding: "12px 16px",
                              fontWeight: 600,
                              fontSize: "0.6rem",
                              minWidth: 220
                            }}>
                              <div style={{ fontWeight: 700, fontSize: "0.8rem", marginBottom: 4 }}>{indexValue}</div>
                              <div style={{ color: "#a1a1aa", fontSize: "0.7rem" }}>Usage: <span style={{ color: "#fff" }}>{value}</span></div>
                            </div>
                          )}
                        />
                      </div>
                    : <Fallback message="No country data" />
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Pie & Rank Table */}
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 ${fadeInClass}`}>
          {/* Pie Chart */}
          <Card className="h-[400px] rounded-2xl border border-border bg-gradient-to-br from-zinc-900/80 to-zinc-800/80 shadow-xl flex flex-col">
            <CardHeader className="font-bold text-white">Tool Usage Breakdown</CardHeader>
            <CardContent className="h-full flex items-center justify-center">
              {loadingToolBreakdown ? <Loader /> : (
                pieData.length > 0
                  ? <div className="h-72 w-full">
                      <ResponsivePie
                        data={pieData}
                        margin={{ top: 40, right: 80, bottom: 40, left: 80 }}
                        innerRadius={0.5}
                        padAngle={1}
                        cornerRadius={5}
                        activeOuterRadiusOffset={16}
                        colors={[accentColor]}
                        borderWidth={2}
                        borderColor={{ from: "color", modifiers: [["darker", 0.5]] }}
                        arcLinkLabelsTextColor={accentColor}
                        arcLabelsTextColor="#fff"
                        arcLabelsSkipAngle={10}
                        arcLabel={d => `${d.value}`}
                        theme={{
                          legends: { text: { fill: accentColor } },
                          tooltip: { 
                            container: { 
                              background: "#18181b", 
                              color: "#fff", 
                              borderRadius: 10, 
                              border: `1px solid ${accentColor}`,
                              padding: "12px 16px",
                              fontWeight: 600,
                              fontSize: "0.6rem"
                            } 
                          }
                        }}
                        animate={true}
                        motionConfig="wobbly"
                        tooltip={({ datum }) => (
                          <div style={{
                            background: "#18181b",
                            color: "#fff",
                            borderRadius: 10,
                            boxShadow: "0 4px 32px #0008",
                            border: `1px solid ${accentColor}`,
                            padding: "12px 16px",
                            fontWeight: 600,
                            fontSize: "0.6rem",
                            minWidth: 220
                          }}>
                            <div style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: 4 }}>{datum.id}</div>
                            <div style={{ color: "#a1a1aa", fontSize: "0.7rem" }}>Usage: <span style={{ color: "#fff" }}>{datum.value}</span></div>
                            <div style={{ color: "#a1a1aa", fontSize: "0.7rem" }}>
                              {((datum.value / (pieData.reduce((a, b) => a + b.value, 0) || 1)) * 100).toFixed(1)}%
                            </div>
                          </div>
                        )}
                      />
                    </div>
                  : <Fallback message="No tool breakdown data" />
              )}
            </CardContent>
          </Card>
          {/* Rank Table */}
          <Card className="h-[400px] rounded-2xl border border-border bg-gradient-to-br from-zinc-900/80 to-zinc-800/80 shadow-xl flex flex-col">
            <CardHeader className="font-bold text-white">Tool Usage Ranking</CardHeader>
            <CardContent className="h-full overflow-auto">
              {loadingToolBreakdown ? <Loader /> : (
                rankedTools.length > 0
                  ? <table className="min-w-full text-sm">
                      <thead>
                        <tr className="bg-background-tertiary">
                          <th className="px-4 py-2 text-left text-white">Rank</th>
                          <th className="px-4 py-2 text-left text-white">Tool</th>
                          <th className="px-4 py-2 text-left text-white">Usage</th>
                          <th className="px-4 py-2 text-left text-white">%</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rankedTools.map((tool) => (
                          <tr key={tool.toolType} className="hover:bg-zinc-800/60 transition">
                            <td className="px-4 py-2 font-bold" style={{ color: accentColor }}>{tool.rank}</td>
                            <td className="px-4 py-2 text-white">{tool.toolType}</td>
                            <td className="px-4 py-2 text-white">{tool.total}</td>
                            <td className="px-4 py-2 text-white">
                              {((tool.total / (pieData.reduce((a, b) => a + b.value, 0) || 1)) * 100).toFixed(1)}%
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  : <Fallback message="No ranking data" />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Line Chart & Recent Activity Table */}
        <div className={`grid grid-cols-1 gap-8 ${fadeInClass}`}>
          {/* Line Chart */}
          <Card className="h-[400px] rounded-2xl border border-border bg-gradient-to-br from-zinc-900/80 to-zinc-800/80 shadow-xl">
            <CardHeader className="font-bold text-white">Usage Trend Over Time</CardHeader>
            <CardContent className="h-full">
              {loadingUsageTrend ? <Loader /> : (
                lineData[0].data.length > 0 && lineData[0].data.some(d => d.y > 0)
                  ? <div className="h-72">
                      <ResponsiveLine
                        data={lineData}
                        margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
                        xScale={{ type: "point" }}
                        yScale={{ type: "linear", min: 0, max: "auto", stacked: false, reverse: false }}
                        axisTop={null}
                        axisRight={null}
                        axisBottom={{
                          tickSize: 5,
                          tickPadding: 5,
                          tickRotation: 0,
                          legend: "Date",
                          legendOffset: 36,
                          legendPosition: "middle",
                        }}
                        axisLeft={{
                          tickSize: 5,
                          tickPadding: 5,
                          tickRotation: 0,
                          legend: "Usage",
                          legendOffset: -40,
                          legendPosition: "middle",
                        }}
                        colors={[accentColor]}
                        pointSize={8}
                        pointColor={{ theme: "background" }}
                        pointBorderWidth={2}
                        pointBorderColor={{ from: "color", modifiers: [["darker", 0.5]] }}
                        enableGridX={true}
                        enableGridY={true}
                        enableArea={true}
                        areaOpacity={0.15}
                        theme={{
                          axis: { ticks: { text: { fill: accentColor } }, legend: { text: { fill: accentColor } } },
                          legends: { text: { fill: accentColor } },
                          tooltip: { container: { background: "#18181b", color: "#fff", borderRadius: 8, border: `1px solid ${accentColor}` } }
                        }}
                        animate={true}
                        motionConfig="wobbly"
                        tooltip={({ point }) => (
                          <div style={{
                            background: "#18181b",
                            color: "#fff",
                            borderRadius: 10,
                            boxShadow: "0 4px 32px #0008",
                            border: `1px solid ${accentColor}`,
                            padding: "12px 16px",
                            fontWeight: 600,
                            fontSize: "0.6rem",
                            minWidth: 220
                          }}>
                            <div style={{ fontWeight: 700, fontSize: "0.8rem", marginBottom: 4 }}>{point.data.x}</div>
                            <div style={{ color: "#a1a1aa", fontSize: "0.7rem" }}>Usage: <span style={{ color: "#fff" }}>{point.data.y}</span></div>
                          </div>
                        )}
                      />
                    </div>
                  : <Fallback message="No trend data" />
              )}
            </CardContent>
          </Card>
          {/* Recent Activity Table */}
          <Card className="h-[400px] rounded-2xl border border-border bg-gradient-to-br from-zinc-900/80 to-zinc-800/80 shadow-xl flex flex-col">
            <CardHeader className="font-bold text-white">Recent Activity</CardHeader>
            <CardContent className="h-full overflow-auto">
              {loadingRecent ? <Loader /> : (
                safeRecent.length > 0
                  ? <table className="min-w-full text-sm">
                      <thead>
                        <tr className="bg-background-tertiary">
                          <th className="px-4 py-2 text-left text-white">Tool</th>
                          <th className="px-4 py-2 text-left text-white">User</th>
                          <th className="px-4 py-2 text-left text-white">Date</th>
                          <th className="px-4 py-2 text-left text-white">Location</th>
                        </tr>
                      </thead>
                      <tbody>
                        {safeRecent.map((activity) => (
                          <tr key={activity.id} className="hover:bg-zinc-800/60 transition">
                            <td className="px-4 py-2 text-white">{activity.toolType}</td>
                            <td className="px-4 py-2 text-white">{activity.instaId}</td>
                            <td className="px-4 py-2 text-white">{activity.createdAt ? new Date(activity.createdAt).toLocaleString() : "-"}</td>
                            <td className="px-4 py-2 text-white">{getCountry(activity.location)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  : <Fallback message="No recent activity" />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}