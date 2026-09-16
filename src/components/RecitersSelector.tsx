import React, { useState, useMemo } from 'react';
import {
  Volume2,
  Search,
  Check,
  Play,
  Headphones,
  Sparkles,
  Filter,
  X,
  Award,
  ShieldCheck,
  User,
  Radio,
} from 'lucide-react';
import { RECITERS_LIST, ReciterInfo } from '../data/quranSurahs';

interface RecitersSelectorProps {
  selectedReciterId: string;
  onSelectReciter: (reciterId: string, autoPlay?: boolean) => void;
  currentSurahId: number;
  currentSurahName: string;
  isPlayingFullSurah?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  mode?: 'modal' | 'inline';
}

type ReciterCategory = 'all' | 'kibar' | 'harameen' | 'khushu' | 'muallim';

export function RecitersSelector({
  selectedReciterId,
  onSelectReciter,
  currentSurahId,
  currentSurahName,
  isPlayingFullSurah = false,
  isOpen = true,
  onClose,
  mode = 'inline',
}: RecitersSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<ReciterCategory>('all');

  const categories: { id: ReciterCategory; label: string; count: number }[] = [
    { id: 'all', label: 'الكل', count: RECITERS_LIST.length },
    {
      id: 'kibar',
      label: 'كبار القراء والمحققين',
      count: RECITERS_LIST.filter((r) => r.category === 'kibar').length,
    },
    {
      id: 'harameen',
      label: 'أئمة الحرمين الشريفين',
      count: RECITERS_LIST.filter((r) => r.category === 'harameen').length,
    },
    {
      id: 'khushu',
      label: 'تلاوات خاشعة ومؤثرة',
      count: RECITERS_LIST.filter((r) => r.category === 'khushu').length,
    },
    {
      id: 'muallim',
      label: 'المصحف المعلم والترديد',
      count: RECITERS_LIST.filter((r) => r.category === 'muallim').length,
    },
  ];

  const filteredReciters = useMemo(() => {
    return RECITERS_LIST.filter((r) => {
      const matchesSearch =
        r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.subName && r.subName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (r.description && r.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory =
        activeCategory === 'all' || r.category === activeCategory;

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const activeReciter = useMemo(
    () => RECITERS_LIST.find((r) => r.id === selectedReciterId) || RECITERS_LIST[0],
    [selectedReciterId]
  );

  // Body content
  const content = (
    <div className="space-y-4 text-right">
      {/* Search & Category Filter Header */}
      <div className="space-y-3">
        {/* Search input */}
        <div className="relative">
          <Search className="w-4 h-4 text-stone-500 absolute right-3.5 top-3" />
          <input
            type="text"
            placeholder="ابحث عن اسم القارئ (مثلاً: الحصري، المنشاوي، العفاسي، المعيقلي)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-stone-950 border border-stone-800 rounded-xl pr-10 pl-3 py-2.5 text-xs text-stone-100 placeholder-stone-500 focus:border-emerald-600 outline-none shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-3 text-stone-500 hover:text-stone-300 text-xs"
            >
              مسح
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                activeCategory === cat.id
                  ? 'bg-emerald-700 text-white shadow-md'
                  : 'bg-stone-950 text-stone-400 hover:bg-stone-800 hover:text-stone-200 border border-stone-800'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                  activeCategory === cat.id
                    ? 'bg-emerald-900 text-emerald-200'
                    : 'bg-stone-800 text-stone-400'
                }`}
              >
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Reciters List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[60vh] overflow-y-auto pr-0.5">
        {filteredReciters.length === 0 ? (
          <div className="col-span-full py-10 text-center text-stone-500 text-xs space-y-1">
            <p>لا يوجد قارئ مطابق لبحثك: "{searchQuery}"</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}
              className="text-emerald-400 hover:underline text-[11px]"
            >
              عرض جميع القراء الكرام (١٧ قارئاً)
            </button>
          </div>
        ) : (
          filteredReciters.map((reciter) => {
            const isSelected = selectedReciterId === reciter.id;

            return (
              <div
                key={reciter.id}
                onClick={() => onSelectReciter(reciter.id, false)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer text-right flex flex-col justify-between gap-2.5 relative group ${
                  isSelected
                    ? 'bg-gradient-to-br from-emerald-950/70 via-stone-900 to-stone-900 border-emerald-500/80 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/40'
                    : 'bg-stone-950/70 border-stone-800/80 hover:border-stone-700 hover:bg-stone-900/60'
                }`}
              >
                {/* Header with Avatar & Details */}
                <div className="flex items-start gap-3">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border shadow-inner transition-colors ${
                      isSelected
                        ? 'bg-emerald-600 border-emerald-400 text-white'
                        : 'bg-stone-900 border-stone-800 text-amber-400 group-hover:border-stone-700'
                    }`}
                  >
                    <Volume2 className={`w-5 h-5 ${isSelected && isPlayingFullSurah ? 'animate-pulse' : ''}`} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="font-bold text-sm text-stone-100 font-quran truncate">
                        {reciter.name}
                      </h4>
                      {isSelected && (
                        <span className="shrink-0 flex items-center gap-1 text-[10px] bg-emerald-900/80 text-emerald-300 border border-emerald-700/60 px-2 py-0.5 rounded-full font-bold">
                          <Check className="w-3 h-3" />
                          <span>القارئ الحالي</span>
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-amber-400/90 font-medium mt-0.5 line-clamp-1">
                      {reciter.subName}
                    </p>

                    {reciter.description && (
                      <p className="text-[10px] text-stone-400 mt-1 line-clamp-2 leading-relaxed">
                        {reciter.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Footer Badges & Play Action */}
                <div className="flex items-center justify-between pt-2 border-t border-stone-800/60 text-[11px]">
                  <div className="flex items-center gap-1.5 text-stone-400">
                    <span className="px-2 py-0.5 rounded-md bg-stone-900 border border-stone-800 text-[10px] text-stone-300">
                      {reciter.riwaya || 'حفص عن عاصم'}
                    </span>
                    {reciter.category === 'harameen' && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-950/40 border border-amber-800/40 text-[10px] text-amber-300">
                        أئمة الحرمين
                      </span>
                    )}
                    {reciter.category === 'muallim' && (
                      <span className="px-2 py-0.5 rounded-md bg-teal-950/40 border border-teal-800/40 text-[10px] text-teal-300">
                        مصحف الترديد
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectReciter(reciter.id, true);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all shadow-sm ${
                      isSelected && isPlayingFullSurah
                        ? 'bg-amber-500 hover:bg-amber-400 text-stone-950'
                        : 'bg-emerald-700 hover:bg-emerald-600 text-white'
                    }`}
                    title={`تشغيل سورة ${currentSurahName} بصوت ${reciter.name}`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>
                      {isSelected && isPlayingFullSurah
                        ? 'قيد التشغيل'
                        : `استماع لسورة ${currentSurahName}`}
                    </span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Selected Reciter Summary Bar */}
      <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Headphones className="w-4 h-4 text-amber-400" />
          <span className="text-stone-300">
            القارئ المعتمد حالياً:{' '}
            <strong className="text-amber-300">{activeReciter.name}</strong> ({activeReciter.subName})
          </span>
        </div>
        <span className="text-[11px] text-stone-400">
          السورة الحالية: <strong className="text-emerald-400">سورة {currentSurahName}</strong>
        </span>
      </div>
    </div>
  );

  if (mode === 'modal') {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
        <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
          {/* Modal Header */}
          <div className="bg-stone-950 px-5 py-4 border-b border-stone-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-stone-100 text-sm flex items-center gap-2 font-quran">
                  <span>قائمة اختيار القراء الكرام</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-mono">
                    ١٧ قارئاً معتمداً
                  </span>
                </h3>
                <p className="text-[11px] text-stone-400">
                  اختر قارئك المفضل للاستماع المستمر للسور وتكرار الآيات للحفظ
                </p>
              </div>
            </div>

            {onClose && (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Modal Body */}
          <div className="p-4 overflow-y-auto flex-1">{content}</div>

          {/* Modal Footer */}
          <div className="bg-stone-950 px-5 py-3 border-t border-stone-800 flex items-center justify-between text-xs">
            <span className="text-stone-400 text-[11px]">
              يتم حفظ القارئ المختار تلقائياً في جلسة التلاوة والحفظ
            </span>
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs transition-colors shadow"
              >
                تم وتأكيد الاختيار
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-stone-900 rounded-2xl p-4 sm:p-5 border border-stone-800 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-stone-800 pb-3">
        <div className="flex items-center gap-2">
          <Headphones className="w-5 h-5 text-amber-400" />
          <h3 className="font-bold text-stone-100 text-sm font-quran">
            قائمة كبار قراء القرآن الكريم ({RECITERS_LIST.length} قارئاً)
          </h3>
        </div>
        <span className="text-xs text-stone-400">
          انقر على أي قارئ لتعيينه والاستماع لتلاوته
        </span>
      </div>
      {content}
    </div>
  );
}
