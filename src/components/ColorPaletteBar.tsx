import React, { useState } from 'react';
import { Palette, Check, Sparkles, ChevronDown, X, RotateCw } from 'lucide-react';
import { COLOR_PALETTES, ColorPaletteId } from '../data/colorPalettes';

interface ColorPaletteBarProps {
  currentPaletteId: ColorPaletteId;
  onSelectPalette: (id: ColorPaletteId) => void;
  theme: 'dark' | 'light';
}

export function ColorPaletteBar({
  currentPaletteId,
  onSelectPalette,
  theme,
}: ColorPaletteBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const isDark = theme === 'dark';

  const currentPalette =
    COLOR_PALETTES.find((p) => p.id === currentPaletteId) || COLOR_PALETTES[0];

  const handleCycleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentIndex = COLOR_PALETTES.findIndex((p) => p.id === currentPaletteId);
    const nextIndex = (currentIndex + 1) % COLOR_PALETTES.length;
    const nextPalette = COLOR_PALETTES[nextIndex];
    onSelectPalette(nextPalette.id);
    setToastMessage(`تم تفعيل: ${nextPalette.nameAr}`);
    setTimeout(() => setToastMessage(null), 2200);
  };

  const handleSelect = (id: ColorPaletteId) => {
    const selected = COLOR_PALETTES.find((p) => p.id === id);
    onSelectPalette(id);
    setIsOpen(false);
    if (selected) {
      setToastMessage(`تم تفعيل: ${selected.nameAr}`);
      setTimeout(() => setToastMessage(null), 2200);
    }
  };

  return (
    <div className="relative inline-flex items-center gap-1">
      {/* Trigger Button with Active Swatch Preview */}
      <div className="inline-flex items-center rounded-xl border border-stone-700/50 shadow-sm overflow-hidden">
        <button
          id="color-palette-btn"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium transition-all ${
            isDark
              ? 'bg-stone-900 text-stone-200 hover:bg-stone-850 hover:text-white'
              : 'bg-white text-[#0a2737] hover:bg-[#f0f7fa]'
          }`}
          title="بنتونة ألوان التطبيق - تغيير المظهر والصبغة اللونية"
        >
          <div className="flex items-center -space-x-1 rtl:space-x-reverse">
            <span
              className="w-2.5 h-2.5 rounded-full ring-1 ring-white/60 shadow-sm"
              style={{ backgroundColor: currentPalette.swatch.primary }}
            />
            <span
              className="w-2.5 h-2.5 rounded-full ring-1 ring-white/60 shadow-sm"
              style={{ backgroundColor: currentPalette.swatch.secondary }}
            />
            <span
              className="w-2.5 h-2.5 rounded-full ring-1 ring-white/60 shadow-sm"
              style={{ backgroundColor: currentPalette.swatch.accent }}
            />
          </div>
          <Palette className="w-3.5 h-3.5 text-cyan-500" />
          <span className="text-[11px] font-bold hidden sm:inline">الألوان</span>
          <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Quick 1-Click Cycle Button */}
        <button
          id="color-palette-quick-cycle-btn"
          type="button"
          onClick={handleCycleNext}
          className={`px-1.5 py-1.5 border-r rtl:border-r-0 rtl:border-l border-stone-700/40 text-stone-400 hover:text-amber-400 transition-colors ${
            isDark ? 'bg-stone-950 hover:bg-stone-900' : 'bg-stone-100 hover:bg-stone-200'
          }`}
          title="تبديل سريع للسمة اللونية التالية بنقرة واحدة"
        >
          <RotateCw className="w-3 h-3" />
        </button>
      </div>

      {/* Floating Instant Feedback Toast */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-stone-950/95 text-amber-400 text-xs px-4 py-2 rounded-full border border-amber-500/50 shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-150 font-bold">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Palette Popover / Modal Menu */}
      {isOpen && (
        <>
          {/* Backdrop for easy closing */}
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-[2px]"
            onClick={() => setIsOpen(false)}
          />

          <div
            className={`fixed sm:absolute top-20 sm:top-auto sm:mt-2 left-4 right-4 sm:left-auto sm:right-0 max-w-sm sm:w-80 rounded-2xl border shadow-2xl z-50 p-4 animate-in fade-in zoom-in-95 duration-150 ${
              isDark
                ? 'bg-stone-950/98 border-stone-800 text-stone-100 shadow-cyan-950/30'
                : 'bg-white border-[#b6d5e6] text-[#0a2737] shadow-xl shadow-cyan-900/10'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-stone-200 dark:border-stone-800 mb-2.5">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4 text-cyan-500" />
                <span className="font-bold text-xs sm:text-sm">بنتونة سمات ألوان منهاج</span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-6 h-6 rounded-full flex items-center justify-center text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className={`text-[11px] mb-3 leading-relaxed ${isDark ? 'text-stone-400' : 'text-[#2e5368]'}`}>
              انقر على أي سمة لتغيير صبغة المنصة فورياً في كامل الواجهة والخلفيات والحدود:
            </p>

            {/* List of Swatches */}
            <div className="space-y-2 max-h-80 overflow-y-auto pr-0.5">
              {COLOR_PALETTES.map((pal) => {
                const isSelected = pal.id === currentPaletteId;
                return (
                  <button
                    key={pal.id}
                    id={`palette-option-${pal.id}`}
                    type="button"
                    onClick={() => handleSelect(pal.id)}
                    className={`w-full p-2.5 rounded-xl border flex items-center justify-between text-right transition-all group ${
                      isSelected
                        ? isDark
                          ? 'bg-cyan-950/70 border-cyan-500 shadow-md ring-1 ring-cyan-500/50'
                          : 'bg-[#eef8fc] border-[#0891b2] shadow-sm ring-1 ring-[#0891b2]/40'
                        : isDark
                        ? 'bg-stone-900/80 border-stone-800 hover:border-stone-700 hover:bg-stone-850'
                        : 'bg-stone-50 border-stone-200 hover:border-[#bae6fd] hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {/* Swatch Triple Circles */}
                      <div className="flex items-center -space-x-1.5 rtl:space-x-reverse shrink-0">
                        <span
                          className="w-5 h-5 rounded-full ring-2 ring-white/80 dark:ring-stone-900 shadow-sm"
                          style={{ backgroundColor: pal.swatch.primary }}
                        />
                        <span
                          className="w-5 h-5 rounded-full ring-2 ring-white/80 dark:ring-stone-900 shadow-sm"
                          style={{ backgroundColor: pal.swatch.secondary }}
                        />
                        <span
                          className="w-5 h-5 rounded-full ring-2 ring-white/80 dark:ring-stone-900 shadow-sm"
                          style={{ backgroundColor: pal.swatch.accent }}
                        />
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-bold leading-tight flex items-center gap-1.5">
                          <span>{pal.nameAr}</span>
                          {pal.id === 'minhaj-teal' && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-500 border border-amber-500/30 font-mono font-bold">
                              الرسمية
                            </span>
                          )}
                        </div>
                        <p className={`text-[10px] mt-0.5 line-clamp-1 ${isDark ? 'text-stone-400' : 'text-[#486576]'}`}>
                          {pal.descriptionAr}
                        </p>
                      </div>
                    </div>

                    {isSelected ? (
                      <div className="w-5 h-5 rounded-full bg-cyan-500 text-stone-950 flex items-center justify-center shrink-0 mr-2">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    ) : (
                      <span className="text-[10px] font-mono text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        تطبيق
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Quick 1-click cycle helper inside modal too */}
            <div className="mt-3 pt-2.5 border-t border-stone-800/80 flex items-center justify-between text-[11px]">
              <button
                type="button"
                onClick={handleCycleNext}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-amber-400 font-bold border border-stone-700 transition-colors"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>السمة التالية (تدوير سريع)</span>
              </button>

              <span className={`text-[10px] ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                تُحفظ تلقائياً
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
