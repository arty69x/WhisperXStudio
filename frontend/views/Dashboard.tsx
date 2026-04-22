import React from "react";
import { motion } from "framer-motion";
import { Activity, Database, Users, Zap } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { AppState } from "../types";
import { Card, Badge } from "../components/ui";
import { THEME } from "../lib/utils";

const mockData = [
  { name: 'Mon', value: 400, tasks: 24 },
  { name: 'Tue', value: 300, tasks: 13 },
  { name: 'Wed', value: 550, tasks: 45 },
  { name: 'Thu', value: 450, tasks: 32 },
  { name: 'Fri', value: 700, tasks: 56 },
  { name: 'Sat', value: 600, tasks: 40 },
  { name: 'Sun', value: 800, tasks: 65 },
];

export const Dashboard: React.FC<{ state: AppState }> = ({ state }) => {
  const stats = [
    { label: "Active Nodes", value: state.nodes.length, icon: Database, color: THEME.cyan },
    { label: "Pending Tasks", value: state.tasks.filter(t => t.status !== 'done').length, icon: Activity, color: THEME.rose },
    { label: "Vault Files", value: state.vault.length, icon: Zap, color: THEME.amber },
    { label: "Evolutions", value: state.evolutions.length, icon: Users, color: THEME.emerald },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-display font-bold text-white mb-1">Nexus Overview</h1>
          <p className="text-sm text-white/50 font-mono">SYSTEM STATUS: NOMINAL</p>
        </div>
        <Badge label="Live" color={THEME.emerald} className="animate-pulse" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="flex items-center gap-4" glowColor={stat.color}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
                <stat.icon size={24} />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-xs text-white/50 uppercase tracking-wider">{stat.label}</div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="h-80 flex flex-col">
          <h3 className="text-sm font-bold text-white/70 uppercase tracking-wider mb-4">System Throughput</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={THEME.violet} stopOpacity={0.5}/>
                    <stop offset="95%" stopColor={THEME.violet} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0c0c2d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area type="monotone" dataKey="value" stroke={THEME.violet} strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="h-80 flex flex-col">
          <h3 className="text-sm font-bold text-white/70 uppercase tracking-wider mb-4">Task Velocity</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockData}>
                <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#0c0c2d', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
                <Bar dataKey="tasks" fill={THEME.emerald} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
};
