import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DailyAttendancePoint } from "@/lib/types";

export function AnalyticsChart({ data }: { data: DailyAttendancePoint[] }) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Daily Attendance Pulse</CardTitle>
          <CardDescription>Presence trend across the last seven operating sessions.</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="h-[320px] pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="attendanceFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2dd4bf" stopOpacity={0.55} />
                <stop offset="100%" stopColor="#2dd4bf" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.08)" />
            <XAxis dataKey="date" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              cursor={{ stroke: "rgba(45,212,191,0.4)", strokeWidth: 1 }}
              contentStyle={{
                borderRadius: 18,
                border: "1px solid rgba(255,255,255,0.12)",
                background: "rgba(15, 23, 42, 0.9)",
              }}
            />
            <Area type="monotone" dataKey="count" stroke="#2dd4bf" strokeWidth={3} fill="url(#attendanceFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

