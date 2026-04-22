import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Terminal as TerminalIcon, Send, Loader2, Cpu } from "lucide-react";
import { AppState, Action } from "../types";
import { Card, HolographicSVG } from "../components/ui";
import { generateAIResponse } from "../services/gemini";
import { THEME } from "../lib/utils";

export const TerminalView: React.FC<{ state: AppState; dispatch: React.Dispatch<Action> }> = ({ state, dispatch }) => {
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [state.terminalLogs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const userCmd = input.trim();
    setInput("");
    dispatch({ type: "ADD_LOG", log: { text: `> ${userCmd}`, type: "user" } });

    if (userCmd.toLowerCase() === "clear") {
      dispatch({ type: "CLEAR_LOGS" });
      return;
    }

    setIsProcessing(true);
    try {
      const response = await generateAIResponse(userCmd, state.apiKey);
      dispatch({ type: "ADD_LOG", log: { text: response, type: "ai" } });
    } catch (error: any) {
      dispatch({ type: "ADD_LOG", log: { text: `ERROR: ${error.message}`, type: "err" } });
    } finally {
      setIsProcessing(false);
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case "sys": return THEME.emerald;
      case "user": return THEME.cyan;
      case "ai": return THEME.violet;
      case "err": return THEME.rose;
      case "success": return THEME.emerald;
      default: return "rgba(255,255,255,0.5)";
    }
  };

  return (
    <div className="h-full flex gap-6 pb-4">
      <Card className="flex-1 flex flex-col p-0 overflow-hidden border-white/10 relative">
        {/* Header */}
        <div className="bg-black/60 p-4 border-b border-white/5 flex items-center gap-3 z-10">
          <TerminalIcon size={18} className="text-violet-400" />
          <h2 className="font-mono text-sm font-bold text-white/80 tracking-widest">NEXUS_CORE_TERMINAL</h2>
          <div className="ml-auto flex gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/50" />
            <div className="w-3 h-3 rounded-full bg-amber-500/50" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
          </div>
        </div>

        {/* Output Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 font-mono text-sm space-y-3 z-10">
          {state.terminalLogs.map((log) => (
            <motion.div 
              key={log.id} 
              initial={{ opacity: 0, x: -10 }} 
              animate={{ opacity: 1, x: 0 }}
              style={{ color: getColor(log.type) }}
              className="whitespace-pre-wrap break-words leading-relaxed"
            >
              {log.text}
            </motion.div>
          ))}
          {isProcessing && (
            <div className="flex items-center gap-2 text-violet-400 mt-4">
              <Loader2 size={14} className="animate-spin" />
              <span className="animate-pulse">Processing query via Gemini Core...</span>
            </div>
          )}
        </div>

        {/* Input Area */}
        <form onSubmit={handleSubmit} className="p-4 bg-black/60 border-t border-white/5 flex gap-3 z-10">
          <span className="text-emerald-400 font-mono text-lg mt-1">❯</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter command or ask AI..."
            className="flex-1 bg-transparent border-none outline-none text-white font-mono placeholder-white/20"
            autoFocus
          />
          <button 
            type="submit" 
            disabled={isProcessing || !input.trim()}
            className="text-violet-400 hover:text-violet-300 disabled:opacity-30 transition-colors"
          >
            <Send size={20} />
          </button>
        </form>
      </Card>

      {/* Side Info Panel */}
      <div className="hidden lg:flex flex-col w-80 gap-6">
        <Card className="flex flex-col items-center justify-center py-10 text-center">
          <HolographicSVG className="w-32 h-32 mb-6" color={THEME.violet} />
          <h3 className="font-display font-bold text-lg text-white mb-2">AI Core Status</h3>
          <p className="text-xs text-emerald-400 font-mono bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">ONLINE & READY</p>
        </Card>
        <Card>
          <h3 className="text-sm font-bold text-white/70 uppercase tracking-wider mb-4 flex items-center gap-2"><Cpu size={16}/> System Specs</h3>
          <div className="space-y-3 text-xs font-mono text-white/50">
            <div className="flex justify-between"><span>Model:</span> <span className="text-white">Gemini 2.5 Flash</span></div>
            <div className="flex justify-between"><span>Latency:</span> <span className="text-emerald-400">24ms</span></div>
            <div className="flex justify-between"><span>Memory:</span> <span className="text-white">Allocated</span></div>
          </div>
        </Card>
      </div>
    </div>
  );
};
