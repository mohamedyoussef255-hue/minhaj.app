import React, { useState, useEffect } from 'react';
import {
  Users,
  Mic,
  MicOff,
  Radio,
  BookOpen,
  HelpCircle,
  Repeat,
  Sparkles,
  Plus,
  Send,
  CheckCircle2,
  Clock,
  ArrowRight,
  Volume2,
  VolumeX,
  Lock,
  HeartHandshake,
  MessageSquare,
  Award,
  ChevronRight,
  ShieldCheck,
  Search,
  Filter,
} from 'lucide-react';
import { ALL_SURAHS, RECITERS_LIST } from '../data/quranSurahs';

export interface HalqaRoomData {
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
  activeSpeaker: {
    name: string;
    role: string;
    isSpeaking: boolean;
  };
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
  createdAt: string;
}

interface HalaqatSectionProps {
  currentUser: any;
  wallet: any;
  onRewardPoints?: (points: number, message: string) => void;
  onPlayContinuousSurah?: (surahId: number) => void;
}

export function HalaqatSection({ currentUser, wallet, onRewardPoints, onPlayContinuousSurah }: HalaqatSectionProps) {
  const [rooms, setRooms] = useState<HalqaRoomData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [audienceFilter, setAudienceFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Inside Active Room state
  const [roomTab, setRoomTab] = useState<'queue' | 'questions' | 'chat' | 'mushaf'>('queue');
  const [isMicMuted, setIsMicMuted] = useState<boolean>(true);
  const [isHandRaised, setIsHandRaised] = useState<boolean>(false);
  const [newQuestionText, setNewQuestionText] = useState<string>('');
  const [newChatMessage, setNewChatMessage] = useState<string>('');
  const [answeringQuestionId, setAnsweringQuestionId] = useState<string | null>(null);
  const [answerInput, setAnswerInput] = useState<string>('');
  const [showRaiseHandModal, setShowRaiseHandModal] = useState<boolean>(false);
  const [raiseType, setRaiseType] = useState<'recite' | 'question'>('recite');
  const [raiseDetail, setRaiseDetail] = useState<string>('');

  // Create Room Modal
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [createTitle, setCreateTitle] = useState<string>('');
  const [createDesc, setCreateDesc] = useState<string>('');
  const [createCategory, setCreateCategory] = useState<'tadabbur' | 'hifz' | 'tajweed' | 'fatwa_qa'>('tadabbur');
  const [createAudience, setCreateAudience] = useState<'all' | 'men_only' | 'women_only'>('all');
  const [createSheikhName, setCreateSheikhName] = useState<string>(currentUser?.name || 'فضيلة الشيخ المشرف');
  const [createSheikhTitle, setCreateSheikhTitle] = useState<string>('معلم قرآن وقراءات معتمد');
  const [createSurahId, setCreateSurahId] = useState<number>(18);
  const [createAyahStart, setCreateAyahStart] = useState<number>(1);
  const [createAyahEnd, setCreateAyahEnd] = useState<number>(10);
  const [isSubmittingRoom, setIsSubmittingRoom] = useState<boolean>(false);

  // Fetch Rooms
  const fetchRooms = async () => {
    try {
      const res = await fetch('/api/v1/halaqat');
      const data = await res.json();
      if (data.success) {
        setRooms(data.rooms);
      }
    } catch (err) {
      console.error('Failed to load halaqat:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
    const interval = setInterval(fetchRooms, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, []);

  const activeRoom = rooms.find((r) => r.id === activeRoomId);

  // Join Room
  const handleJoinRoom = (roomId: string) => {
    setActiveRoomId(roomId);
    setIsHandRaised(false);
    setIsMicMuted(true);
  };

  // Leave Room
  const handleLeaveRoom = () => {
    setActiveRoomId(null);
    setIsHandRaised(false);
  };

  // Submit Raise Hand
  const handleConfirmRaiseHand = async () => {
    if (!activeRoomId) return;
    try {
      const res = await fetch(`/api/v1/halaqat/${activeRoomId}/raise-hand`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser?.id || 'guest',
          userName: currentUser?.name || 'طالب مشارك',
          type: raiseType,
          questionText: raiseDetail.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsHandRaised(true);
        setShowRaiseHandModal(false);
        setRaiseDetail('');
        fetchRooms();
        if (onRewardPoints) {
          onRewardPoints(15, 'بارك الله فيك! سجلت طلب المشاركة في حلقة القرآن.');
        }
      }
    } catch (err) {
      console.error(err);
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
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Sheikh / Admin Answer Question
  const handleAnswerQuestion = async (questionId: string) => {
    if (!activeRoomId || !answerInput.trim()) return;
    try {
      const res = await fetch(`/api/v1/halaqat/${activeRoomId}/answer-question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId,
          answer: answerInput.trim(),
          answeredBy: activeRoom?.sheikhHost.name || currentUser?.name || 'فضيلة الشيخ',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAnsweringQuestionId(null);
        setAnswerInput('');
        fetchRooms();
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

  // Create new Halqa room
  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createTitle.trim()) return;
    setIsSubmittingRoom(true);
    try {
      const res = await fetch('/api/v1/halaqat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: createTitle.trim(),
          description: createDesc.trim(),
          category: createCategory,
          sheikhHostName: createSheikhName.trim(),
          sheikhTitle: createSheikhTitle.trim(),
          targetAudience: createAudience,
          surahId: createSurahId,
          ayahStart: createAyahStart,
          ayahEnd: createAyahEnd,
        }),
      });
      const data = await res.json();
      if (data.success && data.room) {
        setShowCreateModal(false);
        setCreateTitle('');
        setCreateDesc('');
        fetchRooms();
        setActiveRoomId(data.room.id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingRoom(false);
    }
  };

  // Filtered rooms
  const filteredRooms = rooms.filter((r) => {
    if (categoryFilter !== 'all' && r.category !== categoryFilter) return false;
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

  return (
    <div id="halaqat-container" className="space-y-4 animate-in fade-in duration-200">
      
      {/* ========================================================================= */}
      {/* VIEW A: LOBBY & LIST OF HALAQAT (صالة الحلقات والغرف النشطة)               */}
      {/* ========================================================================= */}
      {!activeRoom ? (
        <div className="space-y-4">
          
          {/* Top Banner & Stats */}
          <div className="bg-gradient-to-r from-stone-900 via-stone-900 to-emerald-950/40 rounded-2xl p-5 border border-emerald-800/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <Radio className="w-4 h-4 text-red-500 animate-pulse" />
                <span>حلقات القرآن ومجالس التدبر والأسئلة الشرعية المباشرة</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-stone-100 font-quran">
                غرف التدارس والحفظ والتلاوة الجماعية
              </h2>
              <p className="text-xs text-stone-400 max-w-xl leading-relaxed">
                انضم لمجالس القرآن الحية بإشراف نخبة من الشيوخ والمقرئين المجازين لتسميع الآيات وتدبرها، وتصحيح التلاوة، وطرح الأسئلة الشرعية والفتاوى في بيئة شرعية منضبطة.
              </p>
            </div>

            <button
              id="create-halqa-btn"
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs shadow-lg hover:shadow-emerald-900/30 transition-all active:scale-95 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>إنشاء حلقة / غرفة جديدة</span>
            </button>
          </div>

          {/* Quick Categories Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              onClick={() => setCategoryFilter(categoryFilter === 'tadabbur' ? 'all' : 'tadabbur')}
              className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between ${
                categoryFilter === 'tadabbur'
                  ? 'bg-amber-950/40 border-amber-500/50 text-amber-200 shadow-md'
                  : 'bg-stone-900/80 border-stone-800 text-stone-300 hover:bg-stone-800/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                  {rooms.filter(r => r.category === 'tadabbur').length}
                </span>
              </div>
              <div className="mt-2">
                <div className="font-bold text-xs">غرف التدبر والتفسير</div>
                <div className="text-[10px] text-stone-400">تأمل هدايات وسياق الآيات</div>
              </div>
            </button>

            <button
              onClick={() => setCategoryFilter(categoryFilter === 'hifz' ? 'all' : 'hifz')}
              className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between ${
                categoryFilter === 'hifz'
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200 shadow-md'
                  : 'bg-stone-900/80 border-stone-800 text-stone-300 hover:bg-stone-800/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <Repeat className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                  {rooms.filter(r => r.category === 'hifz').length}
                </span>
              </div>
              <div className="mt-2">
                <div className="font-bold text-xs">غرف التحفيظ والمراجعة</div>
                <div className="text-[10px] text-stone-400">تسميع الآيات وتثبيت الحفظ</div>
              </div>
            </button>

            <button
              onClick={() => setCategoryFilter(categoryFilter === 'tajweed' ? 'all' : 'tajweed')}
              className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between ${
                categoryFilter === 'tajweed'
                  ? 'bg-teal-950/40 border-teal-500/50 text-teal-200 shadow-md'
                  : 'bg-stone-900/80 border-stone-800 text-stone-300 hover:bg-stone-800/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <Mic className="w-4 h-4 text-teal-400" />
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 font-mono">
                  {rooms.filter(r => r.category === 'tajweed').length}
                </span>
              </div>
              <div className="mt-2">
                <div className="font-bold text-xs">مجالس التلاوة والتجويد</div>
                <div className="text-[10px] text-stone-400">تصحيح المخارج وأحكام الترتيل</div>
              </div>
            </button>

            <button
              onClick={() => setCategoryFilter(categoryFilter === 'fatwa_qa' ? 'all' : 'fatwa_qa')}
              className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between ${
                categoryFilter === 'fatwa_qa'
                  ? 'bg-purple-950/40 border-purple-500/50 text-purple-200 shadow-md'
                  : 'bg-stone-900/80 border-stone-800 text-stone-300 hover:bg-stone-800/80'
              }`}
            >
              <div className="flex items-center justify-between">
                <HelpCircle className="w-4 h-4 text-purple-400" />
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
                  {rooms.filter(r => r.category === 'fatwa_qa').length}
                </span>
              </div>
              <div className="mt-2">
                <div className="font-bold text-xs">الأسئلة الشرعية والفتاوى</div>
                <div className="text-[10px] text-stone-400">إجابات فقهية من أهل العلم</div>
              </div>
            </button>
          </div>

          {/* Filters & Search Toolbar */}
          <div className="bg-stone-900 rounded-xl p-3 border border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث باسم الحلقة، الشيخ المشرف، أو السورة..."
                className="bg-transparent text-stone-200 placeholder-stone-500 outline-none w-full text-xs"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="text-stone-500 hover:text-stone-300">
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-stone-400 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" />
                الخصوصية:
              </span>
              <select
                value={audienceFilter}
                onChange={(e) => setAudienceFilter(e.target.value)}
                className="bg-stone-950 border border-stone-800 text-stone-300 rounded-lg px-2.5 py-1 text-xs outline-none"
              >
                <option value="all">جميع المجالس</option>
                <option value="men_only">مجالس الرجال</option>
                <option value="women_only">مجالس الأخوات (خاصة)</option>
              </select>
            </div>
          </div>

          {/* Room Cards Grid */}
          {loading ? (
            <div className="py-16 text-center text-stone-400 text-xs flex flex-col items-center justify-center">
              <Radio className="w-8 h-8 animate-pulse text-emerald-500 mb-2" />
              <span>جاري الاتصال بغرف وحلقات القرآن الحية...</span>
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="bg-stone-900/60 rounded-2xl p-12 text-center border border-stone-800 text-stone-400 space-y-3">
              <Users className="w-10 h-10 text-stone-600 mx-auto" />
              <p className="font-bold text-sm text-stone-300">لا توجد حلقات تطابق هذا الفلتر حالياً</p>
              <p className="text-xs text-stone-500">يمكنك إنشاء حلقة جديدة وتحديد السورة ونوع التدارس فوراً.</p>
              <button
                onClick={() => { setCategoryFilter('all'); setAudienceFilter('all'); setSearchQuery(''); }}
                className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold transition-colors"
              >
                إعادة ضبط الفلاتر
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRooms.map((room) => {
                const badgeColors = {
                  tadabbur: 'bg-amber-950/60 text-amber-300 border-amber-800/40',
                  hifz: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40',
                  tajweed: 'bg-teal-950/60 text-teal-300 border-teal-800/40',
                  fatwa_qa: 'bg-purple-950/60 text-purple-300 border-purple-800/40',
                };

                return (
                  <div
                    key={room.id}
                    className="bg-stone-900 rounded-2xl p-5 border border-stone-800 hover:border-emerald-700/50 shadow-lg hover:shadow-xl transition-all flex flex-col justify-between space-y-4 group"
                  >
                    {/* Header */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badgeColors[room.category]}`}>
                          {room.categoryLabel}
                        </span>

                        <div className="flex items-center gap-2 text-xs">
                          {room.isLive && (
                            <span className="flex items-center gap-1 text-red-400 font-bold bg-red-950/50 px-2 py-0.5 rounded-full border border-red-800/40 text-[10px]">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                              مباشر الآن
                            </span>
                          )}
                          <span className="text-stone-400 flex items-center gap-1 text-[11px]">
                            <Users className="w-3.5 h-3.5 text-stone-500" />
                            {room.participantsCount} حاضر
                          </span>
                        </div>
                      </div>

                      <h3 className="font-bold text-stone-100 text-base leading-snug group-hover:text-emerald-300 transition-colors">
                        {room.title}
                      </h3>

                      <p className="text-xs text-stone-400 line-clamp-2 leading-relaxed">
                        {room.description}
                      </p>
                    </div>

                    {/* Sheikh & Quran Topic Info */}
                    <div className="space-y-2.5 pt-2 border-t border-stone-800/80 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-emerald-950 border border-emerald-700/50 flex items-center justify-center text-emerald-400 font-bold text-xs">
                            {room.sheikhHost.name[0]}
                          </div>
                          <div>
                            <div className="flex items-center gap-1 font-bold text-stone-200">
                              <span>{room.sheikhHost.name}</span>
                              {room.sheikhHost.isVerified && (
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                              )}
                            </div>
                            <span className="text-[10px] text-stone-400 block">{room.sheikhHost.title}</span>
                          </div>
                        </div>

                        {room.targetAudience === 'women_only' ? (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-pink-950/40 border border-pink-800/40 text-pink-300 text-[10px] font-bold">
                            <Lock className="w-3 h-3" />
                            أخوات فقط
                          </span>
                        ) : room.targetAudience === 'men_only' ? (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-blue-950/40 border border-blue-800/40 text-blue-300 text-[10px] font-bold">
                            مجلس رجال
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-stone-800 text-stone-400 text-[10px]">
                            عام للمسلمين
                          </span>
                        )}
                      </div>

                      {/* Surah & Ayah Badge */}
                      <div className="flex items-center justify-between bg-stone-950/70 p-2 rounded-xl border border-stone-800/60 text-[11px]">
                        <div className="flex items-center gap-1.5 text-stone-300">
                          <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                          <span>سورة {room.surahName} (الآيات {room.ayahStart} - {room.ayahEnd})</span>
                        </div>

                        {room.queue.length > 0 && (
                          <span className="text-amber-400/90 font-mono text-[10px] bg-stone-900 px-2 py-0.5 rounded">
                            طابور التسميع: {room.queue.length}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Button */}
                    <button
                      onClick={() => handleJoinRoom(room.id)}
                      className="w-full py-2.5 rounded-xl bg-emerald-700/80 hover:bg-emerald-600 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow hover:shadow-emerald-900/20 active:scale-98"
                    >
                      <span>دخول المجلس والمشاركة الآن</span>
                      <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (

        /* ========================================================================= */
        /* VIEW B: INSIDE ACTIVE ROOM (واجهة الحلقة التفاعلية المباشرة)               */
        /* ========================================================================= */
        <div className="space-y-4 animate-in fade-in duration-200">
          
          {/* Top Bar inside Room */}
          <div className="bg-stone-900 rounded-2xl p-4 border border-stone-800 shadow-xl flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={handleLeaveRoom}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-bold transition-colors"
              >
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                <span>مغادرة الحلقة</span>
              </button>

              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                  <span className="text-red-400 font-bold text-xs">مباشر الآن</span>
                  <span className="text-stone-500">|</span>
                  <span className="text-xs text-amber-400 font-bold">{activeRoom.categoryLabel}</span>
                </div>
                <h2 className="text-base sm:text-lg font-bold text-stone-100 font-quran">
                  {activeRoom.title}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-400 bg-stone-950 px-3 py-1.5 rounded-xl border border-stone-800 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>{activeRoom.participantsCount} مستمع وحاضر</span>
              </span>

              {onPlayContinuousSurah && (
                <button
                  onClick={() => onPlayContinuousSurah(activeRoom.surahId)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs font-bold transition-colors"
                  title="استماع لتلاوة السورة كاملة بدون توقف"
                >
                  <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                  <span>تلاوة كامل سورة {activeRoom.surahName}</span>
                </button>
              )}
            </div>
          </div>

          {/* Main 2-Column Halqa Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* COLUMN 1: LIVE STAGE & MUSHAF VIEWER (8 COLS) */}
            <div className="lg:col-span-8 space-y-4">
              
              {/* Audio Broadcast Stage */}
              <div className="bg-gradient-to-b from-stone-900 to-stone-950 rounded-2xl p-5 border border-emerald-800/30 shadow-xl space-y-4">
                
                {/* Speaker Stage Card */}
                <div className="bg-stone-950/80 p-5 rounded-xl border border-stone-800 text-center relative overflow-hidden">
                  <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800/40 text-[10px] text-emerald-300">
                    <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                    <span>المنصة الصوتية المباشرة</span>
                  </div>

                  {/* Speaker Wave Animation */}
                  <div className="flex items-center justify-center gap-1.5 h-12 my-2">
                    <span className="w-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]" style={{ height: '24px' }} />
                    <span className="w-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]" style={{ height: '38px' }} />
                    <span className="w-1.5 bg-amber-400 rounded-full animate-bounce [animation-delay:-0.4s]" style={{ height: '48px' }} />
                    <span className="w-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.2s]" style={{ height: '34px' }} />
                    <span className="w-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ height: '20px' }} />
                  </div>

                  <div className="mt-2">
                    <h4 className="font-bold text-lg text-stone-100 flex items-center justify-center gap-1.5">
                      <span>{activeRoom.activeSpeaker.name}</span>
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    </h4>
                    <span className="text-xs text-emerald-400/90 font-medium">
                      {activeRoom.activeSpeaker.role} (يتحدث الآن عبر المايكروفون)
                    </span>
                  </div>

                  <p className="text-xs text-stone-400 mt-2 max-w-md mx-auto">
                    المجلس يدار بآداب الاستماع والإنصات لقوله تعالى: ﴿وَإِذَا قُرِئَ الْقُرْآنُ فَاسْتَمِعُوا لَهُ وَأَنْصِتُوا لَعَلَّكُمْ تُرْحَمُونَ﴾
                  </p>
                </div>

                {/* Stage Action Controls */}
                <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsMicMuted(!isMicMuted)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        isMicMuted
                          ? 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                          : 'bg-emerald-600 text-white shadow-lg animate-pulse'
                      }`}
                    >
                      {isMicMuted ? <MicOff className="w-4 h-4 text-red-400" /> : <Mic className="w-4 h-4" />}
                      <span>{isMicMuted ? 'المايك صامت (استماع فقط)' : 'المايك نشط (أنت تتحدث)'}</span>
                    </button>

                    <button
                      id="raise-hand-action-btn"
                      onClick={() => setShowRaiseHandModal(true)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        isHandRaised
                          ? 'bg-amber-600/80 text-stone-950 font-bold border border-amber-400'
                          : 'bg-stone-800 hover:bg-stone-700 text-stone-200'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>{isHandRaised ? 'يدك مرفوعة في الطابور ✋' : 'رفع اليد للتسميع أو السؤال ✋'}</span>
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      if (onRewardPoints) {
                        onRewardPoints(20, `تم تسجيل حضورك المبارك في حلقة ${activeRoom.title}!`);
                      }
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-950/60 border border-emerald-800/40 hover:border-emerald-600 text-emerald-300 text-xs font-bold transition-colors"
                  >
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>تسجيل الحضور (+20 نقطة في المحفظة)</span>
                  </button>
                </div>
              </div>

              {/* Synchronized Quran Surah & Verses Board */}
              <div className="bg-stone-900 rounded-2xl p-5 border border-stone-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                  <div className="flex items-center gap-2 text-stone-200 font-bold text-xs">
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    <span>مصحف الحلقة المشترك: سورة {activeRoom.surahName} (الآيات {activeRoom.ayahStart} - {activeRoom.ayahEnd})</span>
                  </div>

                  <span className="text-[11px] text-stone-400 bg-stone-950 px-2.5 py-1 rounded-lg border border-stone-800">
                    رواية حفص عن عاصم
                  </span>
                </div>

                {/* Styled Quranic Passage */}
                <div className="bg-stone-950 p-6 rounded-xl border border-stone-800/90 text-center space-y-4">
                  <span className="font-quran text-amber-400 text-sm block">
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </span>
                  
                  <p className="font-quran text-xl sm:text-2xl text-amber-100/95 leading-loose font-bold tracking-wide">
                    {activeRoom.surahId === 18 ? (
                      <>
                        الْحَمْدُ لِلَّهِ الَّذِي أَنْزَلَ عَلَىٰ عَبْدِهِ الْكِتَابَ وَلَمْ يَجْعَلْ لَهُ عِوَجًا ۝١ قَيِّمًا لِيُنْذِرَ بَأْسًا شَدِيدًا مِنْ لَدُنْهُ وَيُبَشِّرَ الْمُؤْمِنِينَ الَّذِينَ يَعْمَلُونَ الصَّالِحَاتِ أَنَّ لَهُمْ أَجْرًا حَسَنًا ۝٢ مَاكِثِينَ فِيهِ أَبَدًا ۝٣ وَيُنْذِرَ الَّذِينَ قَالُوا اتَّخَذَ اللَّهُ وَلَدًا ۝٤
                      </>
                    ) : activeRoom.surahId === 78 ? (
                      <>
                        عَمَّ يَتَسَاءَلُونَ ۝١ عَنِ النَّبَإِ الْعَظِيمِ ۝٢ الَّذِي هُمْ فِيهِ مُخْتَلِفُونَ ۝٣ كَلَّا سَيَعْلَمُونَ ۝٤ ثُمَّ كَلَّا سَيَعْلَمُونَ ۝٥ أَلَمْ نَجْعَلِ الْأَرْضَ مِهَادًا ۝٦ وَالْجِبَالَ أَوْتَادًا ۝٧
                      </>
                    ) : activeRoom.surahId === 19 ? (
                      <>
                        كهيعص ۝١ ذِكْرُ رَحْمَتِ رَبِّكَ عَبْدَهُ زَكَرِيَّا ۝٢ إِذْ نَادَىٰ رَبَّهُ نِدَاءً خَفِيًّا ۝٣ قَالَ رَبِّ إِنِّي وَهَنَ الْعَظْمُ مِنِّي وَاشْتَعَلَ الرَّأْسُ شَيْبًا وَلَمْ أَكُنْ بِدُعَائِكَ رَبِّ شَقِيًّا ۝٤
                      </>
                    ) : (
                      <>
                        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ۝١ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ۝٢ الرَّحْمَٰنِ الرَّحِيمِ ۝٣ مَالِكِ يَوْمِ الدِّينِ ۝٤ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ۝٥ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ۝٦ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ ۝٧
                      </>
                    )}
                  </p>

                  <div className="pt-2 flex items-center justify-center gap-3 text-xs text-stone-400">
                    <span className="flex items-center gap-1 text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      الآيات معروضة مباشرة على شاشة جميع طلاب الحلقة
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* COLUMN 2: TABBED PANES (QUEUE, Q&A, CHAT) (4 COLS) */}
            <div className="lg:col-span-4 bg-stone-900 rounded-2xl p-4 border border-stone-800 shadow-xl flex flex-col h-[650px]">
              
              {/* Tab Selector */}
              <div className="flex items-center gap-1 p-1 bg-stone-950 rounded-xl border border-stone-800 mb-3 text-xs">
                <button
                  onClick={() => setRoomTab('queue')}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition-all text-center ${
                    roomTab === 'queue'
                      ? 'bg-emerald-700 text-white shadow'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <span>طابور التسميع ({activeRoom.queue.length})</span>
                </button>

                <button
                  onClick={() => setRoomTab('questions')}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition-all text-center ${
                    roomTab === 'questions'
                      ? 'bg-purple-700 text-white shadow'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <span>الأسئلة الشرعية ({activeRoom.questions.length})</span>
                </button>

                <button
                  onClick={() => setRoomTab('chat')}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition-all text-center ${
                    roomTab === 'chat'
                      ? 'bg-stone-800 text-stone-100 shadow'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <span>الدردشة</span>
                </button>
              </div>

              {/* TAB 1: QUEUE (طابور التسميع) */}
              {roomTab === 'queue' && (
                <div className="flex-1 flex flex-col justify-between overflow-hidden text-xs space-y-3">
                  <div className="space-y-2 overflow-y-auto pr-1 flex-1">
                    <div className="text-[11px] text-stone-400 pb-1 border-b border-stone-800 flex items-center justify-between">
                      <span>الترتيب في الدور:</span>
                      <span>طابور الحضور للتلاوة والتسميع</span>
                    </div>

                    {activeRoom.queue.length === 0 ? (
                      <div className="py-12 text-center text-stone-500 space-y-2">
                        <Users className="w-8 h-8 text-stone-600 mx-auto" />
                        <p>لا يوجد طلاب في طابور التسميع حالياً</p>
                        <p className="text-[11px]">ارفع يدك الآن لتكون التالي في تلاوة الآيات!</p>
                      </div>
                    ) : (
                      activeRoom.queue.map((item, idx) => (
                        <div
                          key={item.id}
                          className="bg-stone-950 p-3 rounded-xl border border-stone-800 flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-6 h-6 rounded-full bg-stone-800 text-stone-300 font-mono flex items-center justify-center font-bold text-xs">
                              {idx + 1}
                            </span>
                            <div>
                              <div className="font-bold text-stone-200">{item.userName}</div>
                              <span className="text-[10px] text-stone-400">
                                {item.type === 'recite' ? '🎙️ طلب تسميع وتلاوة' : '❓ طلب طرح سؤال شرعي'}
                              </span>
                              {item.questionText && (
                                <p className="text-[10px] text-amber-300/80 mt-0.5 line-clamp-1">"{item.questionText}"</p>
                              )}
                            </div>
                          </div>

                          <span className="text-[10px] text-stone-500 font-mono">{item.joinedAt}</span>
                        </div>
                      ))
                    )}
                  </div>

                  <button
                    onClick={() => setShowRaiseHandModal(true)}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow text-xs"
                  >
                    + التسجيل في طابور التسميع
                  </button>
                </div>
              )}

              {/* TAB 2: QUESTIONS & FATWAS (الأسئلة الشرعية) */}
              {roomTab === 'questions' && (
                <div className="flex-1 flex flex-col justify-between overflow-hidden text-xs space-y-3">
                  <div className="space-y-2.5 overflow-y-auto pr-1 flex-1">
                    <div className="text-[11px] text-stone-400 pb-1 border-b border-stone-800">
                      الأسئلة الموجهة للشيخ والمفتي في هذا المجلس:
                    </div>

                    {activeRoom.questions.length === 0 ? (
                      <div className="py-12 text-center text-stone-500 space-y-2">
                        <HelpCircle className="w-8 h-8 text-stone-600 mx-auto" />
                        <p>لم يطرح أحد أسئلة شرعية بعد</p>
                        <p className="text-[11px]">اكتب سؤالك في الفقه أو التفسير للشيخ أدناه.</p>
                      </div>
                    ) : (
                      activeRoom.questions.map((q) => (
                        <div
                          key={q.id}
                          className="bg-stone-950 p-3 rounded-xl border border-stone-800 space-y-2"
                        >
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="font-bold text-stone-300">{q.askerName}</span>
                            <span className={`px-2 py-0.5 rounded-full font-bold ${
                              q.status === 'answered'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40'
                                : 'bg-amber-950 text-amber-400 border border-amber-800/40'
                            }`}>
                              {q.status === 'answered' ? 'تمت الإجابة والفتوى' : 'قيد النظر والإجابة'}
                            </span>
                          </div>

                          <p className="text-xs text-stone-200 font-medium">"{q.question}"</p>

                          {q.status === 'answered' && q.answer && (
                            <div className="bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-800/30 text-[11px] text-stone-300 space-y-1">
                              <span className="font-bold text-emerald-400 flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" />
                                إجابة {q.answeredBy || 'فضيلة الشيخ'}:
                              </span>
                              <p className="leading-relaxed">{q.answer}</p>
                            </div>
                          )}

                          {q.status === 'pending' && (
                            <div className="pt-1">
                              {answeringQuestionId === q.id ? (
                                <div className="space-y-1.5">
                                  <textarea
                                    value={answerInput}
                                    onChange={(e) => setAnswerInput(e.target.value)}
                                    placeholder="اكتب الإجابة الشرعية المؤصلة..."
                                    rows={2}
                                    className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-stone-200 text-xs outline-none"
                                  />
                                  <div className="flex items-center gap-1 justify-end">
                                    <button
                                      onClick={() => setAnsweringQuestionId(null)}
                                      className="px-2 py-1 rounded bg-stone-800 text-stone-400 hover:text-stone-200 text-[10px]"
                                    >
                                      إلغاء
                                    </button>
                                    <button
                                      onClick={() => handleAnswerQuestion(q.id)}
                                      className="px-3 py-1 rounded bg-emerald-600 text-white font-bold text-[10px]"
                                    >
                                      حفظ الفتوى
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  onClick={() => { setAnsweringQuestionId(q.id); setAnswerInput(''); }}
                                  className="text-[10px] text-purple-400 hover:underline font-bold"
                                >
                                  + إجابة السؤال (خاص بالشيخ والمشرفين)
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  {/* Submit Question Form */}
                  <form onSubmit={handleAskQuestion} className="pt-2 border-t border-stone-800 flex items-center gap-2">
                    <input
                      type="text"
                      value={newQuestionText}
                      onChange={(e) => setNewQuestionText(e.target.value)}
                      placeholder="اطرح سؤالاً شرعياً في فقه الآيات..."
                      className="bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200 outline-none flex-1"
                    />
                    <button
                      type="submit"
                      disabled={!newQuestionText.trim()}
                      className="px-3 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 disabled:opacity-50 text-white font-bold transition-colors shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 3: CHAT (محادثة الحلقة) */}
              {roomTab === 'chat' && (
                <div className="flex-1 flex flex-col justify-between overflow-hidden text-xs space-y-3">
                  <div className="space-y-2 overflow-y-auto pr-1 flex-1">
                    {activeRoom.chatMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-2.5 rounded-xl text-xs space-y-1 ${
                          msg.role === 'sheikh'
                            ? 'bg-emerald-950/40 border border-emerald-800/40 text-emerald-100'
                            : msg.role === 'moderator'
                            ? 'bg-amber-950/40 border border-amber-800/40 text-amber-200'
                            : 'bg-stone-950 border border-stone-800 text-stone-300'
                        }`}
                      >
                        <div className="flex items-center justify-between text-[10px]">
                          <span className={`font-bold ${
                            msg.role === 'sheikh' ? 'text-emerald-400' : 'text-stone-300'
                          }`}>
                            {msg.senderName} {msg.role === 'sheikh' && '(الشيخ)'}
                          </span>
                          <span className="text-stone-500 font-mono">{msg.timestamp}</span>
                        </div>
                        <p className="leading-relaxed">{msg.message}</p>
                      </div>
                    ))}
                  </div>

                  {/* Send Message Form */}
                  <form onSubmit={handleSendChat} className="pt-2 border-t border-stone-800 flex items-center gap-2">
                    <input
                      type="text"
                      value={newChatMessage}
                      onChange={(e) => setNewChatMessage(e.target.value)}
                      placeholder="اكتب رسالة أو فائدة قرآنية..."
                      className="bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200 outline-none flex-1"
                    />
                    <button
                      type="submit"
                      disabled={!newChatMessage.trim()}
                      className="px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold transition-colors shrink-0"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: CREATE NEW HALQA ROOM (إنشاء حلقة جديدة)                         */}
      {/* ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Plus className="w-4 h-4" />
                <span>إنشاء حلقة قرآنية أو غرفة شرعية جديدة</span>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-stone-400 hover:text-stone-200 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRoom} className="space-y-3.5 text-xs">
              <div>
                <label className="text-stone-300 block mb-1 font-bold">عنوان الغرفة / الحلقة:</label>
                <input
                  type="text"
                  value={createTitle}
                  onChange={(e) => setCreateTitle(e.target.value)}
                  placeholder="مثال: حلقة تدبر سورة الكهف / مجلس تصحيح التلاوة"
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl p-2.5 text-stone-100 outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-300 block mb-1 font-bold">تصنيف المجلس:</label>
                  <select
                    value={createCategory}
                    onChange={(e: any) => setCreateCategory(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl p-2.5 text-stone-200 outline-none"
                  >
                    <option value="tadabbur">📖 حلقة تدبر وتفسير</option>
                    <option value="hifz">🔁 حلقة تحفيظ ومراجعة</option>
                    <option value="tajweed">🎙️ مجلس تلاوة وتجويد</option>
                    <option value="fatwa_qa">⚖️ مجلس أسئلة شرعية وفتاوى</option>
                  </select>
                </div>

                <div>
                  <label className="text-stone-300 block mb-1 font-bold">الجمهور والخصوصية الشرعية:</label>
                  <select
                    value={createAudience}
                    onChange={(e: any) => setCreateAudience(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl p-2.5 text-stone-200 outline-none"
                  >
                    <option value="all">عام للمسلمين</option>
                    <option value="men_only">مجلس رجال فقط</option>
                    <option value="women_only">مجلس نسائي خاص (بإشراف شيخة)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-stone-300 block mb-1 font-bold">اسم المشرف / الشيخ:</label>
                  <input
                    type="text"
                    value={createSheikhName}
                    onChange={(e) => setCreateSheikhName(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl p-2.5 text-stone-200 outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-stone-300 block mb-1 font-bold">صفته العلمية:</label>
                  <input
                    type="text"
                    value={createSheikhTitle}
                    onChange={(e) => setCreateSheikhTitle(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-700 rounded-xl p-2.5 text-stone-200 outline-none"
                  />
                </div>
              </div>

              {/* Surah & Ayah Target */}
              <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 space-y-2">
                <span className="text-amber-400 font-bold block text-[11px]">
                  السورة والآيات المستهدفة للمدارسة:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <label className="text-stone-400 block mb-1 text-[10px]">السورة:</label>
                    <select
                      value={createSurahId}
                      onChange={(e) => setCreateSurahId(Number(e.target.value))}
                      className="w-full bg-stone-900 border border-stone-700 rounded-lg p-1.5 text-stone-200 text-xs"
                    >
                      {ALL_SURAHS.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.id}. {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-stone-400 block mb-1 text-[10px]">من آية:</label>
                    <input
                      type="number"
                      value={createAyahStart}
                      onChange={(e) => setCreateAyahStart(Number(e.target.value))}
                      min={1}
                      className="w-full bg-stone-900 border border-stone-700 rounded-lg p-1.5 text-stone-200 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-stone-400 block mb-1 text-[10px]">إلى آية:</label>
                    <input
                      type="number"
                      value={createAyahEnd}
                      onChange={(e) => setCreateAyahEnd(Number(e.target.value))}
                      min={1}
                      className="w-full bg-stone-900 border border-stone-700 rounded-lg p-1.5 text-stone-200 text-xs"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-stone-300 block mb-1 font-bold">وصف الحلقة وأهدافها:</label>
                <textarea
                  value={createDesc}
                  onChange={(e) => setCreateDesc(e.target.value)}
                  placeholder="بيان ما سيتم مدارسته من فوائد وأحكام وضوابط الحضور..."
                  rows={2}
                  className="w-full bg-stone-950 border border-stone-700 rounded-xl p-2.5 text-stone-200 outline-none"
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
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold transition-colors"
                >
                  {isSubmittingRoom ? 'جاري الفتح...' : 'افتتاح الغرفة مباشرة'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: RAISE HAND SELECTION (رفع اليد للتسميع أو السؤال)                 */}
      {/* ========================================================================= */}
      {showRaiseHandModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-sm w-full p-5 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-2 border-b border-stone-800">
              <span className="font-bold text-stone-200 text-sm">طلب المشاركة في المجلس</span>
              <button onClick={() => setShowRaiseHandModal(false)} className="text-stone-500 hover:text-stone-300">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <span className="text-stone-400 block">حدد نوع طلبك للشيخ المشرف:</span>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRaiseType('recite')}
                  className={`p-3 rounded-xl border text-center font-bold transition-all ${
                    raiseType === 'recite'
                      ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                      : 'bg-stone-950 border-stone-800 text-stone-400 hover:bg-stone-800'
                  }`}
                >
                  <Mic className="w-4 h-4 mx-auto mb-1 text-emerald-400" />
                  <span>تسميع وتلاوة آيات</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRaiseType('question')}
                  className={`p-3 rounded-xl border text-center font-bold transition-all ${
                    raiseType === 'question'
                      ? 'bg-purple-950 border-purple-500 text-purple-300'
                      : 'bg-stone-950 border-stone-800 text-stone-400 hover:bg-stone-800'
                  }`}
                >
                  <HelpCircle className="w-4 h-4 mx-auto mb-1 text-purple-400" />
                  <span>طرح سؤال شرعي</span>
                </button>
              </div>

              {raiseType === 'question' && (
                <div>
                  <label className="text-stone-400 block mb-1">موجز السؤال (اختياري):</label>
                  <input
                    type="text"
                    value={raiseDetail}
                    onChange={(e) => setRaiseDetail(e.target.value)}
                    placeholder="مثال: حكم السهو في الصلاة..."
                    className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2 text-stone-200 text-xs"
                  />
                </div>
              )}

              <button
                onClick={handleConfirmRaiseHand}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors shadow"
              >
                تأكيد رفع اليد والانضمام للطابور
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
