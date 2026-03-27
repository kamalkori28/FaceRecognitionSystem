import { Cpu, Database, RadioTower, ShieldCheck } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLiveData } from "@/providers/live-data-provider";

const items = [
  {
    title: "Recognition Engine",
    description: "OpenCV preprocessing + face_recognition embeddings over WebSocket frame delivery.",
    icon: Cpu,
  },
  {
    title: "Persistence Layer",
    description: "SQLite by default with SQLAlchemy models ready for PostgreSQL via DATABASE_URL.",
    icon: Database,
  },
  {
    title: "Realtime Layer",
    description: "Dedicated event and recognition WebSocket channels for low-latency UI sync.",
    icon: RadioTower,
  },
  {
    title: "Security",
    description: "JWT-secured REST and WebSocket access with admin-only dashboard controls.",
    icon: ShieldCheck,
  },
];

export function SettingsPage() {
  const { systemStatus } = useLiveData();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>System Settings</CardTitle>
            <CardDescription>Operational reference for deployment, scaling, and recognition tuning.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-[24px] border border-white/[0.08] bg-white/[0.06] p-5">
                <div className="mb-4 inline-flex rounded-2xl bg-primary/[0.15] p-3 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <p className="font-display text-lg font-semibold">{item.title}</p>
                <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Runtime Profile</CardTitle>
            <CardDescription>Current backend system state streamed from the event bus.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.06] p-5">
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="mt-2 text-2xl font-semibold capitalize">{systemStatus.status}</p>
          </div>
          <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.06] p-5">
            <p className="text-sm text-muted-foreground">Known Faces</p>
            <p className="mt-2 text-2xl font-semibold">{systemStatus.knownFaces}</p>
          </div>
          <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.06] p-5">
            <p className="text-sm text-muted-foreground">Event Subscribers</p>
            <p className="mt-2 text-2xl font-semibold">{systemStatus.eventSubscribers}</p>
          </div>
          <div className="rounded-[24px] border border-white/[0.08] bg-white/[0.06] p-5">
            <p className="text-sm text-muted-foreground">Frame Interval</p>
            <p className="mt-2 text-2xl font-semibold">{systemStatus.frameIntervalMs} ms</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

