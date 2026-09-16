import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  BookOpen,
  Bell,
  BellRing,
  Plus,
  Radio,
  Users,
  CheckCircle2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  AlertCircle,
  Video,
  Volume2,
} from 'lucide-react';
import { HalqaSchedule } from '../../types';
import { ALL_SURAHS } from '../../data/quranSurahs';

interface HalaqatScheduleCalendarProps {
  onJoinRoomById?: (roomId: string) => void;
  onRewardPoints?: (points: number, message: string) => void;
  isDark?: boolean;
}

export function HalaqatScheduleCalendar({
  onJoinRoomById,
  onRewardPoints,
  isDark = true,
}: HalaqatScheduleCalendarProps) {
  const [schedules, setSchedules] = useState<HalqaSchedule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [reminderToast, setReminderToast] = useState<string | null>(null);

  // Form State
  const [newTitle, setNewTitle] = useState<string>('');
  const [newSurahId, setNewSurahId] = useState<number>(18);
  const [newAyahStart, setNewAyahStart] = useState<number>(1);
  const [newAyahEnd, setNewAyahEnd] = useState<number>(20);
  const [newCategory, setNewCategory] = useState<'tadabbur' | 'hifz' | 'tajweed' | 'fatwa_qa'>('hifz');
  const [selectedDays, setSelectedDays] = useState<number[]>([5]); // Default Friday
  const [newTime, setNewTime] = useState<string>('18:00');
  const [newDuration, setNewDuration] = useState<number>(45);
  const [newSheikhName, setNewSheikhName] = useState<string>('الشيخ المقرئ');
  const [newMeetingMode, setNewMeetingMode] = useState<'audio_video' | 'audio_only'>('audio_video');
  const [newReminderMin, setNewReminderMin] = useState<number>(15);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const daysOfWeek = [
    { dayNum: 0, label: 'الأحد' },
    { dayNum: 1, label: 'الإثنين' },
    { dayNum: 2, label: 'الثلاثاء' },
    { dayNum: 3, label: 'الأربعاء' },
    { dayNum: 4, label: 'الخميس' },
    { dayNum: 5, label: 'الجمعة' },
    { dayNum: 6, label: 'السبت' },
  ];

  // Fetch Schedules
  const fetchSchedules = async () => {
    try {
      const res = await fetch('/api/v1/halaqat/schedules');
      const data = await res.json();
      if (data.success && data.schedules) {
        setSchedules(data.schedules);
      }
    } catch (err) {
      console.warn('Could not fetch halaqat schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  // Toggle Reminder for a Schedule item
  const handleToggleScheduleReminder = (schedId: string) => {
    setSchedules((prev) =>
      prev.map((s) => {
        if (s.id === schedId) {
          const nextVal = !s.isReminderActive;
          setReminderToast(
            nextVal
              ? `تم تفعيل التنبيه لجلسة "${s.title}" قبل الموعد بـ ${s.reminderMinutesBefore} دقيقة.`
              : `تم إلغاء التنبيه لجلسة "${s.title}".`
          );
          setTimeout(() => setReminderToast(null), 3500);
          return { ...s, isReminderActive: nextVal };
        }
        return s;
      })
    );
  };

  // Delete Schedule
  const handleDeleteSchedule = async (schedId: string) => {
    try {
      const res = await fetch(`/api/v1/halaqat/schedules/${schedId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        setSchedules((prev) => prev.filter((s) => s.id !== schedId));
      }
    } catch (err) {
      console.warn('Could not delete schedule:', err);
    }
  };

  // Add Schedule
  const handleAddSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || selectedDays.length === 0) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/v1/halaqat/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          surahId: newSurahId,
          ayahStart: newAyahStart,
          ayahEnd: newAyahEnd,
          category: newCategory,
          daysOfWeek: selectedDays,
          time: newTime,
          durationMinutes: newDuration,
          sheikhName: newSheikhName,
          meetingMode: newMeetingMode,
          reminderMinutesBefore: newReminderMin,
          isReminderActive: true,
        }),
      });
      const data = await res.json();
      if (data.success && data.schedule) {
        setSchedules((prev) => [data.schedule, ...prev]);
        setShowAddModal(false);
        setNewTitle('');
        if (onRewardPoints) {
          onRewardPoints(10, 'إضافة موعد منظم إلى تقويم التدارس القرآني');
        }
      }
    } catch (err) {
      console.warn('Could not add schedule:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleDaySelection = (dayNum: number) => {
    if (selectedDays.includes(dayNum)) {
      if (selectedDays.length > 1) {
        setSelectedDays(selectedDays.filter((d) => d !== dayNum));
      }
    } else {
      setSelectedDays([...selectedDays, dayNum].sort());
    }
  };

  const filteredSchedules = schedules.filter((s) => {
    if (selectedCategory === 'all') return true;
    return s.category === selectedCategory;
  });

  return (
    <div className="space-y-6" id="halaqat-schedule-calendar">
      {/* Toast Notification */}
      {reminderToast && (
        <div className="p-3 rounded-2xl bg-emerald-900/90 text-emerald-100 border border-emerald-500/50 flex items-center gap-2 shadow-lg animate-fade-in text-xs font-semibold">
          <BellRing className="w-4 h-4 text-emerald-300 animate-bounce" />
          <span>{reminderToast}</span>
        </div>
      )}

      {/* Header with Quick Actions */}
      <div className={`p-5 rounded-3xl border shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 ${
        isDark
          ? 'bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/40 border-emerald-800/40 text-slate-100'
          : 'bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/40 border-emerald-200 text-slate-800'
      }`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <CalendarIcon className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold">تقويم وجداول التدارس والحفظ القرآني</h2>
          </div>
          <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
            مواعيد الجلسات الأسبوعية، مجالس التسميع المباشرة، وتنبيهات الأوراد مع تفعيل التذكير التلقائي.
          </p>
        </div>

        <button
          id="add-schedule-btn"
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة موعد جديد للتقويم</span>
        </button>
      </div>

      {/* Category Filters Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3.5 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
            selectedCategory === 'all'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
          }`}
        >
          كافة المواعيد ({schedules.length})
        </button>
        <button
          onClick={() => setSelectedCategory('hifz')}
          className={`px-3.5 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
            selectedCategory === 'hifz'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
          }`}
        >
          حلقات التحفيظ والتسميع
        </button>
        <button
          onClick={() => setSelectedCategory('tadabbur')}
          className={`px-3.5 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
            selectedCategory === 'tadabbur'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
          }`}
        >
          مجالس التدبر والتفسير
        </button>
        <button
          onClick={() => setSelectedCategory('tajweed')}
          className={`px-3.5 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
            selectedCategory === 'tajweed'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
          }`}
        >
          مجالس التلاوة والتجويد
        </button>
      </div>

      {/* Weekly Schedule Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSchedules.map((schedule) => (
          <div
            key={schedule.id}
            className={`p-4 rounded-3xl border shadow-md space-y-3 flex flex-col justify-between transition-all ${
              isDark
                ? 'bg-slate-900/80 border-slate-800 hover:border-emerald-700/60'
                : 'bg-white border-slate-200 hover:border-emerald-300'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  {schedule.categoryLabel}
                </span>

                <div className="flex items-center gap-1">
                  {/* Toggle Reminder button */}
                  <button
                    onClick={() => handleToggleScheduleReminder(schedule.id)}
                    className={`p-1.5 rounded-xl text-xs transition-all ${
                      schedule.isReminderActive
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-500 hover:text-slate-300'
                    }`}
                    title={schedule.isReminderActive ? 'التنبيه مفعل (انقر للإلغاء)' : 'تفعيل التنبيه'}
                  >
                    {schedule.isReminderActive ? <BellRing className="w-3.5 h-3.5 animate-pulse" /> : <Bell className="w-3.5 h-3.5" />}
                  </button>

                  {/* Delete button */}
                  <button
                    onClick={() => handleDeleteSchedule(schedule.id)}
                    className="p-1.5 rounded-xl text-xs text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    title="حذف من التقويم"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="text-sm font-bold text-slate-100">{schedule.title}</h3>

              <div className="p-2.5 rounded-2xl bg-slate-800/50 border border-slate-800 space-y-1.5 text-xs text-slate-300">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-emerald-400 font-semibold">
                    <BookOpen className="w-3.5 h-3.5" />
                    سورة {schedule.surahName}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    الآيات ({schedule.ayahStart}-{schedule.ayahEnd})
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-700/50">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-400" />
                    {schedule.daysLabel} • {schedule.time}
                  </span>
                  <span>{schedule.durationMinutes} دقيقة</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>المشرف: {schedule.sheikhName}</span>
                <span className="flex items-center gap-1 text-teal-400">
                  {schedule.meetingMode === 'audio_video' ? (
                    <>
                      <Video className="w-3 h-3" />
                      مسموع ومرئي
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3 h-3" />
                      صوتي
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Direct Join Action */}
            <div className="pt-2 border-t border-slate-800">
              {schedule.roomId && onJoinRoomById ? (
                <button
                  onClick={() => onJoinRoomById(schedule.roomId!)}
                  className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-colors"
                >
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  <span>انضمام مباشر للجلسة الآن</span>
                </button>
              ) : (
                <div className="text-center py-1 text-[11px] text-slate-500 flex items-center justify-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>يبدأ البث تلقائياً في الموعد المحدد</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredSchedules.length === 0 && !loading && (
        <div className="p-8 text-center rounded-3xl border border-dashed border-slate-800 space-y-2">
          <CalendarIcon className="w-8 h-8 text-slate-600 mx-auto" />
          <p className="text-xs text-slate-400">لا توجد مواعيد في هذا التصنيف حالياً.</p>
        </div>
      )}

      {/* Add Schedule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className={`w-full max-w-lg rounded-3xl border p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto ${
            isDark ? 'bg-slate-900 border-emerald-800/40 text-slate-100' : 'bg-white border-emerald-200 text-slate-800'
          }`}>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm sm:text-base font-bold flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-emerald-400" />
                إضافة موعد لتقويم وجداول التدارس
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-slate-200">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddSchedule} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold mb-1">عنوان الجلسة أو المجلس:</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: مجلس تدبر سورة الملك والتسميع الدوري"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">تصنيف الجلسة:</label>
                  <select
                    value={newCategory}
                    onChange={(e: any) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="hifz">حلقة تحفيظ وتسميع</option>
                    <option value="tadabbur">حلقة تدبر وتفسير</option>
                    <option value="tajweed">مجلس تلاوة وتجويد</option>
                    <option value="fatwa_qa">مجلس أسئلة وفتاوى</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">السورة المستهدفة:</label>
                  <select
                    value={newSurahId}
                    onChange={(e) => setNewSurahId(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    {ALL_SURAHS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.id}. سورة {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Days Selection */}
              <div>
                <label className="block font-semibold mb-1.5">أيام الانعقاد الأسبوعية:</label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                  {daysOfWeek.map((day) => {
                    const isSelected = selectedDays.includes(day.dayNum);
                    return (
                      <button
                        type="button"
                        key={day.dayNum}
                        onClick={() => toggleDaySelection(day.dayNum)}
                        className={`py-1.5 rounded-xl font-bold text-[11px] transition-all border ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-500 shadow'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                        }`}
                      >
                        {day.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">توقيت الانعقاد:</label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">المدة بالدقائق:</label>
                  <input
                    type="number"
                    min={15}
                    max={180}
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">نظام الاجتماع:</label>
                  <select
                    value={newMeetingMode}
                    onChange={(e: any) => setNewMeetingMode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="audio_video">مسموع ومرئي (صوت وكاميرا)</option>
                    <option value="audio_only">صوتي فقط</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold mb-1">التنبيه قبل الموعد بـ:</label>
                  <select
                    value={newReminderMin}
                    onChange={(e) => setNewReminderMin(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value={10}>10 دقائق</option>
                    <option value={15}>15 دقيقة</option>
                    <option value={30}>30 دقيقة</option>
                    <option value={60}>ساعة واحدة</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors"
                >
                  {isSubmitting ? 'جاري الحفظ...' : 'حفظ في التقويم'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
