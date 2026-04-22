import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, ZoomIn, ZoomOut, Maximize, Settings2 } from "lucide-react";
import { AppState, Action, CanvasNode, NodeType, NodeShape } from "../types";
import { Card, Button, Badge } from "../components/ui";
import { THEME, uid } from "../lib/utils";

export const CanvasView: React.FC<{ state: AppState; dispatch: React.Dispatch<Action> }> = ({ state, dispatch }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Panning logic
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    let isPanning = false;
    let startX = 0, startY = 0;

    const handleMouseDown = (e: MouseEvent) => {
      if (e.target === container || (e.target as HTMLElement).tagName === 'svg') {
        isPanning = true;
        startX = e.clientX - pan.x;
        startY = e.clientY - pan.y;
      }
    };
    const handleMouseMove = (e: MouseEvent) => {
      if (isPanning) setPan({ x: e.clientX - startX, y: e.clientY - startY });
    };
    const handleMouseUp = () => { isPanning = false; };

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [pan]);

  const handleNodePointerDown = (e: React.PointerEvent, id: string) => {
    e.stopPropagation();
    if (connectingFrom) {
      if (connectingFrom !== id) {
        dispatch({ type: "ADD_EDGE", edge: { id: uid("e"), from: connectingFrom, to: id, animated: true } });
      }
      setConnectingFrom(null);
      return;
    }
    setSelectedNode(id);
    setDraggingNode(id);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleNodePointerMove = (e: React.PointerEvent) => {
    if (draggingNode) {
      const dx = e.movementX / zoom;
      const dy = e.movementY / zoom;
      const node = state.nodes.find(n => n.id === draggingNode);
      if (node) dispatch({ type: "UPDATE_NODE", id: draggingNode, patch: { x: node.x + dx, y: node.y + dy } });
    }
  };

  const handleNodePointerUp = (e: React.PointerEvent) => {
    setDraggingNode(null);
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (connectingFrom && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePos({ x: (e.clientX - rect.left - pan.x) / zoom, y: (e.clientY - rect.top - pan.y) / zoom });
    }
  };

  const addNode = () => {
    const types: {t: NodeType, s: NodeShape, c: string}[] = [
      {t: "process", s: "rect", c: THEME.violet},
      {t: "decision", s: "diamond", c: THEME.amber},
      {t: "ai", s: "hex", c: THEME.rose},
      {t: "data", s: "circle", c: THEME.cyan}
    ];
    const rand = types[Math.floor(Math.random() * types.length)];
    dispatch({ type: "ADD_NODE", node: {
      id: uid("n"), x: -pan.x / zoom + 100, y: -pan.y / zoom + 100, w: 160, h: 60,
      label: `New ${rand.t}`, type: rand.t, shape: rand.s, color: rand.c
    }});
  };

  const getShapeStyle = (shape: NodeShape) => {
    switch(shape) {
      case "circle": return { borderRadius: "9999px" };
      case "diamond": return { transform: "rotate(45deg)" };
      case "hex": return { clipPath: "polygon(10% 0, 90% 0, 100% 50%, 90% 100%, 10% 100%, 0 50%)", borderRadius: 0 };
      default: return { borderRadius: "12px" };
    }
  };

  return (
    <div className="flex flex-col h-full gap-4 pb-4">
      <Card className="flex items-center justify-between py-3 px-4 shrink-0 z-10">
        <div className="flex items-center gap-4">
          <h2 className="font-display font-bold text-lg">Canvas Engine</h2>
          <div className="h-6 w-px bg-white/10" />
          <Button variant="ghost" size="sm" onClick={() => setZoom(z => Math.min(z + 0.1, 2))}><ZoomIn size={16}/></Button>
          <Button variant="ghost" size="sm" onClick={() => setZoom(z => Math.max(z - 0.1, 0.5))}><ZoomOut size={16}/></Button>
          <Button variant="ghost" size="sm" onClick={() => { setZoom(1); setPan({x:0, y:0}); }}><Maximize size={16}/></Button>
          <span className="text-xs text-white/40 font-mono">{Math.round(zoom * 100)}%</span>
        </div>
        <div className="flex items-center gap-2">
          {connectingFrom && <span className="text-xs text-amber-400 animate-pulse mr-4">Select target node...</span>}
          {selectedNode && (
            <Button variant="danger" size="sm" onClick={() => { dispatch({ type: "DELETE_NODE", id: selectedNode }); setSelectedNode(null); }}>
              <Trash2 size={16} /> Delete
            </Button>
          )}
          <Button variant="primary" size="sm" onClick={addNode}><Plus size={16} /> Add Node</Button>
        </div>
      </Card>

      <div 
        ref={containerRef}
        className="flex-1 relative overflow-hidden rounded-2xl border border-white/10 bg-[#03030a] cursor-grab active:cursor-grabbing shadow-inner"
        onMouseMove={handleMouseMove}
        onClick={() => { if(connectingFrom) setConnectingFrom(null); setSelectedNode(null); }}
      >
        <div className="absolute inset-0 canvas-bg opacity-30" style={{ backgroundPosition: `${pan.x}px ${pan.y}px`, backgroundSize: `${24*zoom}px ${24*zoom}px` }} />

        <div style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: '0 0', width: '100%', height: '100%', position: 'absolute' }}>
          
          {/* Edges */}
          <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none">
            <defs>
              <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor={THEME.violet} />
                <stop offset="100%" stopColor={THEME.rose} />
              </linearGradient>
            </defs>
            {state.edges.map(edge => {
              const fromNode = state.nodes.find(n => n.id === edge.from);
              const toNode = state.nodes.find(n => n.id === edge.to);
              if (!fromNode || !toNode) return null;
              
              const x1 = fromNode.x + fromNode.w;
              const y1 = fromNode.y + fromNode.h / 2;
              const x2 = toNode.x;
              const y2 = toNode.y + toNode.h / 2;
              const cx = (x1 + x2) / 2;

              return (
                <g key={edge.id}>
                  <path
                    d={`M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`}
                    fill="none"
                    stroke="url(#edgeGrad)"
                    strokeWidth="3"
                    strokeDasharray={edge.animated ? "8,8" : "none"}
                    className={`pointer-events-auto cursor-pointer hover:stroke-white transition-colors ${edge.animated ? 'animate-[spin-slow_linear_infinite]' : ''}`}
                    onClick={(e) => { e.stopPropagation(); dispatch({ type: "DELETE_EDGE", id: edge.id }); }}
                  />
                </g>
              );
            })}
            
            {connectingFrom && (() => {
              const fromNode = state.nodes.find(n => n.id === connectingFrom);
              if (!fromNode) return null;
              const x1 = fromNode.x + fromNode.w;
              const y1 = fromNode.y + fromNode.h / 2;
              const cx = (x1 + mousePos.x) / 2;
              return (
                <path d={`M ${x1} ${y1} C ${cx} ${y1}, ${cx} ${mousePos.y}, ${mousePos.x} ${mousePos.y}`} fill="none" stroke={THEME.amber} strokeWidth="2" strokeDasharray="5,5" className="animate-pulse" />
              );
            })()}
          </svg>

          {/* Nodes */}
          {state.nodes.map(node => {
            const isSelected = selectedNode === node.id;
            const shapeStyle = getShapeStyle(node.shape);
            
            return (
              <div
                key={node.id}
                onPointerDown={(e) => handleNodePointerDown(e, node.id)}
                onPointerMove={handleNodePointerMove}
                onPointerUp={handleNodePointerUp}
                className="absolute flex items-center justify-center cursor-pointer select-none transition-shadow"
                style={{
                  left: node.x, top: node.y, width: node.w, height: node.h,
                  ...shapeStyle,
                  backgroundColor: `${node.color}15`,
                  border: `2px solid ${isSelected ? node.color : `${node.color}40`}`,
                  boxShadow: isSelected ? `0 0 30px ${node.color}60, inset 0 0 20px ${node.color}30` : `inset 0 0 10px ${node.color}10`,
                  backdropFilter: 'blur(12px)'
                }}
              >
                <div className="text-center z-10" style={{ transform: node.shape === 'diamond' ? 'rotate(-45deg)' : 'none' }}>
                  <div className="text-xs font-bold text-white truncate px-2">{node.label}</div>
                  <div className="text-[9px] text-white/50 font-mono uppercase mt-1">{node.type}</div>
                </div>
                
                {/* Connection Port */}
                <div 
                  className="absolute right-[-8px] top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-black border-2 cursor-crosshair hover:scale-150 transition-transform z-20"
                  style={{ borderColor: node.color }}
                  onPointerDown={(e) => { e.stopPropagation(); setConnectingFrom(node.id); }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
