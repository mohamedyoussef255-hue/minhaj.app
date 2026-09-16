import React, { useState } from 'react';
import {
  Sparkles,
  BookOpen,
  Clock,
  Award,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  ListOrdered,
  Lightbulb,
  Plus,
  Check,
} from 'lucide-react';
import { ALL_SURAHS } from '../../data/quranSurahs';

interface AIStudyAdvisorPanelProps {
  onOpenSchedule?: () => void;
  onRewardPoints?: (points: number, message: string) => void;
  isDark?: boolean;
}

export function AIStudyAdvisorPanel({
  onOpenSchedule,
  onRewardPoints,
  isDark = true,
}: AIStudyAdvisorPanelProps) {
  const [targetSurahId, setTargetSurahId] = useState<number>(18);
  const [currentLevel, setCurrentLevel] = useState<string>('متوسط (يحفظ بعض الأجزاء)');
  const [dailyMinutes, setDailyMinutes] = useState<number>(30);
  const [focusArea, setFocusArea] = useState<string>('متوازن بين الحفظ والمراجعة والتدبر');
  const [memorizationPace, setMemorizationPace] = useState<string>('5 آيات أو نصف صفحة يومياً');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [plan, setPlan] = useState<any | null>(null);
  const [addedToCalendarSuccess, setAddedToCalendarSuccess] = useState<boolean>(false);

  // Generate Plan
  const handleGeneratePlan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setAddedToCalendarSuccess(false);
    try {
      const res = await fetch('/api/v1/halaqat/ai-study-priorities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetSurahId,
          currentLevel,
          dailyMinutes,
          focusArea,
          memorizationPace,
        }),
      });
      const data = await res.json();
      if (data.success && data.plan) {
        setPlan(data.plan);
        if (onRewardPoints) {
          onRewardPoints(15, 'استشارة الموجه القرآني الذكي وتصميم خطة تدارس');
        }
      }
    } catch (err) {
      console.warn('Could not generate AI study plan:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Add to schedule calendar
  const handleAddPlanToCalendar = async () => {
    if (!plan) return;
    try {
      const surahMeta = ALL_SURAHS.find((s) => s.id === targetSurahId) || ALL_SURAHS[0];
      const res = await fetch('/api/v1/halaqat/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `ورد مدارسة وحفظ سورة ${surahMeta.name} (خطة الذكاء الاصطناعي)`,
          surahId: targetSurahId,
          ayahStart: 1,
          ayahEnd: Math.min(20, surahMeta.ayasCount),
          category: 'hifz',
          daysOfWeek: [0, 1, 2, 3, 4], // Sun to Thu
          time: '18:30',
          durationMinutes: dailyMinutes,
          sheikhName: 'الموجه القرآني الذكي',
          meetingMode: 'audio_video',
          reminderMinutesBefore: 15,
          isReminderActive: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAddedToCalendarSuccess(true);
        if (onRewardPoints) {
          onRewardPoints(20, 'تثبيت خطة التدارس الذكية في التقويم الأسبوعي');
        }
      }
    } catch (err) {
      console.warn('Could not add plan to calendar:', err);
    }
  };

  return (
    <div className="space-y-6" id="ai-study-advisor-panel">
      {/* Hero Banner */}
      <div className={`p-5 rounded-3xl border shadow-lg space-y-2 ${
        isDark
          ? 'bg-gradient-to-br from-slate-900 via-slate-950 to-teal-950/40 border-teal-800/40 text-slate-100'
          : 'bg-gradient-to-br from-white via-teal-50/30 to-emerald-50/40 border-teal-200 text-slate-800'
      }`}>
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Sparkles className="w-4 h-4" />
          </span>
          <h2 className="text-lg font-bold">مساعد الذكاء الاصطناعي لترتيب أولويات وطرق التدارس</h2>
        </div>
        <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
          يقوم الموجه القرآني الذكي بتحليل مستواك ووقتك اليومي المتاح، ويصمم لك برنامجاً دراسياً يوازن بين الحفظ الجديد والتثبيت وفهم المعاني وفق أدق مناهج الحفظ المعتمدة (كالحصون الخمسة والتكرار المتباعد).
        </p>
      </div>

      {/* Input Parameters Form */}
      <form onSubmit={handleGeneratePlan} className={`p-5 rounded-3xl border shadow-md space-y-4 ${
        isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <h3 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
          <Layers className="w-4 h-4" />
          حدد معايير خطتك الدراسية:
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {/* Target Surah */}
          <div>
            <label className="block font-semibold mb-1 text-slate-300">السورة المستهدفة للحفظ والتدارس:</label>
            <select
              value={targetSurahId}
              onChange={(e) => setTargetSurahId(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              {ALL_SURAHS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id}. سورة {s.name} ({s.ayasCount} آية)
                </option>
              ))}
            </select>
          </div>

          {/* Current Level */}
          <div>
            <label className="block font-semibold mb-1 text-slate-300">المستوى الحالي في الحفظ:</label>
            <select
              value={currentLevel}
              onChange={(e) => setCurrentLevel(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              <option value="مبتدئ (في بداية رحلة الحفظ)">مبتدئ (في بداية رحلة الحفظ)</option>
              <option value="متوسط (يحفظ بعض الأجزاء)">متوسط (يحفظ بعض الأجزاء)</option>
              <option value="متقدم (يحفظ أكثر من نصف القرآن)">متقدم (يحفظ أكثر من نصف القرآن)</option>
              <option value="خاتم يطلب التثبيت والإتقان">خاتم يطلب التثبيت والإتقان</option>
            </select>
          </div>

          {/* Daily Minutes */}
          <div>
            <label className="block font-semibold mb-1 text-slate-300">الوقت اليومي المتاح:</label>
            <select
              value={dailyMinutes}
              onChange={(e) => setDailyMinutes(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              <option value={15}>15 دقيقة يومياً (ورد سريع مركز)</option>
              <option value={30}>30 دقيقة يومياً (المعدل المثالي المتوازن)</option>
              <option value={45}>45 دقيقة يومياً (إتقان وتثبيت موسع)</option>
              <option value={60}>60 دقيقة يومياً (برنامج مكثف للهمم العالية)</option>
            </select>
          </div>

          {/* Focus Area */}
          <div>
            <label className="block font-semibold mb-1 text-slate-300">محور التركيز المطلوب:</label>
            <select
              value={focusArea}
              onChange={(e) => setFocusArea(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              <option value="متوازن بين الحفظ والمراجعة والتدبر">متوازن (حفظ + مراجعة + تدبر)</option>
              <option value="تركيز أساسي على سرعة الحفظ الجديد">التركيز على الحفظ الجديد</option>
              <option value="أولوية قصوى لتثبيت المحفوظ القديم">أولوية لتثبيت المحفوظ القديم</option>
              <option value="تجويد مخارج الحروف وتصحيح التلاوة">تجويد وإتقان مخارج الحروف</option>
            </select>
          </div>

          {/* Memorization Pace */}
          <div>
            <label className="block font-semibold mb-1 text-slate-300">سرعة الإنجاز المقترحة:</label>
            <select
              value={memorizationPace}
              onChange={(e) => setMemorizationPace(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"
            >
              <option value="3 آيات يومياً">3 آيات يومياً (تثبيت راسخ كالجبال)</option>
              <option value="5 آيات أو نصف صفحة يومياً">5 آيات أو نصف صفحة يومياً (متوازن)</option>
              <option value="صفحة كاملة يومياً">صفحة كاملة يومياً (إيقاع سريع)</option>
              <option value="وجهين يومياً">وجهين يومياً (حفظ مكثف)</option>
            </select>
          </div>

          {/* Submit Action */}
          <div className="flex items-end">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جاري إعداد الخطة وترتيب الأولويات...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>توليد خطة التدارس الذكية</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Generated AI Plan Display */}
      {plan && (
        <div className="space-y-6 animate-fade-in">
          {/* Header Summary & One-Click Calendar Integration */}
          <div className={`p-5 rounded-3xl border shadow-md flex flex-col md:flex-row md:items-center justify-between gap-3 ${
            isDark ? 'bg-slate-900/90 border-emerald-800/40' : 'bg-emerald-50/40 border-emerald-200'
          }`}>
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                خطة موصى بها من الذكاء الاصطناعي
              </span>
              <h3 className="text-base font-bold text-slate-100 mt-1">
                برنامج مدارسة سورة {plan.targetSurah} • {plan.dailyMinutes} دقيقة يومياً
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="add-plan-to-calendar-btn"
                onClick={handleAddPlanToCalendar}
                disabled={addedToCalendarSuccess}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-2xl text-xs font-bold transition-all shadow-md ${
                  addedToCalendarSuccess
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {addedToCalendarSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>تمت الإضافة إلى التقويم بنجاح</span>
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4" />
                    <span>إضافة الخطة إلى تقويم التدارس</span>
                  </>
                )}
              </button>

              {onOpenSchedule && (
                <button
                  onClick={onOpenSchedule}
                  className="px-3 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700"
                >
                  فتح التقويم
                </button>
              )}
            </div>
          </div>

          {/* 1. Daily Priority Breakdown by Minutes */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2">
              <ListOrdered className="w-4 h-4" />
              ترتيب أولويات التدارس اليومي (بالدقائق والأنشطة):
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {(plan.priorityOrder || []).map((item: any) => (
                <div
                  key={item.order}
                  className={`p-4 rounded-3xl border shadow-sm space-y-2 flex flex-col justify-between ${
                    isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center text-xs">
                        {item.order}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-[11px] border border-emerald-500/20">
                        {item.durationMinutes} دقيقة
                      </span>
                    </div>

                    <h5 className="text-xs font-bold text-slate-100">{item.phase}</h5>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      {item.activity}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-800 text-[10px] text-teal-400 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 shrink-0" />
                    <span>المنهج: {item.methodName}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 2. Recommended Methodology Card */}
          {plan.recommendedMethodology && (
            <div className={`p-5 rounded-3xl border shadow-md space-y-3 ${
              isDark ? 'bg-slate-900/80 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
            }`}>
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-teal-400 flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  المنهجية العلمية الموصى بها: {plan.recommendedMethodology.name}
                </span>
                <span className="text-[11px] text-slate-400">{plan.recommendedMethodology.origin}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {plan.recommendedMethodology.description}
              </p>

              {plan.recommendedMethodology.steps && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                  {plan.recommendedMethodology.steps.map((step: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 p-2 rounded-xl bg-slate-800/40 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 3. Weekly Schedule Matrix */}
          {plan.weeklyScheduleMatrix && (
            <div className={`p-5 rounded-3xl border shadow-md space-y-3 ${
              isDark ? 'bg-slate-900/80 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
            }`}>
              <h4 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                مصفوفة الجدول الأسبوعي للمدارسة والحفظ:
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-2">
                {plan.weeklyScheduleMatrix.map((matrixItem: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-2xl bg-slate-800/60 border border-slate-800 space-y-1 text-center">
                    <span className="text-[11px] font-bold text-amber-400 block">{matrixItem.day}</span>
                    <p className="text-[10px] text-slate-300 leading-snug">{matrixItem.task}</p>
                    <span className="text-[9px] text-slate-500 block pt-1">{matrixItem.duration}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Scholarly Golden Advice */}
          {plan.scholarlyAdvice && (
            <div className={`p-4 rounded-2xl border ${
              isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <h4 className="text-xs font-bold text-amber-300 mb-2 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4" />
                وصايا علماء القراءات الذهبية لتثبيت الحفظ:
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {plan.scholarlyAdvice.map((advice: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                    <span>{advice}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
