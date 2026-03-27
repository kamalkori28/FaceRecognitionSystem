import { startTransition, useEffect, useMemo, useState } from "react";
import { createContext, useContext } from "react";

import { api, wsUrl } from "@/lib/api";
import type {
  ActivityLog,
  AnalyticsSummary,
  AttendanceRecord,
  OverviewPayload,
  SystemStatus,
} from "@/lib/types";
import { useAuth } from "@/providers/auth-provider";

const defaultStatus: SystemStatus = {
  status: "idle",
  activeStreams: 0,
  knownFaces: 0,
  eventSubscribers: 0,
  frameIntervalMs: 350,
};

const defaultAnalytics: AnalyticsSummary = {
  totalEmployees: 0,
  todayPresent: 0,
  todayAbsent: 0,
  dailyAttendance: [],
};

const LiveDataContext = createContext<{
  loading: boolean;
  systemStatus: SystemStatus;
  analytics: AnalyticsSummary;
  recentAttendance: AttendanceRecord[];
  logs: ActivityLog[];
  refresh: () => Promise<void>;
  prependAttendance: (record: AttendanceRecord) => void;
} | null>(null);

export function LiveDataProvider({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [systemStatus, setSystemStatus] = useState<SystemStatus>(defaultStatus);
  const [analytics, setAnalytics] = useState<AnalyticsSummary>(defaultAnalytics);
  const [recentAttendance, setRecentAttendance] = useState<AttendanceRecord[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  const applyOverview = (payload: OverviewPayload) => {
    startTransition(() => {
      setSystemStatus(payload.systemStatus);
      setAnalytics(payload.analytics);
      setRecentAttendance(payload.recentAttendance);
      setLogs(payload.logs);
      setLoading(false);
    });
  };

  const refresh = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const payload = await api.overview();
    applyOverview(payload);
  };

  useEffect(() => {
    if (!token) {
      setSystemStatus(defaultStatus);
      setAnalytics(defaultAnalytics);
      setRecentAttendance([]);
      setLogs([]);
      setLoading(false);
      return;
    }

    void refresh();
  }, [token]);

  useEffect(() => {
    if (!token) {
      return;
    }

    const socket = new WebSocket(wsUrl("/ws/events", token));
    const heartbeat = window.setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send("ping");
      }
    }, 20_000);

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data) as {
        event: string;
        data: unknown;
      };

      startTransition(() => {
        switch (message.event) {
          case "bootstrap": {
            const payload = message.data as OverviewPayload;
            setSystemStatus(payload.systemStatus);
            setAnalytics(payload.analytics);
            setRecentAttendance(payload.recentAttendance);
            setLogs(payload.logs);
            setLoading(false);
            break;
          }
          case "status:update":
            setSystemStatus(message.data as SystemStatus);
            break;
          case "analytics:update":
            setAnalytics(message.data as AnalyticsSummary);
            break;
          case "attendance:new":
            setRecentAttendance((current) => [message.data as AttendanceRecord, ...current].slice(0, 100));
            break;
          case "log:new":
            setLogs((current) => [message.data as ActivityLog, ...current].slice(0, 80));
            break;
          default:
            break;
        }
      });
    };

    socket.onerror = () => {
      setLoading(false);
    };

    return () => {
      window.clearInterval(heartbeat);
      socket.close();
    };
  }, [token]);

  const value = useMemo(
    () => ({
      loading,
      systemStatus,
      analytics,
      recentAttendance,
      logs,
      refresh,
      prependAttendance: (record: AttendanceRecord) => {
        setRecentAttendance((current) => [record, ...current].slice(0, 100));
      },
    }),
    [analytics, loading, logs, recentAttendance, systemStatus],
  );

  return <LiveDataContext.Provider value={value}>{children}</LiveDataContext.Provider>;
}

export function useLiveData() {
  const context = useContext(LiveDataContext);
  if (!context) {
    throw new Error("useLiveData must be used within LiveDataProvider");
  }
  return context;
}

