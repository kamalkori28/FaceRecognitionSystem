import { motion } from "framer-motion";

import { ActivityLogPanel } from "@/components/dashboard/activity-log";
import { AnalyticsChart } from "@/components/dashboard/analytics-chart";
import { AttendanceTable } from "@/components/dashboard/attendance-table";
import { RecognitionPanel } from "@/components/dashboard/recognition-panel";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLiveData } from "@/providers/live-data-provider";

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
};

export function DashboardPage() {
  const { analytics, logs, recentAttendance, systemStatus, loading } = useLiveData();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 lg:grid-cols-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
        <Skeleton className="h-[420px]" />
      </div>
    );
  }

  return (
    <motion.div className="space-y-6" initial="initial" animate="animate" transition={{ staggerChildren: 0.08 }}>
      <motion.div className="grid gap-4 lg:grid-cols-4" variants={fadeUp}>
        <StatsCard title="Employees" value={analytics.totalEmployees} caption="Active people available for recognition." accent="bg-sky-500/30" />
        <StatsCard title="Present Today" value={analytics.todayPresent} caption="Session-safe attendance marked in real time." accent="bg-emerald-500/30" />
        <StatsCard title="Absent Today" value={analytics.todayAbsent} caption="Calculated against registered active employees." accent="bg-rose-500/25" />
        <StatsCard title="System Streams" value={systemStatus.activeStreams} caption="Live recognition sessions currently running." accent="bg-amber-500/30" />
      </motion.div>

      <motion.div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]" variants={fadeUp}>
        <RecognitionPanel />
        <AnalyticsChart data={analytics.dailyAttendance} />
      </motion.div>

      <motion.div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]" variants={fadeUp}>
        <AttendanceTable
          title="Live Attendance Feed"
          description="Most recent successful recognitions across the current operating session."
          records={recentAttendance.slice(0, 8)}
        />
        <ActivityLogPanel logs={logs} />
      </motion.div>
    </motion.div>
  );
}

