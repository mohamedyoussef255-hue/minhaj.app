import React from 'react';

interface MinhajOfficialLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  theme?: 'dark' | 'light';
  className?: string;
}

export function MinhajOfficialLogo({
  size = 'md',
  showSubtitle = true,
  theme = 'dark',
  className = '',
}: MinhajOfficialLogoProps) {
  const isDark = theme === 'dark';

  // Sizing scales
  const dimensions = {
    sm: { icon: 34, title: 'text-base', sub: 'text-[9px]' },
    md: { icon: 46, title: 'text-xl', sub: 'text-[11px]' },
    lg: { icon: 68, title: 'text-2xl sm:text-3xl', sub: 'text-xs sm:text-sm' },
    xl: { icon: 110, title: 'text-3xl sm:text-4xl', sub: 'text-sm sm:text-base' },
  }[size];

  return (
    <div className={`flex flex-col items-center justify-center text-center select-none ${className}`}>
      {/* Visual Dome & Quranic Marriage Silhouette Emblem */}
      <div className="relative flex items-center justify-center">
        <svg
          width={dimensions.icon}
          height={dimensions.icon}
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_4px_16px_rgba(8,145,178,0.25)] transition-transform hover:scale-105 duration-300"
        >
          {/* Subtle Outer Glow / Aureole */}
          <circle cx="100" cy="100" r="92" fill={isDark ? 'url(#darkAura)' : 'url(#lightAura)'} />

          {/* Mihrab Arch / Dome Golden Flourish */}
          <path
            d="M100 22 C115 48 152 74 154 114 C155 138 138 160 100 178 C62 160 45 138 46 114 C48 74 85 48 100 22 Z"
            fill="none"
            stroke="url(#goldGradient)"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Crescent Moon & Finial atop the dome */}
          <path
            d="M100 8 L100 20 M96 14 A6 6 0 1 1 104 14 A4.5 4.5 0 1 0 96 14"
            stroke="url(#cyanGradient)"
            strokeWidth="3.2"
            fill="url(#cyanGradient)"
            strokeLinecap="round"
          />

          {/* Dome Top Cap Accent */}
          <path
            d="M90 28 C95 24 105 24 110 28 C105 32 95 32 90 28 Z"
            fill="url(#cyanGradient)"
          />

          {/* Arabesque Golden Wings / Side Flourishes */}
          <path
            d="M48 114 C36 116 26 128 32 140 C38 152 52 148 56 142 C60 136 58 126 50 126"
            stroke="url(#goldGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M152 114 C164 116 174 128 168 140 C162 152 148 148 144 142 C140 136 142 126 150 126"
            stroke="url(#goldGradient)"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />

          {/* Bottom Flourish / Base Scroll */}
          <path
            d="M66 166 C80 180 100 188 100 188 C100 188 120 180 134 166 C144 176 136 188 100 196 C64 188 56 176 66 166 Z"
            fill="url(#petrolGradient)"
            stroke="url(#goldGradient)"
            strokeWidth="2.5"
          />

          {/* Couple Reading Holy Quran Silhouette Inside the Arch */}
          {/* Man Profile (Left) */}
          <path
            d="M84 76 A9 9 0 0 0 74 66 A9 9 0 0 0 66 76 C66 84 74 90 74 96 L70 124 L86 124 L86 102 C88 96 90 90 84 76 Z"
            fill="url(#petrolGradient)"
          />
          {/* Woman Profile in Hijab (Right) */}
          <path
            d="M116 74 C116 66 124 64 130 68 C136 72 136 82 132 90 C128 98 124 104 128 124 L114 124 L114 98 C112 90 114 82 116 74 Z"
            fill="url(#cyanGradient)"
          />

          {/* Open Holy Quran (Center) with Glowing Pages */}
          <path
            d="M100 128 L82 118 C80 117 78 119 78 121 L78 136 C78 138 80 140 82 141 L100 148 L118 141 C120 140 122 138 122 136 L122 121 C122 119 120 117 118 118 L100 128 Z"
            fill="url(#goldGradient)"
          />
          <path
            d="M100 128 L100 148"
            stroke="#0a2a38"
            strokeWidth="1.8"
          />
          {/* Quran Bookmark Ribbon */}
          <path
            d="M100 148 L100 156 L96 153 L92 156 L92 146"
            fill="url(#cyanGradient)"
          />

          {/* Gradients Definition */}
          <defs>
            <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fde047" />
              <stop offset="50%" stopColor="#eab308" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>

            <linearGradient id="cyanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="60%" stopColor="#06b6d4" />
              <stop offset="100%" stopColor="#0e7490" />
            </linearGradient>

            <linearGradient id="petrolGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1e3a5f" />
              <stop offset="70%" stopColor="#0c3547" />
              <stop offset="100%" stopColor="#082533" />
            </linearGradient>

            <radialGradient id="darkAura" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0891b2" stopOpacity="0.18" />
              <stop offset="70%" stopColor="#eab308" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="lightAura" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.22" />
              <stop offset="70%" stopColor="#fde047" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      {/* Typography: Wordmarks matching image_fed70e.jpeg */}
      <div className="mt-1 flex flex-col items-center leading-none">
        <span
          className={`font-black font-quran tracking-wide ${dimensions.title} ${
            isDark
              ? 'text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-200 drop-shadow-[0_2px_8px_rgba(251,191,36,0.3)]'
              : 'text-[#0a3547] drop-shadow-sm'
          }`}
        >
          مِـنْـهَـاجْ
        </span>
        <span
          className={`font-mono font-black tracking-[0.25em] text-[10px] sm:text-xs mt-0.5 ${
            isDark ? 'text-cyan-400' : 'text-[#0c3e54]'
          }`}
        >
          MINHAJ
        </span>
      </div>

      {/* Tagline / Subtitle */}
      {showSubtitle && (
        <div className="mt-1.5 flex items-center justify-center gap-1">
          <span className="w-3 h-px bg-amber-400/50" />
          <p
            className={`font-bold tracking-tight ${dimensions.sub} ${
              isDark ? 'text-stone-300' : 'text-[#0f3e54]'
            }`}
          >
            تحفيظ وقرآن • زواج وعفة • حلقات وتدبر
          </p>
          <span className="w-3 h-px bg-amber-400/50" />
        </div>
      )}
    </div>
  );
}
