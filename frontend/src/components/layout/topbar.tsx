import { Menu, MoonStar, SunMedium } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLiveData } from "@/providers/live-data-provider";
import { useTheme } from "@/providers/theme-provider";
import { useAuth } from "@/providers/auth-provider";

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { systemStatus } = useLiveData();
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-20 mb-6 flex items-center gap-3 rounded-[28px] border border-white/10 bg-white/[0.08] px-5 py-4 backdrop-blur-xl">
      <Button variant="ghost" size="sm" className="md:hidden" onClick={onMenuClick}>
        <Menu className="h-4 w-4" />
      </Button>

      <div className="flex-1">
        <p className="font-display text-xl font-semibold">Premium Recognition Console</p>
        <p className="text-sm text-muted-foreground">Realtime monitoring, dataset ops, and attendance analytics</p>
      </div>

      <Badge className={systemStatus.status === "running" ? "bg-success/[0.15] text-emerald-300" : "bg-white/10 text-muted-foreground"}>
        {systemStatus.status === "running" ? "Running" : "Idle"}
      </Badge>

      <Button variant="outline" size="sm" onClick={toggleTheme}>
        {theme === "dark" ? <SunMedium className="h-4 w-4" /> : <MoonStar className="h-4 w-4" />}
        {theme === "dark" ? "Light" : "Dark"}
      </Button>

      <div className="hidden rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-2 md:block">
        <p className="text-sm font-medium">{user?.fullName}</p>
        <p className="text-xs text-muted-foreground">{user?.email}</p>
      </div>

      <Button variant="ghost" size="sm" onClick={() => void logout()}>
        Logout
      </Button>
    </header>
  );
}

