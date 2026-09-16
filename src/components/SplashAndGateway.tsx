import React, { useState, useEffect } from 'react';
import { ShieldCheck, Moon, Sun, Lock, Sparkles, ChevronLeft, Heart, BookOpen, Users, Languages, Settings } from 'lucide-react';
import { MinhajOfficialLogo } from './MinhajOfficialLogo';
import { ColorPaletteBar } from './ColorPaletteBar';
import { ColorPaletteId } from '../data/colorPalettes';
import { SupportedLanguage } from '../data/translations';

interface SplashAndGatewayProps {
  onSelectGender: (gender: 'male' | 'female') => void;
  onAdminClick: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  selectedLanguage?: SupportedLanguage;
  onOpenLanguageModal?: () => void;
  colorPaletteId?: ColorPaletteId;
  onSelectPalette?: (id: ColorPaletteId) => void;
}

export function SplashAndGateway({
  onSelectGender,
  onAdminClick,
  theme,
  onToggleTheme,
  selectedLanguage = 'ar',
  onOpenLanguageModal,
  colorPaletteId = 'minhaj-teal',
  onSelectPalette,
}: SplashAndGatewayProps) {
  const [stage, setStage] = useState<'splash' | 'gateway'>('splash');
  const [logoClicks, setLogoClicks] = useState(0);

  // Auto transition from splash to gateway after 2.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setStage('gateway');
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  const handleLogoClick = () => {
    const next = logoClicks + 1;
    setLogoClicks(next);
    if (next >= 5) {
      setLogoClicks(0);
      onAdminClick();
    }
  };

  const isDark = theme === 'dark';

  return (
    <div
      id="minhaj-portal-entry-container"
      className={`min-h-screen w-full flex flex-col items-center justify-center p-4 transition-colors duration-300 ${
        isDark ? 'bg-islamic-pattern-dark text-stone-100' : 'bg-islamic-pattern-light text-[#0a2737]'
      }`}
      dir={selectedLanguage === 'ar' || selectedLanguage === 'ur' ? 'rtl' : 'ltr'}
    >
      {/* Top Utility Bar with Language, Color Palette, Theme Toggle */}
      <header className="fixed top-3 left-3 right-3 max-w-xl mx-auto flex items-center justify-between z-20 gap-2">
        <div className="flex items-center gap-2">
          <span className={`text-[11px] px-2.5 py-1 rounded-full font-bold border transition-all ${
            isDark ? 'bg-[#0b212c]/90 text-cyan-300 border-[#164e63]/50' : 'bg-white/95 text-[#0c3e54] border-[#cde2ec] shadow-sm'
          }`}>
            منصة مِـنْـهَـاجْ
          </span>
          {logoClicks > 0 && logoClicks < 5 && (
            <span className="text-[10px] text-amber-500 animate-pulse font-mono font-bold">
              ({logoClicks}/5)
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* 🎨 Color Palette Selector */}
          {onSelectPalette && (
            <ColorPaletteBar
              currentPaletteId={colorPaletteId}
              onSelectPalette={onSelectPalette}
              theme={theme}
            />
          )}

          {/* 🌐 Language Switcher Button */}
          {onOpenLanguageModal && (
            <button
              id="splash-language-btn"
              onClick={onOpenLanguageModal}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-sm ${
                isDark
                  ? 'bg-stone-900 border-stone-800 text-stone-200 hover:bg-stone-850'
                  : 'bg-white border-[#cde2ec] text-[#0a2737] hover:bg-[#f0f7fa]'
              }`}
              title="تغيير لغة العرض (Change Language)"
            >
              <Languages className="w-3.5 h-3.5 text-cyan-500" />
              <span className="font-mono text-xs uppercase font-bold">{selectedLanguage}</span>
            </button>
          )}

          {/* Theme Toggle */}
          <button
            id="theme-toggle-splash-btn"
            onClick={onToggleTheme}
            className={`p-2 rounded-xl border transition-all ${
              isDark
                ? 'bg-[#0b212c] text-amber-400 border-[#164e63] hover:bg-[#0e2c3b]'
                : 'bg-white text-[#0c3e54] border-[#cde2ec] hover:bg-[#f0f7fa] shadow-sm'
            }`}
            title={isDark ? 'تفعيل الوضع النهاري' : 'تفعيل الوضع الليلي'}
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* ⚙️ Admin Control Panel Settings Gear (تروس الإعدادات للإدارة) */}
          <button
            id="splash-admin-settings-btn"
            type="button"
            onClick={onAdminClick}
            className={`p-2 rounded-xl border transition-all duration-200 group flex items-center gap-1 ${
              isDark
                ? 'bg-[#0b212c] text-amber-400 border-[#164e63] hover:bg-[#0e2c3b] hover:border-amber-400/60'
                : 'bg-white text-[#0c3e54] border-[#cde2ec] hover:text-amber-600 hover:bg-[#f0f7fa] shadow-sm'
            }`}
            title="لوحة الإدارة والتحكم (للمشرف العام)"
            aria-label="لوحة الإدارة والتحكم"
          >
            <Settings className="w-4 h-4 text-amber-400 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* STAGE 1: SPLASH SCREEN (شاشة البداية وشعار منهاج النوراني)                 */}
      {/* ========================================================================= */}
      {stage === 'splash' && (
        <div
          id="splash-screen"
          className="flex flex-col items-center justify-center text-center max-w-md w-full animate-in fade-in zoom-in-95 duration-500 space-y-5 cursor-pointer"
          onClick={() => setStage('gateway')}
        >
          {/* Official Emblem & Wordmark Component */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleLogoClick();
            }}
            className="transition-transform hover:scale-105 duration-300"
          >
            <MinhajOfficialLogo size="xl" showSubtitle={true} theme={theme} />
          </div>

          <div className="space-y-1 pt-1">
            <p className={`text-xs font-bold ${isDark ? 'text-cyan-300/90' : 'text-[#164359]'}`}>
              منصة التحفيظ الشامل والعفة الشرعية والزواج المنضبط
            </p>
            <p className={`text-[11px] ${isDark ? 'text-stone-400' : 'text-[#486576]'}`}>
              على كتاب الله وسنة رسوله ﷺ
            </p>
          </div>

          {/* Sharia Badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <span className={`inline-flex items-center gap-1 text-[11px] px-3 py-1 rounded-full border font-bold ${
              isDark ? 'bg-cyan-950/60 text-cyan-300 border-cyan-800/50' : 'bg-[#e0f2fe] text-[#0369a1] border-[#bae6fd]'
            }`}>
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />
              عزل شرعي تام
            </span>
            <span className={`inline-flex items-center gap-1 text-[11px] px-3 py-1 rounded-full border font-bold ${
              isDark ? 'bg-[#0b212c] text-amber-300 border-amber-800/40' : 'bg-[#fef3c7] text-[#92400e] border-[#fde68a]'
            }`}>
              <BookOpen className="w-3.5 h-3.5 text-amber-500" />
              حلقات القرآن والتدبر
            </span>
          </div>

          <button
            onClick={() => setStage('gateway')}
            className="mt-4 px-7 py-2.5 rounded-xl bg-gradient-to-r from-[#0c3e54] to-[#0891b2] hover:from-[#092e3f] hover:to-[#0e7490] text-white text-xs font-bold shadow-lg transition-all active:scale-95 flex items-center gap-2 mx-auto"
          >
            <span>الدخول للبوابات الشرعية</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STAGE 2: GATEWAY PORTALS SCREEN (دخول الرجال / دخول النساء)               */}
      {/* ========================================================================= */}
      {stage === 'gateway' && (
        <div
          id="gateway-screen"
          className="w-full max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6 text-center"
        >
          {/* Logo Header */}
          <div
            onClick={handleLogoClick}
            className="cursor-pointer inline-block"
            title="انقر 5 مرات على شعار منهاج للوصول للوحة الإدارة"
          >
            <MinhajOfficialLogo size="md" showSubtitle={false} theme={theme} />
          </div>

          <div className="space-y-1 -mt-2">
            <h2 className={`text-lg sm:text-xl font-black ${isDark ? 'text-white' : 'text-[#0a2737]'}`}>
              اختر بوابة الدخول الشرعي
            </h2>
            <p className={`text-xs max-w-md mx-auto leading-relaxed ${isDark ? 'text-stone-300' : 'text-[#2e5368]'}`}>
              عملاً بضوابط صيانة العفة وغض البصر الشرعي، يرجى اختيار البوابة المخصصة لك للدخول لمسارك الخاص:
            </p>
          </div>

          {/* Two Main Gateway Cards (دخول الرجال / دخول النساء) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-right pt-2">
            {/* CARD 1: دخول الرجال */}
            <div
              id="portal-male-card"
              onClick={() => onSelectGender('male')}
              className={`group cursor-pointer rounded-2xl p-5 border-2 transition-all duration-300 relative overflow-hidden flex flex-col justify-between shadow-xl hover:-translate-y-1 ${
                isDark
                  ? 'bg-[#0b212c] hover:bg-[#0e2c3b] border-[#164e63] hover:border-[#06b6d4]'
                  : 'bg-white hover:bg-[#f0f9ff] border-[#b6d5e6] hover:border-[#0284c7] shadow-sm'
              }`}
            >
              {/* Subtle top badge */}
              <div className="flex items-center justify-between mb-4">
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                  isDark ? 'bg-cyan-950 text-cyan-300 border-cyan-800' : 'bg-[#e0f2fe] text-[#0369a1] border-[#bae6fd]'
                }`}>
                  للإخوة الكرام
                </span>
                <span className="text-2xl">👨</span>
              </div>

              {/* Center Icon & Branding */}
              <div className="space-y-2 mb-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-md transition-transform group-hover:scale-110 ${
                  isDark ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/50' : 'bg-gradient-to-br from-[#0c3e54] to-[#0891b2] text-white'
                }`}>
                  <Users className="w-7 h-7" />
                </div>
                <h3 className={`text-xl font-black ${isDark ? 'text-stone-100' : 'text-[#0a2737]'}`}>
                  دخول الرجال
                </h3>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-stone-300' : 'text-[#164359]'}`}>
                  بوابة الإخوة الراغبين في العفة والزواج الشرعي، وحلقات القرآن الكريم ومدارسة العلم.
                </p>
              </div>

              {/* Sharia Purpose details */}
              <div className={`p-3 rounded-xl text-[11px] space-y-1 mb-4 border ${
                isDark ? 'bg-stone-950/70 border-stone-800 text-stone-300' : 'bg-[#f4f8fa] border-[#cde2ec] text-[#0c3e54]'
              }`}>
                <div className="flex items-center gap-1.5 font-bold text-cyan-600 dark:text-cyan-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>المسار الشرعي المخصص:</span>
                </div>
                <p className="text-[10px] leading-normal opacity-90">
                  تصفح استمارات الأخوات بموافقة الولي الشرعي، وتفعيل التوافق الذكي، وحلقات القرآن.
                </p>
              </div>

              {/* Action Button */}
              <button
                id="enter-male-portal-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectGender('male');
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#0c3e54] to-[#0891b2] hover:from-[#092e3f] hover:to-[#0e7490] text-white text-xs font-bold transition-colors shadow-md flex items-center justify-center gap-1.5"
              >
                <span>دخول بوابة الرجال</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>

            {/* CARD 2: دخول النساء */}
            <div
              id="portal-female-card"
              onClick={() => onSelectGender('female')}
              className={`group cursor-pointer rounded-2xl p-5 border-2 transition-all duration-300 relative overflow-hidden flex flex-col justify-between shadow-xl hover:-translate-y-1 ${
                isDark
                  ? 'bg-[#0b212c] hover:bg-[#0e2c3b] border-amber-600/40 hover:border-amber-400'
                  : 'bg-white hover:bg-[#fffdf5] border-amber-300 hover:border-amber-500 shadow-sm'
              }`}
            >
              {/* Subtle top badge */}
              <div className="flex items-center justify-between mb-4">
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                  isDark ? 'bg-amber-950/80 text-amber-300 border-amber-800/60' : 'bg-amber-100 text-amber-900 border-amber-200'
                }`}>
                  للأخوات وأولياء الأمور
                </span>
                <span className="text-2xl">🧕</span>
              </div>

              {/* Center Icon & Branding */}
              <div className="space-y-2 mb-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-md transition-transform group-hover:scale-110 ${
                  isDark ? 'bg-amber-950 text-amber-300 border border-amber-700/50' : 'bg-gradient-to-br from-[#b45309] to-[#d97706] text-white'
                }`}>
                  <Heart className="w-7 h-7" />
                </div>
                <h3 className={`text-xl font-black ${isDark ? 'text-stone-100' : 'text-[#451a03]'}`}>
                  دخول الأخوات والولي
                </h3>
                <p className={`text-xs leading-relaxed ${isDark ? 'text-stone-300' : 'text-[#78350f]'}`}>
                  بوابة الأخوات وأولياء الأمور المصونة، مع خصوصية تامة وحماية مطلقة لبيانات العفة.
                </p>
              </div>

              {/* Sharia Purpose details */}
              <div className={`p-3 rounded-xl text-[11px] space-y-1 mb-4 border ${
                isDark ? 'bg-stone-950/70 border-stone-800 text-stone-300' : 'bg-[#fffbeb] border-[#fde68a] text-[#78350f]'
              }`}>
                <div className="flex items-center gap-1.5 font-bold text-amber-600 dark:text-amber-400">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>خصوصية تامة وحجاب رقمي:</span>
                </div>
                <p className="text-[10px] leading-normal opacity-90">
                  لا تظهر أي أرقام هواتف أو صور شخصية، والاتصال حصرياً عبر الولي الشرعي بعد الجدية.
                </p>
              </div>

              {/* Action Button */}
              <button
                id="enter-female-portal-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectGender('female');
                }}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#b45309] to-[#d97706] hover:from-[#92400e] hover:to-[#b45309] text-white text-xs font-bold transition-colors shadow-md flex items-center justify-center gap-1.5"
              >
                <span>دخول بوابة الأخوات</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
