import { embeddedRecords } from "../data/embeddedRecords";
import { normalizeEmbeddedRecords } from "./ingestion";
import type { BudgetRecord, CanvasEntity, ContactRecord, DeckRecord, DocRecord, HistoryEvent, ModuleId, WorkspacePreset, SlideRecord } from "./types";

const now = new Date("2026-04-16T00:00:00.000Z").toISOString();

function entity(id: string, module: ModuleId, type: CanvasEntity["type"], title: string, subtitle: string, x: number, y: number): CanvasEntity {
  return {
    id,
    module,
    type,
    title,
    subtitle,
    linkedSourceIds: [],
    x,
    y,
    width: 320,
    height: 220,
    zIndex: 1,
    minimized: false,
    collapsed: false,
    pinned: false,
    locked: false,
    groupId: null,
    visualMode: "panel",
    payload: {},
    createdAt: now,
    updatedAt: now
  };
}

export const moduleIds: ModuleId[] = ["Overview", "Workspace", "Forge", "Vault", "Archive", "Reader", "Summary", "History", "Readiness", "Docs", "Slides", "Topology", "AI", "Contacts", "Budget"];

export const initialEntities: CanvasEntity[] = [
  entity("overview-main", "Overview", "summary-panel", "Overview Surface", "Runtime, readiness, and routing", 40, 48),
  entity("workspace-main", "Workspace", "comparison-panel", "Workspace Hub", "Cross-module split operations", 420, 60),
  entity("forge-main", "Forge", "forge-blueprint", "Forge Fusion", "Blueprint and matrix transforms", 820, 70),
  entity("archive-main", "Archive", "archive-record", "Archive Lineage", "Embedded source continuity", 120, 340),
  entity("reader-main", "Reader", "reader-panel", "Reader Workstation", "Search and compare records", 520, 360),
  entity("ai-main", "AI", "ai-chat-panel", "AI Context", "Selection-aware assistant", 900, 350)
].map((item, index) => ({ ...item, zIndex: index + 1 }));

export const initialDocs: DocRecord[] = [
  {
    id: "doc-1",
    title: "Production Readiness Narrative",
    outline: ["Current runtime", "Gaps", "Action plan"],
    body: "# Production Readiness\n\nWhisperXStudio now runs as one canvas-first workspace with module-aware routing.",
    linkedSourceIds: ["src-readme", "src-blueprint"],
    updatedAt: now
  }
];

export const initialSlides: SlideRecord[] = [
  { id: "slide-1", title: "Runtime Map", bullets: ["One shell", "One canvas", "One state"], sourceIds: ["src-index"] },
  { id: "slide-2", title: "Archive Continuity", bullets: ["Raw + embedded", "Searchable", "Reader-ready"], sourceIds: ["src-readme", "src-blueprint"] }
];

export const initialDecks: DeckRecord[] = [{ id: "deck-1", title: "WhisperXStudio Ops Deck", slideIds: ["slide-1", "slide-2"], updatedAt: now }];

export const initialContacts: ContactRecord[] = [
  { id: "contact-1", name: "Mila Torres", group: "Product", role: "Program Lead", focus: "Operational roadmap" },
  { id: "contact-2", name: "Evan Boyd", group: "Platform", role: "Systems Engineer", focus: "Canvas runtime quality" },
  { id: "contact-3", name: "Priya Nair", group: "Research", role: "AI Specialist", focus: "Prompt workflows" }
];

export const initialBudget: BudgetRecord[] = [
  { id: "budget-1", category: "Platform", planned: 70000, actual: 66400, status: "on-track" },
  { id: "budget-2", category: "AI Ops", planned: 28000, actual: 30100, status: "watch" },
  { id: "budget-3", category: "Delivery", planned: 40000, actual: 45000, status: "risk" }
];

export const initialHistory: HistoryEvent[] = [{ id: "evt-1", module: "Overview", action: "boot", detail: "Initialized canvas runtime", at: now }];

export const initialPresets: WorkspacePreset[] = [{ id: "preset-core", name: "Core Operations", entityIds: ["overview-main", "workspace-main", "archive-main", "reader-main"], zoom: 1, pan: { x: 0, y: 0 }, createdAt: now }];

export const embeddedArchive = embeddedRecords;
export const normalizedArchive = normalizeEmbeddedRecords(embeddedRecords);
