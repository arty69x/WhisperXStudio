import React, { useReducer, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, Sparkles, X } from "lucide-react";
import { AppState, Action } from "./types";
import { INITIAL_STATE } from "./store/initialState";
import { Sidebar, MobileNav } from "./components/Layout";
import { Dashboard } from "./views/Dashboard";
import { CanvasView } from "./views/Canvas";
import { TerminalView } from "./views/Terminal";
import { KanbanView } from "./views/Kanban";
import { VaultView } from "./views/Vault";
import { ForgeView } from "./views/Forge";
import { SettingsView } from "./views/Settings";

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "SET_AUTH": return { ...state, authTier: action.tier, authUser: action.user };
    case "SET_MODULE": return { ...state, activeModule: action.id };
    case "TOGGLE_SIDEBAR": return { ...state, sidebarOpen: !state.sidebarOpen };
    case "SET_API_KEY": return { ...state, apiKey: action.key };
    case "ADD_NODE": return { ...state, nodes: [...state.nodes, action.node] };
    case "UPDATE_NODE": return { ...state, nodes: state.nodes.map(n => n.id === action.id ? { ...n, ...action.patch } : n) };
    case "DELETE_NODE": return { ...state, nodes: state.nodes.filter(n => n.id !== action.id), edges: state.edges.filter(e => e.from !== action.id && e.to !== action.id) };
    case "ADD_EDGE": return { ...state, edges: [...state.edges, action.edge] };
    case "DELETE_EDGE": return { ...state, edges: state.edges.filter(e => e.id !== action.id) };
    case "ADD_TASK": return { ...state, tasks: [...state.tasks, action.task] };
    case "UPDATE_TASK": return { ...state, tasks: state.tasks.map(t => t.id === action.id ? { ...t, ...action.patch } : t) };
    case "DELETE_TASK": return { ...state, tasks: state.tasks.filter(t => t.id !== action.id) };
    case "ADD_LOG": return { ...state, terminalLogs: [...state.terminalLogs, { ...action.log, id: `l-${Date.now()}`, timestamp: new Date().toISOString() }] };
    case "CLEAR_LOGS": return { ...state, terminalLogs: [] };
    case "ADD_VAULT_FILE": return { ...state, vault: [...state.vault, action.file] };
    case "UPDATE_VAULT_FILE": return { ...state, vault: state.vault.map(f => f.id === action.id ? { ...f, ...action.patch } : f) };
    case "DELETE_VAULT_FILE": return { ...state, vault: state.vault.filter(f => f.id !== action.id) };
    case "ADD_EVOLUTION": return { ...state, evolutions: [action.record, ...state.evolutions] };
    case "ADD_TOAST": return { ...state, toasts: [...state.toasts, { id: `t-${Date.now()}`, msg: action.msg, type: action.toastType || "info" }] };
    case "REMOVE_TOAST": return { ...state, toasts: state.toasts.filter(t => t.id !== action.id) };
    default: return state;
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const [showAuth, setShowAuth] = useState(true);

  // Toast auto-remove
  useEffect(() => {
    if (state.toasts.length > 0) {
      const timer = setTimeout(() => {
        dispatch({ type: "REMOVE_TOAST", id: state.toasts[0].id });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [state.toasts]);

  const renderModule = () => {
    switch (state.activeModule) {
      case "dashboard": return <Dashboard state={state} />;
      case "canvas": return <CanvasView state={state} dispatch={dispatch} />;
      case "terminal": return <TerminalView state={state} dispatch={dispatch} />;
      case "kanban": return <KanbanView state={state} dispatch={dispatch} />;
      case "vault": return <VaultView state={state} dispatch={dispatch} />;
      case "forge": return <ForgeView state={state} dispatch={dispatch} />;
      case "settings": return <SettingsView state={state} dispatch={dispatch} />;
      default: return <div className="text-white">Module not found</div>;
    }
  };

  return (
    <div className="flex h-screen w-full bg-bg text-text font-body overflow-hidden relative">
      {/* Ambient Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[100px] animate-float" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-rose-600/10 blur-[100px] animate-float" style={{ animationDelay: '-3s' }} />
      </div>

      {/* Toasts */}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        <AnimatePresence>
          {state.toasts.map(t => (
            <motion.div key={t.id} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9 }} className={`px-4 py-3 rounded-xl shadow-lg backdrop-blur-md border text-sm font-bold flex items-center justify-between gap-4 ${t.type === 'error' ? 'bg-red-500/20 border-red-500/50 text-red-100' : t.type === 'success' ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-100' : 'bg-white/10 border-white/20 text-white'}`}>
              {t.msg}
              <button onClick={() => dispatch({ type: "REMOVE_TOAST", id: t.id })}><X size={14}/></button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Auth Gate Overlay */}
      <AnimatePresence>
        {showAuth && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div className="glass-panel p-8 rounded-3xl max-w-sm w-full text-center border-violet-500/30 shadow-[0_0_50px_rgba(112,0,255,0.2)]">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-violet-600 to-rose-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg animate-pulse-glow">
                <Sparkles size={32} className="text-white" />
              </div>
              <h2 className="text-2xl font-display font-bold text-white mb-2">Nexus Omega</h2>
              <p className="text-sm text-white/50 mb-8">Authenticate to access the system.</p>
              <button 
                onClick={() => { dispatch({ type: "SET_AUTH", tier: 3, user: { name: "Admin", role: "Commander" } }); setShowAuth(false); }}
                className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
              >
                <LogIn size={18} /> Enter System
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Sidebar state={state} dispatch={dispatch} onLogout={() => setShowAuth(true)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 z-10">
        {/* Topbar (Mobile) */}
        <header className="md:hidden h-14 border-b border-white/10 glass-panel flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-rose-600 flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-lg holo-text">NEXUS</span>
          </div>
        </header>

        {/* Module Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 hide-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={state.activeModule}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {renderModule()}
            </motion.div>
          </AnimatePresence>
        </main>

        <MobileNav state={state} dispatch={dispatch} />
      </div>
    </div>
  );
}
