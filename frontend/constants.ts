import { AppState, Task, CanvasNode, CanvasEdge } from "./types";

export const THEME = {
  bg: "#010105",
  panel: "#0c0c2d",
  rose: "#ff0055",
  violet: "#7000ff",
  emerald: "#00f5a0",
  amber: "#ffcc00",
  cyan: "#00d4ff",
  text: "#f0f2f5",
  muted: "rgba(148,163,184,0.55)",
  border: "rgba(255,255,255,0.08)",
};

const SEED_TASKS: Task[] = [
  { id: "t1", title: "Initialize Nexus Core", status: "done", priority: "critical", assignee: "System" },
  { id: "t2", title: "Calibrate AI Models", status: "in-progress", priority: "high", assignee: "Admin" },
  { id: "t3", title: "Establish Secure Uplink", status: "todo", priority: "medium", assignee: "Network" },
];

const SEED_NODES: CanvasNode[] = [
  { id: "n1", x: 100, y: 100, w: 160, h: 60, label: "Data Ingestion", type: "source", color: THEME.cyan },
  { id: "n2", x: 350, y: 100, w: 160, h: 60, label: "AI Processing", type: "process", color: THEME.violet },
  { id: "n3", x: 600, y: 100, w: 160, h: 60, label: "Output Stream", type: "sink", color: THEME.emerald },
];

const SEED_EDGES: CanvasEdge[] = [
  { id: "e1", from: "n1", to: "n2" },
  { id: "e2", from: "n2", to: "n3" },
];

export const INITIAL_STATE: AppState = {
  authTier: 0,
  authUser: null,
  activeModule: "dashboard",
  sidebarOpen: true,
  apiKey: "",
  nodes: SEED_NODES,
  edges: SEED_EDGES,
  tasks: SEED_TASKS,
  terminalLogs: [
    { id: "l1", text: "WHISPERX NEXUS OMEGA v3.0 INITIALIZED", type: "sys", timestamp: new Date().toISOString() },
    { id: "l2", text: "Awaiting secure connection...", type: "dim", timestamp: new Date().toISOString() },
  ],
};
