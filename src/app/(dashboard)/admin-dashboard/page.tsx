"use client";

import { useEffect, useState, useMemo, use } from "react";
// Helper to get current accent color from CSS variable
function getAccentColor() {
  if (typeof window === "undefined") return "#ec4899"; // fallback
  const color = getComputedStyle(document.documentElement).getPropertyValue("--accent-color");
  return color?.trim() || "#ec4899";
}

import { Button } from "@/components/ui/button";
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

  // Fetch each API independently
  useEffect(() => {
    setLoadingOverview(true);
    fetch("/api/analytics/overview")
      .then(r => r.json())
      .then(res => setOverview(res.data))
      .catch(() => setOverview(null))
      .finally(() => setLoadingOverview(false));
  }, []);
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
    fetch("/api/analytics/tool-breakdown")
      .then(r => r.json())
      .then(res => setToolBreakdown(Array.isArray(res.data) ? res.data : []))
      .catch(() => setToolBreakdown([]))
      .finally(() => setLoadingToolBreakdown(false));
  }, []);
  useEffect(() => {
    setLoadingUsageTrend(true);
    fetch("/api/analytics/usage-trend")
      .then(r => r.json())
      .then(res => setUsageTrend(Array.isArray(res.data) ? res.data : []))
      .catch(() => setUsageTrend([]))
      .finally(() => setLoadingUsageTrend(false));
  }, []);
  useEffect(() => {
    setLoadingRecent(true);
    fetch("/api/analytics/recent")
      .then(r => r.json())
      .then(res => setRecent(Array.isArray(res.data) ? res.data : []))
      .catch(() => setRecent([]))
      .finally(() => setLoadingRecent(false));
  }, []);

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

        {/* Usage by Country Bar Chart */}
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