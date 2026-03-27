import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableCell, TableHead, TableRow } from "@/components/ui/table";
import type { AttendanceRecord } from "@/lib/types";

export function AttendanceTable({
  title,
  description,
  records,
}: {
  title: string;
  description: string;
  records: AttendanceRecord[];
}) {
  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Badge>{records.length} records</Badge>
      </CardHeader>
      <CardContent className="overflow-auto">
        <Table>
          <thead>
            <tr>
              <TableHead>Name</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Confidence</TableHead>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <TableRow key={record.id}>
                <TableCell className="font-medium">{record.name}</TableCell>
                <TableCell>{record.employeeCode}</TableCell>
                <TableCell>{record.department ?? "Core Ops"}</TableCell>
                <TableCell>{format(new Date(record.recognizedAt), "dd MMM yyyy, hh:mm:ss a")}</TableCell>
                <TableCell>
                  <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300">
                    {record.confidence.toFixed(1)}%
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </CardContent>
    </Card>
  );
}

