import React, { useState } from "react";
import { motion } from "framer-motion";
import { Database, Upload, FileText, Trash2, Loader2, CheckCircle } from "lucide-react";
import { AppState, Action } from "../types";
import { Card, Button, Badge } from "../components/ui";
import { analyzeFileContent } from "../services/gemini";
import { THEME, uid } from "../lib/utils";

export const VaultView: React.FC<{ state: AppState; dispatch: React.Dispatch<Action> }> = ({ state, dispatch }) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!state.apiKey) {
      dispatch({ type: "ADD_TOAST", msg: "API Key required for analysis.", toastType: "error" });
      return;
    }

    setIsUploading(true);
    const fileId = uid("v");
    
    try {
      const content = await file.text();
      dispatch({
        type: "ADD_VAULT_FILE",
        file: { id: fileId, name: file.name, ext: file.name.split('.').pop() || 'txt', size: file.size, content, status: "analyzing" }
      });

      const analysis = await analyzeFileContent(content, state.apiKey);
      
      dispatch({ type: "UPDATE_VAULT_FILE", id: fileId, patch: { status: "done", analysis } });
      dispatch({ type: "ADD_TOAST", msg: "File analyzed successfully.", toastType: "success" });
    } catch (error: any) {
      dispatch({ type: "UPDATE_VAULT_FILE", id: fileId, patch: { status: "error" } });
      dispatch({ type: "ADD_TOAST", msg: error.message || "Analysis failed.", toastType: "error" });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-1">Data Vault</h1>
          <p className="text-sm text-white/50 font-mono">Secure storage and AI analysis</p>
        </div>
        <label className="cursor-pointer">
          <input type="file" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
          <div className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-violet-600 to-rose-600 text-white shadow-[0_0_15px_rgba(112,0,255,0.4)] hover:shadow-[0_0_25px_rgba(255,0,85,0.6)] ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
            {isUploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            Upload File
          </div>
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.vault.length === 0 ? (
          <div className="col-span-full text-center py-20 text-white/30 font-mono">No files in vault. Upload to begin analysis.</div>
        ) : (
          state.vault.map(file => (
            <Card key={file.id} className="flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white truncate max-w-[150px]">{file.name}</h3>
                    <p className="text-xs text-white/40 font-mono">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
                <button onClick={() => dispatch({ type: "DELETE_VAULT_FILE", id: file.id })} className="text-white/20 hover:text-red-400 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="flex-1 bg-black/30 rounded-xl p-3 border border-white/5">
                {file.status === "analyzing" ? (
                  <div className="flex items-center justify-center h-full gap-2 text-violet-400">
                    <Loader2 size={16} className="animate-spin" /> <span className="text-xs font-mono">Analyzing...</span>
                  </div>
                ) : file.status === "error" ? (
                  <div className="text-red-400 text-xs text-center">Analysis Failed</div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-white/80 italic">"{file.analysis?.corePurpose}"</p>
                    <div className="flex flex-wrap gap-1">
                      {file.analysis?.abilities.slice(0,3).map((a, i) => <Badge key={i} label={a} color={THEME.emerald} />)}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
