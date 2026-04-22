import React, { useState } from "react";
import { Key, Shield, Save } from "lucide-react";
import { AppState, Action } from "../types";
import { Card, Button, Input } from "../components/ui";

export const SettingsView: React.FC<{ state: AppState; dispatch: React.Dispatch<Action> }> = ({ state, dispatch }) => {
  const [key, setKey] = useState(state.apiKey);

  const handleSave = () => {
    dispatch({ type: "SET_API_KEY", key });
    dispatch({ type: "ADD_TOAST", msg: "Configuration saved successfully.", toastType: "success" });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-3xl font-display font-bold text-white mb-8">System Configuration</h1>

      <Card className="space-y-6">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <Shield className="text-violet-400" size={24} />
          <h2 className="text-xl font-bold text-white">Authentication</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-2">Gemini API Key</label>
            <Input 
              type="password" 
              value={key} 
              onChange={(e) => setKey(e.target.value)} 
              placeholder="AIzaSy..."
              icon={<Key size={16} />}
            />
            <p className="text-xs text-white/30 mt-2">Required for AI Terminal, Vault analysis, and Forge synthesis. Stored locally in memory.</p>
          </div>

          <Button variant="primary" onClick={handleSave} className="w-full mt-4">
            <Save size={16} /> Save Configuration
          </Button>
        </div>
      </Card>
    </div>
  );
};
