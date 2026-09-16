import React, { useState, useEffect, useMemo } from 'react';
import {
  Radio,
  Users,
  Mic,
  BookOpen,
  HelpCircle,
  Play,
  Volume2,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Lock,
  Sparkles,
  Send,
  X,
  RefreshCw,
  CheckCircle2,
  Headphones,
} from 'lucide-react';
import { HalqaRoom } from './HalaqatTadabburRooms';
import { RECITERS_LIST } from '../data/quranSurahs';

interface LiveHalaqatMiniWidgetProps {
  currentUser?: any;
  onJoinRoom: (roomId: string, role: 'listener' | 'student_reciter' | 'questioner') => void;
  onOpenFullRooms: () => void;
  onPlayContinuousSurah?: (surahId: number, reciterId?: string) => void;
  onRewardPoints?: (points: number, message: string) => void;
}

export function LiveHalaqatMiniWidget({
  currentUser,
  onJoinRoom,
  onOpenFullRooms,
  onPlayContinuousSurah,
  onRewardPoints,
}: LiveHalaqatMiniWidgetProps) {
  const [rooms, setRooms] = useState<HalqaRoom[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'hifz' | 'tadabbur' | 'fatwa_qa'>('all');

  // Quick Question Modal
  const [quickQuestionRoom, setQuickQuestionRoom] = useState<HalqaRoom | null>(null);
  const [quickQuestionText, setQuickQuestionText] = useState<string>('');
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState<boolean>(false);
  const [questionSentSuccess, setQuestionSentSuccess] = useState<boolean>(false);

  // Fetch live rooms
  const fetchLiveRooms = async () => {
    try {
      const res = await fetch('/api/v1/halaqat');
      const data = await res.json();
      if (data.success && Array.isArray(data.rooms)) {
        setRooms(data.rooms);
      }
    } catch (err) {
      console.warn('MiniWidget: Could not fetch rooms:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveRooms();
    const interval = setInterval(fetchLiveRooms, 12000);
    return () => clearInterval(interval);
  }, []);

  // Filtered rooms
  const filteredRooms = useMemo(() => {
    if (selectedCategory === 'all') return rooms;
    return rooms.filter((r) => r.category === selectedCategory);
  }, [rooms, selectedCategory]);

  // Counts by category
  const counts = useMemo(() => {
    return {
      all: rooms.length,
      hifz: rooms.filter((r) => r.category === 'hifz').length,
      tadabbur: rooms.filter((r) => r.category === 'tadabbur').length,
      fatwa_qa: rooms.filter((r) => r.category === 'fatwa_qa').length,
      totalParticipants: rooms.reduce((acc, curr) => acc + (curr.participantsCount || 0), 0),
    };
  }, [rooms]);

  // Submit Quick Question
  const handleSendQuickQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickQuestionRoom || !quickQuestionText.trim()) return;
    setIsSubmittingQuestion(true);
    try {
      const res = await fetch(`/api/v1/halaqat/${quickQuestionRoom.id}/ask-question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          askerId: currentUser?.id || 'guest',
          askerName: currentUser?.name || 'سائل كريم',
          question: quickQuestionText.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setQuestionSentSuccess(true);
        if (onRewardPoints) {
          onRewardPoints(10, 'تم إرسال سؤالك الشرعي للشيخ في الحلقة المباشرة.');
        }
        setTimeout(() => {
          setQuestionSentSuccess(false);
          setQuickQuestionRoom(null);
          setQuickQuestionText('');
          fetchLiveRooms();
        }, 1600);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingQuestion(false);
    }
  };

  // Status badge helper
  const getRoomStatusDetails = (room: HalqaRoom) => {
    if (room.category === 'hifz') {
      return {
        label: 'مباشر: مجلس تسميع وحفظ',
        badgeColor: 'bg-amber-950/80 text-amber-300 border-amber-800/60',
        actionLabel: 'انضم للتسميع',
        icon: Mic,
        dotColor: 'bg-amber-500',
      };
    }
    if (room.category === 'tadabbur') {
      return {
        label: 'مباشر: تدبر وتدارس المعاني',
        badgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60',
        actionLabel: 'انضم للتدبر',
        icon: BookOpen,
        dotColor: 'bg-emerald-500',
      };
    }
    return {
      label: 'مباشر: استقبال الفتاوى والأسئلة',
      badgeColor: 'bg-blue-950/80 text-blue-300 border-blue-800/60',
      actionLabel: 'اطرح سؤالاً',
      icon: HelpCircle,
      dotColor: 'bg-blue-500',
    };
  };

  return (
    <div
      id="live-halaqat-mini-widget"
      className="bg-gradient-to-r from-stone-900 via-stone-900/95 to-emerald-950/30 rounded-2xl border border-emerald-800/50 shadow-xl overflow-hidden transition-all duration-300 text-right"
    >
      {/* Mini Widget Top Header */}
      <div className="p-3.5 sm:p-4 flex flex-wrap items-center justify-between gap-3 border-b border-stone-800/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600/30 via-emerald-600/30 to-amber-600/30 border border-emerald-500/40 flex items-center justify-center shadow-inner">
            <Radio className="w-5 h-5 text-red-500 animate-pulse" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-stone-100 flex items-center gap-1.5 font-quran">
                <span>الحلقات المباشرة</span>
                <span className="text-[10px] font-mono bg-red-950/80 text-red-400 border border-red-800/60 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                  <span>{rooms.length} غرف نشطة</span>
                </span>
              </h3>
            </div>
            <p className="text-[11px] text-stone-400 flex items-center gap-2 mt-0.5">
              <span>غرف صوتية تفاعلية للحفظ والتدبر والأسئلة الشرعية</span>
              <span className="text-stone-600">•</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Users className="w-3 h-3" />
                {counts.totalParticipants} حاضر الآن
              </span>
            </p>
          </div>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenFullRooms}
            className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1 shadow transition-all active:scale-95"
          >
            <span>الصالة الكاملة</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-400 hover:text-stone-200 transition-colors"
            title={isCollapsed ? 'توسيع الواجهة المصغرة' : 'طي الواجهة المصغرة'}
          >
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Collapsible Content */}
      {!isCollapsed && (
        <div className="p-3.5 sm:p-4 space-y-3.5">
          {/* Filter Pills (حفظ، تدبر، أسئلة شرعية) */}
          <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  selectedCategory === 'all'
                    ? 'bg-emerald-700 text-white shadow'
                    : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
                }`}
              >
                الكل ({counts.all})
              </button>

              <button
                onClick={() => setSelectedCategory('hifz')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  selectedCategory === 'hifz'
                    ? 'bg-amber-600 text-stone-950 shadow'
                    : 'bg-stone-950 text-amber-400/80 hover:text-amber-300 border border-stone-800'
                }`}
              >
                <Mic className="w-3 h-3" />
                <span>غرف الحفظ والتسميع ({counts.hifz})</span>
              </button>

              <button
                onClick={() => setSelectedCategory('tadabbur')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  selectedCategory === 'tadabbur'
                    ? 'bg-emerald-700 text-white shadow'
                    : 'bg-stone-950 text-emerald-400/80 hover:text-emerald-300 border border-stone-800'
                }`}
              >
                <BookOpen className="w-3 h-3" />
                <span>مجالس التدبر ({counts.tadabbur})</span>
              </button>

              <button
                onClick={() => setSelectedCategory('fatwa_qa')}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                  selectedCategory === 'fatwa_qa'
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-stone-950 text-blue-400/80 hover:text-blue-300 border border-stone-800'
                }`}
              >
                <HelpCircle className="w-3 h-3" />
                <span>الأسئلة الشرعية ({counts.fatwa_qa})</span>
              </button>
            </div>

            <span className="text-[11px] text-stone-500 hidden md:inline">
              اضغط على أي حلقة للانضمام المباشر أو الاستماع لتلاوة السورة
            </span>
          </div>

          {/* Cards Carousel / Grid */}
          {loading ? (
            <div className="py-6 text-center text-xs text-stone-500 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
              <span>جاري تحميل الحلقات المباشرة...</span>
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="py-6 text-center text-xs text-stone-500 bg-stone-950/60 rounded-xl border border-stone-800/80">
              لا توجد حلقات مباشرة حالياً في هذا التصنيف.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredRooms.map((room) => {
                const status = getRoomStatusDetails(room);
                const IconComponent = status.icon;

                return (
                  <div
                    key={room.id}
                    className="bg-stone-950/90 hover:bg-stone-950 p-3.5 rounded-xl border border-stone-800 hover:border-emerald-700/60 transition-all flex flex-col justify-between gap-3 shadow-md group relative"
                  >
                    {/* Top Status and Participants */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 text-[10px]">
                        <span
                          className={`px-2 py-0.5 rounded-md font-bold border flex items-center gap-1 ${status.badgeColor}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dotColor} animate-pulse`} />
                          <span>{status.label}</span>
                        </span>

                        <div className="flex items-center gap-1.5 text-stone-400 bg-stone-900 px-2 py-0.5 rounded-md border border-stone-800/60">
                          <Users className="w-3 h-3 text-emerald-400" />
                          <span className="font-bold text-stone-200">{room.participantsCount}</span>
                          <span className="text-stone-500">حاضر</span>
                        </div>
                      </div>

                      {/* Title & Surah */}
                      <div>
                        <h4 className="font-bold text-xs text-stone-100 group-hover:text-emerald-300 transition-colors line-clamp-1 leading-relaxed">
                          {room.title}
                        </h4>
                        <div className="flex items-center gap-1.5 text-[11px] text-amber-400 font-medium mt-1">
                          <BookOpen className="w-3 h-3" />
                          <span>سورة {room.surahName}</span>
                          <span className="text-stone-500 font-mono text-[10px]">
                            ({room.ayahStart} - {room.ayahEnd})
                          </span>
                        </div>
                      </div>

                      {/* Host & Audience */}
                      <div className="flex items-center justify-between text-[11px] text-stone-400 pt-1 border-t border-stone-900">
                        <div className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-emerald-950 border border-emerald-800/60 text-emerald-400 flex items-center justify-center text-[10px] font-bold">
                            {room.sheikhHost.name[0]}
                          </span>
                          <span className="text-stone-300 line-clamp-1">{room.sheikhHost.name}</span>
                          {room.sheikhHost.isVerified && (
                            <ShieldCheck className="w-3 h-3 text-emerald-400 shrink-0" />
                          )}
                        </div>

                        {room.targetAudience === 'women_only' ? (
                          <span className="text-[10px] text-pink-300 bg-pink-950/60 px-1.5 py-0.5 rounded border border-pink-800/40 flex items-center gap-0.5">
                            <Lock className="w-2.5 h-2.5" />
                            أخوات
                          </span>
                        ) : room.targetAudience === 'men_only' ? (
                          <span className="text-[10px] text-blue-300 bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-800/40">
                            رجال
                          </span>
                        ) : (
                          <span className="text-[10px] text-stone-500">عام</span>
                        )}
                      </div>
                    </div>

                    {/* Action Bar (تلاوة مستمرة + انضمام مباشر مخصص) */}
                    <div className="space-y-1.5 pt-2 border-t border-stone-800/80 text-xs">
                      {/* Continuous Recitation Button */}
                      <button
                        onClick={() => {
                          if (onPlayContinuousSurah) {
                            onPlayContinuousSurah(room.surahId);
                          }
                          onJoinRoom(room.id, 'listener');
                        }}
                        className="w-full py-1.5 px-2.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-amber-300 border border-stone-800 hover:border-amber-600/40 font-bold flex items-center justify-between text-[11px] transition-all"
                        title="استماع لتلاوة السورة كاملة بدون انقطاع بصوت القارئ"
                      >
                        <span className="flex items-center gap-1.5">
                          <Volume2 className="w-3 h-3 text-amber-400" />
                          <span>تلاوة مستمرة للسورة</span>
                        </span>
                        <Play className="w-3 h-3 fill-current text-amber-400" />
                      </button>

                      {/* Split Actions based on category */}
                      <div className="grid grid-cols-2 gap-1.5">
                        {room.category === 'fatwa_qa' ? (
                          <button
                            onClick={() => {
                              setQuickQuestionRoom(room);
                              setQuickQuestionText('');
                            }}
                            className="py-1.5 px-2 rounded-lg bg-blue-900/40 hover:bg-blue-800/60 text-blue-300 border border-blue-700/40 font-bold flex items-center justify-center gap-1 text-[11px] transition-all"
                          >
                            <HelpCircle className="w-3 h-3 text-blue-400" />
                            <span>سؤال سريع</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => onJoinRoom(room.id, 'student_reciter')}
                            className="py-1.5 px-2 rounded-lg bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border border-amber-700/40 font-bold flex items-center justify-center gap-1 text-[11px] transition-all"
                          >
                            <Mic className="w-3 h-3 text-amber-400" />
                            <span>تسميع وحفظ</span>
                          </button>
                        )}

                        <button
                          onClick={() =>
                            onJoinRoom(
                              room.id,
                              room.category === 'fatwa_qa' ? 'questioner' : room.category === 'tadabbur' ? 'listener' : 'student_reciter'
                            )
                          }
                          className="py-1.5 px-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold flex items-center justify-center gap-1 text-[11px] transition-all shadow"
                        >
                          <span>دخول الغرفة</span>
                          <ChevronLeft className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Quick Question Modal Popup */}
      {quickQuestionRoom && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 rounded-2xl p-5 border border-stone-800 w-full max-w-md shadow-2xl space-y-4 text-right animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="flex items-center gap-2 text-blue-400">
                <HelpCircle className="w-5 h-5" />
                <h3 className="font-bold text-sm text-stone-100">طرح سؤال شرعي مباشر في الحلقة</h3>
              </div>
              <button
                onClick={() => setQuickQuestionRoom(null)}
                className="p-1 rounded-lg hover:bg-stone-800 text-stone-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-stone-950 p-3 rounded-xl border border-stone-800/80 text-xs text-stone-300 space-y-1">
              <div className="font-bold text-amber-400">غرفة: {quickQuestionRoom.title}</div>
              <div className="text-stone-400">
                المشرف: {quickQuestionRoom.sheikhHost.name} ({quickQuestionRoom.sheikhHost.title})
              </div>
            </div>

            {questionSentSuccess ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="font-bold text-stone-100 text-sm">تم إرسال سؤالك للشيخ بنجاح!</h4>
                <p className="text-xs text-stone-400">جاري تحديث المجلس وعرض السؤال في قائمة الانتظار...</p>
              </div>
            ) : (
              <form onSubmit={handleSendQuickQuestion} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1.5">
                    اكتب سؤالك الشرعي أو استفسارك في سورة {quickQuestionRoom.surahName}:
                  </label>
                  <textarea
                    rows={4}
                    value={quickQuestionText}
                    onChange={(e) => setQuickQuestionText(e.target.value)}
                    placeholder="مثال: ما معنى قوله تعالى في هذه الآية؟ أو ما الحكم الفقهي المتعلق بـ..."
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs text-stone-100 placeholder-stone-500 focus:border-blue-500 outline-none resize-none"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setQuickQuestionRoom(null)}
                    className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold"
                  >
                    إلغاء
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmittingQuestion || !quickQuestionText.trim()}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow"
                  >
                    {isSubmittingQuestion ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    <span>إرسال السؤال للمجلس</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
