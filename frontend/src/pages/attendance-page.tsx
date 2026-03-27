import { useDeferredValue, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { AttendanceTable } from "@/components/dashboard/attendance-table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/lib/api";

export function AttendancePage() {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const historyQuery = useQuery({
    queryKey: ["attendance-history"],
    queryFn: () => api.attendanceHistory(200),
  });

  const filtered = useMemo(() => {
    const value = deferredSearch.toLowerCase().trim();
    return (historyQuery.data?.items ?? []).filter((record) => {
      if (!value) {
        return true;
      }
      return [record.name, record.employeeCode, record.department ?? ""].some((field) =>
        field.toLowerCase().includes(value),
      );
    });
  }, [deferredSearch, historyQuery.data?.items]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Attendance Ledger</CardTitle>
            <CardDescription>Searchable attendance history with confidence metadata and session timestamps.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search by name, employee code, or department"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </CardContent>
      </Card>

      {historyQuery.isLoading ? (
        <Skeleton className="h-[480px]" />
      ) : (
        <AttendanceTable
          title="Historical Attendance"
          description="All captured attendance events stored in SQLite and mirrored to CSV."
          records={filtered}
        />
      )}
    </div>
  );
}

