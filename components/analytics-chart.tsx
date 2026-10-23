"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function AnalyticsChart({ values }: { values: Array<{ label: string; value: number; color: string }> }) {
  if (!values.some((item) => item.value > 0)) return <div className="empty-copy chart-empty">No analytics data is available for this period yet.</div>;
  return <div className="chart-shell analytics-chart"><ResponsiveContainer width="100%" height={220}><BarChart data={values} margin={{ top: 10, right: 8, left: -18, bottom: 0 }}><CartesianGrid stroke="#e5ebf3" vertical={false} /><XAxis dataKey="label" tick={{ fontSize: 10, fill: "#607594" }} tickLine={false} axisLine={false} /><YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#607594" }} tickLine={false} axisLine={false} /><Tooltip cursor={{ fill: "#f3f7fc" }} contentStyle={{ border: "1px solid #e5ebf3", borderRadius: 8, fontSize: 12 }} /><Bar dataKey="value" fill="#0d9f8d" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer></div>;
}
