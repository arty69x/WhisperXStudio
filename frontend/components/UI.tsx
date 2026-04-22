import React from "react";
import { motion } from "framer-motion";
import { THEME } from "../constants";

export const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({ children, className = "", onClick }) => (
  <motion.div
    whileHover={onClick ? { y: -2, borderColor: "rgba(255,255,255,0.2)" } : {}}
    onClick={onClick}
    className={`glass-panel rounded-2xl p-5 transition-colors ${onClick ? 'cursor-pointer' : ''} ${className}`}
  >
    {children}
  </motion.div>
);

export const Button: React.FC<{ 
  children: React.ReactNode; 
  onClick?: () => void; 
  variant?: "primary" | "secondary" | "danger";
  className?: string;
  disabled?: boolean;
}> = ({ children, onClick, variant = "secondary", className = "", disabled }) => {
  const baseStyle = "px-4 py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-gradient-to-r from-violet-600 to-rose-600 text-white shadow-[0_0_15px_rgba(112,0,255,0.4)] hover:shadow-[0_0_25px_rgba(255,0,85,0.6)]",
    secondary: "bg-white/5 text-white border border-white/10 hover:bg-white/10",
    danger: "bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30"
  };

  return (
    <motion.button
      whileTap={disabled ? {} : { scale: 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${className}`}
    >
      {children}
    </motion.button>
  );
};

export const Badge: React.FC<{ label: string; color?: string }> = ({ label, color = THEME.violet }) => (
  <span 
    className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border"
    style={{ backgroundColor: `${color}20`, color: color, borderColor: `${color}40` }}
  >
    {label}
  </span>
);

export const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input
    {...props}
    className={`w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all ${props.className || ''}`}
  />
);
