import { formatDistanceToNow } from "date-fns";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { ActivityLog } from "@/lib/types";

const levelStyles: Record<string, string> = {
  system: "text-cyan-300",
  auth: "text-sky-300",
  dataset: "text-amber-300",
  encoding: "text-fuchsia-300",
  recognition: "text-emerald-300",
  attendance: "text-lime-300",
  error: "text-rose-300",
};

export function ActivityLogPanel({ logs }: { logs: ActivityLog[] }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div>
          <CardTitle>Activity Console</CardTitle>
          <CardDescription>Live operational stream from the API, encoding pipeline, and recognition loop.</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="max-h-[360px] space-y-3 overflow-auto rounded-[22px] bg-slate-950/[0.65] p-4 font-mono text-sm">
        {logs.length === 0 ? (
          <p className="text-muted-foreground">System is quiet. New events will stream here.</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-3">
              <div className="mb-1 flex items-center justify-between gap-3">
                <span className={levelStyles[log.level] ?? "text-slate-200"}>[{log.level.toUpperCase()}]</span>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                </span>
              </div>
              <p className="leading-6 text-slate-200">{log.message}</p>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

