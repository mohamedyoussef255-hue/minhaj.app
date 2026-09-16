import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Circle,
  Clock,
  Award,
  Bell,
  BellRing,
  BookOpen,
  CheckSquare,
  Plus,
  RefreshCw,
  AlertCircle,
  Calendar,
  Share2,
  ChevronDown,
  ChevronUp,
  Tag,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { HalqaRoomData, HalqaTask, MeetingAnalysis } from '../../types';

interface MeetingAnalysisPanelProps {
  room: HalqaRoomData;
  currentUser?: any;
  isDark?: boolean;
  onRefreshRoom: () => void;
  onRewardPoints?: (points: number, message: string) => void;
  onOpenSchedule?: () => void;
}

export function MeetingAnalysisPanel({
  room,
  currentUser,
  isDark = true,
  onRefreshRoom,
  onRewardPoints,
  onOpenSchedule,
}: MeetingAnalysisPanelProps) {
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [activeSubSection, setActiveSubSection] = useState<'analysis' | 'tasks'>('analysis');
  const [remindersActive, setRemindersActive] = useState<boolean>(true);
  const [reminderToast, setReminderToast] = useState<string | null>(null);

  // New task form state
  const [showAddTaskModal, setShowAddTaskModal] = useState<boolean>(false);
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [newTaskDesc, setNewTaskDesc] = useState<string>('');
  const [newTaskType, setNewTaskType] = useState<'hifz' | 'murajaah' | 'tafseer' | 'tajweed' | 'action'>('hifz');
  const [newTaskDeadline, setNewTaskDeadline] = useState<string>('قبل المجلس القادم');
  const [newTaskPoints, setNewTaskPoints] = useState<number>(25);
  const [isAddingTask, setIsAddingTask] = useState<boolean>(false);

  const analysis = room.meetingAnalysis;
  const tasks = room.tasks || [];

  // Trigger AI Meeting Analysis
  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisError(null);
    try {
      const res = await fetch(`/api/v1/halaqat/${room.id}/analyze-meeting`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) {
        onRefreshRoom();
        if (onRewardPoints) {
          onRewardPoints(15, 'تحليل مجريات المجلس القرآني واستخراج التكليفات');
        }
      } else {
        setAnalysisError(data.error || 'تعذر تحليل الاجتماع حالياً');
      }
    } catch (err: any) {
      setAnalysisError(err.message || 'حدث خطأ في الاتصال بالخادم');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Toggle Task Completion
  const handleToggleTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/v1/halaqat/${room.id}/tasks/${taskId}/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser?.id || 'guest-user' }),
      });
      const data = await res.json();
      if (data.success) {
        onRefreshRoom();
        if (data.pointsAwarded && onRewardPoints) {
          onRewardPoints(data.pointsAwarded, data.message);
        }
      }
    } catch (err) {
      console.warn('Could not toggle task:', err);
    }
  };

  // Add Manual Task
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    setIsAddingTask(true);
    try {
      const res = await fetch(`/api/v1/halaqat/${room.id}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTaskTitle,
          description: newTaskDesc,
          type: newTaskType,
          deadline: newTaskDeadline,
          pointsReward: newTaskPoints,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNewTaskTitle('');
        setNewTaskDesc('');
        setShowAddTaskModal(false);
        onRefreshRoom();
      }
    } catch (err) {
      console.warn('Could not add task:', err);
    } finally {
      setIsAddingTask(false);
    }
  };

  // Reminders toggle
  const handleToggleReminders = () => {
    const nextState = !remindersActive;
    setRemindersActive(nextState);
    if (nextState) {
      setReminderToast('تم تفعيل تنبيهات وتذكيرات التكليفات والمهام بنجاح! ستصلك إشعارات قبل الموعد.');
      if ('Notification' in window && Notification.permission !== 'granted') {
        Notification.requestPermission();
      }
    } else {
      setReminderToast('تم إيقاف التنبيهات مؤقتاً.');
    }
    setTimeout(() => setReminderToast(null), 4000);
  };

  const completedCount = tasks.filter((t) => t.isCompleted).length;

  return (
    <div className="space-y-6" id="meeting-analysis-panel">
      {/* Toast Notification */}
      {reminderToast && (
        <div className="p-3.5 rounded-2xl bg-emerald-900/90 text-emerald-100 border border-emerald-500/50 flex items-center gap-2 shadow-lg animate-fade-in">
          <BellRing className="w-5 h-5 text-emerald-300 animate-bounce" />
          <span className="text-xs font-semibold">{reminderToast}</span>
        </div>
      )}

      {/* Top Banner with AI Analysis Action & Reminder Toggle */}
      <div className={`p-5 rounded-3xl border shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isDark
          ? 'bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/40 border-emerald-800/40 text-slate-100'
          : 'bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/40 border-emerald-200 text-slate-800'
      }`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Sparkles className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold">تحليل الاجتماع بالذكاء الاصطناعي والتكليفات</h2>
          </div>
          <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
            استخراج تلقائي لأهم النقاط والمحاور، صياغة التكليفات والواجبات، تفعيل التنبيهات، وترتيب خطة المدارسة حتى المجلس القادم.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* Reminders Toggle */}
          <button
            id="toggle-reminders-btn"
            onClick={handleToggleReminders}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-semibold border transition-all ${
              remindersActive
                ? 'bg-emerald-600/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-600/30'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
            }`}
            title="تفعيل أو تعطيل التنبيهات والتذكير"
          >
            {remindersActive ? <BellRing className="w-4 h-4 text-emerald-400 animate-pulse" /> : <Bell className="w-4 h-4" />}
            <span>{remindersActive ? 'التنبيهات مفعلة' : 'تفعيل التنبيهات'}</span>
          </button>

          {/* Trigger AI Analysis Button */}
          <button
            id="run-ai-analysis-btn"
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-bold text-xs shadow-lg transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{isAnalyzing ? 'جاري التحليل واستخراج المهام...' : 'تحديث التحليل بالذكاء الاصطناعي'}</span>
          </button>
        </div>
      </div>

      {analysisError && (
        <div className="p-3 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{analysisError}</span>
        </div>
      )}

      {/* Sub-tabs switch: Analysis View vs. Tasks & Assignments View */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubSection('analysis')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubSection === 'analysis'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>ملخص ومحاور الاجتماع</span>
          </button>

          <button
            onClick={() => setActiveSubSection('tasks')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubSection === 'tasks'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>المهام والتكليفات والواجبات</span>
            <span className="px-1.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
              {completedCount}/{tasks.length}
            </span>
          </button>
        </div>

        {activeSubSection === 'tasks' && (
          <button
            onClick={() => setShowAddTaskModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-emerald-400" />
            <span>إضافة تكليف جديد</span>
          </button>
        )}
      </div>

      {/* SECTION 1: AI MEETING ANALYSIS & THEMES */}
      {activeSubSection === 'analysis' && (
        <div className="space-y-5">
          {analysis ? (
            <>
              {/* Executive Summary Card */}
              <div className={`p-5 rounded-3xl border shadow-md space-y-3 ${
                isDark ? 'bg-slate-900/80 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
              }`}>
                <div className="flex items-center justify-between text-xs text-amber-400 font-semibold">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" />
                    التقرير التنفيذي وخلاصة المجلس
                  </span>
                  <span className="text-slate-400 text-[11px] flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    تم التوثيق: {new Date(analysis.generatedAt).toLocaleDateString('ar-SA')}
                  </span>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed text-justify">
                  {analysis.executiveSummary}
                </p>
              </div>

              {/* Key Themes & Scholarly Takeaways Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Key Themes */}
                <div className={`p-5 rounded-3xl border shadow-md space-y-3 ${
                  isDark ? 'bg-slate-900/80 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
                }`}>
                  <h3 className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <Tag className="w-4 h-4" />
                    أهم محاور التدارس المستنبطة
                  </h3>
                  <ul className="space-y-2">
                    {analysis.keyThemes.map((theme, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <span>{theme}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Scholarly Takeaways */}
                <div className={`p-5 rounded-3xl border shadow-md space-y-3 ${
                  isDark ? 'bg-slate-900/80 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-800'
                }`}>
                  <h3 className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    الفوائد الإيمانية والتفسيرية
                  </h3>
                  <ul className="space-y-2">
                    {analysis.scholarlyTakeaways.map((takeaway, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-300 leading-relaxed">
                        <CheckCircle2 className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                        <span>{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Study Recommendations & Revision Plan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-2xl border ${
                  isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <h4 className="text-xs font-bold text-teal-400 mb-1 flex items-center gap-1.5">
                    <Award className="w-4 h-4" />
                    توجيهات طرق التدارس والحفظ
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {analysis.studyRecommendations}
                  </p>
                </div>

                {analysis.recommendedRevisionPlan && (
                  <div className={`p-4 rounded-2xl border ${
                    isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <h4 className="text-xs font-bold text-emerald-400 mb-1 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      جدول الورد والمراجعة المقترح
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {analysis.recommendedRevisionPlan}
                    </p>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="p-8 text-center rounded-3xl border border-dashed border-slate-800 space-y-3">
              <Sparkles className="w-8 h-8 text-amber-400 mx-auto animate-pulse" />
              <h3 className="text-sm font-bold text-slate-200">لم يتم تشغيل تحليل الاجتماع بعد</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                انقر على زر "تحديث التحليل بالذكاء الاصطناعي" في الأعلى ليقوم النموذج بفحص ملاحظات المجلس وتلاواته واستخراج أهم النقاط والتكليفات بدقة.
              </p>
              <button
                onClick={handleRunAnalysis}
                disabled={isAnalyzing}
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs transition-colors"
              >
                تشغيل التحليل الآن
              </button>
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: TASKS, ASSIGNMENTS & HOMEWORK */}
      {activeSubSection === 'tasks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-400">
              قائمة الواجبات والتكليفات المترتبة على هذا المجلس. أنجز التكليف واضغط لتأكيد الحفظ وكسب نقاط البركة:
            </div>
            {onOpenSchedule && (
              <button
                onClick={onOpenSchedule}
                className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>عرض تقويم وجداول التدارس</span>
              </button>
            )}
          </div>

          {tasks.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {tasks.map((task) => {
                const typeColors: Record<string, string> = {
                  hifz: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300',
                  murajaah: 'border-teal-500/40 bg-teal-950/20 text-teal-300',
                  tafseer: 'border-amber-500/40 bg-amber-950/20 text-amber-300',
                  tajweed: 'border-blue-500/40 bg-blue-950/20 text-blue-300',
                  action: 'border-purple-500/40 bg-purple-950/20 text-purple-300',
                };
                const badgeClass = typeColors[task.type] || 'border-slate-700 bg-slate-800 text-slate-300';

                return (
                  <div
                    key={task.id}
                    className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                      task.isCompleted
                        ? 'bg-slate-900/40 border-emerald-800/40 opacity-80'
                        : isDark
                        ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                        : 'bg-white border-slate-200 hover:border-emerald-200'
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1">
                      {/* Completion Checkbox */}
                      <button
                        onClick={() => handleToggleTask(task.id)}
                        className={`mt-0.5 p-1 rounded-xl transition-all ${
                          task.isCompleted
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-800 text-slate-500 border border-slate-700 hover:text-emerald-400'
                        }`}
                        title={task.isCompleted ? 'إلغاء التحديد' : 'تأكيد إنجاز التكليف'}
                      >
                        {task.isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : <Circle className="w-4 h-4" />}
                      </button>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeClass}`}>
                            {task.typeLabel || 'تكليف قرآني'}
                          </span>
                          <h4 className={`text-xs sm:text-sm font-semibold ${task.isCompleted ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                            {task.title}
                          </h4>
                        </div>

                        {task.description && (
                          <p className="text-xs text-slate-400 leading-relaxed">
                            {task.description}
                          </p>
                        )}

                        <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            الموعد: <strong>{task.deadline || 'قبل المجلس القادم'}</strong>
                          </span>
                          <span>المكلفون: {task.assignedTo}</span>
                        </div>
                      </div>
                    </div>

                    {/* Reward Points Badge & Status */}
                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className="px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                        <span>+{task.pointsReward} نقطة</span>
                      </span>

                      {task.isCompleted && (
                        <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          تم الإنجاز
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center rounded-3xl border border-dashed border-slate-800 space-y-2">
              <CheckSquare className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400">لا توجد تكليفات مضافة بعد لهذا المجلس.</p>
              <button
                onClick={() => setShowAddTaskModal(true)}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
              >
                إضافة تكليف الآن
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className={`w-full max-w-lg rounded-3xl border p-6 shadow-2xl space-y-4 ${
            isDark ? 'bg-slate-900 border-emerald-800/40 text-slate-100' : 'bg-white border-emerald-200 text-slate-800'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm sm:text-base font-bold flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                إضافة تكليف أو واجب جديد للحلقة
              </h3>
              <button
                onClick={() => setShowAddTaskModal(false)}
                className="p-1 text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddTask} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">عنوان المهمة / التكليف:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: حفظ وتثبيت الآيات (1-10) من سورة الكهف بالتجويد"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">وصف وتفاصيل التكليف (اختياري):</label>
                <textarea
                  rows={2}
                  placeholder="أحكام التجويد المطلوبة أو التفسير الواجب قراءته..."
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">نوع التكليف:</label>
                  <select
                    value={newTaskType}
                    onChange={(e: any) => setNewTaskType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="hifz">حفظ جديد وتثبيت</option>
                    <option value="murajaah">مراجعة دورية</option>
                    <option value="tafseer">تفسير وتدبر</option>
                    <option value="tajweed">تجويد وإتقان</option>
                    <option value="action">تطبيق عملي وسلوك</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">الموعد النهائي:</label>
                  <input
                    type="text"
                    value={newTaskDeadline}
                    onChange={(e) => setNewTaskDeadline(e.target.value)}
                    placeholder="قبل المجلس القادم / خلال 48 ساعة"
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">نقاط البركة كمكافأة إنجاز:</label>
                <input
                  type="number"
                  min={5}
                  max={100}
                  value={newTaskPoints}
                  onChange={(e) => setNewTaskPoints(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isAddingTask}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors"
                >
                  {isAddingTask ? 'جاري الإضافة...' : 'إضافة التكليف'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
