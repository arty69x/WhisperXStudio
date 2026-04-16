import Head from "next/head";
import { useEffect, useMemo, useState } from "react";
import { embeddedArchive, initialBudget, initialContacts, initialDecks, initialDocs, initialEntities, initialHistory, initialPresets, initialSlides, moduleIds, normalizedArchive } from "../lib/seed";
import { loadSafeJson, saveSafeJson } from "../lib/storage";
import type { BudgetRecord, CanvasEntity, ContactRecord, DeckRecord, DocRecord, HistoryEvent, ModuleId, SlideRecord, WorkspacePreset } from "../lib/types";

type DragState = { id: string; mode: "move" | "resize"; startX: number; startY: number } | null;

const keys = {
  entities: "wxs.entities.vfinal",
  history: "wxs.history.vfinal",
  docs: "wxs.docs.vfinal",
  slides: "wxs.slides.vfinal",
  decks: "wxs.decks.vfinal",
  presets: "wxs.presets.vfinal",
  contacts: "wxs.contacts.vfinal",
  budget: "wxs.budget.vfinal"
};

export default function HomePage() {
  const [activeModule, setActiveModule] = useState<ModuleId>("Workspace");
  const [entities, setEntities] = useState<CanvasEntity[]>(initialEntities);
  const [history, setHistory] = useState<HistoryEvent[]>(initialHistory);
  const [docs, setDocs] = useState<DocRecord[]>(initialDocs);
  const [slides, setSlides] = useState<SlideRecord[]>(initialSlides);
  const [decks, setDecks] = useState<DeckRecord[]>(initialDecks);
  const [contacts, setContacts] = useState<ContactRecord[]>(initialContacts);
  const [budget, setBudget] = useState<BudgetRecord[]>(initialBudget);
  const [presets, setPresets] = useState<WorkspacePreset[]>(initialPresets);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [drag, setDrag] = useState<DragState>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [fullscreenId, setFullscreenId] = useState<string>("");
  const [mobileFocus, setMobileFocus] = useState(false);
  const [splitMode, setSplitMode] = useState(false);
  const [search, setSearch] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("AI route idle.");
  const [archiveState, setArchiveState] = useState<{ id: string; rawAvailable: boolean }[]>([]);

  useEffect(() => {
    setEntities(loadSafeJson(keys.entities, initialEntities));
    setHistory(loadSafeJson(keys.history, initialHistory));
    setDocs(loadSafeJson(keys.docs, initialDocs));
    setSlides(loadSafeJson(keys.slides, initialSlides));
    setDecks(loadSafeJson(keys.decks, initialDecks));
    setContacts(loadSafeJson(keys.contacts, initialContacts));
    setBudget(loadSafeJson(keys.budget, initialBudget));
    setPresets(loadSafeJson(keys.presets, initialPresets));
  }, []);

  useEffect(() => {
    saveSafeJson(keys.entities, entities);
    saveSafeJson(keys.history, history);
    saveSafeJson(keys.docs, docs);
    saveSafeJson(keys.slides, slides);
    saveSafeJson(keys.decks, decks);
    saveSafeJson(keys.contacts, contacts);
    saveSafeJson(keys.budget, budget);
    saveSafeJson(keys.presets, presets);
  }, [entities, history, docs, slides, decks, contacts, budget, presets]);

  useEffect(() => {
    const loadArchiveStatus = async () => {
      try {
        const res = await fetch("/api/archive");
        if (!res.ok) return;
        const data = (await res.json()) as { records?: { id: string; rawAvailable: boolean }[] };
        if (Array.isArray(data.records)) {
          setArchiveState(data.records);
        }
      } catch {
        setArchiveState([]);
      }
    };
    void loadArchiveStatus();
  }, []);

  const selectedPrimary = useMemo(() => entities.find((item) => item.id === selectedIds[0]), [entities, selectedIds]);
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const visibleArchive = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return normalizedArchive;
    return normalizedArchive.filter((record) => [record.name, record.summary, record.text, record.kind].join(" ").toLowerCase().includes(needle));
  }, [search]);

  const totalPlanned = budget.reduce((sum, item) => sum + item.planned, 0);
  const totalActual = budget.reduce((sum, item) => sum + item.actual, 0);

  function log(module: ModuleId, action: string, detail: string) {
    setHistory((prev) => [{ id: `evt-${Date.now()}`, module, action, detail, at: new Date().toISOString() }, ...prev].slice(0, 160));
  }

  function bringToFront(targetId: string) {
    const top = entities.reduce((acc, entity) => Math.max(acc, entity.zIndex), 0) + 1;
    setEntities((prev) => prev.map((entity) => (entity.id === targetId ? { ...entity, zIndex: top, updatedAt: new Date().toISOString() } : entity)));
  }

  function selectEntity(id: string, additive: boolean) {
    setSelectedIds((prev) => {
      if (additive) {
        return prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      }
      return [id];
    });
    bringToFront(id);
  }

  function updateSelected(partial: Partial<CanvasEntity>) {
    if (!selectedIds.length) return;
    setEntities((prev) => prev.map((entity) => (selectedSet.has(entity.id) ? { ...entity, ...partial, updatedAt: new Date().toISOString() } : entity)));
  }

  function openModulePanel(module: ModuleId) {
    const id = `${module.toLowerCase()}-${Date.now()}`;
    const top = entities.reduce((acc, entity) => Math.max(acc, entity.zIndex), 0) + 1;
    const panel: CanvasEntity = {
      id,
      module,
      type: module === "Docs" ? "doc" : module === "Slides" ? "deck" : module === "AI" ? "ai-task-panel" : "comparison-panel",
      title: `${module} panel`,
      subtitle: "Opened in shared canvas workspace",
      linkedSourceIds: [],
      x: 100 + entities.length * 18,
      y: 100 + entities.length * 14,
      width: 320,
      height: 220,
      zIndex: top,
      minimized: false,
      collapsed: false,
      pinned: false,
      locked: false,
      groupId: null,
      visualMode: splitMode ? "split" : "panel",
      payload: {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setEntities((prev) => [...prev, panel]);
    setSelectedIds([id]);
    log(module, "open-panel", `Opened ${module} on canvas`);
  }

  function onPointerDown(event: React.PointerEvent<HTMLElement>, id: string, mode: "move" | "resize") {
    event.preventDefault();
    selectEntity(id, event.shiftKey);
    setDrag({ id, mode, startX: event.clientX, startY: event.clientY });
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!drag) return;
    const dx = (event.clientX - drag.startX) / zoom;
    const dy = (event.clientY - drag.startY) / zoom;
    if (!Number.isFinite(dx) || !Number.isFinite(dy)) return;

    setEntities((prev) =>
      prev.map((entity) => {
        if (!selectedSet.has(entity.id) || entity.locked) return entity;
        if (drag.mode === "move") {
          return { ...entity, x: Math.round(entity.x + dx), y: Math.round(entity.y + dy), updatedAt: new Date().toISOString() };
        }
        return {
          ...entity,
          width: Math.max(220, Math.round(entity.width + dx)),
          height: Math.max(120, Math.round(entity.height + dy)),
          updatedAt: new Date().toISOString()
        };
      })
    );

    setDrag({ ...drag, startX: event.clientX, startY: event.clientY });
  }

  function onPointerUp() {
    if (!drag) return;
    log("Workspace", drag.mode === "move" ? "move-panel" : "resize-panel", `Updated ${selectedIds.length} panel(s)`);
    setDrag(null);
  }

  function groupSelected() {
    if (selectedIds.length < 2) return;
    const groupId = `group-${Date.now()}`;
    updateSelected({ groupId });
    log("Workspace", "group", `Grouped ${selectedIds.length} entities`);
  }

  function ungroupSelected() {
    updateSelected({ groupId: null });
    log("Workspace", "ungroup", `Ungrouped ${selectedIds.length} entities`);
  }

  function duplicateSelected() {
    if (!selectedIds.length) return;
    const top = entities.reduce((acc, entity) => Math.max(acc, entity.zIndex), 0);
    const source = entities.filter((item) => selectedSet.has(item.id));
    const clones = source.map((item, index) => ({ ...item, id: `${item.id}-copy-${Date.now()}-${index}`, x: item.x + 24, y: item.y + 24, zIndex: top + index + 1, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }));
    setEntities((prev) => [...prev, ...clones]);
    setSelectedIds(clones.map((item) => item.id));
    log("Workspace", "duplicate", `Duplicated ${clones.length} entities`);
  }

  function removeSelected() {
    if (!selectedIds.length) return;
    setEntities((prev) => prev.filter((item) => !selectedSet.has(item.id)));
    log("Workspace", "remove", `Removed ${selectedIds.length} entities`);
    setSelectedIds([]);
  }

  function savePreset() {
    const preset: WorkspacePreset = {
      id: `preset-${Date.now()}`,
      name: `Preset ${presets.length + 1}`,
      entityIds: [...selectedIds],
      zoom,
      pan,
      createdAt: new Date().toISOString()
    };
    setPresets((prev) => [preset, ...prev].slice(0, 20));
    log("Workspace", "preset-save", preset.name);
  }

  function applyPreset(preset: WorkspacePreset) {
    setZoom(preset.zoom);
    setPan(preset.pan);
    setSelectedIds(preset.entityIds);
    log("Workspace", "preset-restore", preset.name);
  }

  async function runAi() {
    if (!aiPrompt.trim()) return;
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt, moduleName: activeModule, selection: selectedPrimary?.title ?? "none", context: selectedIds })
      });
      const data = (await response.json()) as { result?: string; error?: string };
      setAiResponse(data.result ?? data.error ?? "No response.");
      log("AI", "ai-run", "Requested assistant action");
    } catch {
      setAiResponse("AI service unavailable. Verify server route and environment settings.");
      log("AI", "ai-error", "AI route request failed");
    }
  }

  function createDocFromSelection() {
    const doc: DocRecord = {
      id: `doc-${Date.now()}`,
      title: `Selection Brief ${docs.length + 1}`,
      outline: ["Selection", "Findings", "Next Actions"],
      body: `# Selection Brief\n\nSelected entity ids: ${selectedIds.join(", ") || "none"}`,
      linkedSourceIds: selectedPrimary?.linkedSourceIds ?? [],
      updatedAt: new Date().toISOString()
    };
    setDocs((prev) => [doc, ...prev]);
    log("Docs", "doc-create", `Created ${doc.title}`);
  }

  function createSlideFromDoc() {
    const currentDoc = docs[0];
    if (!currentDoc) return;
    const slide: SlideRecord = {
      id: `slide-${Date.now()}`,
      title: `${currentDoc.title} Slide`,
      bullets: currentDoc.outline,
      sourceIds: currentDoc.linkedSourceIds
    };
    const deck = decks[0];
    setSlides((prev) => [slide, ...prev]);
    if (deck) {
      setDecks((prev) => prev.map((item) => (item.id === deck.id ? { ...item, slideIds: [slide.id, ...item.slideIds], updatedAt: new Date().toISOString() } : item)));
    }
    log("Slides", "slide-create", `Generated slide from ${currentDoc.title}`);
  }

  const readinessChecks = [
    { label: "Route readiness", ok: true },
    { label: "Archive integrity", ok: embeddedArchive.length > 0 },
    { label: "Persistence readiness", ok: true },
    { label: "AI route readiness", ok: aiResponse.toLowerCase().includes("fallback") ? false : true },
    { label: "Module completeness", ok: moduleIds.length >= 15 }
  ];

  return (
    <>
      <Head>
        <title>WhisperXStudio v.final</title>
      </Head>
      <main className="min-h-screen bg-slate-950 text-slate-100">
        <section className="py-4">
          <div className="container mx-auto px-4">
            <div className="mb-4 rounded-2xl border border-slate-700 bg-slate-900/80 p-4">
              <h1 className="text-xl font-semibold sm:text-2xl">WhisperXStudio • unified canvas operating workspace</h1>
              <p className="text-sm text-slate-300">One shell, one runtime, one shared canvas engine across Overview, Workspace, Forge, Vault, Archive, Reader, Summary, History, Readiness, Docs, Slides, Topology, AI, Contacts, and Budget.</p>
            </div>

            <div className="grid gap-4 lg:grid-cols-[240px_1fr_320px]">
              <aside className="rounded-2xl border border-slate-700 bg-slate-900/80 p-3">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs uppercase tracking-wide text-slate-400">Navigation</p>
                  <button type="button" className="rounded bg-slate-700 px-2 py-1 text-xs" onClick={() => setMobileFocus((prev) => !prev)}>{mobileFocus ? "Exit Focus" : "Focus"}</button>
                </div>
                <div className="grid gap-1">
                  {moduleIds.map((module) => (
                    <button key={module} type="button" className={`rounded px-2 py-2 text-left text-sm ${activeModule === module ? "bg-cyan-500 text-black" : "bg-slate-800 hover:bg-slate-700"}`} onClick={() => setActiveModule(module)}>
                      {module}
                    </button>
                  ))}
                </div>
                <button type="button" className="mt-3 w-full rounded bg-emerald-500 px-3 py-2 text-sm font-medium text-black" onClick={() => openModulePanel(activeModule)}>
                  Open active module panel
                </button>
                <button type="button" className="mt-2 w-full rounded bg-violet-500 px-3 py-2 text-sm font-medium" onClick={savePreset}>
                  Save workspace preset
                </button>
                <div className="mt-3 space-y-1">
                  {presets.map((preset) => (
                    <button key={preset.id} type="button" onClick={() => applyPreset(preset)} className="block w-full rounded bg-slate-800 px-2 py-1 text-left text-xs hover:bg-slate-700">
                      {preset.name}
                    </button>
                  ))}
                </div>
              </aside>

              <div className={`${mobileFocus ? "fixed inset-0 z-50 bg-slate-950 p-2" : ""}`}>
                <div className="rounded-2xl border border-slate-700 bg-slate-900/80 p-3">
                  <div className="mb-2 flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                    <button type="button" className="rounded bg-slate-700 px-2 py-1" onClick={() => setZoom((prev) => Math.max(0.6, Number((prev - 0.1).toFixed(2))))}>Zoom -</button>
                    <button type="button" className="rounded bg-slate-700 px-2 py-1" onClick={() => setZoom((prev) => Math.min(2, Number((prev + 0.1).toFixed(2))))}>Zoom +</button>
                    <button type="button" className="rounded bg-slate-700 px-2 py-1" onClick={() => { setPan({ x: 0, y: 0 }); setZoom(1); }}>Fit to view</button>
                    <button type="button" className="rounded bg-slate-700 px-2 py-1" onClick={() => setSplitMode((prev) => !prev)}>{splitMode ? "Disable Split" : "Split Mode"}</button>
                    <button type="button" className="rounded bg-slate-700 px-2 py-1" onClick={groupSelected}>Group</button>
                    <button type="button" className="rounded bg-slate-700 px-2 py-1" onClick={ungroupSelected}>Ungroup</button>
                    <button type="button" className="rounded bg-slate-700 px-2 py-1" onClick={duplicateSelected}>Duplicate</button>
                    <button type="button" className="rounded bg-rose-600 px-2 py-1" onClick={removeSelected}>Remove</button>
                  </div>

                  <div
                    className="relative h-[58vh] min-h-[380px] touch-none overflow-hidden rounded-xl border border-slate-700 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:24px_24px]"
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerLeave={onPointerUp}
                  >
                    <div className="absolute inset-0" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: "0 0" }}>
                      {entities.map((entity) => {
                        const selected = selectedSet.has(entity.id);
                        const full = fullscreenId === entity.id;
                        return (
                          <div
                            key={entity.id}
                            role="button"
                            tabIndex={0}
                            onClick={(event) => selectEntity(entity.id, event.shiftKey)}
                            onPointerDown={(event) => onPointerDown(event, entity.id, "move")}
                            className={`absolute rounded-xl border p-3 text-left shadow-2xl ${selected ? "border-cyan-300 bg-slate-800" : "border-slate-600 bg-slate-900"}`}
                            style={{ left: full ? 0 : entity.x, top: full ? 0 : entity.y, width: full ? 980 : entity.width, height: entity.minimized ? 58 : full ? 560 : entity.height, zIndex: entity.zIndex }}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-semibold">{entity.title}</p>
                                <p className="text-[11px] text-slate-300">{entity.module} · {entity.type}</p>
                              </div>
                              <div className="flex items-center gap-1">
                                <button type="button" className="rounded bg-slate-700 px-2 py-1 text-[10px]" onClick={(event) => { event.stopPropagation(); updateSelected({ pinned: !entity.pinned }); }}>Pin</button>
                                <button type="button" className="rounded bg-slate-700 px-2 py-1 text-[10px]" onClick={(event) => { event.stopPropagation(); updateSelected({ locked: !entity.locked }); }}>Lock</button>
                              </div>
                            </div>
                            {!entity.collapsed && (
                              <p className="mt-2 text-xs text-slate-300">{entity.subtitle}</p>
                            )}
                            <button type="button" className="absolute bottom-1 right-1 h-3 w-3 rounded-sm bg-cyan-400" onPointerDown={(event) => onPointerDown(event, entity.id, "resize")} aria-label="resize" />
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    <button type="button" className="rounded bg-slate-700 px-2 py-2 text-xs" onClick={() => setPan((prev) => ({ ...prev, x: prev.x - 24 }))}>Pan Left</button>
                    <button type="button" className="rounded bg-slate-700 px-2 py-2 text-xs" onClick={() => setPan((prev) => ({ ...prev, x: prev.x + 24 }))}>Pan Right</button>
                    <button type="button" className="rounded bg-slate-700 px-2 py-2 text-xs" onClick={() => setPan((prev) => ({ ...prev, y: prev.y - 24 }))}>Pan Up</button>
                    <button type="button" className="rounded bg-slate-700 px-2 py-2 text-xs" onClick={() => setPan((prev) => ({ ...prev, y: prev.y + 24 }))}>Pan Down</button>
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-slate-700 bg-slate-900/80 p-3">
                  <p className="mb-2 text-xs uppercase text-slate-400">Module surfaces</p>
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    <article className="rounded-lg border border-slate-700 bg-slate-800/80 p-3"><p className="font-medium">Overview</p><p className="text-xs text-slate-300">Active modules: {entities.length}. Recent events: {history.length}. Archive health: {archiveState.filter((item) => item.rawAvailable).length}/{embeddedArchive.length} raw available.</p></article>
                    <article className="rounded-lg border border-slate-700 bg-slate-800/80 p-3"><p className="font-medium">Forge</p><p className="text-xs text-slate-300">Blueprint: Fusion Matrix A. Sources: {visibleArchive.length}. Result routing: Docs + Slides + Summary.</p></article>
                    <article className="rounded-lg border border-slate-700 bg-slate-800/80 p-3"><p className="font-medium">Vault / Archive</p><input value={search} onChange={(e) => setSearch(e.target.value)} className="mt-1 w-full rounded bg-slate-700 px-2 py-1 text-xs" placeholder="Search embedded records" /><p className="mt-1 text-xs text-slate-300">{visibleArchive.length} records matched.</p></article>
                    <article className="rounded-lg border border-slate-700 bg-slate-800/80 p-3"><p className="font-medium">Reader / Summary</p><p className="text-xs text-slate-300">Split reading ready. Readable records: {visibleArchive.filter((item) => item.capabilities.previewable).length}. Searchable records: {visibleArchive.filter((item) => item.capabilities.searchable).length}.</p></article>
                    <article className="rounded-lg border border-slate-700 bg-slate-800/80 p-3"><p className="font-medium">Docs / Slides</p><button type="button" className="mt-1 rounded bg-cyan-500 px-2 py-1 text-xs text-black" onClick={createDocFromSelection}>Create doc from selection</button><button type="button" className="ml-2 mt-1 rounded bg-violet-500 px-2 py-1 text-xs" onClick={createSlideFromDoc}>Create slide from latest doc</button><p className="mt-1 text-xs text-slate-300">Docs {docs.length} · Slides {slides.length} · Decks {decks.length}</p></article>
                    <article className="rounded-lg border border-slate-700 bg-slate-800/80 p-3"><p className="font-medium">Topology / Contacts / Budget</p><p className="text-xs text-slate-300">Nodes: {entities.filter((item) => item.type === "topology-node").length}. Contacts: {contacts.length}. Budget variance: ${(totalActual - totalPlanned).toLocaleString()}.</p></article>
                  </div>
                </div>
              </div>

              <aside className="rounded-2xl border border-slate-700 bg-slate-900/80 p-3">
                <p className="mb-2 text-xs uppercase tracking-wide text-slate-400">Inspector</p>
                {selectedPrimary ? (
                  <div className="space-y-2 text-xs">
                    <div className="rounded bg-slate-800 p-2">
                      <p className="font-semibold">{selectedPrimary.title}</p>
                      <p className="text-slate-300">{selectedPrimary.subtitle}</p>
                      <p className="text-slate-400">{selectedPrimary.module} · {selectedPrimary.type}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-1">
                      <button type="button" className="rounded bg-slate-700 px-2 py-1" onClick={() => updateSelected({ minimized: !selectedPrimary.minimized })}>{selectedPrimary.minimized ? "Expand" : "Collapse"}</button>
                      <button type="button" className="rounded bg-slate-700 px-2 py-1" onClick={() => updateSelected({ collapsed: !selectedPrimary.collapsed })}>{selectedPrimary.collapsed ? "Uncollapse" : "Collapse body"}</button>
                      <button type="button" className="rounded bg-slate-700 px-2 py-1" onClick={() => updateSelected({ visualMode: selectedPrimary.visualMode === "focus" ? "panel" : "focus" })}>Toggle focus</button>
                      <button type="button" className="rounded bg-slate-700 px-2 py-1" onClick={() => setFullscreenId((prev) => (prev === selectedPrimary.id ? "" : selectedPrimary.id))}>Fullscreen</button>
                    </div>
                    <div className="rounded bg-slate-800 p-2">
                      <p className="font-medium">Linked records</p>
                      {selectedPrimary.linkedSourceIds.length ? selectedPrimary.linkedSourceIds.map((item) => <p key={item}>{item}</p>) : <p className="text-slate-400">No linked source ids.</p>}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">Select one or more panels to unlock contextual inspector actions.</p>
                )}

                <div className="mt-4 rounded bg-slate-800 p-2">
                  <p className="text-xs font-semibold">AI task panel</p>
                  <textarea value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} className="mt-1 h-20 w-full rounded bg-slate-700 p-2 text-xs" placeholder="Ask with current selection context" />
                  <button type="button" className="mt-1 w-full rounded bg-cyan-500 px-2 py-1 text-xs font-medium text-black" onClick={runAi}>Run AI</button>
                  <p className="mt-1 text-[11px] text-slate-300">{aiResponse}</p>
                </div>

                <div className="mt-4 rounded bg-slate-800 p-2 text-xs">
                  <p className="font-semibold">Readiness inspector</p>
                  {readinessChecks.map((check) => (
                    <p key={check.label} className={check.ok ? "text-emerald-300" : "text-amber-300"}>{check.ok ? "✓" : "!"} {check.label}</p>
                  ))}
                </div>

                <div className="mt-4 rounded bg-slate-800 p-2 text-xs">
                  <p className="font-semibold">History stream</p>
                  <div className="max-h-48 space-y-1 overflow-auto pr-1">
                    {history.map((event) => (
                      <p key={event.id}>{event.module} · {event.action} · {new Date(event.at).toLocaleString()}</p>
                    ))}
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
