import { AppState, Task, CanvasNode, CanvasEdge } from "../types";
import { THEME } from "../lib/utils";

const SEED_TASKS: Task[] = [
  { id: "t1", title: "Initialize Nexus Core", status: "done", priority: "critical", assignee: "System", tags: ["core", "init"] },
  { id: "t2", title: "Calibrate AI Models", status: "in-progress", priority: "high", assignee: "Admin", tags: ["ai", "tuning"] },
  { id: "t3", title: "Establish Secure Uplink", status: "todo", priority: "medium", assignee: "Network", tags: ["sec", "infra"] },
];

const SEED_NODES: CanvasNode[] = [
  { id: "n1", x: 100, y: 150, w: 160, h: 60, label: "Data Ingestion", type: "trigger", color: THEME.cyan, shape: "circle" },
  { id: "n2", x: 350, y: 150, w: 160, h: 60, label: "AI Processing", type: "ai", color: THEME.violet, shape: "hex" },
  { id: "n3", x: 600, y: 150, w: 160, h: 60, label: "Output Stream", type: "output", color: THEME.emerald, shape: "rect" },
];

const SEED_EDGES: CanvasEdge[] = [
  { id: "e1", from: "n1", to: "n2", animated: true },
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
    { id: "l1", text: "WHISPERX STUDIO OMEGA v3.0 INITIALIZED", type: "sys", timestamp: new Date().toISOString() },
    { id: "l2", text: "Awaiting secure connection...", type: "dim", timestamp: new Date().toISOString() },
  ],
  vault: [],
  evolutions: [],
  toasts: [],
};
