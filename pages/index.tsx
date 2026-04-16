import Head from "next/head";
import { useEffect, useMemo, useState } from "react";

type ModuleId =
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

type CanvasEntityType =
  | "doc"
  | "slide"
  | "deck"
  | "topology"
  | "archive-record"
  | "reader-panel"
  | "summary-panel"
  | "history-timeline"
  | "readiness-panel"
  | "ai-chat-panel"
  | "forge-result"
  | "vault-preview"
  | "contact-panel"
  | "budget-panel"
  | "comparison-panel";

type CanvasEntity = {
  id: string;
  type: CanvasEntityType;
  title: string;
  subtitle: string;
  linkedSourceIds: string[];
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  minimized: boolean;
  pinned: boolean;
  locked: boolean;
  visualMode: "panel" | "focus";
  payload: Record<string, string>;
  createdAt: string;
  updatedAt: string;
};

type HistoryEvent = {
  id: string;
  title: string;
  module: ModuleId;
  at: string;
};

const modules: ModuleId[] = [
  "Overview",
  "Workspace",
  "Forge",
  "Vault",
  "Archive",
  "Reader",
  "Summary",
  "History",
  "Readiness",
  "Docs",
  "Slides",
  "Topology",
  "AI",
  "Contacts",
  "Budget"
];

const baseEntities: CanvasEntity[] = [
  makeEntity("overview-01", "summary-panel", "Overview", "Live mission surface", 40, 56),
  makeEntity("vault-01", "vault-preview", "Vault", "Normalized assets", 380, 66),
  makeEntity("archive-01", "archive-record", "Archive", "Embedded legacy records", 760, 76),
  makeEntity("docs-01", "doc", "Docs", "Drafting + source links", 70, 330),
  makeEntity("slides-01", "deck", "Slides", "Visual deck workspace", 470, 352),
  makeEntity("ai-01", "ai-chat-panel", "AI", "Context aware assistant", 860, 336)
];

function makeEntity(id: string, type: CanvasEntityType, title: string, subtitle: string, x: number, y: number): CanvasEntity {
  const stamp = new Date().toISOString();
  return {
    id,
    type,
    title,
    subtitle,
    linkedSourceIds: [],
    x,
    y,
    width: 290,
    height: 190,
    zIndex: 1,
    minimized: false,
    pinned: false,
    locked: false,
    visualMode: "panel",
    payload: {},
    createdAt: stamp,
    updatedAt: stamp
  };
}

function loadSafe<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function HomePage() {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selectedId, setSelectedId] = useState<string>("");
  const [activeModule, setActiveModule] = useState<ModuleId>("Workspace");
  const [entities, setEntities] = useState<CanvasEntity[]>(baseEntities);
  const [history, setHistory] = useState<HistoryEvent[]>([]);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("Ready: AI route status unknown.");

  useEffect(() => {
    const loadedEntities = loadSafe<CanvasEntity[]>("wxs.entities", baseEntities);
    const loadedHistory = loadSafe<HistoryEvent[]>("wxs.history", []);
    setEntities(Array.isArray(loadedEntities) ? loadedEntities : baseEntities);
    setHistory(Array.isArray(loadedHistory) ? loadedHistory : []);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("wxs.entities", JSON.stringify(entities));
      localStorage.setItem("wxs.history", JSON.stringify(history));
    } catch {
      // local fallback only
    }
  }, [entities, history]);

  const selected = useMemo(() => entities.find((item) => item.id === selectedId), [entities, selectedId]);

  const logEvent = (title: string, module: ModuleId) => {
    setHistory((prev) => [
      {
        id: `${Date.now()}`,
        title,
        module,
        at: new Date().toISOString()
      },
      ...prev
    ].slice(0, 32));
  };

  const addPanel = (module: ModuleId) => {
    const id = `${module.toLowerCase()}-${Date.now()}`;
    const next = makeEntity(id, "comparison-panel", `${module} Panel`, "Contextual workspace panel", 120 + entities.length * 24, 100 + entities.length * 20);
    setEntities((prev) => [...prev, { ...next, zIndex: prev.length + 1 }]);
    setSelectedId(id);
    logEvent(`Opened ${module} panel on canvas`, module);
  };

  const moveSelected = (dx: number, dy: number) => {
    if (!selectedId) return;
    setEntities((prev) =>
      prev.map((item) => (item.id === selectedId && !item.locked ? { ...item, x: item.x + dx, y: item.y + dy, updatedAt: new Date().toISOString() } : item))
    );
  };

  const toggleSelected = (kind: "pinned" | "locked" | "minimized") => {
    if (!selectedId) return;
    setEntities((prev) =>
      prev.map((item) => (item.id === selectedId ? { ...item, [kind]: !item[kind], updatedAt: new Date().toISOString() } : item))
    );
  };

  const sendAi = async () => {
    if (!aiPrompt.trim()) return;
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: aiPrompt,
          selected: selected?.title ?? "none",
          moduleName: activeModule
        })
      });
      const data = (await res.json()) as { result?: string; error?: string };
      setAiResponse(data.result ?? data.error ?? "No response.");
      logEvent("Ran AI context assist", "AI");
    } catch {
      setAiResponse("AI unavailable: verify server route and env.");
    }
  };

  return (
    <>
      <Head>
        <title>WhisperXStudio</title>
      </Head>
      <main className="min-h-screen pb-8">
        <section className="pt-4">
          <div className="container mx-auto px-4">
            <header className="mb-4 rounded-xl border border-indigo-400/30 bg-indigo-950/40 p-4 backdrop-blur">
              <h1 className="text-2xl font-semibold">WhisperXStudio</h1>
              <p className="text-sm text-indigo-100/80">Canvas-first production workspace with connected modules, inspector, history, and persistence.</p>
            </header>

            <div className="grid gap-4 lg:grid-cols-[220px_1fr_280px]">
              <aside className="rounded-xl border border-white/15 bg-slate-900/60 p-3">
                <p className="mb-2 text-xs uppercase text-indigo-200/70">Modules</p>
                <div className="grid gap-2">
                  {modules.map((module) => (
                    <button
                      key={module}
                      className={`rounded-md px-3 py-2 text-left text-sm ${activeModule === module ? "bg-indigo-500 text-white" : "bg-slate-800 text-indigo-100 hover:bg-slate-700"}`}
                      onClick={() => setActiveModule(module)}
                      type="button"
                    >
                      {module}
                    </button>
                  ))}
                </div>
                <button className="mt-3 w-full rounded-md bg-emerald-500 px-3 py-2 text-sm font-medium text-black" onClick={() => addPanel(activeModule)} type="button">
                  Open active module on canvas
                </button>
              </aside>

              <div className="rounded-xl border border-white/15 bg-slate-950/70 p-3">
                <div className="mb-2 flex flex-wrap items-center gap-2 text-sm">
                  <button type="button" className="rounded bg-slate-700 px-2 py-1" onClick={() => setZoom((z) => Math.max(0.6, z - 0.1))}>-</button>
                  <span>Zoom {Math.round(zoom * 100)}%</span>
                  <button type="button" className="rounded bg-slate-700 px-2 py-1" onClick={() => setZoom((z) => Math.min(1.8, z + 0.1))}>+</button>
                  <button type="button" className="rounded bg-slate-700 px-2 py-1" onClick={() => setPan({ x: 0, y: 0 })}>Fit</button>
                  <button type="button" className="rounded bg-slate-700 px-2 py-1" onClick={() => setPan((p) => ({ x: p.x - 30, y: p.y }))}>◀</button>
                  <button type="button" className="rounded bg-slate-700 px-2 py-1" onClick={() => setPan((p) => ({ x: p.x + 30, y: p.y }))}>▶</button>
                </div>

                <div className="relative h-[520px] overflow-hidden rounded-lg border border-slate-700 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:24px_24px]">
                  <div className="absolute inset-0" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: "0 0" }}>
                    {entities.map((entity) => (
                      <button
                        key={entity.id}
                        type="button"
                        className={`absolute rounded-lg border p-3 text-left shadow-xl transition ${selectedId === entity.id ? "border-emerald-400 bg-slate-800" : "border-slate-600 bg-slate-900 hover:border-indigo-300"}`}
                        style={{ left: entity.x, top: entity.y, width: entity.width, height: entity.minimized ? 56 : entity.height, zIndex: entity.zIndex }}
                        onClick={() => setSelectedId(entity.id)}
                      >
                        <p className="font-medium">{entity.title}</p>
                        <p className="text-xs text-indigo-100/70">{entity.subtitle}</p>
                        <p className="mt-2 text-[11px] uppercase text-emerald-300/80">{entity.type}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <button type="button" className="rounded bg-slate-700 px-3 py-2 text-sm" onClick={() => moveSelected(-24, 0)}>Move left</button>
                  <button type="button" className="rounded bg-slate-700 px-3 py-2 text-sm" onClick={() => moveSelected(24, 0)}>Move right</button>
                  <button type="button" className="rounded bg-slate-700 px-3 py-2 text-sm" onClick={() => moveSelected(0, -24)}>Move up</button>
                  <button type="button" className="rounded bg-slate-700 px-3 py-2 text-sm" onClick={() => moveSelected(0, 24)}>Move down</button>
                </div>
              </div>

              <aside className="rounded-xl border border-white/15 bg-slate-900/60 p-3">
                <p className="mb-2 text-xs uppercase text-indigo-200/70">Inspector</p>
                {selected ? (
                  <div className="space-y-2 text-sm">
                    <p className="font-semibold">{selected.title}</p>
                    <p className="text-indigo-100/75">{selected.subtitle}</p>
                    <p className="text-xs">Type: {selected.type}</p>
                    <p className="text-xs">Updated: {selected.updatedAt}</p>
                    <div className="grid gap-2 sm:grid-cols-3">
                      <button type="button" className="rounded bg-indigo-500 px-2 py-1 text-xs" onClick={() => toggleSelected("pinned")}>{selected.pinned ? "Unpin" : "Pin"}</button>
                      <button type="button" className="rounded bg-indigo-500 px-2 py-1 text-xs" onClick={() => toggleSelected("locked")}>{selected.locked ? "Unlock" : "Lock"}</button>
                      <button type="button" className="rounded bg-indigo-500 px-2 py-1 text-xs" onClick={() => toggleSelected("minimized")}>{selected.minimized ? "Expand" : "Collapse"}</button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-indigo-100/70">Select a panel to inspect metadata and quick actions.</p>
                )}

                <hr className="my-3 border-white/10" />
                <p className="mb-2 text-xs uppercase text-indigo-200/70">AI context</p>
                <textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} className="h-24 w-full rounded bg-slate-800 p-2 text-sm" placeholder="Ask with current canvas selection" />
                <button type="button" className="mt-2 w-full rounded bg-cyan-400 px-3 py-2 text-sm font-medium text-black" onClick={sendAi}>Run AI assist</button>
                <p className="mt-2 rounded bg-slate-800 p-2 text-xs text-cyan-100">{aiResponse}</p>
              </aside>
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-slate-900/50 p-3">
              <h2 className="mb-2 text-sm font-semibold">History Timeline</h2>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {history.length > 0 ? (
                  history.map((event) => (
                    <article key={event.id} className="rounded-md border border-slate-700 bg-slate-800/70 p-2 text-xs">
                      <p>{event.title}</p>
                      <p className="text-indigo-200/70">{event.module} • {event.at}</p>
                    </article>
                  ))
                ) : (
                  <p className="text-xs text-indigo-100/70">No actions yet. Open a module panel to start building workspace history.</p>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
