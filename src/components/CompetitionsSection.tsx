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
  Sparkles,
  Flame,
  Crown,
  BookOpen,
  DollarSign,
  Coins,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';
import { Competition } from '../types';

interface CompetitionsSectionProps {
  competitions: Competition[];
  userGender: 'male' | 'female';
  currentUser?: any;
  theme: 'dark' | 'light';
  onJoinCompetition: (
    competitionId: string,
    submissionNotes: string,
    submissionAudioUrl?: string
  ) => Promise<void>;
  onOpenPaymentMethods?: (purpose: string) => void;
}

export function CompetitionsSection({
  competitions,
  userGender,
  currentUser,
  theme,
  onJoinCompetition,
  onOpenPaymentMethods,
}: CompetitionsSectionProps) {
  const [selectedCompId, setSelectedCompId] = useState<string>(
    competitions[0]?.id || ''
  );
  const [filterFrequency, setFilterFrequency] = useState<string>('all');
  const [submissionNotes, setSubmissionNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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
      setSuccessMsg('تم تأكيد انضمامك للمسابقة القرآنية بنجاح! سيتم فحص التسميع من قِبل اللجنة المعتمدة.');
      setSubmissionNotes('');
    } catch (e: any) {
      alert(e.message || 'حدث خطأ أثناء الانضمام للمسابقة');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPrizePool = competitions.reduce((acc, curr) => acc + (curr.prizePool || 0), 0);

  return (
    <div id="competitions-view" className="space-y-6 animate-in fade-in duration-200">
      {/* Hero Card */}
      <div
        className={`p-6 rounded-2xl border shadow-xl relative overflow-hidden transition-colors ${
          isDark
            ? 'bg-gradient-to-br from-amber-950/40 via-stone-900 to-emerald-950/40 border-amber-500/40 text-stone-100'
            : 'bg-gradient-to-br from-amber-50/80 via-white to-emerald-50/80 border-amber-300 text-[#0a2737] shadow-md'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center border border-amber-500/40 shadow-inner">
              <Trophy className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black">
                  المسابقات القرآنية وجوائز الإتقان
                </h2>
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500 text-stone-950 font-black">
                  جوائز نقدية معتمدة
                </span>
              </div>
              <p className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-stone-300' : 'text-[#335568]'}`}>
                مكافآت مقتطعة شرعياً من إيرادات المنصة لدعم حفظة كتاب الله تعالى، مقسمة أسبوعياً وشهرياً.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end">
            <div className={`p-3 rounded-xl border text-center ${
              isDark ? 'bg-stone-950/80 border-amber-500/30' : 'bg-white border-amber-200 shadow-sm'
            }`}>
              <span className="text-[10px] text-amber-500 font-bold block">إجمالي جوائز المسابقات</span>
              <span className="text-xl font-black text-amber-400 font-mono">
                {totalPrizePool || 5000} <span className="text-xs">ج.م</span>
              </span>
            </div>

            {onOpenPaymentMethods && (
              <button
                onClick={() => onOpenPaymentMethods('المساهمة في صندوق جوائز القرآن')}
                className="px-3 py-3 rounded-xl bg-gradient-to-r from-[#0c3e54] to-[#0891b2] hover:from-[#092e3f] hover:to-[#0e7490] text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-transform active:scale-95"
              >
                <CreditCard className="w-4 h-4" />
                <span className="hidden sm:inline">انستاباي والدعم</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-amber-500/20 flex-wrap">
          <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            التصنيف:
          </span>
          {[
            { id: 'all', label: 'الكل' },
            { id: 'weekly', label: 'أسبوعية' },
            { id: 'monthly', label: 'شهرية' },
            { id: 'ramadan', label: 'مواسم خاصة' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilterFrequency(item.id)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                filterFrequency === item.id
                  ? 'bg-amber-500 text-stone-950 shadow-md font-black'
                  : isDark
                  ? 'bg-stone-900/80 text-stone-300 border border-stone-800 hover:bg-stone-800'
                  : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100 shadow-sm'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Competitions Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCompetitions.map((comp) => {
          const isSelected = selectedComp?.id === comp.id;
          const userInComp = comp.participants?.some(
            (p) =>
              p.userId === (currentUser?.id || (userGender === 'female' ? 'usr-female-1' : 'usr-male-1'))
          );

          return (
            <div
              key={comp.id}
              onClick={() => setSelectedCompId(comp.id)}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                isSelected
                  ? 'border-amber-500 shadow-lg ring-1 ring-amber-500/40 ' + (isDark ? 'bg-amber-950/20' : 'bg-amber-50/40')
                  : isDark
                  ? 'border-stone-800 bg-stone-900/70 hover:border-stone-700'
                  : 'border-stone-200 bg-white hover:border-amber-300 shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                    comp.frequency === 'weekly'
                      ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                      : 'bg-amber-950 text-amber-300 border-amber-800'
                  }`}>
                    {comp.frequency === 'weekly' ? 'مسابقة أسبوعية' : 'مسابقة كبرى'}
                  </span>
                  <div className="flex items-center gap-1 font-mono text-xs font-bold text-amber-500">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>{comp.prizePool} ج.م</span>
                  </div>
                </div>

                <h3 className="font-bold text-sm leading-tight text-stone-100 dark:text-stone-100 mb-1">
                  {comp.title}
                </h3>
                <p className={`text-xs line-clamp-2 ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                  {comp.scopeDescription}
                </p>

                <div className="mt-3 flex items-center gap-3 text-[11px] text-stone-400">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-cyan-500" />
                    {comp.participants?.length || 0} متسابق
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-500" />
                    ينتهي: {new Date(comp.endDate).toLocaleDateString('ar-EG')}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-stone-800 flex items-center justify-between">
                {userInComp ? (
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    تم الانضمام
                  </span>
                ) : (
                  <span className="text-xs font-bold text-amber-500">
                    انقر للمشاركة والتفاصيل ❯
                  </span>
                )}
                <span className="text-[10px] text-stone-400">
                  المستوى: {comp.surahTarget ? `سورة رقم ${comp.surahTarget}` : (comp.versesTarget || 'عام')}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Competition Detail & Participation Box */}
      {selectedComp && (
        <div className={`p-5 rounded-2xl border shadow-xl space-y-4 ${
          isDark ? 'bg-stone-900/90 border-stone-800 text-stone-100' : 'bg-white border-[#cde2ec] text-[#0a2737]'
        }`}>
          <div className="flex items-center justify-between border-b pb-3 border-stone-800">
            <div>
              <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider block">
                المسابقة المحددة
              </span>
              <h3 className="text-base font-black mt-0.5">
                {selectedComp.title}
              </h3>
            </div>
            <div className="text-left font-mono">
              <span className="text-xs text-stone-400 block">الجائزة الإجمالية</span>
              <span className="text-xl font-black text-amber-400">
                {selectedComp.prizePool} <span className="text-xs">ج.م</span>
              </span>
            </div>
          </div>

          <p className={`text-xs leading-relaxed ${isDark ? 'text-stone-300' : 'text-[#335568]'}`}>
            {selectedComp.scopeDescription}
          </p>

          {/* Prizes breakdown */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className={`p-2.5 rounded-xl border ${
              isDark ? 'bg-amber-950/40 border-amber-600/40 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-900'
            }`}>
              <Crown className="w-4 h-4 mx-auto mb-1 text-amber-400" />
              <span className="text-[10px] block opacity-80">المركز الأول</span>
              <span className="font-mono font-bold text-sm">
                {selectedComp.prizesBreakdown?.firstPlace ?? Math.round(selectedComp.prizePool * 0.5)} ج.م
              </span>
            </div>

            <div className={`p-2.5 rounded-xl border ${
              isDark ? 'bg-stone-950 border-stone-800 text-stone-300' : 'bg-stone-50 border-stone-200 text-stone-800'
            }`}>
              <Award className="w-4 h-4 mx-auto mb-1 text-cyan-400" />
              <span className="text-[10px] block opacity-80">المركز الثاني</span>
              <span className="font-mono font-bold text-sm">
                {selectedComp.prizesBreakdown?.secondPlace ?? Math.round(selectedComp.prizePool * 0.3)} ج.م
              </span>
            </div>

            <div className={`p-2.5 rounded-xl border ${
              isDark ? 'bg-stone-950 border-stone-800 text-stone-300' : 'bg-stone-50 border-stone-200 text-stone-800'
            }`}>
              <Award className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
              <span className="text-[10px] block opacity-80">المركز الثالث</span>
              <span className="font-mono font-bold text-sm">
                {selectedComp.prizesBreakdown?.thirdPlace ?? Math.round(selectedComp.prizePool * 0.2)} ج.م
              </span>
            </div>
          </div>

          {/* Success message banner */}
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/90 border border-emerald-600 text-emerald-200 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Submission Form */}
          <div className="space-y-3 pt-2">
            <label className="text-xs font-bold flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5 text-amber-500" />
              <span>ملاحظات التسميع أو رابط التلاوة الصوتية:</span>
            </label>
            <textarea
              rows={2}
              value={submissionNotes}
              onChange={(e) => setSubmissionNotes(e.target.value)}
              placeholder="اكتب رقم الآيات التي تم تسميعها أو رابط التسجيل الصوتي..."
              className={`w-full p-3 rounded-xl text-xs border focus:outline-none transition-colors ${
                isDark
                  ? 'bg-stone-950 border-stone-800 focus:border-amber-500 text-stone-100'
                  : 'bg-[#f4f8fa] border-[#cde2ec] focus:border-[#0891b2] text-[#0a2737]'
              }`}
            />

            <button
              id="join-competition-btn"
              type="button"
              disabled={isSubmitting}
              onClick={handleJoin}
              className={`w-full py-3 rounded-xl text-xs font-black shadow-lg transition-all flex items-center justify-center gap-2 ${
                hasJoined
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950'
              } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'active:scale-98'}`}
            >
              {isSubmitting ? (
                <span>جاري تأكيد التسجيل...</span>
              ) : hasJoined ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>تحديث بيانات المشاركة في المسابقة</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>تأكيد المشاركة والدخول في المنافسة</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
