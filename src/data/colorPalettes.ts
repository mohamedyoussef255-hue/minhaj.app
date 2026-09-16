import React from 'react';

export type ColorPaletteId = 'minhaj-teal' | 'royal-turquoise' | 'imperial-navy' | 'warm-amber' | 'celestial-sky' | 'classic-emerald';

export interface ColorPalette {
  id: ColorPaletteId;
  nameAr: string;
  nameEn: string;
  descriptionAr: string;
  swatch: {
    primary: string; // Hex for preview circles
    secondary: string;
    accent: string;
  };
  // Light Mode Colors
  light: {
    bgRoot: string;
    bgCard: string;
    bgHeader: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    border: string;
    borderActive: string;
    primaryBtn: string;
    primaryBtnHover: string;
    primaryBtnText: string;
    accentBadge: string;
    accentText: string;
    goldText: string;
    glowRing: string;
    cardShadow: string;
  };
  // Dark Mode Colors
  dark: {
    bgRoot: string;
    bgCard: string;
    bgHeader: string;
    textPrimary: string;
    textSecondary: string;
    textMuted: string;
    border: string;
    borderActive: string;
    primaryBtn: string;
    primaryBtnHover: string;
    primaryBtnText: string;
    accentBadge: string;
    accentText: string;
    goldText: string;
    glowRing: string;
    cardShadow: string;
  };
}

export const COLOR_PALETTES: ColorPalette[] = [
  {
    id: 'minhaj-teal',
    nameAr: 'هوية منهاج الرسمية (بترولي وذهب)',
    nameEn: 'Minhaj Official Teal & Gold',
    descriptionAr: 'الألوان الأصلية المستوحاة مباشرة من شعار منهاج: أزرق بترولي ملكي وذهب عتيق وفيروزي',
    swatch: {
      primary: '#0c3e54',
      secondary: '#0891b2',
      accent: '#d4af37',
    },
    light: {
      bgRoot: 'bg-gradient-to-b from-[#f0f7fa] via-[#f7fafc] to-[#eef6f9]',
      bgCard: 'bg-white',
      bgHeader: 'bg-white/95 border-[#cde2ec]',
      textPrimary: 'text-[#0a2737]',
      textSecondary: 'text-[#164359]',
      textMuted: 'text-[#486576]',
      border: 'border-[#cfe0ea]',
      borderActive: 'border-[#0891b2]',
      primaryBtn: 'bg-gradient-to-r from-[#0c3e54] to-[#0891b2] hover:from-[#092e3f] hover:to-[#0e7490]',
      primaryBtnHover: 'hover:bg-[#0c3e54]',
      primaryBtnText: 'text-white',
      accentBadge: 'bg-[#e0f2fe] text-[#0369a1] border-[#bae6fd]',
      accentText: 'text-[#0284c7]',
      goldText: 'text-[#b45309]',
      glowRing: 'focus:ring-[#0891b2]/40',
      cardShadow: 'shadow-sm shadow-[#0c3e54]/5',
    },
    dark: {
      bgRoot: 'bg-gradient-to-b from-[#06141c] via-[#081b24] to-[#051118]',
      bgCard: 'bg-[#0b212c]',
      bgHeader: 'bg-[#071720]/95 border-[#164e63]/50',
      textPrimary: 'text-[#f0f9ff]',
      textSecondary: 'text-[#94d2e8]',
      textMuted: 'text-[#6494a8]',
      border: 'border-[#164e63]/40',
      borderActive: 'border-[#06b6d4]',
      primaryBtn: 'bg-gradient-to-r from-[#0891b2] via-[#0284c7] to-[#0369a1] hover:from-[#06b6d4] hover:to-[#0284c7]',
      primaryBtnHover: 'hover:bg-[#0891b2]',
      primaryBtnText: 'text-white',
      accentBadge: 'bg-[#083344] text-[#38bdf8] border-[#0e7490]',
      accentText: 'text-[#38bdf8]',
      goldText: 'text-[#fbbf24]',
      glowRing: 'focus:ring-[#38bdf8]/40',
      cardShadow: 'shadow-lg shadow-black/40',
    },
  },
  {
    id: 'royal-turquoise',
    nameAr: 'الفيروزي والزمردي القرآني',
    nameEn: 'Royal Turquoise & Emerald',
    descriptionAr: 'درجات الفيروزي النضر والأخضر الزمردي للمصاحف الكريمة',
    swatch: {
      primary: '#0f766e',
      secondary: '#06b6d4',
      accent: '#10b981',
    },
    light: {
      bgRoot: 'bg-gradient-to-b from-[#f0fdfa] via-[#f8fafc] to-[#e6fcf5]',
      bgCard: 'bg-white',
      bgHeader: 'bg-white/95 border-[#ccfbf1]',
      textPrimary: 'text-[#042f2e]',
      textSecondary: 'text-[#115e59]',
      textMuted: 'text-[#3d7a75]',
      border: 'border-[#ccfbf1]',
      borderActive: 'border-[#0d9488]',
      primaryBtn: 'bg-gradient-to-r from-[#0f766e] to-[#0d9488] hover:from-[#115e59] hover:to-[#0f766e]',
      primaryBtnHover: 'hover:bg-[#0f766e]',
      primaryBtnText: 'text-white',
      accentBadge: 'bg-[#ccfbf1] text-[#0f766e] border-[#99f6e4]',
      accentText: 'text-[#0d9488]',
      goldText: 'text-[#ca8a04]',
      glowRing: 'focus:ring-[#14b8a6]/40',
      cardShadow: 'shadow-sm shadow-[#0f766e]/5',
    },
    dark: {
      bgRoot: 'bg-gradient-to-b from-[#041a18] via-[#062623] to-[#031513]',
      bgCard: 'bg-[#08302c]',
      bgHeader: 'bg-[#051c1a]/95 border-[#115e59]/50',
      textPrimary: 'text-[#f0fdfa]',
      textSecondary: 'text-[#99f6e4]',
      textMuted: 'text-[#5eead4]/70',
      border: 'border-[#134e48]',
      borderActive: 'border-[#2dd4bf]',
      primaryBtn: 'bg-gradient-to-r from-[#0d9488] to-[#14b8a6] hover:from-[#14b8a6] hover:to-[#2dd4bf]',
      primaryBtnHover: 'hover:bg-[#0d9488]',
      primaryBtnText: 'text-stone-950 font-bold',
      accentBadge: 'bg-[#134e4a] text-[#5eead4] border-[#0d9488]',
      accentText: 'text-[#2dd4bf]',
      goldText: 'text-[#facc15]',
      glowRing: 'focus:ring-[#2dd4bf]/40',
      cardShadow: 'shadow-lg shadow-black/40',
    },
  },
  {
    id: 'imperial-navy',
    nameAr: 'الكحلي الملكي والذهب الصافي',
    nameEn: 'Imperial Navy & Pure Gold',
    descriptionAr: 'فخامة الكحلي الأندلسي والذهب الصافي لهيبة القرآن وباقات العفة الملكية',
    swatch: {
      primary: '#1e1b4b',
      secondary: '#4338ca',
      accent: '#f59e0b',
    },
    light: {
      bgRoot: 'bg-gradient-to-b from-[#f5f5ff] via-[#fafaff] to-[#eef0ff]',
      bgCard: 'bg-white',
      bgHeader: 'bg-white/95 border-[#e0e7ff]',
      textPrimary: 'text-[#1e1b4b]',
      textSecondary: 'text-[#312e81]',
      textMuted: 'text-[#4c4b7b]',
      border: 'border-[#e0e7ff]',
      borderActive: 'border-[#6366f1]',
      primaryBtn: 'bg-gradient-to-r from-[#312e81] to-[#4338ca] hover:from-[#1e1b4b] hover:to-[#3730a3]',
      primaryBtnHover: 'hover:bg-[#312e81]',
      primaryBtnText: 'text-white',
      accentBadge: 'bg-[#e0e7ff] text-[#3730a3] border-[#c7d2fe]',
      accentText: 'text-[#4f46e5]',
      goldText: 'text-[#b45309]',
      glowRing: 'focus:ring-[#6366f1]/40',
      cardShadow: 'shadow-sm shadow-[#1e1b4b]/5',
    },
    dark: {
      bgRoot: 'bg-gradient-to-b from-[#0a091e] via-[#110f33] to-[#080718]',
      bgCard: 'bg-[#15133d]',
      bgHeader: 'bg-[#0d0b26]/95 border-[#312e81]/60',
      textPrimary: 'text-[#e0e7ff]',
      textSecondary: 'text-[#a5b4fc]',
      textMuted: 'text-[#6366f1]/80',
      border: 'border-[#312e81]/60',
      borderActive: 'border-[#818cf8]',
      primaryBtn: 'bg-gradient-to-r from-[#4f46e5] to-[#6366f1] hover:from-[#6366f1] hover:to-[#818cf8]',
      primaryBtnHover: 'hover:bg-[#4f46e5]',
      primaryBtnText: 'text-white',
      accentBadge: 'bg-[#1e1b4b] text-[#c7d2fe] border-[#4338ca]',
      accentText: 'text-[#a5b4fc]',
      goldText: 'text-[#fbbf24]',
      glowRing: 'focus:ring-[#818cf8]/40',
      cardShadow: 'shadow-lg shadow-black/40',
    },
  },
  {
    id: 'warm-amber',
    nameAr: 'العنبر والذهب الدافئ (العفة)',
    nameEn: 'Warm Amber & Royal Ochre',
    descriptionAr: 'درجات العنبر الذهبي والبرونز الدافئ، تفيض بالمودة والسكينة',
    swatch: {
      primary: '#78350f',
      secondary: '#d97706',
      accent: '#f59e0b',
    },
    light: {
      bgRoot: 'bg-gradient-to-b from-[#fffbeb] via-[#fffdf5] to-[#fef3c7]',
      bgCard: 'bg-white',
      bgHeader: 'bg-white/95 border-[#fde68a]',
      textPrimary: 'text-[#451a03]',
      textSecondary: 'text-[#78350f]',
      textMuted: 'text-[#92400e]',
      border: 'border-[#fde68a]',
      borderActive: 'border-[#d97706]',
      primaryBtn: 'bg-gradient-to-r from-[#b45309] to-[#d97706] hover:from-[#92400e] hover:to-[#b45309]',
      primaryBtnHover: 'hover:bg-[#b45309]',
      primaryBtnText: 'text-white',
      accentBadge: 'bg-[#fef3c7] text-[#92400e] border-[#fde68a]',
      accentText: 'text-[#b45309]',
      goldText: 'text-[#b45309]',
      glowRing: 'focus:ring-[#f59e0b]/40',
      cardShadow: 'shadow-sm shadow-[#78350f]/5',
    },
    dark: {
      bgRoot: 'bg-gradient-to-b from-[#180d04] via-[#241407] to-[#120a03]',
      bgCard: 'bg-[#2b1809]',
      bgHeader: 'bg-[#1a0f05]/95 border-[#78350f]/60',
      textPrimary: 'text-[#fef3c7]',
      textSecondary: 'text-[#fcd34d]',
      textMuted: 'text-[#f59e0b]/70',
      border: 'border-[#78350f]/50',
      borderActive: 'border-[#f59e0b]',
      primaryBtn: 'bg-gradient-to-r from-[#d97706] to-[#f59e0b] hover:from-[#f59e0b] hover:to-[#fbbf24]',
      primaryBtnHover: 'hover:bg-[#d97706]',
      primaryBtnText: 'text-stone-950 font-bold',
      accentBadge: 'bg-[#451a03] text-[#fde68a] border-[#b45309]',
      accentText: 'text-[#fcd34d]',
      goldText: 'text-[#fbbf24]',
      glowRing: 'focus:ring-[#f59e0b]/40',
      cardShadow: 'shadow-lg shadow-black/40',
    },
  },
  {
    id: 'celestial-sky',
    nameAr: 'السماوي الهادئ والثلج النقي',
    nameEn: 'Celestial Sky & Ice Blue',
    descriptionAr: 'أزرق سماوي نقي يبعث على الراحة النفسية والتركيز في التلاوة والحفظ',
    swatch: {
      primary: '#0369a1',
      secondary: '#0ea5e9',
      accent: '#38bdf8',
    },
    light: {
      bgRoot: 'bg-gradient-to-b from-[#f0f9ff] via-[#f8fafc] to-[#e0f2fe]',
      bgCard: 'bg-white',
      bgHeader: 'bg-white/95 border-[#bae6fd]',
      textPrimary: 'text-[#082f49]',
      textSecondary: 'text-[#0369a1]',
      textMuted: 'text-[#0c4a6e]',
      border: 'border-[#bae6fd]',
      borderActive: 'border-[#0ea5e9]',
      primaryBtn: 'bg-gradient-to-r from-[#0284c7] to-[#0ea5e9] hover:from-[#0369a1] hover:to-[#0284c7]',
      primaryBtnHover: 'hover:bg-[#0284c7]',
      primaryBtnText: 'text-white',
      accentBadge: 'bg-[#e0f2fe] text-[#0369a1] border-[#bae6fd]',
      accentText: 'text-[#0284c7]',
      goldText: 'text-[#b45309]',
      glowRing: 'focus:ring-[#38bdf8]/40',
      cardShadow: 'shadow-sm shadow-[#0369a1]/5',
    },
    dark: {
      bgRoot: 'bg-gradient-to-b from-[#03131e] via-[#051c2c] to-[#020e17]',
      bgCard: 'bg-[#082436]',
      bgHeader: 'bg-[#041724]/95 border-[#0369a1]/60',
      textPrimary: 'text-[#f0f9ff]',
      textSecondary: 'text-[#7dd3fc]',
      textMuted: 'text-[#38bdf8]/70',
      border: 'border-[#075985]/60',
      borderActive: 'border-[#38bdf8]',
      primaryBtn: 'bg-gradient-to-r from-[#0284c7] to-[#38bdf8] hover:from-[#0369a1] hover:to-[#0284c7]',
      primaryBtnHover: 'hover:bg-[#0284c7]',
      primaryBtnText: 'text-stone-950 font-bold',
      accentBadge: 'bg-[#082f49] text-[#bae6fd] border-[#0284c7]',
      accentText: 'text-[#38bdf8]',
      goldText: 'text-[#facc15]',
      glowRing: 'focus:ring-[#38bdf8]/40',
      cardShadow: 'shadow-lg shadow-black/40',
    },
  },
  {
    id: 'classic-emerald',
    nameAr: 'الزمرد النبوي والزيتوني الأصيل',
    nameEn: 'Classic Prophetic Emerald',
    descriptionAr: 'الأخضر الزمردي الكلاسيكي لرياض الجنة وحلقات العلم الشريف',
    swatch: {
      primary: '#064e3b',
      secondary: '#059669',
      accent: '#10b981',
    },
    light: {
      bgRoot: 'bg-gradient-to-b from-[#f0fdf4] via-[#f7fee7] to-[#ecfdf5]',
      bgCard: 'bg-white',
      bgHeader: 'bg-white/95 border-[#bbf7d0]',
      textPrimary: 'text-[#022c22]',
      textSecondary: 'text-[#065f46]',
      textMuted: 'text-[#047857]',
      border: 'border-[#bbf7d0]',
      borderActive: 'border-[#10b981]',
      primaryBtn: 'bg-gradient-to-r from-[#065f46] to-[#059669] hover:from-[#064e3b] hover:to-[#047857]',
      primaryBtnHover: 'hover:bg-[#065f46]',
      primaryBtnText: 'text-white',
      accentBadge: 'bg-[#dcfce7] text-[#15803d] border-[#bbf7d0]',
      accentText: 'text-[#16a34a]',
      goldText: 'text-[#ca8a04]',
      glowRing: 'focus:ring-[#10b981]/40',
      cardShadow: 'shadow-sm shadow-[#064e3b]/5',
    },
    dark: {
      bgRoot: 'bg-gradient-to-b from-[#021812] via-[#04241b] to-[#02130e]',
      bgCard: 'bg-[#062d22]',
      bgHeader: 'bg-[#031d16]/95 border-[#065f46]/60',
      textPrimary: 'text-[#f0fdf4]',
      textSecondary: 'text-[#86efac]',
      textMuted: 'text-[#4ade80]/70',
      border: 'border-[#065f46]/50',
      borderActive: 'border-[#34d399]',
      primaryBtn: 'bg-gradient-to-r from-[#059669] to-[#10b981] hover:from-[#10b981] hover:to-[#34d399]',
      primaryBtnHover: 'hover:bg-[#059669]',
      primaryBtnText: 'text-stone-950 font-bold',
      accentBadge: 'bg-[#064e3b] text-[#86efac] border-[#059669]',
      accentText: 'text-[#34d399]',
      goldText: 'text-[#facc15]',
      glowRing: 'focus:ring-[#34d399]/40',
      cardShadow: 'shadow-lg shadow-black/40',
    },
  },
];
