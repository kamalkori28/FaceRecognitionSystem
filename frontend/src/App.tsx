import { Navigate, Route, Routes } from "react-router-dom";

import { AppShell } from "@/components/layout/app-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { AttendancePage } from "@/pages/attendance-page";
import { DashboardPage } from "@/pages/dashboard-page";
import { DatasetPage } from "@/pages/dataset-page";
import { LoginPage } from "@/pages/login-page";
import { SettingsPage } from "@/pages/settings-page";
import { useAuth } from "@/providers/auth-provider";

function ProtectedRoutes() {
  const { ready, user } = useAuth();

  if (!ready) {
    return (
      <div className="min-h-screen bg-background bg-aurora p-8">
        <Skeleton className="mx-auto h-[80vh] max-w-7xl rounded-[36px]" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <AppShell />;
}

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route element={<ProtectedRoutes />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/dataset" element={<DatasetPage />} />
        <Route path="/attendance" element={<AttendancePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

