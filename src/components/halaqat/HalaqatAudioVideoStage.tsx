import React, { useState, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  MonitorUp,
  Radio,
  Users,
  Sparkles,
  Share2,
  CheckCircle2,
  Award,
  Volume2,
  VolumeX,
  BookOpen,
  MessageCircle,
  HelpCircle,
  Clock,
  ShieldCheck,
  Maximize2,
  Calendar,
  ListTodo,
} from 'lucide-react';
import { HalqaRoomData } from '../../types';

interface HalaqatAudioVideoStageProps {
  room: HalqaRoomData;
  currentUser?: any;
  userRole: 'listener' | 'student_reciter' | 'questioner';
  isMicMuted: boolean;
  setIsMicMuted: React.Dispatch<React.SetStateAction<boolean>>;
  isDark?: boolean;
  onOpenAnalysis: () => void;
  onOpenTasks: () => void;
  onOpenWhatsAppInvite: () => void;
  onOpenSchedule: () => void;
  onRewardPoints?: (points: number, msg: string) => void;
}

export function HalaqatAudioVideoStage({
  room,
  currentUser,
  userRole,
  isMicMuted,
  setIsMicMuted,
  isDark = true,
  onOpenAnalysis,
  onOpenTasks,
  onOpenWhatsAppInvite,
  onOpenSchedule,
  onRewardPoints,
}: HalaqatAudioVideoStageProps) {
  const [isVideoOn, setIsVideoOn] = useState<boolean>(true);
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);
  const [activeSpeakerMode, setActiveSpeakerMode] = useState<'grid' | 'speaker'>('grid');
  const [audioWaves, setAudioWaves] = useState<number[]>([40, 75, 55, 90, 60, 80, 45, 95, 70, 50, 85, 65]);

  // Audio wave animation simulation for active reciter
  useEffect(() => {
    const interval = setInterval(() => {
      setAudioWaves((prev) =>
        prev.map(() => Math.floor(Math.random() * 65) + 30)
      );
    }, 280);
    return () => clearInterval(interval);
  }, []);

  const tasksCount = room.tasks?.length || 0;
  const completedTasksCount = room.tasks?.filter((t) => t.isCompleted).length || 0;

  return (
    <div className="space-y-4" id="halaqat-av-stage">
      {/* Meeting Header Bar */}
      <div className={`p-4 rounded-2xl border flex flex-wrap items-center justify-between gap-3 ${
        isDark ? 'bg-slate-900/80 border-emerald-900/40 text-slate-100' : 'bg-white border-emerald-100 text-slate-800'
      }`}>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white shadow-md">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-950 animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                مباشر الآن
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                اجتماع مسموع ومرئي عالي الدقة
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {room.participantsCount} مشارك
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-bold mt-0.5">{room.title}</h2>
          </div>
        </div>

        {/* Action Shortcuts */}
        <div className="flex items-center flex-wrap gap-2">
          {/* WhatsApp Invite Button */}
          <button
            id="av-stage-whatsapp-invite-btn"
            onClick={onOpenWhatsAppInvite}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-colors"
            title="إرسال دعوة للأعضاء عبر الواتساب"
          >
            <Share2 className="w-4 h-4" />
            <span>دعوة واتساب</span>
          </button>

          {/* AI Meeting Analysis Button */}
          <button
            id="av-stage-ai-analysis-btn"
            onClick={onOpenAnalysis}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-white text-xs font-semibold shadow-md transition-colors"
            title="تحليل الاجتماع واستخراج المهام والتكليفات بالذكاء الاصطناعي"
          >
            <Sparkles className="w-4 h-4" />
            <span>تحليل الاجتماع بالذكاء الاصطناعي</span>
            {room.meetingAnalysis && (
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            )}
          </button>

          {/* Tasks & Assignments Button */}
          <button
            id="av-stage-tasks-btn"
            onClick={onOpenTasks}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-700/70 hover:bg-teal-600 text-white text-xs font-semibold border border-teal-500/30 transition-colors"
          >
            <ListTodo className="w-4 h-4" />
            <span>التكليفات والواجبات</span>
            <span className="px-1.5 py-0.2 bg-teal-900 rounded-full text-[10px]">
              {completedTasksCount}/{tasksCount}
            </span>
          </button>

          {/* Schedule Calendar Button */}
          <button
            id="av-stage-schedule-btn"
            onClick={onOpenSchedule}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>الجدول والتقويم</span>
          </button>
        </div>
      </div>

      {/* Video Meeting Canvas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Main Presenter / Sheikh Video Screen (Spans 2 columns on desktop) */}
        <div className={`md:col-span-2 relative rounded-3xl overflow-hidden border aspect-video flex flex-col justify-between p-4 shadow-xl ${
          isDark
            ? 'bg-gradient-to-b from-slate-900 via-slate-950 to-emerald-950/60 border-emerald-800/40'
            : 'bg-gradient-to-b from-emerald-50 via-teal-50/40 to-slate-100 border-emerald-200'
        }`}>
          {/* Top Video Overlay: Sheikh Info & Recitation Surah */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold">{room.sheikhHost.name}</span>
              <span className="text-emerald-300 text-[11px] font-normal">({room.sheikhHost.title})</span>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-900/70 backdrop-blur-md border border-emerald-500/30 text-emerald-100 text-xs font-medium">
              <BookOpen className="w-3.5 h-3.5 text-emerald-300" />
              <span>سورة {room.surahName} (الآيات {room.ayahStart}-{room.ayahEnd})</span>
            </div>
          </div>

          {/* Center Visual: Spiritual Quranic Ambient Video / Audio Visualizer */}
          <div className="my-auto flex flex-col items-center justify-center text-center p-6 space-y-4">
            <div className="relative">
              {/* Outer pulsing halo */}
              <div className="absolute -inset-4 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-gradient-to-br from-emerald-700 via-teal-800 to-slate-900 border-2 border-emerald-400/50 flex items-center justify-center text-white shadow-2xl">
                <BookOpen className="w-12 h-12 text-emerald-200" />
              </div>
              <span className="absolute bottom-1 right-1 p-1 rounded-full bg-emerald-500 text-white shadow">
                <ShieldCheck className="w-4 h-4" />
              </span>
            </div>

            <div className="max-w-md">
              <h3 className="text-base sm:text-lg font-bold text-white tracking-wide">
                بث مباشر لتدارس وتلاوة الآيات الكريمة
              </h3>
              <p className="text-xs text-emerald-200/80 mt-1 leading-relaxed">
                ﴿ورتل القرآن ترتيلا﴾ • مجلس مبارك تحفه الملائكة وتغشاه الرحمة
              </p>
            </div>

            {/* Audio Waveform Equalizer */}
            <div className="flex items-center justify-center gap-1 h-10 px-4 py-2 rounded-2xl bg-black/40 backdrop-blur-sm border border-emerald-500/20">
              <span className="text-[10px] text-emerald-400 font-mono ml-2">الصوت المباشر:</span>
              {audioWaves.map((height, idx) => (
                <div
                  key={idx}
                  className="w-1 bg-gradient-to-t from-emerald-500 to-teal-300 rounded-full transition-all duration-300"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </div>

          {/* Bottom Video Overlay: Speaker Active State & Controls */}
          <div className="flex items-center justify-between z-10 pt-2 border-t border-white/10">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <span className="p-1 rounded-lg bg-emerald-500/20 text-emerald-300">
                <Volume2 className="w-3.5 h-3.5 animate-pulse" />
              </span>
              <span>المتحدث الحالي: <strong>{room.activeSpeaker.name}</strong> ({room.activeSpeaker.role})</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveSpeakerMode(activeSpeakerMode === 'grid' ? 'speaker' : 'grid')}
                className="px-2.5 py-1 rounded-lg bg-black/50 hover:bg-black/70 text-white text-xs border border-white/10 transition-colors flex items-center gap-1"
                title="تغيير نمط العرض"
              >
                <Maximize2 className="w-3 h-3" />
                <span className="hidden sm:inline">{activeSpeakerMode === 'grid' ? 'ملء الشاشة' : 'شبكة'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Side Column: Student / Participant Video Tile & Meeting Info */}
        <div className="flex flex-col gap-4">
          {/* User's Local Video / Webcam Tile */}
          <div className={`relative rounded-3xl overflow-hidden border p-4 flex flex-col justify-between shadow-lg h-52 sm:h-56 ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-800 text-slate-200 border border-slate-700">
                كاميرتي (طالب / مشارك)
              </span>
              <span className={`w-2 h-2 rounded-full ${isVideoOn ? 'bg-emerald-400' : 'bg-slate-500'}`} />
            </div>

            {/* Camera View / Avatar */}
            <div className="my-auto flex flex-col items-center justify-center">
              {isVideoOn ? (
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-700 to-slate-800 border border-emerald-400/40 flex items-center justify-center text-white shadow-inner relative">
                  <span className="text-xl font-bold">
                    {currentUser?.fullName ? currentUser.fullName.slice(0, 2) : 'أنت'}
                  </span>
                  <div className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-emerald-400 border border-slate-900" />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                  <VideoOff className="w-8 h-8" />
                </div>
              )}
              <span className="text-xs font-medium text-slate-300 mt-2">
                {currentUser?.fullName || 'الطالب المشارك'}
              </span>
              <span className="text-[10px] text-slate-500">
                {isMicMuted ? 'الميكروفون مكتوم' : 'الميكروفون يعمل بنقاء'}
              </span>
            </div>

            {/* Quick Local Toggles */}
            <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-800/80">
              <button
                id="toggle-mic-quick-btn"
                onClick={() => {
                  setIsMicMuted(!isMicMuted);
                  if (onRewardPoints && isMicMuted) {
                    onRewardPoints(5, 'تفعيل المشاركة الصوتية في الحلقة المباركة');
                  }
                }}
                className={`p-2 rounded-xl transition-all ${
                  isMicMuted
                    ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                }`}
                title={isMicMuted ? 'إلغاء كتم الميكروفون' : 'كتم الميكروفون'}
              >
                {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <button
                id="toggle-video-quick-btn"
                onClick={() => setIsVideoOn(!isVideoOn)}
                className={`p-2 rounded-xl transition-all ${
                  !isVideoOn
                    ? 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                    : 'bg-teal-500/20 text-teal-400 border border-teal-500/30 hover:bg-teal-500/30'
                }`}
                title={isVideoOn ? 'إيقاف الكاميرا' : 'تشغيل الكاميرا'}
              >
                {isVideoOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </button>

              <button
                id="toggle-screenshare-quick-btn"
                onClick={() => setIsScreenSharing(!isScreenSharing)}
                className={`p-2 rounded-xl transition-all ${
                  isScreenSharing
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                }`}
                title="مشاركة شاشة المصحف أو المتن"
              >
                <MonitorUp className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Meeting Protocol & AI Status Card */}
          <div className={`rounded-3xl border p-4 space-y-3 shadow-md flex-1 flex flex-col justify-between ${
            isDark ? 'bg-slate-900/90 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-emerald-400 mb-2">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  ضوابط وتوثيق الجلسة
                </span>
                <span className="text-[11px] text-slate-400">{room.scheduledTime || 'مباشر'}</span>
              </div>
              <ul className="text-xs space-y-1.5 text-slate-300 leading-relaxed">
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <span>الاجتماع موثق ويسجل التكليفات والمهام بالذكاء الاصطناعي تلقائياً.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
                  <span>تُمنح نقاط بركة عند إنجاز الواجبات وتدوين فوائد التدبر.</span>
                </li>
              </ul>
            </div>

            {/* Quick WhatsApp Invite Banner */}
            <div className="p-2.5 rounded-2xl bg-emerald-950/40 border border-emerald-700/30 flex items-center justify-between gap-2">
              <div className="text-[11px] text-emerald-200">
                <strong>دعوة أفراد العائلة أو الأصدقاء:</strong>
                <p className="text-[10px] text-emerald-300/80">إرسال رابط الجلسة المباشرة عبر الواتساب</p>
              </div>
              <button
                onClick={onOpenWhatsAppInvite}
                className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold shrink-0 transition-colors"
              >
                واتساب
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
