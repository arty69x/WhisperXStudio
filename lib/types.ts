export type ModuleId =
  | "Overview"
  | "Workspace"
  | "Forge"
  | "Vault"
  | "Archive"
  | "Reader"
  | "Summary"
  | "History"
  | "Readiness"
  | "Docs"
  | "Slides"
  | "Topology"
  | "AI"
  | "Contacts"
  | "Budget";

export type CanvasEntityType =
  | "doc"
  | "slide"
  | "deck"
  | "topology"
  | "topology-node"
  | "archive-record"
  | "reader-panel"
  | "summary-panel"
  | "history-timeline"
  | "readiness-panel"
  | "ai-chat-panel"
  | "ai-task-panel"
  | "forge-blueprint"
  | "forge-matrix"
  | "forge-result"
  | "vault-preview"
  | "contact-panel"
  | "budget-panel"
  | "code-preview"
  | "markdown-preview"
  | "media-preview"
  | "pdf-preview"
  | "comparison-panel";

export type VisualMode = "panel" | "focus" | "split";

export type CanvasEntity = {
  id: string;
  type: CanvasEntityType;
  module: ModuleId;
  title: string;
  subtitle: string;
  linkedSourceIds: string[];
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  minimized: boolean;
  collapsed: boolean;
  pinned: boolean;
  locked: boolean;
  groupId: string | null;
  visualMode: VisualMode;
  payload: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type NormalizedKind = "text" | "image" | "pdf" | "office" | "archive" | "binary";
export type RenderType = "text" | "markdown" | "code" | "image" | "pdf" | "metadata";

export type EmbeddedRecord = {
  id: string;
  name: string;
  title: string;
  ext: string;
  mime: string;
  size: number;
  tags: string[];
  sourceCategory: string;
  origin: string;
  summary: string;
  searchableText: string;
  parsedText: string;
  base64Fallback?: string;
  rawPathReference: string;
  createdAt: string;
  updatedAt: string;
};

export type NormalizedRecord = {
  id: string;
  name: string;
  ext: string;
  mime: string;
  size: number;
  kind: NormalizedKind;
  renderType: RenderType;
  text: string;
  base64: string;
  arrayBuffer: string;
  previewUrl: string;
  summary: string;
  analysis: string;
  routingHints: string[];
  sourceReferences: string[];
  capabilities: {
    previewable: boolean;
    searchable: boolean;
    sendToForge: boolean;
    sendToReader: boolean;
    sendToSummary: boolean;
  };
};

export type DocRecord = {
  id: string;
  title: string;
  outline: string[];
  body: string;
  linkedSourceIds: string[];
  updatedAt: string;
};

export type SlideRecord = {
  id: string;
  title: string;
  bullets: string[];
  sourceIds: string[];
};

export type DeckRecord = {
  id: string;
  title: string;
  slideIds: string[];
  updatedAt: string;
};

export type ContactRecord = {
  id: string;
  name: string;
  group: string;
  role: string;
  focus: string;
};

export type BudgetRecord = {
  id: string;
  category: string;
  planned: number;
  actual: number;
  status: "on-track" | "watch" | "risk";
};

export type HistoryEvent = {
  id: string;
  module: ModuleId;
  action: string;
  detail: string;
  at: string;
};

export type WorkspacePreset = {
  id: string;
  name: string;
  entityIds: string[];
  zoom: number;
  pan: { x: number; y: number };
  createdAt: string;
};
