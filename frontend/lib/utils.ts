export const uid = (prefix = "id") => `${prefix}-${Math.random().toString(36).slice(2, 11)}`;

export const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const THEME = {
  bg: "#010105",
  panel: "#0c0c2d",
  rose: "#ff0055",
  violet: "#7000ff",
  emerald: "#00f5a0",
  amber: "#ffcc00",
  cyan: "#00d4ff",
  text: "#f0f2f5",
  muted: "rgba(148,163,184,0.55)",
  border: "rgba(255,255,255,0.08)",
};
