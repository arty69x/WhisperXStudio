import React, { useState } from "react";
import { motion } from "framer-motion";
import { Zap, ArrowRight, Loader2 } from "lucide-react";
import { AppState, Action } from "../types";
import { Card, Button, Input } from "../components/ui";
import { evolveLogic } from "../services/gemini";
import { THEME, uid } from "../lib/utils";

export const ForgeView: React.FC<{ state: AppState; dispatch: React.Dispatch<Action> }> = ({ state, dispatch }) => {
  const [bpId, setBpId] = useState<string>("");
  const [mxId, setMxId] = useState<string>("");
  const [ability, setAbility] = useState("");
  const [isEvolving, setIsEvolving] = useState(false);

  const analyzedFiles = state.vault.filter(f => f.status === "done");

  const handleEvolve = async () => {
    if (!bpId || !mxId || !ability) {
      dispatch({ type: "ADD_TOAST", msg: "Select Blueprint, Matrix, and enter Ability.", toastType: "warning" });
      return;
    }
    if (!state.apiKey) {
      dispatch({ type: "ADD_TOAST", msg: "API Key required.", toastType: "error" });
      return;
    }

    const bp = state.vault.find(f => f.id === bpId);
    const mx = state.vault.find(f => f.id === mxId);
    if (!bp || !mx) return;

    setIsEvolving(true);
    try {
      const result = await evolveLogic(bp.content, mx.content, ability, state.apiKey);
      dispatch({
        type: "ADD_EVOLUTION",
        record: { id: uid("evo"), bName: bp.name, mName: mx.name, ability, result: result.result, score: result.score, timestamp: new Date().toISOString() }
      });
      dispatch({ type: "ADD_TOAST", msg: "Evolution successful!", toastType: "success" });
      setAbility("");
    } catch (error: any) {
      dispatch({ type: "ADD_TOAST", msg: error.message || "Evolution failed.", toastType: "error" });
    } finally {
      setIsEvolving(false);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-3xl font-display font-bold text-white mb-1">Evolution Forge</h1>
        <p className="text-sm text-white/50 font-mono">Synthesize new logic structures</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Blueprint */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-rose-400 uppercase tracking-widest">Blueprint (Base)</label>
              <select 
                value={bpId} onChange={e => setBpId(e.target.value)}
                className="w-full bg-black/40 border border-rose-500/30 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-rose-500"
              >
                <option value="">Select file...</option>
                {analyzedFiles.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
            {/* Matrix */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-violet-400 uppercase tracking-widest">Matrix (Modifier)</label>
              <select 
                value={mxId} onChange={e => setMxId(e.target.value)}
                className="w-full bg-black/40 border border-violet-500/30 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-violet-500"
              >
                <option value="">Select file...</option>
                {analyzedFiles.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-cyan-400 uppercase tracking-widest">Target Ability</label>
            <Input value={ability} onChange={e => setAbility(e.target.value)} placeholder="e.g., Real-time data synchronization" />
          </div>

          <Button variant="primary" onClick={handleEvolve} disabled={isEvolving || !bpId || !mxId || !ability} className="w-full py-4 text-lg tracking-widest uppercase">
            {isEvolving ? <><Loader2 className="animate-spin" /> Synthesizing...</> : <><Zap /> Initiate Fusion</>}
          </Button>
        </Card>

        {/* History */}
        <Card className="flex flex-col h-[400px]">
          <h3 className="text-sm font-bold text-white/70 uppercase tracking-wider mb-4">Evolution History</h3>
          <div className="flex-1 overflow-y-auto space-y-3 hide-scrollbar">
            {state.evolutions.length === 0 ? (
              <div className="text-center text-white/30 font-mono mt-10">No evolutions yet.</div>
            ) : (
              state.evolutions.map(evo => (
                <div key={evo.id} className="bg-black/30 p-3 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2 text-xs font-bold text-white/80 mb-2">
                    <span className="text-rose-400 truncate max-w-[80px]">{evo.bName}</span>
                    <ArrowRight size={12} className="text-white/30" />
                    <span className="text-violet-400 truncate max-w-[80px]">{evo.mName}</span>
                  </div>
                  <p className="text-xs text-white/60 italic mb-2 line-clamp-2">"{evo.result}"</p>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-white/30 font-mono">{new Date(evo.timestamp).toLocaleTimeString()}</span>
                    <span className={`text-xs font-bold ${evo.score > 80 ? 'text-emerald-400' : 'text-amber-400'}`}>Score: {evo.score}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
