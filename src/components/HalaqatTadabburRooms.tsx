import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Users,
  Radio,
  Mic,
  MicOff,
  BookOpen,
  Volume2,
  VolumeX,
  Play,
  Pause,
  HelpCircle,
  MessageSquare,
  Plus,
  CheckCircle2,
  ShieldCheck,
  HeartHandshake,
  Lock,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Send,
  Headphones,
  Clock,
  RefreshCw,
  X,
  Search,
  Check,
  Award,
  ThumbsUp,
  Copy,
  FileText,
  Bookmark,
  CheckCheck,
  Tag,
  Share2,
  Calendar,
  Video,
  ListTodo,
} from 'lucide-react';
import {
  ALL_SURAHS,
  RECITERS_LIST,
  getFullSurahAudioUrl,
  ReciterInfo,
  SurahMeta,
} from '../data/quranSurahs';
import { HalaqatAudioVideoStage } from './halaqat/HalaqatAudioVideoStage';
import { MeetingAnalysisPanel } from './halaqat/MeetingAnalysisPanel';
import { HalaqatScheduleCalendar } from './halaqat/HalaqatScheduleCalendar';
import { AIStudyAdvisorPanel } from './halaqat/AIStudyAdvisorPanel';
import { WhatsAppInviteModal } from './halaqat/WhatsAppInviteModal';
import { HalqaRoomData, HalqaSchedule, HalqaTask, MeetingAnalysis } from '../types';

export interface TadabburNote {
  id: string;
  authorId: string;
  authorName: string;
  authorGender?: 'male' | 'female';
  surahId: number;
  surahName: string;
  ayahNumber?: string;
  benefitText: string;
  categoryTag?: 'iman' | 'language' | 'action' | 'tazkiyah' | 'general';
  categoryTagLabel?: string;
  likesCount: number;
  likedBy: string[];
  createdAt: string;
  timestamp: string;
}

export interface HalqaRoom {
  id: string;
  title: string;
  description: string;
  category: 'tadabbur' | 'hifz' | 'tajweed' | 'fatwa_qa';
  categoryLabel: string;
  sheikhHost: {
    id: string;
    name: string;
    title: string;
    isVerified: boolean;
    gender: 'male' | 'female';
  };
  targetAudience: 'all' | 'men_only' | 'women_only';
  surahId: number;
  surahName: string;
  ayahStart: number;
  ayahEnd: number;
  isLive: boolean;
  participantsCount: number;
  maxParticipants: number;
  hasVideo?: boolean;
  meetingMode?: 'audio_video' | 'audio_only';
  scheduledTime?: string;
  activeSpeaker: {
    name: string;
    role: string;
    isSpeaking: boolean;
  };
  reciterId?: string;
  queue: Array<{
    id: string;
    userId: string;
    userName: string;
    type: 'recite' | 'question';
    questionText?: string;
    joinedAt: string;
  }>;
  questions: Array<{
    id: string;
    askerId: string;
    askerName: string;
    question: string;
    status: 'answered' | 'pending';
    answer?: string;
    answeredBy?: string;
    timestamp: string;
  }>;
  chatMessages: Array<{
    id: string;
    senderId: string;
    senderName: string;
    role: 'sheikh' | 'moderator' | 'student';
    message: string;
    timestamp: string;
  }>;
  tadabburNotes?: TadabburNote[];
  tasks?: HalqaTask[];
  meetingAnalysis?: MeetingAnalysis;
  invitedPhones?: string[];
  createdAt: string;
}

interface HalaqatTadabburRoomsProps {
  currentUser?: any;
  wallet?: any;
  userGender?: 'male' | 'female';
  theme?: 'dark' | 'light';
  selectedReciterId?: string;
  onRewardPoints?: (points: number, message: string) => void;
  onPlayContinuousSurah?: (surahId: number, reciterId?: string) => void;
  onSelectSurahInMushaf?: (surahId: number) => void;
  onNavigateToQuran?: (surah: number, ayah: number) => void;
  displayMode?: 'full' | 'compact_widget';
  onOpenFullView?: () => void;
  initialRoomId?: string | null;
  initialRole?: 'listener' | 'student_reciter' | 'questioner';
}

export function HalaqatTadabburRooms({
  currentUser,
  wallet,
  userGender,
  theme = 'dark',
  selectedReciterId = 'husary_murattal',
  onRewardPoints,
  onPlayContinuousSurah,
  onSelectSurahInMushaf,
  onNavigateToQuran,
  displayMode = 'full',
  onOpenFullView,
  initialRoomId,
  initialRole = 'listener',
}: HalaqatTadabburRoomsProps) {
  const isDark = theme === 'dark';

  // State
  const [rooms, setRooms] = useState<HalqaRoom[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(initialRoomId || null);

  // Top-level Navigation: Live Rooms Directory, Schedule Calendar, or AI Study Advisor
  const [mainNavTab, setMainNavTab] = useState<'rooms_lobby' | 'schedules_calendar' | 'ai_study_advisor'>('rooms_lobby');
  const [whatsAppModalRoom, setWhatsAppModalRoom] = useState<HalqaRoom | null>(null);

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState<'all' | 'hifz' | 'tadabbur' | 'fatwa_qa'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [audienceFilter, setAudienceFilter] = useState<'all' | 'men_only' | 'women_only'>('all');

  // Room interaction
  const [userRoleInRoom, setUserRoleInRoom] = useState<'listener' | 'student_reciter' | 'questioner'>('listener');
  const [roomSubTab, setRoomSubTab] = useState<'audio_stage' | 'meeting_analysis' | 'tadabbur_notes' | 'questions' | 'queue' | 'chat'>('audio_stage');
  const [isMicMuted, setIsMicMuted] = useState<boolean>(true);
  const [isHandRaised, setIsHandRaised] = useState<boolean>(false);
  const [newQuestionText, setNewQuestionText] = useState<string>('');
  const [newChatMessage, setNewChatMessage] = useState<string>('');
  const [selectedRoomReciterId, setSelectedRoomReciterId] = useState<string>(selectedReciterId);

  // Tadabbur Notes (ملاحظات وفوائد التدبر) state
  const [newNoteAyah, setNewNoteAyah] = useState<string>('');
  const [newNoteText, setNewNoteText] = useState<string>('');
  const [newNoteCategory, setNewNoteCategory] = useState<'iman' | 'language' | 'action' | 'tazkiyah' | 'general'>('iman');
  const [isSubmittingNote, setIsSubmittingNote] = useState<boolean>(false);
  const [copiedNoteId, setCopiedNoteId] = useState<string | null>(null);
  const [selectedNoteFilter, setSelectedNoteFilter] = useState<'all' | 'iman' | 'language' | 'action' | 'tazkiyah' | 'general'>('all');
  const [showAddNoteForm, setShowAddNoteForm] = useState<boolean>(false);

  // Share & Invite Modal State
  const [shareModalRoom, setShareModalRoom] = useState<HalqaRoom | null>(null);
  const [isLinkCopied, setIsLinkCopied] = useState<boolean>(false);

  // Embedded continuous surah player state inside room
  const [isRoomAudioPlaying, setIsRoomAudioPlaying] = useState<boolean>(false);
  const [roomAudioCurrentTime, setRoomAudioCurrentTime] = useState<number>(0);
  const [roomAudioDuration, setRoomAudioDuration] = useState<number>(0);
  const roomAudioRef = useRef<HTMLAudioElement | null>(null);

  // Create Room Modal
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [createTitle, setCreateTitle] = useState<string>('');
  const [createDesc, setCreateDesc] = useState<string>('');
  const [createCategory, setCreateCategory] = useState<'tadabbur' | 'hifz' | 'tajweed' | 'fatwa_qa'>('tadabbur');
  const [createAudience, setCreateAudience] = useState<'all' | 'men_only' | 'women_only'>('all');
  const [createSurahId, setCreateSurahId] = useState<number>(18); // Default Al-Kahf
  const [createAyahStart, setCreateAyahStart] = useState<number>(1);
  const [createAyahEnd, setCreateAyahEnd] = useState<number>(10);
  const [createMeetingMode, setCreateMeetingMode] = useState<'audio_video' | 'audio_only'>('audio_video');
  const [createScheduledTime, setCreateScheduledTime] = useState<string>('مباشر الآن');
  const [createInvitedPhones, setCreateInvitedPhones] = useState<string>('');
  const [isSubmittingRoom, setIsSubmittingRoom] = useState<boolean>(false);

  // Initial rooms fetch
  const fetchRooms = async () => {
    try {
      const res = await fetch('/api/v1/halaqat');
      const data = await res.json();
      if (data.success && data.rooms) {
        setRooms(data.rooms);
      }
    } catch (err) {
      console.warn('Could not fetch halaqat rooms from server:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
    const timer = setInterval(fetchRooms, 15000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (initialRoomId) {
      setActiveRoomId(initialRoomId);
      if (initialRole) {
        setUserRoleInRoom(initialRole);
        setIsHandRaised(initialRole === 'student_reciter');
        setRoomSubTab(initialRole === 'questioner' ? 'questions' : initialRole === 'student_reciter' ? 'queue' : 'audio_stage');
      }
    }
  }, [initialRoomId, initialRole]);

  const activeRoom = useMemo(() => rooms.find((r) => r.id === activeRoomId), [rooms, activeRoomId]);

  // Audio URL for active room's surah
  const activeRoomReciter = useMemo(() => {
    return RECITERS_LIST.find((r) => r.id === selectedRoomReciterId) || RECITERS_LIST[0];
  }, [selectedRoomReciterId]);

  const activeRoomSurahAudioUrl = useMemo(() => {
    if (!activeRoom) return '';
    return getFullSurahAudioUrl(activeRoomReciter.fullSurahServerUrl, activeRoom.surahId);
  }, [activeRoom, activeRoomReciter]);

  // Handle Room Join with specified purpose
  const handleJoinRoom = (room: HalqaRoom, role: 'listener' | 'student_reciter' | 'questioner') => {
    setActiveRoomId(room.id);
    setUserRoleInRoom(role);
    setIsHandRaised(role === 'student_reciter');
    setIsMicMuted(true);
    setRoomSubTab(
      role === 'questioner'
        ? 'questions'
        : role === 'student_reciter'
        ? 'queue'
        : room.category === 'tadabbur'
        ? 'tadabbur_notes'
        : 'audio_stage'
    );
    
    // Automatically trigger continuous recitation if user enters as listener and audio is requested
    if (role === 'listener' && onPlayContinuousSurah) {
      onPlayContinuousSurah(room.surahId, selectedRoomReciterId);
    }
  };

  const handleLeaveRoom = () => {
    if (roomAudioRef.current) {
      roomAudioRef.current.pause();
    }
    setIsRoomAudioPlaying(false);
    setActiveRoomId(null);
    setIsHandRaised(false);
  };

  // Toggle Continuous Audio for active room
  const toggleRoomAudioPlayback = () => {
    if (!roomAudioRef.current) return;
    if (isRoomAudioPlaying) {
      roomAudioRef.current.pause();
      setIsRoomAudioPlaying(false);
    } else {
      roomAudioRef.current
        .play()
        .then(() => setIsRoomAudioPlaying(true))
        .catch((e) => console.warn('Audio play error:', e));
    }
  };

  // Submit Sharia Question
  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRoomId || !newQuestionText.trim()) return;
    try {
      const res = await fetch(`/api/v1/halaqat/${activeRoomId}/ask-question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          askerId: currentUser?.id || 'guest',
          askerName: currentUser?.name || 'سائل كريم',
          question: newQuestionText.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNewQuestionText('');
        fetchRooms();
        if (onRewardPoints) {
          onRewardPoints(10, 'جزاك الله خيراً! تم إرسال سؤالك الشرعي لمجلس التدبر والفتوى.');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Submit Queue Request (Raise Hand for Hifz Recitation)
  const handleRaiseHandForRecitation = async () => {
    if (!activeRoomId) return;
    try {
      const res = await fetch(`/api/v1/halaqat/${activeRoomId}/raise-hand`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id || 'guest',
          userName: currentUser?.name || 'طالب حافظ',
          type: 'recite',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsHandRaised(true);
        fetchRooms();
        if (onRewardPoints) {
          onRewardPoints(15, 'بارك الله فيك! سجلت طلب التسميع والحفظ أمام الشيخ.');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Send Chat message
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRoomId || !newChatMessage.trim()) return;
    try {
      const res = await fetch(`/api/v1/halaqat/${activeRoomId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderId: currentUser?.id || 'user',
          senderName: currentUser?.name || 'مشارك',
          role: 'student',
          message: newChatMessage.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNewChatMessage('');
        fetchRooms();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Add Tadabbur Note / Benefit
  const handleAddTadabburNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRoomId || !newNoteText.trim()) return;
    setIsSubmittingNote(true);
    try {
      const res = await fetch(`/api/v1/halaqat/${activeRoomId}/tadabbur-notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorId: currentUser?.id || 'guest-user',
          authorName: currentUser?.name || (userGender === 'female' ? 'أخت متدبرة' : 'أخ متدبر'),
          authorGender: userGender || 'male',
          ayahNumber: newNoteAyah.trim() || undefined,
          benefitText: newNoteText.trim(),
          categoryTag: newNoteCategory,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNewNoteText('');
        setNewNoteAyah('');
        setShowAddNoteForm(false);
        fetchRooms();
        if (onRewardPoints) {
          onRewardPoints(10, 'جزاك الله خيراً ونفع بما سطرت! أضيفت 10 نقاط لمحفظتك نظير تدوين ومشاركة فائدة التدبر.');
        }
      }
    } catch (err) {
      console.error('Error adding tadabbur note:', err);
    } finally {
      setIsSubmittingNote(false);
    }
  };

  // Like / Appreciate Tadabbur Note
  const handleLikeNote = async (noteId: string) => {
    if (!activeRoomId) return;
    try {
      const res = await fetch(`/api/v1/halaqat/${activeRoomId}/tadabbur-notes/${noteId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id || 'guest-user',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRooms((prev) =>
          prev.map((r) => {
            if (r.id !== activeRoomId) return r;
            const updatedNotes = (r.tadabburNotes || []).map((n) => {
              if (n.id !== noteId) return n;
              return {
                ...n,
                likesCount: data.likesCount,
                likedBy: data.liked
                  ? [...(n.likedBy || []), currentUser?.id || 'guest-user']
                  : (n.likedBy || []).filter((id) => id !== (currentUser?.id || 'guest-user')),
              };
            });
            return { ...r, tadabburNotes: updatedNotes };
          })
        );
      }
    } catch (err) {
      console.error('Error liking tadabbur note:', err);
    }
  };

  // Copy Tadabbur Note Text
  const handleCopyNote = (text: string, noteId: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedNoteId(noteId);
      setTimeout(() => setCopiedNoteId(null), 2500);
    }
  };

  // Create room handler
  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createTitle.trim()) return;
    setIsSubmittingRoom(true);
    try {
      const phones = createInvitedPhones
        .split(/[,;\n]/)
        .map((p) => p.trim())
        .filter(Boolean);

      const res = await fetch('/api/v1/halaqat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: createTitle.trim(),
          description: createDesc.trim(),
          category: createCategory,
          sheikhHostName: currentUser?.name || 'فضيلة الشيخ المقرئ',
          sheikhTitle: 'معلم قرآن وتجويد معتمد',
          targetAudience: createAudience,
          surahId: createSurahId,
          ayahStart: createAyahStart,
          ayahEnd: createAyahEnd,
          hasVideo: createMeetingMode === 'audio_video',
          meetingMode: createMeetingMode,
          scheduledTime: createScheduledTime,
          invitedPhones: phones,
        }),
      });
      const data = await res.json();
      if (data.success && data.room) {
        setShowCreateModal(false);
        setCreateTitle('');
        setCreateDesc('');
        setCreateInvitedPhones('');
        fetchRooms();
        setActiveRoomId(data.room.id);
        if (phones.length > 0) {
          setWhatsAppModalRoom(data.room);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingRoom(false);
    }
  };

  // Filtered rooms
  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      if (activeTab !== 'all' && r.category !== activeTab) return false;
      if (audienceFilter !== 'all' && r.targetAudience !== audienceFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = r.title.toLowerCase().includes(q);
        const matchSheikh = r.sheikhHost.name.toLowerCase().includes(q);
        const matchSurah = r.surahName.toLowerCase().includes(q);
        if (!matchTitle && !matchSheikh && !matchSurah) return false;
      }
      return true;
    });
  }, [rooms, activeTab, audienceFilter, searchQuery]);

  // Format audio seconds
  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs)) return '00:00';
    const mins = Math.floor(secs / 60);
    const remainder = Math.floor(secs % 60);
    return `${mins}:${remainder.toString().padStart(2, '0')}`;
  };

  // =========================================================================
  // COMPACT WIDGET DISPLAY (للدمج السريع داخل الواجهة الرئيسية للمصحف)
  // =========================================================================
  if (displayMode === 'compact_widget' && !activeRoom) {
    return (
      <div className={`rounded-2xl p-4 sm:p-5 border shadow-xl space-y-3.5 text-right transition-colors ${
        isDark
          ? 'bg-gradient-to-br from-[#0b212c] via-[#0b212c] to-[#081f2b] border-cyan-800/40 text-stone-100'
          : 'bg-white border-[#cde2ec] shadow-sm text-[#0a2737]'
      }`}>
        <div className={`flex flex-wrap items-center justify-between gap-2 border-b pb-3 ${
          isDark ? 'border-stone-800' : 'border-[#cde2ec]'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow ${
              isDark ? 'bg-cyan-600/30 border border-cyan-500/40 text-cyan-300' : 'bg-[#e0f2fe] border border-[#7dd3fc] text-[#0369a1]'
            }`}>
              <Radio className="w-5 h-5 text-red-500 animate-pulse" />
            </div>
            <div>
              <h3 className={`font-bold text-sm flex items-center gap-2 font-quran ${
                isDark ? 'text-stone-100' : 'text-[#0a2737]'
              }`}>
                <span>حلقات الحفظ والتدبر (غرف قرآنية حية)</span>
                <span className="text-[10px] bg-red-500/10 text-red-500 border border-red-500/30 px-2 py-0.5 rounded-full font-bold animate-pulse">
                  مباشر الآن ({rooms.length} غرف)
                </span>
              </h3>
              <p className={`text-[11px] ${isDark ? 'text-stone-400' : 'text-[#335568]'}`}>
                انضم لمجالس التسميع والاستماع والتدارس مع إمكانية التلاوة المستمرة لكامل السورة
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenFullView && (
              <button
                onClick={onOpenFullView}
                className="text-xs text-cyan-600 hover:text-cyan-500 font-bold hover:underline flex items-center gap-1"
              >
                <span>عرض صالة الحلقات بالكامل</span>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-3 py-1.5 rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white font-bold text-xs flex items-center gap-1 shadow"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إنشاء غرفة</span>
            </button>
          </div>
        </div>

        {/* 3 Quick Live Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {rooms.slice(0, 3).map((room) => (
            <div
              key={room.id}
              className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-2.5 group ${
                isDark
                  ? 'bg-stone-950/80 border-stone-800 hover:border-cyan-700/60'
                  : 'bg-[#f4f8fa] border-[#cde2ec] hover:border-cyan-500 shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 text-[10px] mb-1.5">
                  <span className={`px-2 py-0.5 rounded font-bold border ${
                    isDark ? 'bg-cyan-950 text-cyan-300 border-cyan-800/40' : 'bg-[#e0f2fe] text-[#0369a1] border-[#7dd3fc]'
                  }`}>
                    {room.categoryLabel}
                  </span>
                  <span className={`flex items-center gap-1 ${isDark ? 'text-stone-400' : 'text-[#335568]'}`}>
                    <Users className="w-3 h-3" />
                    <span>{room.participantsCount} مشارك</span>
                  </span>
                </div>

                <h4 className="font-bold text-xs text-stone-100 group-hover:text-emerald-300 transition-colors line-clamp-1">
                  {room.title}
                </h4>

                <div className="flex items-center gap-1 text-[11px] text-amber-400/90 mt-1">
                  <BookOpen className="w-3 h-3" />
                  <span>سورة {room.surahName} ({room.ayahStart} - {room.ayahEnd})</span>
                </div>

                <p className="text-[10px] text-stone-400 mt-1 line-clamp-1">
                  المشرف: {room.sheikhHost.name}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-stone-800/60 text-xs">
                <button
                  onClick={() => handleJoinRoom(room, 'listener')}
                  className="py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-amber-300 border border-stone-800 hover:border-amber-600/40 font-bold flex items-center justify-center gap-1 text-[11px] transition-all"
                  title="استماع لتلاوة السورة كاملة بدون توقف"
                >
                  <Volume2 className="w-3 h-3 text-amber-400" />
                  <span>تلاوة مستمرة</span>
                </button>

                <button
                  onClick={() => handleJoinRoom(room, 'student_reciter')}
                  className="py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold flex items-center justify-center gap-1 text-[11px] transition-all shadow"
                >
                  <span>دخول الغرفة</span>
                  <ChevronLeft className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div id="halaqat-tadabbur-component" className="space-y-4 animate-in fade-in duration-200 text-right">
      
      {/* Hidden Audio Player for Active Room Continuous Recitation */}
      {activeRoom && (
        <audio
          ref={roomAudioRef}
          src={activeRoomSurahAudioUrl}
          onTimeUpdate={() => {
            if (roomAudioRef.current) {
              setRoomAudioCurrentTime(roomAudioRef.current.currentTime);
              setRoomAudioDuration(roomAudioRef.current.duration || 0);
            }
          }}
          onEnded={() => setIsRoomAudioPlaying(false)}
        />
      )}

      {/* ========================================================================= */}
      {/* VIEW A: ROOMS DIRECTORY / LOBBY, SCHEDULES, OR AI STUDY ADVISOR           */}
      {/* ========================================================================= */}
      {!activeRoom ? (
        <div className="space-y-4">
          
          {/* Main Halaqat Navigation Bar */}
          <div className={`p-2 rounded-2xl border flex flex-wrap items-center gap-2 transition-colors ${
            isDark ? 'bg-stone-900/90 border-stone-800' : 'bg-white border-[#cde2ec] shadow-sm'
          }`}>
            <button
              id="halaqat-nav-rooms-btn"
              onClick={() => setMainNavTab('rooms_lobby')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
                mainNavTab === 'rooms_lobby'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md'
                  : isDark
                  ? 'text-stone-300 hover:text-white hover:bg-stone-800'
                  : 'text-[#335568] hover:text-[#0a2737] hover:bg-[#f4f8fa]'
              }`}
            >
              <Radio className="w-4 h-4 text-emerald-300" />
              <span>مجالس وحلقات القرآن المباشرة</span>
              <span className="px-1.5 py-0.5 rounded-full bg-black/30 text-emerald-200 text-[10px]">
                {rooms.length}
              </span>
            </button>

            <button
              id="halaqat-nav-schedules-btn"
              onClick={() => setMainNavTab('schedules_calendar')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
                mainNavTab === 'schedules_calendar'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md'
                  : isDark
                  ? 'text-stone-300 hover:text-white hover:bg-stone-800'
                  : 'text-[#335568] hover:text-[#0a2737] hover:bg-[#f4f8fa]'
              }`}
            >
              <Calendar className="w-4 h-4 text-amber-400" />
              <span>تقويم وجداول التدارس والحفظ مع التنبيهات</span>
            </button>

            <button
              id="halaqat-nav-ai-advisor-btn"
              onClick={() => setMainNavTab('ai_study_advisor')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all ${
                mainNavTab === 'ai_study_advisor'
                  ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-stone-950 font-extrabold shadow-md'
                  : isDark
                  ? 'text-stone-300 hover:text-white hover:bg-stone-800'
                  : 'text-[#335568] hover:text-[#0a2737] hover:bg-[#f4f8fa]'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>مساعد الذكاء الاصطناعي لترتيب الأولويات وطرق التدارس</span>
            </button>
          </div>

          {mainNavTab === 'schedules_calendar' ? (
            <HalaqatScheduleCalendar
              onJoinRoomById={(roomId) => {
                setActiveRoomId(roomId);
                setMainNavTab('rooms_lobby');
              }}
              onRewardPoints={onRewardPoints}
              isDark={isDark}
            />
          ) : mainNavTab === 'ai_study_advisor' ? (
            <AIStudyAdvisorPanel
              onOpenSchedule={() => setMainNavTab('schedules_calendar')}
              onRewardPoints={onRewardPoints}
              isDark={isDark}
            />
          ) : (
            <>
              {/* Header Banner */}
              <div className={`rounded-2xl p-5 border shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-colors ${
                isDark
                  ? 'bg-gradient-to-r from-[#0b212c] via-[#0b212c] to-[#081f2b] border-cyan-800/40 text-stone-100'
                  : 'bg-white border-[#cde2ec] shadow-sm text-[#0a2737]'
              }`}>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-cyan-500 font-bold text-xs">
                <Radio className="w-4 h-4 text-red-500 animate-pulse" />
                <span>مجالس القرآن المباشرة • حلقات الحفظ والتدبر وتصحيح التلاوة</span>
              </div>
              <h2 className={`text-xl sm:text-2xl font-bold font-quran ${
                isDark ? 'text-stone-100' : 'text-[#0a2737]'
              }`}>
                حلقات الحفظ والتدبر والأسئلة الشرعية (غرف تفاعلية)
              </h2>
              <p className={`text-xs max-w-2xl leading-relaxed ${
                isDark ? 'text-stone-400' : 'text-[#335568]'
              }`}>
                انضم لغرف الحفظ الجماعية للتسميع وضبط الأحكام أمام الشيوخ المعتمدين، أو شارك في مجالس التدبر وتلاوة السور كاملةً بصوت كبار القراء، أو اطرح أسئلتك الشرعية مباشرة.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>إنشاء حلقة جديدة</span>
              </button>
            </div>
          </div>

          {/* Filter Bar: Category Tabs & Search */}
          <div className={`p-3 rounded-2xl border shadow-md space-y-3 transition-colors ${
            isDark ? 'bg-stone-900 border-stone-800' : 'bg-white border-[#cde2ec]'
          }`}>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                    activeTab === 'all'
                      ? 'bg-cyan-700 text-white shadow'
                      : isDark
                      ? 'bg-stone-950 text-stone-400 hover:bg-stone-800 hover:text-stone-200 border border-stone-800'
                      : 'bg-[#f4f8fa] text-[#335568] hover:bg-[#e2edf2] hover:text-[#0a2737] border border-[#cde2ec]'
                  }`}
                >
                  جميع الغرف ({rooms.length})
                </button>

                <button
                  onClick={() => setActiveTab('hifz')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                    activeTab === 'hifz'
                      ? 'bg-cyan-700 text-white shadow'
                      : isDark
                      ? 'bg-stone-950 text-stone-400 hover:bg-stone-800 hover:text-stone-200 border border-stone-800'
                      : 'bg-[#f4f8fa] text-[#335568] hover:bg-[#e2edf2] hover:text-[#0a2737] border border-[#cde2ec]'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5 text-amber-400" />
                  <span>حلقات الحفظ والتسميع</span>
                </button>

                <button
                  onClick={() => setActiveTab('tadabbur')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                    activeTab === 'tadabbur'
                      ? 'bg-cyan-700 text-white shadow'
                      : isDark
                      ? 'bg-stone-950 text-stone-400 hover:bg-stone-800 hover:text-stone-200 border border-stone-800'
                      : 'bg-[#f4f8fa] text-[#335568] hover:bg-[#e2edf2] hover:text-[#0a2737] border border-[#cde2ec]'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                  <span>مجالس التدبر والتفسير</span>
                </button>

                <button
                  onClick={() => setActiveTab('fatwa_qa')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap flex items-center gap-1 ${
                    activeTab === 'fatwa_qa'
                      ? 'bg-cyan-700 text-white shadow'
                      : isDark
                      ? 'bg-stone-950 text-stone-400 hover:bg-stone-800 hover:text-stone-200 border border-stone-800'
                      : 'bg-[#f4f8fa] text-[#335568] hover:bg-[#e2edf2] hover:text-[#0a2737] border border-[#cde2ec]'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
                  <span>الأسئلة الشرعية والفتاوى</span>
                </button>
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-stone-400 absolute right-3 top-2.5" />
                <input
                  type="text"
                  placeholder="ابحث عن سورة أو شيخ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full border rounded-xl pr-9 pl-3 py-1.5 text-xs outline-none transition-colors ${
                    isDark
                      ? 'bg-stone-950 border-stone-800 text-stone-100 placeholder-stone-500 focus:border-cyan-500'
                      : 'bg-[#f4f8fa] border-[#cde2ec] text-[#0a2737] placeholder-[#64748b] focus:border-[#0891b2]'
                  }`}
                />
              </div>
            </div>

            {/* Audience filter bar */}
            <div className={`flex items-center gap-2 pt-1 text-xs border-t ${
              isDark ? 'text-stone-400 border-stone-800/80' : 'text-[#335568] border-[#cde2ec]'
            }`}>
              <span className="text-[11px]">تصنيف الحضور:</span>
              <button
                onClick={() => setAudienceFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                  audienceFilter === 'all'
                    ? isDark ? 'bg-stone-800 text-white' : 'bg-cyan-700 text-white'
                    : isDark ? 'hover:text-stone-200' : 'hover:text-[#0a2737]'
                }`}
              >
                الكل
              </button>
              <button
                onClick={() => setAudienceFilter('men_only')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                  audienceFilter === 'men_only'
                    ? 'bg-blue-950/80 text-blue-300 border border-blue-800/40'
                    : isDark ? 'hover:text-stone-200' : 'hover:text-[#0a2737]'
                }`}
              >
                مجالس الرجال
              </button>
              <button
                onClick={() => setAudienceFilter('women_only')}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                  audienceFilter === 'women_only'
                    ? 'bg-pink-950/80 text-pink-300 border border-pink-800/40'
                    : isDark ? 'hover:text-stone-200' : 'hover:text-[#0a2737]'
                }`}
              >
                مجالس الأخوات المصونة
              </button>
            </div>
          </div>

          {/* Rooms Grid */}
          {loading ? (
            <div className="p-12 text-center text-stone-400 text-xs flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
              <span>جاري تحميل الغرف والحلقات القرآنية الحية...</span>
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className={`rounded-2xl p-12 text-center text-xs border space-y-3 ${
              isDark ? 'bg-stone-900 border-stone-800 text-stone-400' : 'bg-white border-[#cde2ec] text-[#335568]'
            }`}>
              <Radio className="w-8 h-8 text-stone-400 mx-auto" />
              <p>لا توجد غرف تطابق شروط البحث الحالية.</p>
              <button
                onClick={() => {
                  setActiveTab('all');
                  setAudienceFilter('all');
                  setSearchQuery('');
                }}
                className="text-cyan-600 hover:underline font-bold"
              >
                إعادة ضبط الفلاتر وعرض جميع الغرف
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredRooms.map((room) => {
                return (
                  <div
                    key={room.id}
                    className={`rounded-2xl p-4 sm:p-5 border shadow-xl transition-all flex flex-col justify-between gap-3 group relative ${
                      isDark
                        ? 'bg-stone-900/90 border-stone-800/90 hover:border-cyan-600/70 text-stone-100'
                        : 'bg-white border-[#cde2ec] hover:border-cyan-500 shadow-md text-[#0a2737]'
                    }`}
                  >
                    <div className="space-y-2.5">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                          isDark ? 'bg-cyan-950 text-cyan-300 border-cyan-800/40' : 'bg-[#e0f2fe] text-[#0369a1] border-[#7dd3fc]'
                        }`}>
                          {room.categoryLabel}
                        </span>

                        <div className="flex items-center gap-2">
                          {room.isLive && (
                            <span className="flex items-center gap-1 text-red-500 font-bold bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/30 text-[10px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                              مباشر الآن
                            </span>
                          )}
                          <span className={`flex items-center gap-1 text-[11px] ${isDark ? 'text-stone-400' : 'text-[#335568]'}`}>
                            <Users className="w-3.5 h-3.5 text-stone-400" />
                            {room.participantsCount}
                          </span>
                        </div>
                      </div>

                      {/* Room Title */}
                      <h3 className={`font-bold text-base leading-snug group-hover:text-cyan-600 transition-colors ${
                        isDark ? 'text-stone-100' : 'text-[#0a2737]'
                      }`}>
                        {room.title}
                      </h3>

                      <p className={`text-xs line-clamp-2 leading-relaxed ${
                        isDark ? 'text-stone-400' : 'text-[#335568]'
                      }`}>
                        {room.description}
                      </p>

                      {/* Surah Info Bar */}
                      <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs ${
                        isDark ? 'bg-stone-950/80 border-stone-800 text-stone-200' : 'bg-[#f4f8fa] border-[#cde2ec] text-[#0a2737]'
                      }`}>
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-4 h-4 text-amber-500" />
                          <span className="font-bold">سورة {room.surahName}</span>
                          <span className={`text-[10px] ${isDark ? 'text-stone-400' : 'text-[#64748b]'}`}>({room.ayahStart} - {room.ayahEnd})</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {room.tadabburNotes && room.tadabburNotes.length > 0 && (
                            <span className="text-[10px] bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-md text-amber-600 font-bold flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                              <span>{room.tadabburNotes.length} فوائد</span>
                            </span>
                          )}
                          <span className={`text-[10px] px-2 py-0.5 rounded ${
                            isDark ? 'bg-stone-900 text-amber-300' : 'bg-white text-amber-800 border border-amber-200'
                          }`}>
                            طابور: {room.queue.length}
                          </span>
                        </div>
                      </div>

                      {/* Sheikh info */}
                      <div className="flex items-center justify-between pt-1 text-xs">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-full border flex items-center justify-center font-bold text-xs ${
                            isDark ? 'bg-cyan-950 border-cyan-700/50 text-cyan-400' : 'bg-[#e0f2fe] border-[#7dd3fc] text-[#0369a1]'
                          }`}>
                            {room.sheikhHost.name[0]}
                          </div>
                          <div>
                            <div className={`flex items-center gap-1 font-bold text-xs ${
                              isDark ? 'text-stone-200' : 'text-[#0a2737]'
                            }`}>
                              <span>{room.sheikhHost.name}</span>
                              {room.sheikhHost.isVerified && (
                                <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />
                              )}
                            </div>
                            <span className={`text-[10px] ${isDark ? 'text-stone-400' : 'text-[#64748b]'}`}>{room.sheikhHost.title}</span>
                          </div>
                        </div>

                        {room.targetAudience === 'women_only' ? (
                          <span className="px-2 py-0.5 rounded bg-pink-500/10 border border-pink-500/30 text-pink-600 text-[10px] font-bold flex items-center gap-1">
                            <Lock className="w-3 h-3" />
                            أخوات
                          </span>
                        ) : room.targetAudience === 'men_only' ? (
                          <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-600 text-[10px] font-bold">
                            رجال
                          </span>
                        ) : (
                          <span className={`px-2 py-0.5 rounded text-[10px] ${
                            isDark ? 'bg-stone-800 text-stone-400' : 'bg-[#e2edf2] text-[#335568]'
                          }`}>
                            عام
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Three Joining Action Buttons */}
                    <div className={`space-y-2 pt-3 border-t ${
                      isDark ? 'border-stone-800/70' : 'border-[#cde2ec]'
                    }`}>
                      {/* Option 1: Continuous Surah Recitation & Collective Listening */}
                      <button
                        onClick={() => handleJoinRoom(room, 'listener')}
                        className={`w-full py-2 px-3 rounded-xl border font-bold text-xs transition-all flex items-center justify-between group/recite ${
                          isDark
                            ? 'bg-gradient-to-r from-amber-600/20 via-amber-500/10 to-transparent hover:from-amber-600/30 border-amber-600/40 text-amber-300'
                            : 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-800 shadow-xs'
                        }`}
                        title={`استماع لتلاوة سورة ${room.surahName} كاملة بصوت القارئ المختار`}
                      >
                        <span className="flex items-center gap-1.5">
                          <Volume2 className="w-3.5 h-3.5 text-amber-500 group-hover/recite:scale-110 transition-transform" />
                          <span>تلاوة متواصلة للسورة كاملة</span>
                        </span>
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </button>

                      <div className="grid grid-cols-2 gap-2">
                        {/* Option 2: Join for Hifz & Recitation */}
                        <button
                          onClick={() => handleJoinRoom(room, 'student_reciter')}
                          className="py-2 px-2.5 rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white font-bold text-xs transition-all flex items-center justify-center gap-1 shadow"
                        >
                          <Mic className="w-3.5 h-3.5" />
                          <span>تسميع وحفظ</span>
                        </button>

                        {/* Option 3: Ask Sharia Question */}
                        <button
                          onClick={() => handleJoinRoom(room, 'questioner')}
                          className={`py-2 px-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1 border ${
                            isDark
                              ? 'bg-stone-800 hover:bg-stone-700 text-stone-200 border-stone-700'
                              : 'bg-[#f4f8fa] hover:bg-[#e2edf2] text-[#0a2737] border-[#cde2ec]'
                          }`}
                        >
                          <HelpCircle className="w-3.5 h-3.5 text-blue-500" />
                          <span>سؤال شرعي</span>
                        </button>
                      </div>

                      {/* Option 4: Share & Invite Link */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShareModalRoom(room);
                          setIsLinkCopied(false);
                        }}
                        className={`w-full py-1.5 px-3 rounded-xl text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 border ${
                          isDark
                            ? 'bg-stone-950/70 hover:bg-stone-800 text-stone-300 hover:text-amber-300 border-stone-800'
                            : 'bg-[#f4f8fa] hover:bg-[#e2edf2] text-[#0a2737] hover:text-cyan-700 border-[#cde2ec]'
                        }`}
                        title="مشاركة رابط الحلقة ودعوة الآخرين للتسجيل والانضمام"
                      >
                        <Share2 className="w-3 h-3 text-amber-400" />
                        <span>دعوة ومشاركة رابط الحلقة</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
            </>
          )}
        </div>
      ) : (

        /* ========================================================================= */
        /* VIEW B: INSIDE ACTIVE HALQA ROOM                                          */
        /* ========================================================================= */
        <div className="space-y-4 animate-in fade-in duration-200">
          
          {/* Top Bar inside Active Room */}
          <div className="bg-stone-900 rounded-2xl p-4 sm:p-5 border border-stone-800 shadow-xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={handleLeaveRoom}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold transition-colors"
              >
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                <span>مغادرة المجلس</span>
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <span className="text-red-400 font-bold text-xs">غرفة مباشرة</span>
                  <span className="text-stone-500">|</span>
                  <span className="text-xs text-amber-400 font-bold">{activeRoom.categoryLabel}</span>
                  <span className="text-stone-500">|</span>
                  <span className="text-xs text-stone-300">سورة {activeRoom.surahName} ({activeRoom.ayahStart} - {activeRoom.ayahEnd})</span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-stone-100 font-quran mt-0.5">
                  {activeRoom.title}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-300 bg-stone-950 px-3 py-1.5 rounded-xl border border-stone-800 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>{activeRoom.participantsCount} مستمع وحاضر</span>
              </span>

              {onSelectSurahInMushaf && (
                <button
                  onClick={() => onSelectSurahInMushaf(activeRoom.surahId)}
                  className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition-colors flex items-center gap-1 border border-stone-700"
                >
                  <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                  <span>فتح المصحف</span>
                </button>
              )}

              <button
                onClick={() => {
                  setShareModalRoom(activeRoom);
                  setIsLinkCopied(false);
                }}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
                  isDark
                    ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40'
                    : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300'
                }`}
                title="مشاركة رابط الحلقة ودعوة الآخرين للتسجيل والانضمام"
              >
                <Share2 className="w-3.5 h-3.5 text-amber-500" />
                <span>دعوة ومشاركة</span>
              </button>

              <button
                onClick={() => setWhatsAppModalRoom(activeRoom as any)}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow"
                title="إرسال دعوة للأعضاء المطلوب انضمامهم عبر الواتساب"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>دعوة واتساب</span>
              </button>
            </div>
          </div>

          {/* Active Room Subtabs Navigation */}
          <div className={`p-2 rounded-2xl border flex flex-wrap items-center gap-2 transition-colors ${
            isDark ? 'bg-stone-900/90 border-stone-800' : 'bg-white border-[#cde2ec] shadow-sm'
          }`}>
            <button
              onClick={() => setRoomSubTab('audio_stage')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                roomSubTab === 'audio_stage'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow'
                  : isDark
                  ? 'text-stone-300 hover:bg-stone-800'
                  : 'text-[#335568] hover:bg-[#f4f8fa]'
              }`}
            >
              <Video className="w-4 h-4 text-emerald-300" />
              <span>الاجتماع المسموع والمرئي</span>
            </button>

            <button
              onClick={() => setRoomSubTab('meeting_analysis')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                roomSubTab === 'meeting_analysis'
                  ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-stone-950 font-extrabold shadow'
                  : isDark
                  ? 'text-amber-300 hover:bg-stone-800'
                  : 'text-amber-700 hover:bg-amber-50'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>تحليل الاجتماع بالذكاء الاصطناعي والتكليفات</span>
              {activeRoom.tasks && activeRoom.tasks.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-950 text-amber-300 text-[10px]">
                  {activeRoom.tasks.length} مهام
                </span>
              )}
            </button>

            <button
              onClick={() => setRoomSubTab('tadabbur_notes')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                roomSubTab === 'tadabbur_notes'
                  ? 'bg-stone-800 text-amber-300 border border-amber-500/40 shadow'
                  : isDark
                  ? 'text-stone-400 hover:bg-stone-800/50'
                  : 'text-[#335568] hover:bg-[#f4f8fa]'
              }`}
            >
              <BookOpen className="w-4 h-4 text-emerald-400" />
              <span>ملاحظات التدبر ({activeRoom.tadabburNotes?.length || 0})</span>
            </button>

            <button
              onClick={() => setRoomSubTab('questions')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                roomSubTab === 'questions'
                  ? 'bg-stone-800 text-cyan-300 border border-cyan-500/40 shadow'
                  : isDark
                  ? 'text-stone-400 hover:bg-stone-800/50'
                  : 'text-[#335568] hover:bg-[#f4f8fa]'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-blue-400" />
              <span>الأسئلة والفتاوى ({activeRoom.questions?.length || 0})</span>
            </button>

            <button
              onClick={() => setRoomSubTab('queue')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                roomSubTab === 'queue'
                  ? 'bg-stone-800 text-emerald-300 border border-emerald-500/40 shadow'
                  : isDark
                  ? 'text-stone-400 hover:bg-stone-800/50'
                  : 'text-[#335568] hover:bg-[#f4f8fa]'
              }`}
            >
              <Users className="w-4 h-4 text-amber-400" />
              <span>طابور التسميع ({activeRoom.queue?.length || 0})</span>
            </button>

            <button
              onClick={() => setRoomSubTab('chat')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                roomSubTab === 'chat'
                  ? 'bg-stone-800 text-stone-200 border border-stone-700 shadow'
                  : isDark
                  ? 'text-stone-400 hover:bg-stone-800/50'
                  : 'text-[#335568] hover:bg-[#f4f8fa]'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>المحادثة المباشرة</span>
            </button>
          </div>

          {roomSubTab === 'meeting_analysis' ? (
            <MeetingAnalysisPanel
              room={activeRoom as any}
              currentUser={currentUser}
              isDark={isDark}
              onRefreshRoom={fetchRooms}
              onRewardPoints={onRewardPoints}
              onOpenSchedule={() => {
                handleLeaveRoom();
                setMainNavTab('schedules_calendar');
              }}
            />
          ) : (
            /* Main 2-Column Grid */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Left/Main Column: Audio Broadcast & Continuous Recitation Engine (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              
              {/* Dedicated Continuous Full Surah Player Card inside Room */}
              <div className="bg-gradient-to-r from-stone-900 via-stone-900 to-emerald-950/40 rounded-2xl p-4 sm:p-5 border border-emerald-800/40 shadow-xl space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600 to-emerald-600 flex items-center justify-center text-white shadow-lg">
                      <Volume2 className={`w-5 h-5 ${isRoomAudioPlaying ? 'animate-pulse' : ''}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-stone-100 font-quran">
                          التلاوة المستمرة لكامل سورة {activeRoom.surahName}
                        </span>
                        <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800/40 px-2 py-0.5 rounded-full font-bold">
                          بث الغرفة
                        </span>
                      </div>
                      <p className="text-xs text-amber-300/90 mt-0.5">
                        القارئ: {activeRoomReciter.name} ({activeRoomReciter.subName})
                      </p>
                    </div>
                  </div>

                  {/* Reciter selector for room audio */}
                  <div className="flex items-center gap-1.5 bg-stone-950 px-2.5 py-1 rounded-xl border border-stone-800 text-xs">
                    <span className="text-stone-400 text-[11px]">تبديل القارئ:</span>
                    <select
                      value={selectedRoomReciterId}
                      onChange={(e) => {
                        setSelectedRoomReciterId(e.target.value);
                        if (isRoomAudioPlaying && roomAudioRef.current) {
                          setTimeout(() => {
                            roomAudioRef.current?.play().catch((err) => console.warn(err));
                          }, 100);
                        }
                      }}
                      className="bg-transparent text-amber-300 font-bold outline-none cursor-pointer text-xs"
                    >
                      {RECITERS_LIST.map((r) => (
                        <option key={r.id} value={r.id} className="bg-stone-900 text-stone-200">
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Progress Bar & Audio Player Controls */}
                <div className="bg-stone-950 p-3 rounded-xl border border-stone-800/80 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-stone-400 font-mono">
                    <span>{formatTime(roomAudioCurrentTime)}</span>
                    <span className="text-stone-300">سورة {activeRoom.surahName} كاملة بدون توقف</span>
                    <span>{formatTime(roomAudioDuration)}</span>
                  </div>

                  {/* Scrub bar */}
                  <input
                    type="range"
                    min={0}
                    max={roomAudioDuration || 100}
                    value={roomAudioCurrentTime}
                    onChange={(e) => {
                      const newTime = Number(e.target.value);
                      setRoomAudioCurrentTime(newTime);
                      if (roomAudioRef.current) {
                        roomAudioRef.current.currentTime = newTime;
                      }
                    }}
                    className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />

                  {/* Controls */}
                  <div className="flex items-center justify-between pt-1">
                    <button
                      onClick={toggleRoomAudioPlayback}
                      className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs transition-all shadow"
                    >
                      {isRoomAudioPlaying ? (
                        <>
                          <Pause className="w-4 h-4 fill-current" />
                          <span>إيقاف مؤقت</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-current" />
                          <span>تشغيل التلاوة المستمرة الآن</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-2 text-xs">
                      {onPlayContinuousSurah && (
                        <button
                          onClick={() => onPlayContinuousSurah(activeRoom.surahId, selectedRoomReciterId)}
                          className="text-stone-300 hover:text-amber-300 font-bold flex items-center gap-1 text-[11px]"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                          <span>نقل البث للمشغل العائم العام</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modern Audio & Video Meeting Stage */}
              <HalaqatAudioVideoStage
                room={activeRoom as any}
                currentUser={currentUser}
                userRole={userRoleInRoom}
                isMicMuted={isMicMuted}
                setIsMicMuted={setIsMicMuted}
                isDark={isDark}
                onOpenAnalysis={() => setRoomSubTab('meeting_analysis')}
                onOpenTasks={() => setRoomSubTab('meeting_analysis')}
                onOpenWhatsAppInvite={() => setWhatsAppModalRoom(activeRoom as any)}
                onOpenSchedule={() => {
                  handleLeaveRoom();
                  setMainNavTab('schedules_calendar');
                }}
                onRewardPoints={onRewardPoints}
              />

              {/* Quick Tadabbur Banner in Left Column */}
              <div className="bg-gradient-to-r from-amber-950/40 via-stone-900 to-stone-900 rounded-2xl p-4 border border-amber-800/40 flex items-center justify-between gap-3 shadow">
                <div className="flex items-center gap-3 text-xs">
                  <div className="w-9 h-9 rounded-xl bg-amber-900/60 border border-amber-700/50 flex items-center justify-center text-amber-300 shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-amber-200 block text-xs sm:text-sm">
                      مدونة فوائد ولطائف التدبر — سورة {activeRoom.surahName}
                    </span>
                    <span className="text-[11px] text-stone-400">
                      {activeRoom.tadabburNotes && activeRoom.tadabburNotes.length > 0
                        ? `${activeRoom.tadabburNotes.length} فائدة ولطيفة تدبر مدونة من المشايخ والطلاب الحاضرين`
                        : 'لم تُدوّن فوائد بعد — شارك بما فتح الله عليك من تدبر الآيات واحصل على نقاط'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setRoomSubTab('tadabbur_notes');
                    setShowAddNoteForm(true);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs transition-all shrink-0 flex items-center gap-1.5 shadow"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>تدوين فائدة</span>
                </button>
              </div>
            </div>

            {/* Right Column: Interactive Room Tabs (Tadabbur Notes, Questions, Queue, Chat, Attendance) (4 cols) */}
            <div className="lg:col-span-4 bg-stone-900 rounded-2xl p-4 border border-stone-800 shadow-xl flex flex-col h-[580px]">
              
              {/* Tab Navigation */}
              <div className="flex items-center gap-1 border-b border-stone-800 pb-2.5 text-xs overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setRoomSubTab('tadabbur_notes')}
                  className={`px-2.5 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-1 shrink-0 ${
                    roomSubTab === 'tadabbur_notes'
                      ? 'bg-amber-600 text-stone-950 shadow-md font-extrabold'
                      : 'text-amber-300 hover:text-amber-100 hover:bg-stone-800/60'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>ملاحظات التدبر ({activeRoom.tadabburNotes?.length || 0})</span>
                </button>

                <button
                  onClick={() => setRoomSubTab('questions')}
                  className={`px-2.5 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap flex items-center gap-1 shrink-0 ${
                    roomSubTab === 'questions'
                      ? 'bg-emerald-800 text-white shadow'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
                  <span>الأسئلة ({activeRoom.questions.length})</span>
                </button>

                <button
                  onClick={() => setRoomSubTab('queue')}
                  className={`px-2.5 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap flex items-center gap-1 shrink-0 ${
                    roomSubTab === 'queue'
                      ? 'bg-emerald-800 text-white shadow'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 text-amber-400" />
                  <span>التسميع ({activeRoom.queue.length})</span>
                </button>

                <button
                  onClick={() => setRoomSubTab('chat')}
                  className={`px-2.5 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap flex items-center gap-1 shrink-0 ${
                    roomSubTab === 'chat'
                      ? 'bg-emerald-800 text-white shadow'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  <span>المحادثة</span>
                </button>

                <button
                  onClick={() => setRoomSubTab('audio_stage')}
                  className={`px-2.5 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap shrink-0 ${
                    roomSubTab === 'audio_stage'
                      ? 'bg-emerald-800 text-white shadow'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  الحاضرون
                </button>
              </div>

              {/* SubTab: Tadabbur Notes (ملاحظات وفوائد التدبر) */}
              {roomSubTab === 'tadabbur_notes' && (
                <div className="flex-1 flex flex-col justify-between pt-2.5 space-y-2.5 overflow-hidden">
                  {/* Top Bar: Title & Toggle Add Note Form */}
                  <div className="flex items-center justify-between gap-2 pb-1 border-b border-stone-800/80">
                    <div className="flex items-center gap-1.5 text-xs">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span className="font-bold text-stone-200">فوائد تدبر سورة {activeRoom.surahName}</span>
                    </div>

                    <button
                      onClick={() => setShowAddNoteForm(!showAddNoteForm)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors flex items-center gap-1 shadow-sm ${
                        showAddNoteForm
                          ? 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                          : 'bg-amber-600 hover:bg-amber-500 text-stone-950'
                      }`}
                    >
                      {showAddNoteForm ? (
                        <>
                          <X className="w-3 h-3" />
                          <span>إغلاق النموذج</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3" />
                          <span>تدوين فائدة (+10)</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Filter Pills */}
                  {activeRoom.tadabburNotes && activeRoom.tadabburNotes.length > 0 && !showAddNoteForm && (
                    <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-1 text-[10px]">
                      <button
                        onClick={() => setSelectedNoteFilter('all')}
                        className={`px-2 py-0.5 rounded-full font-bold whitespace-nowrap transition-colors ${
                          selectedNoteFilter === 'all'
                            ? 'bg-amber-500 text-stone-950'
                            : 'bg-stone-800 text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        الكل ({activeRoom.tadabburNotes.length})
                      </button>
                      <button
                        onClick={() => setSelectedNoteFilter('iman')}
                        className={`px-2 py-0.5 rounded-full font-bold whitespace-nowrap transition-colors ${
                          selectedNoteFilter === 'iman'
                            ? 'bg-amber-500 text-stone-950'
                            : 'bg-stone-800 text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        هدايات إيمانية
                      </button>
                      <button
                        onClick={() => setSelectedNoteFilter('language')}
                        className={`px-2 py-0.5 rounded-full font-bold whitespace-nowrap transition-colors ${
                          selectedNoteFilter === 'language'
                            ? 'bg-amber-500 text-stone-950'
                            : 'bg-stone-800 text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        لطائف بيانية
                      </button>
                      <button
                        onClick={() => setSelectedNoteFilter('action')}
                        className={`px-2 py-0.5 rounded-full font-bold whitespace-nowrap transition-colors ${
                          selectedNoteFilter === 'action'
                            ? 'bg-amber-500 text-stone-950'
                            : 'bg-stone-800 text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        عمل وتطبيق
                      </button>
                      <button
                        onClick={() => setSelectedNoteFilter('tazkiyah')}
                        className={`px-2 py-0.5 rounded-full font-bold whitespace-nowrap transition-colors ${
                          selectedNoteFilter === 'tazkiyah'
                            ? 'bg-amber-500 text-stone-950'
                            : 'bg-stone-800 text-stone-400 hover:text-stone-200'
                        }`}
                      >
                        تزكية النفس
                      </button>
                    </div>
                  )}

                  {/* Add Note Form (Visible if showAddNoteForm) */}
                  {showAddNoteForm ? (
                    <form onSubmit={handleAddTadabburNote} className="bg-stone-950 p-3 rounded-xl border border-amber-700/50 space-y-2 text-xs">
                      <div className="flex items-center justify-between pb-1 border-b border-stone-800 text-[11px]">
                        <span className="font-bold text-amber-300 flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5" />
                          <span>تدوين فائدة تدبر جديدة</span>
                        </span>
                        <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/40">
                          +10 نقاط مكافأة
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-stone-400 block mb-1">رقم الآية (اختياري)</label>
                          <input
                            type="text"
                            placeholder="مثال: 10 أو 1-4"
                            value={newNoteAyah}
                            onChange={(e) => setNewNoteAyah(e.target.value)}
                            className="w-full bg-stone-900 border border-stone-800 rounded-lg px-2.5 py-1.5 text-stone-200 text-xs focus:outline-none focus:border-amber-500"
                          />
                        </div>

                        <div>
                          <label className="text-[10px] text-stone-400 block mb-1">نوع الفائدة</label>
                          <select
                            value={newNoteCategory}
                            onChange={(e: any) => setNewNoteCategory(e.target.value)}
                            className="w-full bg-stone-900 border border-stone-800 rounded-lg px-2 py-1.5 text-stone-200 text-xs focus:outline-none focus:border-amber-500 cursor-pointer"
                          >
                            <option value="iman">هداية إيمانية</option>
                            <option value="language">لطيفة بيانية وتفسيرية</option>
                            <option value="action">عمل وتطبيق</option>
                            <option value="tazkiyah">تزكية النفس والقلب</option>
                            <option value="general">فائدة تدبر عامة</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] text-stone-400 block mb-1">
                          نص الفائدة أو اللطيفة المستخلصة من الآيات:
                        </label>
                        <textarea
                          rows={3}
                          placeholder="سجل ما فتح الله به عليك من معانٍ، تأملات، وهدايات في الآيات الكريمة..."
                          value={newNoteText}
                          onChange={(e) => setNewNoteText(e.target.value)}
                          className="w-full bg-stone-900 border border-stone-800 rounded-lg p-2.5 text-stone-200 text-xs leading-relaxed focus:outline-none focus:border-amber-500 resize-none font-arabic"
                          required
                        />
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-stone-400">
                          {newNoteText.length} حرفاً
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setShowAddNoteForm(false)}
                            className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-400 text-xs font-bold transition-colors"
                          >
                            إلغاء
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmittingNote || !newNoteText.trim()}
                            className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-stone-950 font-bold text-xs transition-colors flex items-center gap-1 shadow"
                          >
                            {isSubmittingNote ? (
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Send className="w-3.5 h-3.5" />
                            )}
                            <span>نشر الفائدة في المجلس</span>
                          </button>
                        </div>
                      </div>
                    </form>
                  ) : null}

                  {/* Notes List */}
                  <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs">
                    {(!activeRoom.tadabburNotes || activeRoom.tadabburNotes.length === 0) ? (
                      <div className="py-8 text-center text-stone-500 space-y-2">
                        <div className="w-10 h-10 rounded-full bg-stone-950 border border-stone-800 mx-auto flex items-center justify-center text-amber-400">
                          <Sparkles className="w-5 h-5" />
                        </div>
                        <p className="font-bold text-stone-300">لا توجد ملاحظات تدبر مسجلة حتى الآن</p>
                        <p className="text-[11px] text-stone-400 max-w-xs mx-auto leading-relaxed">
                          ﴿أَفَلَا يَتَدَبَّرُونَ الْقُرْآنَ﴾ — كن أول من يدون لطيفة أو هداية إيمانية استخلصها من سورة {activeRoom.surahName}.
                        </p>
                        <button
                          onClick={() => setShowAddNoteForm(true)}
                          className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600/90 hover:bg-amber-600 text-stone-950 text-xs font-bold transition-all shadow"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>اكتب أول فائدة تدبر الآن</span>
                        </button>
                      </div>
                    ) : (
                      (selectedNoteFilter === 'all'
                        ? activeRoom.tadabburNotes
                        : activeRoom.tadabburNotes.filter((n) => n.categoryTag === selectedNoteFilter)
                      ).map((note) => {
                        const isUserLiked = note.likedBy && currentUser?.id && note.likedBy.includes(currentUser.id);
                        return (
                          <div
                            key={note.id}
                            className="bg-stone-950 p-3.5 rounded-xl border border-stone-800 hover:border-amber-700/40 transition-colors space-y-2.5 relative group"
                          >
                            {/* Author & Tags Header */}
                            <div className="flex items-center justify-between gap-2 text-[11px]">
                              <div className="flex items-center gap-1.5">
                                <div className="w-6 h-6 rounded-full bg-emerald-950 border border-emerald-700/50 flex items-center justify-center text-emerald-400 font-bold text-[10px]">
                                  {note.authorName[0]}
                                </div>
                                <span className="font-bold text-stone-200">{note.authorName}</span>
                                {note.authorId === activeRoom.sheikhHost.id && (
                                  <span className="text-[9px] bg-emerald-950/80 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-800/40 font-bold">
                                    الشيخ المشرف
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1.5">
                                {note.ayahNumber && (
                                  <span className="text-[10px] bg-stone-900 border border-stone-800 text-stone-300 px-1.5 py-0.5 rounded font-mono">
                                    الآية {note.ayahNumber}
                                  </span>
                                )}
                                <span
                                  className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                                    note.categoryTag === 'language'
                                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/50'
                                      : note.categoryTag === 'action'
                                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/50'
                                      : note.categoryTag === 'tazkiyah'
                                      ? 'bg-purple-950 text-purple-300 border border-purple-800/50'
                                      : 'bg-amber-950 text-amber-300 border border-amber-800/50'
                                  }`}
                                >
                                  {note.categoryTagLabel || 'فائدة تدبر'}
                                </span>
                              </div>
                            </div>

                            {/* Note Text */}
                            <p className="text-stone-200 text-xs sm:text-[13px] leading-relaxed font-arabic bg-stone-900/40 p-2.5 rounded-lg border-r-2 border-amber-500/70">
                              {note.benefitText}
                            </p>

                            {/* Action Bar (Like, Copy, Time) */}
                            <div className="flex items-center justify-between pt-1 border-t border-stone-800/60 text-[10px]">
                              <span className="text-stone-500 font-mono">{note.timestamp}</span>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleCopyNote(note.benefitText, note.id)}
                                  className="text-stone-400 hover:text-stone-200 flex items-center gap-1 px-2 py-0.5 rounded bg-stone-900 hover:bg-stone-800 transition-colors"
                                  title="نسخ نص الفائدة"
                                >
                                  {copiedNoteId === note.id ? (
                                    <>
                                      <CheckCheck className="w-3 h-3 text-emerald-400" />
                                      <span className="text-emerald-400 font-bold">تم النسخ</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" />
                                      <span>نسخ</span>
                                    </>
                                  )}
                                </button>

                                <button
                                  onClick={() => handleLikeNote(note.id)}
                                  className={`flex items-center gap-1 px-2 py-0.5 rounded transition-all ${
                                    isUserLiked
                                      ? 'bg-amber-950/80 border border-amber-700/60 text-amber-300 font-bold'
                                      : 'bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-amber-300'
                                  }`}
                                  title="انتفعت بهذه الفائدة"
                                >
                                  <ThumbsUp className={`w-3 h-3 ${isUserLiked ? 'fill-current text-amber-400' : ''}`} />
                                  <span>{note.likesCount > 0 ? note.likesCount : 'انتفعت'}</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {/* SubTab 1: Sharia Q&A (طرح الأسئلة الشرعية) */}
              {roomSubTab === 'questions' && (
                <div className="flex-1 flex flex-col justify-between pt-3 space-y-3 overflow-hidden">
                  {/* Questions list */}
                  <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs">
                    {activeRoom.questions.length === 0 ? (
                      <div className="py-8 text-center text-stone-500 space-y-1">
                        <HelpCircle className="w-6 h-6 mx-auto text-stone-600" />
                        <p>لا توجد أسئلة مسجلة حتى الآن.</p>
                        <p className="text-[11px] text-stone-400">كن أول من يطرح سؤالاً فقهياً أو تفسيرياً للشيخ في هذه السورة.</p>
                      </div>
                    ) : (
                      activeRoom.questions.map((q) => (
                        <div
                          key={q.id}
                          className="bg-stone-950 p-3 rounded-xl border border-stone-800 space-y-2"
                        >
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-amber-300">{q.askerName}</span>
                            <span className="text-stone-500 font-mono text-[10px]">{q.timestamp}</span>
                          </div>

                          <p className="text-stone-200 text-xs leading-relaxed font-medium">
                            {q.question}
                          </p>

                          {q.status === 'answered' && q.answer ? (
                            <div className="bg-emerald-950/60 p-2.5 rounded-lg border border-emerald-800/50 space-y-1">
                              <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold">
                                <Check className="w-3 h-3" />
                                <span>إجابة فضيلة الشيخ ({q.answeredBy || activeRoom.sheikhHost.name}):</span>
                              </div>
                              <p className="text-stone-300 text-[11px] leading-relaxed">
                                {q.answer}
                              </p>
                            </div>
                          ) : (
                            <span className="inline-block text-[10px] text-amber-400/90 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                              قيد العرض على الشيخ في المجلس
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Ask Question Form */}
                  <form onSubmit={handleAskQuestion} className="pt-2 border-t border-stone-800 space-y-2">
                    <textarea
                      rows={2}
                      value={newQuestionText}
                      onChange={(e) => setNewQuestionText(e.target.value)}
                      placeholder="اكتب سؤالك الشرعي أو استفسارك في التفسير والتجويد..."
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-xs text-stone-100 placeholder-stone-500 focus:border-emerald-600 outline-none resize-none"
                    />
                    <button
                      type="submit"
                      disabled={!newQuestionText.trim()}
                      className="w-full py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow flex items-center justify-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5 rtl:rotate-180" />
                      <span>إرسال السؤال للشيخ</span>
                    </button>
                  </form>
                </div>
              )}

              {/* SubTab 2: Queue for Recitation (طابور التسميع) */}
              {roomSubTab === 'queue' && (
                <div className="flex-1 flex flex-col justify-between pt-3 space-y-3 overflow-hidden text-xs">
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                    {activeRoom.queue.length === 0 ? (
                      <div className="py-8 text-center text-stone-500 space-y-2">
                        <Users className="w-6 h-6 mx-auto text-stone-600" />
                        <p>لا يوجد طلاب مسجلون في طابور التسميع حالياً.</p>
                        <button
                          onClick={handleRaiseHandForRecitation}
                          className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs"
                        >
                          كن أول من يسمع الآيات الآن
                        </button>
                      </div>
                    ) : (
                      activeRoom.queue.map((entry, index) => (
                        <div
                          key={entry.id}
                          className="bg-stone-950 p-2.5 rounded-xl border border-stone-800 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-stone-900 border border-stone-700 flex items-center justify-center text-[10px] font-mono text-amber-400 font-bold">
                              {index + 1}
                            </span>
                            <div>
                              <span className="font-bold text-stone-200 block text-xs">{entry.userName}</span>
                              <span className="text-[10px] text-stone-500 font-mono">انضم: {entry.joinedAt}</span>
                            </div>
                          </div>

                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/40">
                            {index === 0 ? 'المتحدث التالي' : 'في الانتظار'}
                          </span>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="pt-2 border-t border-stone-800">
                    <button
                      onClick={handleRaiseHandForRecitation}
                      className="w-full py-2 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs rounded-xl transition-all shadow flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isHandRaised ? 'يدك مرفوعة في الطابور' : 'تسجيل اسمي في طابور التسميع'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* SubTab 3: Live Chat (محادثة المجلس) */}
              {roomSubTab === 'chat' && (
                <div className="flex-1 flex flex-col justify-between pt-3 space-y-3 overflow-hidden text-xs">
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                    {activeRoom.chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-2.5 rounded-xl border ${
                          msg.role === 'sheikh'
                            ? 'bg-emerald-950/60 border-emerald-800/50'
                            : msg.role === 'moderator'
                            ? 'bg-stone-950 border-stone-800 text-stone-400'
                            : 'bg-stone-950 border-stone-800/80'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px] text-stone-400 mb-1">
                          <span className="font-bold text-amber-300">{msg.senderName}</span>
                          <span className="font-mono">{msg.timestamp}</span>
                        </div>
                        <p className="text-stone-200 text-xs leading-relaxed">{msg.message}</p>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleSendChat} className="pt-2 border-t border-stone-800 flex items-center gap-1.5">
                    <input
                      type="text"
                      value={newChatMessage}
                      onChange={(e) => setNewChatMessage(e.target.value)}
                      placeholder="اكتب تعقيباً أو دعاءً طيباً..."
                      className="flex-1 bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-100 placeholder-stone-500 focus:border-emerald-600 outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!newChatMessage.trim()}
                      className="p-2 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl transition-colors"
                    >
                      <Send className="w-4 h-4 rtl:rotate-180" />
                    </button>
                  </form>
                </div>
              )}

              {/* SubTab 4: Attendees & Sheikh Info */}
              {roomSubTab === 'audio_stage' && (
                <div className="flex-1 flex flex-col justify-between pt-3 space-y-3 overflow-y-auto text-xs">
                  <div className="space-y-3">
                    <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 space-y-1">
                      <span className="text-[10px] text-stone-400 block">المشرف على المجلس:</span>
                      <h4 className="font-bold text-sm text-stone-100">{activeRoom.sheikhHost.name}</h4>
                      <p className="text-[11px] text-emerald-400">{activeRoom.sheikhHost.title}</p>
                    </div>

                    <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 space-y-1.5">
                      <span className="text-[10px] text-stone-400 block">السورة والآيات المدارسة:</span>
                      <p className="font-bold text-stone-200 text-xs">
                        سورة {activeRoom.surahName} — من الآية {activeRoom.ayahStart} إلى {activeRoom.ayahEnd}
                      </p>
                      <p className="text-[10px] text-stone-400 leading-relaxed">
                        {activeRoom.description}
                      </p>
                    </div>

                    <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 space-y-1">
                      <span className="text-[10px] text-stone-400 block">آداب مجالس القرآن:</span>
                      <ul className="text-[10px] text-stone-300 space-y-1 list-disc list-inside leading-relaxed">
                        <li>الإنصات التام أثناء تلاوة الآيات الكريمة.</li>
                        <li>كتم المايكروفون ما لم يُؤذن لك بالتسميع.</li>
                        <li>طرح الأسئلة في نافذة الأسئلة الشرعية لتجيب عنها الإدارة.</li>
                      </ul>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-800 text-[11px] text-center text-stone-400">
                    مستمعون حاضرون: <strong className="text-emerald-400">{activeRoom.participantsCount}</strong>
                  </div>
                </div>
              )}
            </div>
          </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREATE NEW HALQA ROOM                                              */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
          <div className="bg-stone-900 border border-stone-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden text-right">
            <div className="bg-stone-950 px-5 py-4 border-b border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-stone-100 text-sm font-quran">
                  إنشاء حلقة / غرفة قرآنية جديدة
                </h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="text-stone-300 font-bold block mb-1">عنوان الحلقة / المجلس:</label>
                <input
                  type="text"
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                  placeholder="مثلاً: حلقة إتقان سورة الكهف وتدبر معانيها"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-xs text-stone-100 outline-none focus:border-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="text-stone-300 font-bold block mb-1">نوع الحلقة ومسارها:</label>
                <select
                  value={createCategory}
                  onChange={(e) => setCreateCategory(e.target.value as any)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-xs text-stone-100 outline-none focus:border-emerald-600"
                >
                  <option value="tadabbur">مجلس تدبر وتفسير للآيات</option>
                  <option value="hifz">حلقة تسميع وحفظ وتثبيت</option>
                  <option value="tajweed">مقرأة أحكام التجويد ومخارج الحروف</option>
                  <option value="fatwa_qa">مجلس أسئلة شرعية وفتاوى</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="text-stone-300 font-bold block mb-1">السورة المحددة:</label>
                  <select
                    value={createSurahId}
                    onChange={(e) => setCreateSurahId(Number(e.target.value))}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-xs text-stone-100 outline-none focus:border-emerald-600"
                  >
                    {ALL_SURAHS.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.id}. {s.name} ({s.ayasCount} آية)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-stone-300 font-bold block mb-1">من آية:</label>
                  <input
                    type="number"
                    value={createAyahStart}
                    onChange={(e) => setCreateAyahStart(Number(e.target.value))}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-xs text-stone-100 outline-none focus:border-emerald-600"
                    min={1}
                  />
                </div>

                <div>
                  <label className="text-stone-300 font-bold block mb-1">إلى آية:</label>
                  <input
                    type="number"
                    value={createAyahEnd}
                    onChange={(e) => setCreateAyahEnd(Number(e.target.value))}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-xs text-stone-100 outline-none focus:border-emerald-600"
                    min={1}
                  />
                </div>
              </div>

              {/* Meeting Mode: Audio/Video vs Audio Only */}
              <div>
                <label className="text-stone-300 font-bold block mb-1">نظام الاجتماع والبث:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCreateMeetingMode('audio_video')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all border ${
                      createMeetingMode === 'audio_video'
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow'
                        : 'bg-stone-950 text-stone-400 border-stone-800 hover:bg-stone-800'
                    }`}
                  >
                    <Video className="w-4 h-4 text-emerald-300" />
                    <span>مسموع ومرئي (صوت وفيديو)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCreateMeetingMode('audio_only')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all border ${
                      createMeetingMode === 'audio_only'
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow'
                        : 'bg-stone-950 text-stone-400 border-stone-800 hover:bg-stone-800'
                    }`}
                  >
                    <Mic className="w-4 h-4 text-emerald-300" />
                    <span>صوتي فقط (استماع وتسميع)</span>
                  </button>
                </div>
              </div>

              {/* Scheduled Time */}
              <div>
                <label className="text-stone-300 font-bold block mb-1">موعد وتوقيت الانعقاد:</label>
                <input
                  type="text"
                  value={createScheduledTime}
                  onChange={(e) => setCreateScheduledTime(e.target.value)}
                  placeholder="مثال: اليوم بعد صلاة العصر، أو غداً الساعة 5:30 م"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-xs text-stone-100 outline-none focus:border-emerald-600"
                />
              </div>

              {/* WhatsApp Member Invites */}
              <div>
                <label className="text-stone-300 font-bold block mb-1 flex items-center justify-between">
                  <span>أرقام هواتف الأعضاء لدعوتهم عبر الواتساب:</span>
                  <span className="text-[10px] text-emerald-400 font-normal">إرسال دعوات تلقائية</span>
                </label>
                <input
                  type="text"
                  value={createInvitedPhones}
                  onChange={(e) => setCreateInvitedPhones(e.target.value)}
                  placeholder="مثال: +966501234567, +201012345678 (مفصولة بفواصل)"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-xs text-stone-100 outline-none focus:border-emerald-600 font-mono"
                  dir="ltr"
                />
                <p className="text-[10px] text-stone-400 mt-1">
                  سيتم تجهيز وإرسال رابط الدعوة فورياً عبر الواتساب للأعضاء للانضمام للحلقة بضغطة زر.
                </p>
              </div>

              <div>
                <label className="text-stone-300 font-bold block mb-1">فئة الحضور والخصوصية:</label>
                <select
                  value={createAudience}
                  onChange={(e) => setCreateAudience(e.target.value as any)}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-xs text-stone-100 outline-none focus:border-emerald-600"
                >
                  <option value="all">عام لعموم المسلمين</option>
                  <option value="men_only">مجلس خاص بالرجال</option>
                  <option value="women_only">مجلس خاص بالأخوات والنساء</option>
                </select>
              </div>

              <div>
                <label className="text-stone-300 font-bold block mb-1">نبذة عن موضوع الحلقة ومحاورها:</label>
                <textarea
                  rows={2}
                  value={createDesc}
                  onChange={(e) => setCreateDesc(e.target.value)}
                  placeholder="بيان أهداف الحلقة، طريقة التسميع، وأهم الوقفات التدبرية..."
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-xs text-stone-100 outline-none focus:border-emerald-600 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRoom}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold shadow"
                >
                  {isSubmittingRoom ? 'جاري فتح الغرفة...' : 'فتح الغرفة وبدء البث'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: SHARE & INVITE TO HALQA (دعوة ومشاركة رابط الحلقة)                  */}
      {/* ========================================================================= */}
      {shareModalRoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div
            className={`w-full max-w-lg rounded-2xl p-6 border shadow-2xl space-y-4 text-right ${
              isDark ? 'bg-stone-900 border-amber-500/30 text-stone-100' : 'bg-white border-[#cde2ec] text-[#0a2737]'
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-stone-800/80">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-amber-400 font-quran">
                    دعوة ومشاركة مجلس القرآن والتدبر
                  </h3>
                  <p className={`text-xs ${isDark ? 'text-stone-400' : 'text-[#335568]'}`}>
                    أرسل الرابط لأصدقائك وأهلك للانضمام للمجلس مباشرة
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShareModalRoom(null)}
                className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-400 hover:text-stone-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Room Brief Card */}
            <div className={`p-4 rounded-xl border ${
              isDark ? 'bg-stone-950/80 border-stone-800' : 'bg-[#f4f8fa] border-[#cde2ec]'
            }`}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  سورة {shareModalRoom.surahName} ({shareModalRoom.ayahStart} - {shareModalRoom.ayahEnd})
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                  isDark ? 'bg-cyan-950 text-cyan-300' : 'bg-[#e0f2fe] text-[#0369a1]'
                }`}>
                  {shareModalRoom.categoryLabel}
                </span>
              </div>
              <h4 className="font-bold text-sm text-stone-100 mb-1">
                {shareModalRoom.title}
              </h4>
              <p className={`text-xs ${isDark ? 'text-stone-400' : 'text-[#64748b]'}`}>
                تقديم وفحص: {shareModalRoom.sheikhHost.name} ({shareModalRoom.sheikhHost.title})
              </p>
            </div>

            {/* Shareable Link Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-300 block">
                رابط الانضمام المباشر للحلقة:
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={typeof window !== 'undefined' ? `${window.location.origin}/?tab=halaqat&roomId=${shareModalRoom.id}&invite=1` : ''}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-xs text-stone-300 font-mono select-all focus:outline-none focus:border-amber-500/50"
                  dir="ltr"
                />
                <button
                  onClick={() => {
                    const link = `${window.location.origin}/?tab=halaqat&roomId=${shareModalRoom.id}&invite=1`;
                    if (navigator.clipboard) {
                      navigator.clipboard.writeText(link);
                      setIsLinkCopied(true);
                      setTimeout(() => setIsLinkCopied(false), 3000);
                    }
                  }}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all shrink-0 flex items-center gap-1.5 shadow ${
                    isLinkCopied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-600 hover:bg-amber-500 text-stone-950'
                  }`}
                >
                  {isLinkCopied ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>تم النسخ!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>نسخ الرابط</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Quick Share Buttons */}
            <div className="pt-2 border-t border-stone-800/80 space-y-2">
              <span className="text-xs font-bold text-stone-300 block">
                مشاركة فورية عبر المنصات:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* WhatsApp */}
                <button
                  onClick={() => {
                    const link = `${window.location.origin}/?tab=halaqat&roomId=${shareModalRoom.id}&invite=1`;
                    const text = `السلام عليكم ورحمة الله وبركاته 🌿\nأدعوك للانضمام معي إلى مجلس مدارسة وتدبر القرآن الكريم:\n"${shareModalRoom.title}"\nبرعاية الشيخ ${shareModalRoom.sheikhHost.name}.\n\nرابط التسجيل والانضمام المباشر:\n${link}`;
                    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-700/80 hover:bg-emerald-600 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>إرسال عبر واتساب (WhatsApp)</span>
                </button>

                {/* Telegram */}
                <button
                  onClick={() => {
                    const link = `${window.location.origin}/?tab=halaqat&roomId=${shareModalRoom.id}&invite=1`;
                    const text = `السلام عليكم ورحمة الله، أدعوك لمجلس تدبر القرآن الكريم: ${shareModalRoom.title}`;
                    window.open(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(text)}`, '_blank');
                  }}
                  className="w-full py-2.5 px-3 rounded-xl bg-sky-700/80 hover:bg-sky-600 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow"
                >
                  <Send className="w-4 h-4" />
                  <span>إرسال عبر تلغرام (Telegram)</span>
                </button>
              </div>

              {/* Native Web Share API if available */}
              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button
                  onClick={() => {
                    const link = `${window.location.origin}/?tab=halaqat&roomId=${shareModalRoom.id}&invite=1`;
                    navigator.share({
                      title: shareModalRoom.title,
                      text: `دعوة لحضور مجلس تدبر القرآن الكريم: ${shareModalRoom.title}`,
                      url: link,
                    }).catch(() => {});
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 font-bold text-xs transition-all flex items-center justify-center gap-2 mt-1"
                >
                  <Share2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>مشاركة عبر تطبيقات الجهاز الأخرى</span>
                </button>
              )}
            </div>

            <div className="pt-2 text-center">
              <span className="text-[11px] text-stone-400">
                بمجرد فتح الرابط، يدخل الزائر مباشرة إلى مجلس التدبر ويتمكن من الاستماع للتلاوة والتسميع والتفاعل.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: WHATSAPP DIRECT INVITES & MEMBER NOTIFICATIONS                    */}
      {/* ========================================================================= */}
      {whatsAppModalRoom && (
        <WhatsAppInviteModal
          room={whatsAppModalRoom as any}
          isOpen={true}
          isDark={isDark}
          onClose={() => setWhatsAppModalRoom(null)}
          onRewardPoints={onRewardPoints}
        />
      )}
    </div>
  );
}
