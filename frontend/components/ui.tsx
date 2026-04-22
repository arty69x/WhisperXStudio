import React from "react";
import { motion } from "framer-motion";
import { THEME } from "../lib/utils";

export const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void; glowColor?: string }> = ({ children, className = "", onClick, glowColor }) => (
  <motion.div
    whileHover={onClick ? { y: -4, borderColor: glowColor || "rgba(255,255,255,0.3)", boxShadow: glowColor ? `0 10px 30px ${glowColor}30` : undefined } : {}}
    onClick={onClick}
    className={`glass-panel rounded-2xl p-5 transition-all duration-300 ${onClick ? 'cursor-pointer' : ''} ${className}`}
  >
    {children}
  </motion.div>
);

export const Button: React.FC<{ 
  children: React.ReactNode; 
  onClick?: () => void; 
  variant?: "primary" | "secondary" | "danger" | "ghost";
  className?: string;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
}> = ({ children, onClick, variant = "secondary", className = "", disabled, size = "md" }) => {
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };
  
  const variants = {
    primary: "bg-gradient-to-r from-violet-600 to-rose-600 text-white shadow-[0_0_15px_rgba(112,0,255,0.4)] hover:shadow-[0_0_25px_rgba(255,0,85,0.6)] border-none",
    secondary: "bg-white/5 text-white border border-white/10 hover:bg-white/10",
    danger: "bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20",
    ghost: "bg-transparent text-white/60 hover:text-white hover:bg-white/5 border-none"
  };

  return (
    <motion.button
      whileTap={disabled ? {} : { scale: 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${sizes[size]} ${variants[variant]} ${className}`}
    >
      {children}
    </motion.button>
  );
};

export const Badge: React.FC<{ label: string; color?: string; className?: string }> = ({ label, color = THEME.violet, className = "" }) => (
  <span 
    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${className}`}
    style={{ backgroundColor: `${color}15`, color: color, borderColor: `${color}40` }}
  >
    {label}
  </span>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { icon?: React.ReactNode }> = ({ icon, className, ...props }) => (
  <div className="relative w-full">
    {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">{icon}</div>}
    <input
      {...props}
      className={`w-full bg-black/40 border border-white/10 rounded-xl ${icon ? 'pl-10' : 'px-4'} pr-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all ${className || ''}`}
    />
  </div>
);

export const HolographicSVG: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={`pointer-events-none ${className}`} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <motion.circle 
      cx="50" cy="50" r="40" 
      stroke="url(#holo-grad)" strokeWidth="0.5" strokeDasharray="4 4"
      animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
    />
    <motion.circle 
      cx="50" cy="50" r="30" 
      stroke="url(#holo-grad-rev)" strokeWidth="1" opacity="0.5"
      animate={{ rotate: -360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
    />
    <defs>
      <linearGradient id="holo-grad" x1="0" y1="0" x2="100" y2="100">
        <stop offset="0%" stopColor={THEME.violet} />
        <stop offset="50%" stopColor={THEME.rose} />
        <stop offset="100%" stopColor={THEME.cyan} />
      </linearGradient>
      <linearGradient id="holo-grad-rev" x1="100" y1="100" x2="0" y2="0">
        <stop offset="0%" stopColor={THEME.emerald} />
        <stop offset="100%" stopColor={THEME.violet} />
      </linearGradient>
    </defs>
  </svg>
);
