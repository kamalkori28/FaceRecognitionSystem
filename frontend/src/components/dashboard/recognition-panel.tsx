import { useEffect, useMemo, useRef } from "react";
import Webcam from "react-webcam";
import { Camera, Radio, ScanFace, Square } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRecognitionSocket } from "@/hooks/use-recognition-socket";
import { useAuth } from "@/providers/auth-provider";
import { useLiveData } from "@/providers/live-data-provider";
import styles from "./recognition-panel.module.css";

export function RecognitionPanel() {
  const webcamRef = useRef<Webcam>(null);
  const inFlightRef = useRef(false);

  const { token } = useAuth();
  const { systemStatus, prependAttendance } = useLiveData();

  const {
    isActive,
    isConnected,
    result,
    error,
    start,
    stop,
    sendFrame,
  } = useRecognitionSocket(token);

  // 🎥 Send frames continuously
  useEffect(() => {
    if (!isActive || !isConnected) return;

    const timer = window.setInterval(() => {
      if (inFlightRef.current) return;

      const image = webcamRef.current?.getScreenshot();
      if (!image) return;

      inFlightRef.current = true;
      sendFrame(image);
    }, systemStatus.frameIntervalMs || 350);

    return () => window.clearInterval(timer);
  }, [isActive, isConnected, sendFrame, systemStatus.frameIntervalMs]);

  // 🔥 MAIN LOGIC (POPUP + STOP)
  useEffect(() => {
    if (!result) return;

    inFlightRef.current = false;

    // ✅ SUCCESS
    if (result.scanResult === "success") {
      result.newAttendance?.forEach((record: any) => {
        prependAttendance(record);
      });

      toast.success("✅ Attendance marked successfully");
      stop();
      return;
    }

    // ⚠️ ALREADY MARKED
    if (result.scanResult === "already_marked") {
      toast.warning("⚠️ Your attendance is already marked");
      stop();
      return;
    }

    // ❌ FAILED
    if (result.scanResult === "failed") {
      toast.error("❌ Face not matched. Please upload dataset");
      stop();
      return;
    }
  }, [result, stop, prependAttendance]);

  // ❌ ERROR HANDLING
  useEffect(() => {
    if (!error) return;

    inFlightRef.current = false;
    toast.error(error);
  }, [error]);

  const detections = result?.detections ?? [];

  const liveMetrics = useMemo(
    () => [
      { label: "Latency", value: `${result?.latencyMs ?? 0} ms` },
      { label: "Faces", value: detections.length },
      { label: "Model", value: "OpenCV + face_recognition" },
    ],
    [detections.length, result?.latencyMs],
  );

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div>
          <CardTitle>Live Recognition Studio</CardTitle>
          <CardDescription>
            Realtime webcam face recognition with smart attendance marking.
          </CardDescription>
        </div>

        <div className="flex items-center gap-2">
          <Badge
            className={
              isActive
                ? "bg-green-500/20 text-green-400"
                : "bg-white/10 text-muted-foreground"
            }
          >
            {isActive ? "Streaming" : "Ready"}
          </Badge>

          {!isActive ? (
            <Button onClick={start}>
              <Radio className="h-4 w-4 mr-2" />
              Start Scan
            </Button>
          ) : (
            <Button variant="outline" onClick={stop}>
              <Square className="h-4 w-4 mr-2" />
              Stop
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="relative aspect-video overflow-hidden rounded-[20px] border border-white/10 bg-black">
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            mirrored
            className="h-full w-full object-cover"
            videoConstraints={{
              width: 1280,
              height: 720,
              facingMode: "user",
            }}
          />

          {/* 🎯 Face Boxes */}
          <div className="pointer-events-none absolute inset-0">
            {detections.map((detection: any, index: number) => {
              const width = result?.frame?.width
                ? (detection.bbox.width / result.frame.width) * 100
                : 0;

              const height = result?.frame?.height
                ? (detection.bbox.height / result.frame.height) * 100
                : 0;

              const left = result?.frame?.width
                ? (detection.bbox.left / result.frame.width) * 100
                : 0;

              const top = result?.frame?.height
                ? (detection.bbox.top / result.frame.height) * 100
                : 0;

              return (
                <div
                  key={index}
                  className={`${styles.detectionBox} absolute border-2 border-green-400 rounded-lg`}
                  style={{
                    left: `${left}%`,
                    top: `${top}%`,
                    width: `${width}%`,
                    height: `${height}%`,
                  }}
                >
                  <div className="absolute -top-6 left-0 text-xs bg-black text-white px-2 py-1 rounded">
                    {detection.name} ({detection.confidence?.toFixed(1)}%)
                  </div>
                </div>
              );
div            })}
          </div>

          {/* 📴 Overlay */}
          {!isActive && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60">
              <ScanFace className="h-10 w-10 text-white" />
              <p className="text-white text-lg font-semibold">
                Recognition paused
              </p>
            </div>
          )}
        </div>

        {/* 📊 Metrics */}
        <div className="grid grid-cols-3 gap-4">
          {liveMetrics.map((metric) => (
            <div
              key={metric.label}
              className="p-4 rounded-lg bg-white/5 border border-white/10"
            >
              <p className="text-sm text-muted-foreground">{metric.label}</p>
              <p className="text-lg font-semibold">{metric.value}</p>
            </div>
          ))}
        </div>

        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <Camera className="h-4 w-4" />
          Frames captured every {systemStatus.frameIntervalMs} ms
        </div>
      </CardContent>
    </Card>
  );
}