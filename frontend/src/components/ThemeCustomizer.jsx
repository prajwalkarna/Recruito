import { useState } from "react";
import { useTheme } from "../context/ThemeContext";

const PRESET_COLORS = [
  { name: "Purple", value: "#667eea" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Green", value: "#10b981" },
  { name: "Red", value: "#ef4444" },
  { name: "Orange", value: "#f59e0b" },
  { name: "Pink", value: "#ec4899" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Teal", value: "#14b8a6" },
];

export default function ThemeCustomizer() {
  const { theme, accentColor, toggleTheme, changeAccentColor } = useTheme();
  const [pendingColor, setPendingColor] = useState(accentColor);
  const [showCustomizer, setShowCustomizer] = useState(false);

  const handleApply = () => {
    if (/^#[0-9A-Fa-f]{6}$/.test(pendingColor)) {
      changeAccentColor(pendingColor);
    } else {
      alert("Invalid color format. Use hex format (#RRGGBB)");
    }
  };

  return (
    <>
      {/* Theme Toggle Button (Floating) */}
      <button
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-primary text-on-primary shadow-2xl z-[1000] flex items-center justify-center text-2xl hover:scale-110 active:scale-95 transition-all shadow-primary/30 group"
        onClick={() => setShowCustomizer(!showCustomizer)}
        title="Neural Interface Settings"
      >
        <span className="material-symbols-outlined group-hover:rotate-45 transition-transform">settings</span>
      </button>

      {/* Customizer Panel */}
      {showCustomizer && (
        <div className="fixed bottom-24 right-8 w-80 bg-[#16161e] border border-white/10 rounded-2xl shadow-2xl z-[1001] overflow-hidden animate-in slide-in-from-bottom-4 zoom-in-95 duration-200">
          <div className="flex justify-between items-center p-5 bg-gradient-to-r from-primary/20 to-indigo-500/20 border-b border-white/5">
            <h3 className="text-[10px] font-black text-white uppercase tracking-widest italic flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">palette</span> Interface Tuning
            </h3>
            <button
              className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 text-white/40 flex items-center justify-center hover:bg-white/10 hover:text-white transition-all"
              onClick={() => setShowCustomizer(false)}
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>

          <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar text-white">
            {/* Dark Mode Toggle */}
            <div className="space-y-4">
              <h4 className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Manifest State</h4>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => theme === "dark" && toggleTheme()}
                  className={`py-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${theme === 'light' ? 'bg-primary text-on-primary border-primary shadow-lg shadow-primary/10' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}
                >
                  ☀️ Solar
                </button>
                <button 
                  onClick={() => theme === "light" && toggleTheme()}
                  className={`py-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${theme === 'dark' ? 'bg-primary text-on-primary border-primary shadow-lg shadow-primary/10' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}
                >
                  🌙 Nocturnal
                </button>
              </div>
            </div>

            {/* Accent Color */}
            <div className="space-y-4">
              <h4 className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Chroma Accent</h4>
              <div className="grid grid-cols-4 gap-3">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color.value}
                    className={`aspect-square rounded-lg border-2 transition-all hover:scale-110 flex items-center justify-center ${pendingColor === color.value ? 'border-primary outline outline-offset-2 outline-primary/30' : 'border-transparent'}`}
                    style={{ backgroundColor: color.value }}
                    onClick={() => setPendingColor(color.value)}
                    title={color.name}
                  >
                    {pendingColor === color.value && <span className="material-symbols-outlined text-white text-xs">check</span>}
                  </button>
                ))}
              </div>

              {/* Custom Color */}
              <div className="pt-4 border-t border-white/5 space-y-3">
                <label className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] ml-1">Custom Hex</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={pendingColor}
                    onChange={(e) => setPendingColor(e.target.value)}
                    className="w-10 h-10 rounded-lg bg-transparent border-none cursor-pointer overflow-hidden p-0"
                  />
                  <input
                    type="text"
                    value={pendingColor}
                    onChange={(e) => setPendingColor(e.target.value)}
                    placeholder="#667eea"
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-[10px] font-black text-white focus:outline-none focus:border-primary uppercase tracking-widest"
                  />
                  <button 
                    onClick={handleApply}
                    className="px-4 py-2 bg-primary border border-primary text-on-primary text-[9px] font-black uppercase tracking-widest rounded-lg hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-4 pt-4 border-t border-white/5">
              <h4 className="text-[9px] font-black text-white/40 uppercase tracking-[0.2em] ml-1">Neural Preview</h4>
              <div className="bg-white/[0.02] border border-white/5 p-5 rounded-xl text-center space-y-4">
                <p className="text-[10px] font-medium text-on-surface-variant italic">Protocol visual verification.</p>
                <div className="space-y-2">
                    <button
                      className="w-full py-3 rounded-xl text-[9px] font-black uppercase tracking-widest text-on-primary shadow-lg transition-all"
                      style={{
                        backgroundColor: pendingColor,
                        boxShadow: `0 8px 16px ${pendingColor}33`,
                      }}
                    >
                      Buffered State
                    </button>
                    <p className="text-[8px] text-white/30 uppercase tracking-[0.1em]">Changes above are pending application</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
