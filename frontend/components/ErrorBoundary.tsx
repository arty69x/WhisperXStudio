import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Card, Button } from "./ui";

interface Props { children: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false, error: null };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-bg flex items-center justify-center p-4">
          <Card className="max-w-md w-full text-center border-red-500/30">
            <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-display font-bold text-white mb-2">System Failure</h2>
            <p className="text-sm text-white/60 mb-6 font-mono bg-black/50 p-3 rounded-lg overflow-auto text-left max-h-40">
              {this.state.error?.message || "Unknown error occurred."}
            </p>
            <Button variant="danger" onClick={() => window.location.reload()} className="w-full">
              <RefreshCw size={16} /> Reboot System
            </Button>
          </Card>
        </div>
      );
    }
    return this.props.children;
  }
}
