export type ModuleId = "dashboard" | "canvas" | "terminal" | "kanban" | "vault" | "forge" | "settings";
export type AuthTier = 0 | 1 | 2 | 3;

export interface User {
  name: string;
  role: string;
  avatar?: string;
}

export type NodeShape = "rect" | "circle" | "diamond" | "hex";
export type NodeType = "process" | "decision" | "ai" | "data" | "trigger" | "output";

export interface CanvasNode {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  type: NodeType;
  color: string;
  shape: NodeShape;
  data?: Record<string, any>;
}

export interface CanvasEdge {
  id: string;
  from: string;
  to: string;
  animated?: boolean;
  label?: string;
}

export type TaskStatus = "todo" | "in-progress" | "review" | "done";
export type TaskPriority = "low" | "medium" | "high" | "critical";

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  tags: string[];
}

export interface TerminalLog {
  id: string;
  text: string;
  type: "sys" | "user" | "ai" | "err" | "dim" | "success";
  timestamp: string;
}

export interface VaultFile {
  id: string;
  name: string;
  ext: string;
  size: number;
  content: string;
  status: "analyzing" | "done" | "error";
  analysis?: {
    corePurpose: string;
    abilities: string[];
    risks: string[];
  };
}

export interface EvolutionRecord {
  id: string;
  bName: string;
  mName: string;
  ability: string;
  result: string;
  score: number;
  timestamp: string;
}

export interface AppState {
  authTier: AuthTier;
  authUser: User | null;
  activeModule: ModuleId;
  sidebarOpen: boolean;
  apiKey: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  tasks: Task[];
  terminalLogs: TerminalLog[];
  vault: VaultFile[];
  evolutions: EvolutionRecord[];
  toasts: { id: string; msg: string; type: "info" | "success" | "error" }[];
}

export type Action =
  | { type: "SET_AUTH"; tier: AuthTier; user: User | null }
  | { type: "SET_MODULE"; id: ModuleId }
  | { type: "TOGGLE_SIDEBAR" }
  | { type: "SET_API_KEY"; key: string }
  | { type: "ADD_NODE"; node: CanvasNode }
  | { type: "UPDATE_NODE"; id: string; patch: Partial<CanvasNode> }
  | { type: "DELETE_NODE"; id: string }
  | { type: "ADD_EDGE"; edge: CanvasEdge }
  | { type: "DELETE_EDGE"; id: string }
  | { type: "ADD_TASK"; task: Task }
  | { type: "UPDATE_TASK"; id: string; patch: Partial<Task> }
  | { type: "DELETE_TASK"; id: string }
  | { type: "ADD_LOG"; log: Omit<TerminalLog, "id" | "timestamp"> }
  | { type: "CLEAR_LOGS" }
  | { type: "ADD_VAULT_FILE"; file: VaultFile }
  | { type: "UPDATE_VAULT_FILE"; id: string; patch: Partial<VaultFile> }
  | { type: "DELETE_VAULT_FILE"; id: string }
  | { type: "ADD_EVOLUTION"; record: EvolutionRecord }
  | { type: "ADD_TOAST"; msg: string; toastType?: "info" | "success" | "error" }
  | { type: "REMOVE_TOAST"; id: string };
