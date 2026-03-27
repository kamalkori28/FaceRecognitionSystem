import { ArrowUpRight } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function StatsCard({
  title,
  value,
  caption,
  accent,
}: {
  title: string;
  value: string | number;
  caption: string;
  accent: string;
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div>
          <CardDescription>{title}</CardDescription>
          <CardTitle className="mt-2 text-4xl">{value}</CardTitle>
        </div>
        <div className={`rounded-2xl ${accent} p-3 text-white`}>
          <ArrowUpRight className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{caption}</p>
      </CardContent>
    </Card>
  );
}

