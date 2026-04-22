import React from "react";
import { motion } from "framer-motion";
import { LayoutDashboard, GitBranch, Terminal, Layers, Settings, LogOut, Sparkles, Menu, Database, Zap } from "lucide-react";
import { AppState, Action, ModuleId } from "../types";
import { THEME } from "../lib/utils";

const NAV_ITEMS: { id: ModuleId; label: string; icon: React.FC<any>; color: string }[] = [
  { id: "dashboard", label: "Overview", icon: LayoutDashboard, color: THEME.rose },
  { id: "canvas", label: "Canvas Engine", icon: GitBranch, color: THEME.violet },
  { id: "terminal", label: "AI Terminal", icon: Terminal, color: THEME.emerald },
  { id: "kanban", label: "Task Board", icon: Layers, color: THEME.cyan },
  { id: "vault", label: "Data Vault", icon: Database, color: THEME.amber },
  { id: "forge", label: "Evolution Forge", icon: Zap, color: THEME.rose },
  { id: "settings", label: "Settings", icon: Settings, color: THEME.muted },
];

export const Sidebar: React.FC<{ state: AppState; dispatch: React.Dispatch<Action>; onLogout: () => void }> = ({ state, dispatch, onLogout }) => {
  return (
    <aside className={`hidden md:flex flex-col border-r border-white/10 glass-panel z-20 transition-all duration-300 ${state.sidebarOpen ? 'w-64' : 'w-20'}`}>
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-rose-600 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(112,0,255,0.5)]">
            <Sparkles size={16} className="text-white" />
          </div>
          {state.sidebarOpen && <span className="font-display font-bold text-lg whitespace-nowrap holo-text">NEXUS OMEGA</span>}
        </div>
        <button onClick={() => dispatch({ type: "TOGGLE_SIDEBAR" })} className="text-white/50 hover:text-white transition-colors">
          <Menu size={20} />
        </button>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto hide-scrollbar">
        {NAV_ITEMS.map(item => {
          const isActive = state.activeModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => dispatch({ type: "SET_MODULE", id: item.id })}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${isActive ? 'bg-white/10 text-white shadow-inner' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}
              title={!state.sidebarOpen ? item.label : undefined}
            >
              <item.icon size={20} style={{ color: isActive ? item.color : undefined }} className="shrink-0" />
              {state.sidebarOpen && <span className="font-bold text-sm whitespace-nowrap">{item.label}</span>}
              {isActive && state.sidebarOpen && <motion.div layoutId="activeNav" className="ml-auto w-1.5 h-1.5 rounded-full" style={{ backgroundColor: item.color }} />}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10 shrink-0">
        <button onClick={onLogout} className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-white/50 hover:bg-red-500/20 hover:text-red-400 transition-all ${!state.sidebarOpen ? 'justify-center' : ''}`}>
          <LogOut size={20} className="shrink-0" />
          {state.sidebarOpen && <span className="font-bold text-sm">Disconnect</span>}
        </button>
      </div>
    </aside>
  );
};

export const MobileNav: React.FC<{ state: AppState; dispatch: React.Dispatch<Action> }> = ({ state, dispatch }) => (
  <nav className="md:hidden h-16 border-t border-white/10 glass-panel flex items-center justify-around px-2 shrink-0 pb-safe z-20">
    {NAV_ITEMS.slice(0, 5).map(item => {
      const isActive = state.activeModule === item.id;
      return (
        <button
          key={item.id}
          onClick={() => dispatch({ type: "SET_MODULE", id: item.id })}
          className={`flex flex-col items-center gap-1 p-2 transition-colors ${isActive ? 'text-white' : 'text-white/40'}`}
        >
          <item.icon size={20} style={{ color: isActive ? item.color : undefined }} />
          <span className="text-[10px] font-bold">{item.label.split(' ')[0]}</span>
        </button>
      );
    })}
  </nav>
);
