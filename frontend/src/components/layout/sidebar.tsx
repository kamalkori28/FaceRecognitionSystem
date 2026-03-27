import { BellRing, Camera, LayoutDashboard, Settings, UsersRound } from "lucide-react";
import { NavLink } from "react-router-dom";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/dataset", label: "Dataset", icon: Camera },
  { to: "/attendance", label: "Attendance", icon: UsersRound },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ mobileOpen, onClose }: { mobileOpen: boolean; onClose: () => void }) {
  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-30 bg-slate-950/[0.55] backdrop-blur-sm transition md:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 flex h-screen w-[290px] flex-col border-r border-white/10 bg-slate-950/75 px-5 py-6 backdrop-blur-2xl transition-transform duration-300 md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="font-display text-2xl font-bold">FaceNova</p>
            <p className="text-sm text-muted-foreground">AI Attendance Cloud</p>
          </div>
          <Badge className="bg-primary/[0.15] text-primary">v2026</Badge>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                end={item.to === "/"}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300",
                    isActive
                      ? "bg-white/[0.14] text-white shadow-[0_20px_40px_rgba(15,23,42,0.28)]"
                      : "text-muted-foreground hover:bg-white/[0.08] hover:text-white",
                  )
                }
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-auto rounded-[24px] border border-white/10 bg-white/[0.06] p-4">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-2xl bg-primary/20 p-3 text-primary">
              <BellRing className="h-4 w-4" />
            </div>
            <div>
              <p className="font-medium">Realtime Ops</p>
              <p className="text-sm text-muted-foreground">WebSocket event bus active</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Low-latency recognition, live attendance sync, and analytics refresh in one operator console.
          </p>
        </div>
      </aside>
    </>
  );
}

