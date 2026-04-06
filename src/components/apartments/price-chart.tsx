"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { TrendingUp, TrendingDown, Minus, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type FloorPlanSeries = {
  floorPlanId: string;
  name: string;
  bedrooms: number;
  currentPrice: number;
  currentPriceMax: number | null;
  dataPoints: { date: string; priceMin: number; priceMax: number | null }[];
};

type PriceHistoryData = {
  floorPlans: FloorPlanSeries[];
  aggregate: { date: string; priceMin: number; priceMax: number }[];
  hasHistory: boolean;
};

const COLORS = ["#BF5700", "#2563eb", "#16a34a", "#9333ea", "#dc2626", "#ca8a04"];

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatCurrency(value: number) {
  return `$${value.toLocaleString()}`;
}

export function PriceChart({ slug }: { slug: string }) {
  const [data, setData] = useState<PriceHistoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"aggregate" | "floorplans">("aggregate");

  useEffect(() => {
    fetch(`/api/apartments/${slug}/price-history`)
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="h-48 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-burnt-orange border-t-transparent rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || !data.hasHistory) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-burnt-orange" />
            Price Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-text-muted">
            <BarChart3 className="h-12 w-12 mx-auto mb-3 text-text-muted" />
            <p className="font-medium">No price history yet</p>
            <p className="text-sm mt-1">
              Price trends will appear here after the first weekly snapshot
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const agg = data.aggregate;
  const priceChange =
    agg.length >= 2 ? agg[agg.length - 1].priceMin - agg[0].priceMin : 0;
  const percentChange =
    agg.length >= 2 && agg[0].priceMin > 0
      ? ((priceChange / agg[0].priceMin) * 100).toFixed(1)
      : "0";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-burnt-orange" />
            Price Trends
          </CardTitle>
          <div className="flex items-center gap-2">
            {priceChange !== 0 && (
              <div
                className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-lg ${
                  priceChange > 0
                    ? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950"
                    : "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950"
                }`}
              >
                {priceChange > 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : priceChange < 0 ? (
                  <TrendingDown className="h-4 w-4" />
                ) : (
                  <Minus className="h-4 w-4" />
                )}
                {priceChange > 0 ? "+" : ""}
                {percentChange}%
              </div>
            )}
            <div className="flex bg-surface-raised rounded-lg p-0.5">
              <button
                onClick={() => setView("aggregate")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  view === "aggregate"
                    ? "bg-surface text-text-primary shadow-sm"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setView("floorplans")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  view === "floorplans"
                    ? "bg-surface text-text-primary shadow-sm"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                By Floor Plan
              </button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {view === "aggregate" ? (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={agg}>
                <defs>
                  <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#BF5700" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#BF5700" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={formatCurrency}
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  axisLine={false}
                  tickLine={false}
                  width={70}
                />
                <Tooltip
                  formatter={((value: number) => [formatCurrency(value), "Price"]) as never}
                  labelFormatter={((label: string) => formatDate(label)) as never}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="priceMin"
                  stroke="#BF5700"
                  strokeWidth={2}
                  fill="url(#priceGrad)"
                  name="Starting at"
                />
                <Line
                  type="monotone"
                  dataKey="priceMax"
                  stroke="#BF570060"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                  name="Up to"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  axisLine={false}
                  tickLine={false}
                  allowDuplicatedCategory={false}
                />
                <YAxis
                  tickFormatter={formatCurrency}
                  tick={{ fontSize: 12, fill: "#6b7280" }}
                  axisLine={false}
                  tickLine={false}
                  width={70}
                />
                <Tooltip
                  formatter={((value: number, name: string) => [
                    formatCurrency(value),
                    name,
                  ]) as never}
                  labelFormatter={((label: string) => formatDate(label)) as never}
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e5e7eb",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  }}
                />
                {data.floorPlans
                  .filter((fp) => fp.dataPoints.length > 0)
                  .map((fp, i) => (
                    <Line
                      key={fp.floorPlanId}
                      data={fp.dataPoints}
                      type="monotone"
                      dataKey="priceMin"
                      stroke={COLORS[i % COLORS.length]}
                      strokeWidth={2}
                      dot={{ r: 3, fill: COLORS[i % COLORS.length] }}
                      name={fp.name}
                    />
                  ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {view === "floorplans" && (
          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-border-base">
            {data.floorPlans
              .filter((fp) => fp.dataPoints.length > 0)
              .map((fp, i) => (
                <div key={fp.floorPlanId} className="flex items-center gap-2 text-sm">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}
                  />
                  <span className="text-text-secondary">{fp.name}</span>
                </div>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
