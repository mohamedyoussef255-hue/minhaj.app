import React, { useState } from 'react';
import {
  Trophy,
  Award,
  Calendar,
  Clock,
  CheckCircle2,
  Users,
  Mic,
  Send,
  X,
  Sparkles,
  Flame,
  Crown,
  BookOpen,
  DollarSign,
  Coins,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { Competition, CompetitionParticipant } from '../types';

interface CompetitionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  competitions: Competition[];
  userGender: 'male' | 'female';
  currentUser?: any;
  theme: 'dark' | 'light';
  onJoinCompetition: (
    competitionId: string,
    submissionNotes: string,
    submissionAudioUrl?: string
  ) => Promise<void>;
}

export function CompetitionsModal({
  isOpen,
  onClose,
  competitions,
  userGender,
  currentUser,
  theme,
  onJoinCompetition,
}: CompetitionsModalProps) {
  const [selectedCompId, setSelectedCompId] = useState<string>(
    competitions[0]?.id || ''
  );
  const [filterFrequency, setFilterFrequency] = useState<string>('all');
  const [submissionNotes, setSubmissionNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const isDark = theme === 'dark';

  const filteredCompetitions = competitions.filter((c) => {
    if (filterFrequency !== 'all' && c.frequency !== filterFrequency) return false;
    return true;
  });

  const selectedComp =
    competitions.find((c) => c.id === selectedCompId) || filteredCompetitions[0] || competitions[0];

  const hasJoined =
    selectedComp &&
    selectedComp.participants?.some(
      (p) =>
        p.userId === (currentUser?.id || (userGender === 'female' ? 'usr-female-1' : 'usr-male-1'))
    );

  const handleJoin = async () => {
    if (!selectedComp) return;
    setIsSubmitting(true);
    setSuccessMsg(null);
    try {
      await onJoinCompetition(
        selectedComp.id,
        submissionNotes || 'تسميع مسجل ومراجعة لأحكام التجويد'
      );
      setSuccessMsg('تهانينا! تم تسجيل اشتراكك في المسابقة ورفع التسميع بنجاح.');
      setSubmissionNotes('');
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const frequencyLabel = (freq: string) => {
    switch (freq) {
      case 'daily':
        return 'مسابقة يومية';
      case 'weekly':
        return 'مسابقة أسبوعية';
      case 'monthly':
        return 'مسابقة شهرية';
      case 'occasions':
        return 'مسابقة مواسم ومناسبات';
      case 'instant':
        return 'تحدي فوري سريع';
      default:
        return 'مسابقة عامة';
    }
  };

  return (
    <div
      id="competitions-modal"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div
        className={`w-full max-w-4xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150 ${
          isDark
            ? 'bg-stone-900 border-amber-500/30 text-stone-100'
            : 'bg-white border-amber-200 text-stone-900'
        }`}
      >
        {/* Header */}
        <div
          className={`p-5 border-b relative ${
            isDark
              ? 'bg-gradient-to-r from-stone-950 via-emerald-950/20 to-stone-950 border-stone-800'
              : 'bg-gradient-to-r from-amber-50 via-emerald-50/50 to-amber-50 border-amber-100'
          }`}
        >
          <button
            onClick={onClose}
            className="absolute top-5 left-5 w-8 h-8 rounded-full bg-stone-800/60 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-bold text-amber-500">
                    مسابقات حفظ القرآن الكريم والتدبر
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    جوائز نقدية من الإيرادات
                  </span>
                </div>
                <p className="text-xs text-stone-400 mt-0.5">
                  تُعلن الإدارة المسابقات باستمرار وتُصرف الجوائز للفائزين مباشرة من مخصص بند الإيرادات للمحفظة.
                </p>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-1 rounded-2xl bg-stone-950/70 border border-stone-800/80 text-[11px] overflow-x-auto">
              {[
                { id: 'all', label: 'كافة المسابقات' },
                { id: 'daily', label: 'اليومية' },
                { id: 'weekly', label: 'الأسبوعية' },
                { id: 'monthly', label: 'الشهرية' },
                { id: 'occasions', label: 'المناسبات' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterFrequency(tab.id)}
                  className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                    filterFrequency === tab.id
                      ? 'bg-amber-500 text-stone-950 shadow'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Body Layout: Left list + Right active details */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x md:divide-x-reverse divide-stone-800">

          {/* List of competitions (5 cols) */}
          <div className="md:col-span-5 p-4 overflow-y-auto space-y-3 bg-stone-950/40 text-xs">
            {filteredCompetitions.length === 0 ? (
              <div className="text-center py-10 text-stone-500">
                لا توجد مسابقات حالية في هذا التصنيف.
              </div>
            ) : (
              filteredCompetitions.map((comp) => {
                const isSelected = selectedComp?.id === comp.id;
                const daysRemaining = Math.max(
                  0,
                  Math.ceil(
                    (new Date(comp.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                  )
                );

                return (
                  <div
                    key={comp.id}
                    onClick={() => {
                      setSelectedCompId(comp.id);
                      setSuccessMsg(null);
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2 ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/50 shadow-lg'
                        : isDark
                        ? 'bg-stone-900/80 hover:bg-stone-900 border-stone-800'
                        : 'bg-stone-50 hover:bg-stone-100 border-stone-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-stone-800 text-amber-400 border border-stone-700">
                          {frequencyLabel(comp.frequency)}
                        </span>
                        <h4 className="font-bold text-stone-100 text-sm leading-tight">
                          {comp.title}
                        </h4>
                      </div>
                      <span className="font-mono text-amber-400 font-bold text-sm shrink-0">
                        {comp.prizePool} ج.م
                      </span>
                    </div>

                    <p className="text-[11px] text-stone-400 line-clamp-2">
                      {comp.scopeDescription}
                    </p>

                    <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1 border-t border-stone-800/60">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3 h-3 text-emerald-400" />
                        <span>{comp.participantsCount} متسابق</span>
                      </div>
                      <div className="flex items-center gap-1 text-amber-400/90 font-mono">
                        <Clock className="w-3 h-3" />
                        <span>متبقي {daysRemaining} يوم</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Active Competition Details & Submission (7 cols) */}
          <div className="md:col-span-7 p-5 overflow-y-auto space-y-4 text-xs">
            {selectedComp ? (
              <div className="space-y-4">
                {/* Title & Occasion */}
                <div className="space-y-1">
                  {selectedComp.occasionName && (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 inline-block mb-1">
                      ✨ {selectedComp.occasionName}
                    </span>
                  )}
                  <h3 className="text-lg font-bold text-stone-100">
                    {selectedComp.title}
                  </h3>
                  <p className="text-stone-300 leading-relaxed text-xs">
                    {selectedComp.scopeDescription}
                  </p>
                </div>

                {/* Prize Pool Breakdown Card */}
                <div className={`p-4 rounded-2xl border ${isDark ? 'bg-stone-950 border-amber-500/30' : 'bg-amber-50 border-amber-200'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-bold text-amber-500 flex items-center gap-1.5 text-sm">
                      <Trophy className="w-4 h-4" />
                      <span>مجموع جوائز المسابقة: {selectedComp.prizePool} ج.م / ر.س</span>
                    </span>
                    <span className="text-[10px] text-stone-400">مخصصة من إيرادات المنصة</span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30">
                      <Crown className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                      <span className="text-[10px] text-stone-400 block">المركز الأول</span>
                      <strong className="text-amber-400 font-mono text-sm">
                        {selectedComp.prizesBreakdown.firstPlace} ج.م
                      </strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800">
                      <Award className="w-4 h-4 text-stone-300 mx-auto mb-1" />
                      <span className="text-[10px] text-stone-400 block">المركز الثاني</span>
                      <strong className="text-stone-200 font-mono text-sm">
                        {selectedComp.prizesBreakdown.secondPlace} ج.م
                      </strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800">
                      <Award className="w-4 h-4 text-amber-600 mx-auto mb-1" />
                      <span className="text-[10px] text-stone-400 block">المركز الثالث</span>
                      <strong className="text-amber-600 font-mono text-sm">
                        {selectedComp.prizesBreakdown.thirdPlace} ج.م
                      </strong>
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-stone-800/80 flex items-center justify-between text-[11px] text-stone-400">
                    <span>نقاط التميز الإضافية: <strong className="text-amber-400 font-mono">{selectedComp.rewardPoints} نقطة</strong></span>
                    <span>جوائز الترضية: <strong className="text-stone-200 font-mono">{selectedComp.prizesBreakdown.consolationPrizes} ج.م</strong></span>
                  </div>
                </div>

                {/* Rules */}
                <div className="space-y-2">
                  <h4 className="font-bold text-stone-200 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-emerald-400" />
                    <span>شروط وضوابط المسابقة:</span>
                  </h4>
                  <div className="space-y-1.5 bg-stone-950/60 p-3 rounded-xl border border-stone-800/80">
                    {selectedComp.rules.map((rule, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-[11px] text-stone-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{rule}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Honor Roll / Winners if available */}
                {selectedComp.winners && selectedComp.winners.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-bold text-amber-400 flex items-center gap-1.5">
                      <Crown className="w-4 h-4" />
                      <span>لوحة شرف الفائزين بالمراكز الأولى:</span>
                    </h4>
                    <div className="space-y-2">
                      {selectedComp.winners.map((win, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-amber-500 text-stone-950 font-bold flex items-center justify-center text-xs">
                              {win.place}
                            </span>
                            <div>
                              <span className="font-bold text-stone-100">{win.userName}</span>
                              <span className="text-[10px] text-stone-400 block font-mono">
                                درجة الإتقان: {win.score}/100
                              </span>
                            </div>
                          </div>
                          <div className="text-left">
                            <span className="font-mono font-bold text-emerald-400 text-sm block">
                              +{win.prizeCash} ج.م
                            </span>
                            <span className="text-[10px] text-amber-400 font-mono">
                              +{win.prizePoints} نقطة
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Submission Form */}
                <div className={`p-4 rounded-2xl border space-y-3 ${isDark ? 'bg-stone-950 border-stone-800' : 'bg-stone-50 border-stone-200'}`}>
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-stone-200 flex items-center gap-1.5">
                      <Mic className="w-4 h-4 text-amber-400" />
                      <span>تسجيل المشاركة ورفع التسميع:</span>
                    </h4>
                    {hasJoined && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                        ✅ أنت مسجل في هذه المسابقة
                      </span>
                    )}
                  </div>

                  {successMsg && (
                    <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs">
                      {successMsg}
                    </div>
                  )}

                  <div>
                    <label className="text-[11px] text-stone-400 block mb-1">
                      ملاحظات التلاوة، الرواية، أو رابط التسجيل الصوتي المرفوع:
                    </label>
                    <textarea
                      rows={2}
                      value={submissionNotes}
                      onChange={(e) => setSubmissionNotes(e.target.value)}
                      placeholder="مثال: تم حفظ سورة الكهف برواية حفص عن عاصم، وجاهز للتسميع المباشر بالغرفة الصوتية..."
                      className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2.5 text-xs text-stone-200 focus:border-amber-500 focus:outline-none"
                    />
                  </div>

                  <button
                    onClick={handleJoin}
                    disabled={isSubmitting}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <span>جاري تسجيل المشاركة...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>{hasJoined ? 'تحديث مشاركتي بالمسابقة' : 'تأكيد التسجيل والمنافسة على الجوائز'}</span>
                      </>
                    )}
                  </button>
                </div>

              </div>
            ) : null}
          </div>

        </div>

        {/* Footer */}
        <div
          className={`p-4 border-t flex items-center justify-between text-xs ${
            isDark ? 'bg-stone-950 border-stone-800 text-stone-400' : 'bg-white border-stone-200 text-stone-600'
          }`}
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>كافة المسابقات تخضع للإشراف الشرعي وضوابط حفظ العفة والخصوصية.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
