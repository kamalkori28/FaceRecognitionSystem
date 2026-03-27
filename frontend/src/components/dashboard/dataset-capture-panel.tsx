import { useEffect, useMemo, useRef, useState } from "react";
import Webcam from "react-webcam";
import { Cpu, DatabaseZap, RefreshCcw, ScanFace, UserPlus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableCell, TableHead, TableRow } from "@/components/ui/table";
import { api } from "@/lib/api";

const TARGET_IMAGES = 24;

export function DatasetCapturePanel() {
  const webcamRef = useRef<Webcam>(null);
  const timerRef = useRef<number | null>(null);
  const [name, setName] = useState("");
  const [employeeCode, setEmployeeCode] = useState("");
  const [department, setDepartment] = useState("");
  const [captured, setCaptured] = useState<string[]>([]);
  const [capturing, setCapturing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [encoding, setEncoding] = useState(false);

  const peopleQuery = useQuery({
    queryKey: ["persons"],
    queryFn: api.persons,
  });

  const progress = useMemo(() => Math.round((captured.length / TARGET_IMAGES) * 100), [captured.length]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, []);

  const startAutoCapture = () => {
    setCaptured([]);
    setCapturing(true);
    timerRef.current = window.setInterval(() => {
      const shot = webcamRef.current?.getScreenshot();
      if (!shot) {
        return;
      }

      setCaptured((current) => {
        const next = [...current, shot];
        if (next.length >= TARGET_IMAGES && timerRef.current) {
          window.clearInterval(timerRef.current);
          timerRef.current = null;
          setCapturing(false);
          toast.success("Training images captured", {
            description: `${TARGET_IMAGES} frames are ready for upload.`,
          });
        }
        return next;
      });
    }, 240);
  };

  const stopCapture = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setCapturing(false);
  };

  const savePerson = async () => {
    if (!name || !employeeCode || captured.length < 20) {
      toast.error("Capture at least 20 images and complete the profile first.");
      return;
    }

    setSaving(true);
    try {
      const personResponse = await api.createPerson({ name, employeeCode, department });
      await api.uploadImages(personResponse.item.id, captured);
      await peopleQuery.refetch();
      setName("");
      setEmployeeCode("");
      setDepartment("");
      setCaptured([]);
      toast.success("Dataset profile saved", {
        description: `${personResponse.item.name} is ready for encoding.`,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save dataset profile");
    } finally {
      setSaving(false);
    }
  };

  const rebuildEncodings = async () => {
    setEncoding(true);
    try {
      const result = await api.rebuildEncodings();
      toast.success("Encodings rebuilt", {
        description: `${result.encodings} embeddings generated from ${result.imagesProcessed} images.`,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Encoding failed");
    } finally {
      setEncoding(false);
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Dataset Builder</CardTitle>
            <CardDescription>Capture 20 to 30 clean training frames per employee directly from the browser webcam.</CardDescription>
          </div>
          <Badge>{captured.length}/{TARGET_IMAGES} frames</Badge>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 md:grid-cols-3">
            <Input placeholder="Full name" value={name} onChange={(event) => setName(event.target.value)} />
            <Input placeholder="Employee code" value={employeeCode} onChange={(event) => setEmployeeCode(event.target.value)} />
            <Input placeholder="Department" value={department} onChange={(event) => setDepartment(event.target.value)} />
          </div>

          <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-slate-950/70">
            <Webcam
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              mirrored
              className="aspect-video w-full object-cover"
              videoConstraints={{ width: 1280, height: 720, facingMode: "user" }}
            />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-[22px] border border-white/10 bg-slate-950/[0.65] px-4 py-3 backdrop-blur-xl">
              <div>
                <p className="text-sm font-medium">Capture Quality</p>
                <p className="text-xs text-muted-foreground">Keep the face centered and vary angles slightly for stronger embeddings.</p>
              </div>
              <div className="w-40 rounded-full bg-white/10">
                <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {!capturing ? (
              <Button onClick={startAutoCapture}>
                <ScanFace className="h-4 w-4" />
                Auto Capture
              </Button>
            ) : (
              <Button variant="outline" onClick={stopCapture}>
                Stop Capture
              </Button>
            )}
            <Button variant="secondary" onClick={() => void savePerson()} disabled={saving}>
              <UserPlus className="h-4 w-4" />
              {saving ? "Saving..." : "Save Person"}
            </Button>
            <Button variant="outline" onClick={() => void rebuildEncodings()} disabled={encoding}>
              <DatabaseZap className="h-4 w-4" />
              {encoding ? "Encoding..." : "Rebuild Encodings"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Registered People</CardTitle>
            <CardDescription>Current dataset coverage and encoding-ready profiles.</CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={() => void peopleQuery.refetch()}>
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-[22px] border border-white/[0.08] bg-white/[0.06] p-4">
              <p className="text-sm text-muted-foreground">Profiles</p>
              <p className="mt-2 text-3xl font-semibold">{peopleQuery.data?.items.length ?? 0}</p>
            </div>
            <div className="rounded-[22px] border border-white/[0.08] bg-white/[0.06] p-4">
              <p className="text-sm text-muted-foreground">Pipeline</p>
              <p className="mt-2 flex items-center gap-2 text-lg font-semibold">
                <Cpu className="h-4 w-4 text-primary" />
                Ready for inference
              </p>
            </div>
          </div>

          <div className="max-h-[360px] overflow-auto rounded-[22px] border border-white/[0.08]">
            <Table>
              <thead>
                <tr>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Images</TableHead>
                </tr>
              </thead>
              <tbody>
                {peopleQuery.data?.items.map((person) => (
                  <TableRow key={person.id}>
                    <TableCell className="font-medium">{person.name}</TableCell>
                    <TableCell>{person.employeeCode}</TableCell>
                    <TableCell>{person.imageCount}</TableCell>
                  </TableRow>
                ))}
              </tbody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

