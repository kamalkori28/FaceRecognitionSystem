export type User = {
  id: number;
  email: string;
  fullName: string;
  role: string;
};

export type SystemStatus = {
  status: "idle" | "running";
  activeStreams: number;
  knownFaces: number;
  eventSubscribers: number;
  frameIntervalMs: number;
};

export type AttendanceRecord = {
  id: string;
  personId: string;
  name: string;
  employeeCode: string;
  department?: string | null;
  recognizedAt: string;
  sessionKey: string;
  confidence: number;
  source: string;
};

export type Person = {
  id: string;
  name: string;
  employeeCode: string;
  department?: string | null;
  datasetPath: string;
  avatarPath?: string | null;
  imageCount: number;
  isActive: boolean;
  createdAt: string;
};

export type ActivityLog = {
  id: string;
  level: string;
  message: string;
  context: Record<string, unknown>;
  createdAt: string;
};

export type DailyAttendancePoint = {
  date: string;
  count: number;
};

export type AnalyticsSummary = {
  totalEmployees: number;
  todayPresent: number;
  todayAbsent: number;
  dailyAttendance: DailyAttendancePoint[];
};

export type Detection = {
  bbox: {
    top: number;
    right: number;
    bottom: number;
    left: number;
    width: number;
    height: number;
  };
  name: string;
  confidence: number;
  distance: number;
  recognized: boolean;
};

export type RecognitionResult = {
  frame: {
    width: number;
    height: number;
  };
  detections: Detection[];
  newAttendance: AttendanceRecord[];
  latencyMs: number;
  systemStatus: SystemStatus;
   scanResult?: "success" | "already_marked" | "failed" | null;
};

export type OverviewPayload = {
  systemStatus: SystemStatus;
  analytics: AnalyticsSummary;
  recentAttendance: AttendanceRecord[];
  logs: ActivityLog[];
};

