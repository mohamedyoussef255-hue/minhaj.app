import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  BookOpen,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  SkipBack,
  Repeat,
  Search,
  Sparkles,
  Award,
  Clock,
  Check,
  CheckCircle2,
  Mic,
  MicOff,
  RefreshCw,
  Headphones,
  Radio,
  SlidersHorizontal,
  Bookmark,
  Layers,
  ChevronDown,
  Info,
  ChevronLeft,
  ChevronRight,
  ListMusic,
  Users,
  X,
  Copy,
  FileText,
  List,
} from 'lucide-react';
import {
  ALL_SURAHS,
  RECITERS_LIST,
  getEveryAyahAudioUrl,
  getFullSurahAudioUrl,
  SurahMeta,
  ReciterInfo,
} from '../data/quranSurahs';
import { HalaqatSection } from './HalaqatSection';
import { RecitersSelector } from './RecitersSelector';
import { HalaqatTadabburRooms } from './HalaqatTadabburRooms';
import { LiveHalaqatMiniWidget } from './LiveHalaqatMiniWidget';

interface QuranSectionProps {
  currentUser: any;
  wallet: any;
  theme?: 'dark' | 'light';
  onRewardPoints?: (points: number, message: string) => void;
}

export function QuranSection({ currentUser, wallet, theme = 'dark', onRewardPoints }: QuranSectionProps) {
  const isDark = theme === 'dark';
  // Quran Sub-tabs: 'mushaf' | 'recitation' | 'repeater' | 'halaqat' | 'tajweed' | 'plans'
  const [quranTab, setQuranTab] = useState<'mushaf' | 'recitation' | 'repeater' | 'halaqat' | 'tajweed' | 'plans'>('mushaf');

  // Selected Halqa Room for direct entry
  const [targetHalqaRoomId, setTargetHalqaRoomId] = useState<string | null>(null);
  const [targetHalqaRole, setTargetHalqaRole] = useState<'listener' | 'student_reciter' | 'questioner'>('listener');

  // Reciters Selection Modal state
  const [isRecitersModalOpen, setIsRecitersModalOpen] = useState<boolean>(false);

  // Selected Surah & Ayah state
  const [selectedSurahId, setSelectedSurahId] = useState<number>(1); // default Al-Faatiha
  const [selectedAyahNumber, setSelectedAyahNumber] = useState<number>(1);
  const [selectedReciterId, setSelectedReciterId] = useState<string>('husary_murattal');

  // Search & Filter in Mushaf
  const [surahSearch, setSurahSearch] = useState<string>('');
  const [juzFilter, setJuzFilter] = useState<number | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'مكية' | 'مدنية'>('all');
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('large');

  // Surah verses loading & cache
  const [surahVerses, setSurahVerses] = useState<any[]>([]);
  const [loadingVerses, setLoadingVerses] = useState<boolean>(false);

  // Verse details (Tafsir & Tajweed)
  const [verseDetail, setVerseDetail] = useState<any>(null);
  const [loadingVerseDetail, setLoadingVerseDetail] = useState<boolean>(false);

  // Audio Player State (Per Ayah & Continuous)
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fullSurahAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlayingAyah, setIsPlayingAyah] = useState<boolean>(false);
  const [playingAyahNumber, setPlayingAyahNumber] = useState<number | null>(null);

  // ----------------------------------------------------
  // 1. REPETITION ENGINE (عدد مرات تكرار الحفظ)
  // ----------------------------------------------------
  const [repetitionTarget, setRepetitionTarget] = useState<number>(5); // 3, 5, 7, 10, 20
  const [currentRepetition, setCurrentRepetition] = useState<number>(0);
  const [isRepeating, setIsRepeating] = useState<boolean>(false);
  const [pauseBetweenReps, setPauseBetweenReps] = useState<number>(1.5); // seconds
  const [autoAdvanceAyah, setAutoAdvanceAyah] = useState<boolean>(true);
  const [repetitionCompletedMessage, setRepetitionCompletedMessage] = useState<string | null>(null);

  // ----------------------------------------------------
  // 2. FULL SURAH PLAYER (التلاوة العادية للقراء)
  // ----------------------------------------------------
  const [isPlayingFullSurah, setIsPlayingFullSurah] = useState<boolean>(false);
  const [fullSurahTime, setFullSurahTime] = useState<number>(0);
  const [fullSurahDuration, setFullSurahDuration] = useState<number>(0);
  const [fullSurahSpeed, setFullSurahSpeed] = useState<number>(1.0);
  const [autoNextSurah, setAutoNextSurah] = useState<boolean>(true);

  // ----------------------------------------------------
  // 3. TAJWEED & MIC RECORDING (المختبر الصوتي)
  // ----------------------------------------------------
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [evaluatingTajweed, setEvaluatingTajweed] = useState(false);
  const [aiTajweedEval, setAiTajweedEval] = useState<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  // ----------------------------------------------------
  // 4. HIFZ PLANS (خطط الحفظ)
  // ----------------------------------------------------
  const [hifzPlans, setHifzPlans] = useState<any[]>([
    {
      id: 'hp-1',
      surahName: 'سورة الكهف',
      verseStart: 1,
      verseEnd: 10,
      targetDate: '2026-09-20',
      repetitionCount: 10,
      isCompleted: false,
      tajweedNotes: 'التركيز على إخفاء النون عند حرف الكاف وقلقلة الدال',
    },
    {
      id: 'hp-2',
      surahName: 'سورة النور',
      verseStart: 30,
      verseEnd: 35,
      targetDate: '2026-09-25',
      repetitionCount: 7,
      isCompleted: true,
      tajweedNotes: 'المد المتصل في (سَمَاء) وتفخيم اللام في اسم الجلالة',
    },
    {
      id: 'hp-3',
      surahName: 'سورة الملك',
      verseStart: 1,
      verseEnd: 30,
      targetDate: '2026-09-30',
      repetitionCount: 5,
      isCompleted: false,
      tajweedNotes: 'تثبيت السورة كاملة للورد اليومي قبل النوم',
    },
  ]);
  const [newPlanSurah, setNewPlanSurah] = useState('سورة مريم');
  const [newPlanStart, setNewPlanStart] = useState(1);
  const [newPlanEnd, setNewPlanEnd] = useState(15);
  const [newPlanReps, setNewPlanReps] = useState(10);
  const [newPlanDate, setNewPlanDate] = useState('2026-10-01');
  const [isAddingPlan, setIsAddingPlan] = useState(false);

  // Fetch active Surah verses
  const currentSurahMeta = ALL_SURAHS.find(s => s.id === selectedSurahId) || ALL_SURAHS[0];
  const currentReciter = RECITERS_LIST.find(r => r.id === selectedReciterId) || RECITERS_LIST[0];

  // Book View & Page Flip State
  const [mushafViewMode, setMushafViewMode] = useState<'book' | 'list'>('book');
  const [currentBookPage, setCurrentBookPage] = useState<number>(() => currentSurahMeta.page || 1);
  const [showTafsirDrawer, setShowTafsirDrawer] = useState<boolean>(true);
  const [isContinuousPageRecitation, setIsContinuousPageRecitation] = useState<boolean>(false);
  const [copiedTafsir, setCopiedTafsir] = useState<boolean>(false);
  const [pageJumpInput, setPageJumpInput] = useState<string>('');

  // Arabic digit converter for end of Ayah symbol
  const toArabicDigits = (num: number) =>
    num.toString().replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[parseInt(d, 10)]);

  // Load verses when Surah changes
  useEffect(() => {
    setSelectedAyahNumber(1);
    setIsPlayingAyah(false);
    setIsRepeating(false);
    setIsContinuousPageRecitation(false);
    setPlayingAyahNumber(null);
    loadSurahVerses(selectedSurahId);
    loadVerseDetail(selectedSurahId, 1);
    const s = ALL_SURAHS.find(sur => sur.id === selectedSurahId);
    if (s && s.page) {
      setCurrentBookPage(s.page);
    }
  }, [selectedSurahId]);

  // Load verse detail when Ayah changes
  useEffect(() => {
    loadVerseDetail(selectedSurahId, selectedAyahNumber);
    const targetVerse = surahVerses.find(v => v.numberInSurah === selectedAyahNumber);
    if (targetVerse?.page && targetVerse.page !== currentBookPage) {
      setCurrentBookPage(targetVerse.page);
    }
  }, [selectedAyahNumber]);

  // Pages present in the active surah
  const surahPages = useMemo(() => {
    if (surahVerses.length === 0) return [currentSurahMeta.page];
    const pages = Array.from(new Set(surahVerses.map(v => v.page).filter(Boolean))) as number[];
    return pages.length > 0 ? pages.sort((a, b) => a - b) : [currentSurahMeta.page];
  }, [surahVerses, currentSurahMeta.page]);

  // Verses specifically on currentBookPage
  const currentPageVerses = useMemo(() => {
    if (surahVerses.length === 0) return [];
    const onPage = surahVerses.filter(v => v.page === currentBookPage);
    return onPage.length > 0 ? onPage : surahVerses;
  }, [surahVerses, currentBookPage]);

  // Flip to next page
  const handleNextPage = () => {
    if (currentBookPage < 604) {
      const newPage = currentBookPage + 1;
      setCurrentBookPage(newPage);
      const v = surahVerses.find(verse => verse.page === newPage);
      if (v) {
        setSelectedAyahNumber(v.numberInSurah);
      }
    }
  };

  // Flip to previous page
  const handlePrevPage = () => {
    if (currentBookPage > 1) {
      const newPage = currentBookPage - 1;
      setCurrentBookPage(newPage);
      const v = surahVerses.find(verse => verse.page === newPage);
      if (v) {
        setSelectedAyahNumber(v.numberInSurah);
      }
    }
  };

  const handleJumpToPage = (targetPage: number) => {
    const valid = Math.max(1, Math.min(604, targetPage));
    setCurrentBookPage(valid);
    const v = surahVerses.find(verse => verse.page === valid);
    if (v) {
      setSelectedAyahNumber(v.numberInSurah);
    }
  };

  const toggleContinuousPageRecitation = () => {
    if (isContinuousPageRecitation) {
      setIsContinuousPageRecitation(false);
      if (audioRef.current) audioRef.current.pause();
      setIsPlayingAyah(false);
    } else {
      setIsContinuousPageRecitation(true);
      const firstVerseOnPage = currentPageVerses[0]?.numberInSurah || selectedAyahNumber;
      setSelectedAyahNumber(firstVerseOnPage);
      playAyah(firstVerseOnPage);
    }
  };

  const loadSurahVerses = async (surahId: number) => {
    setLoadingVerses(true);
    try {
      const res = await fetch(`/api/v1/quran/surah/${surahId}`);
      if (res.ok) {
        const data = await res.json();
        const ayahs = data.ayahs || [];
        setSurahVerses(ayahs);
        if (ayahs.length > 0 && ayahs[0].page) {
          setCurrentBookPage(ayahs[0].page);
        }
      }
    } catch (err) {
      console.error('Failed to load surah verses:', err);
    } finally {
      setLoadingVerses(false);
    }
  };

  const loadVerseDetail = async (surahId: number, ayahNum: number) => {
    setLoadingVerseDetail(true);
    try {
      const res = await fetch(`/api/v1/quran/verse-details?surah=${surahId}&ayah=${ayahNum}&reciter=${selectedReciterId}`);
      if (res.ok) {
        const data = await res.json();
        setVerseDetail(data);
      }
    } catch (err) {
      console.error('Failed to load verse details:', err);
    } finally {
      setLoadingVerseDetail(false);
    }
  };

  // Play a specific Ayah with the chosen reciter
  const playAyah = (ayahNum: number) => {
    if (!audioRef.current) return;

    // If already playing this Ayah, pause it
    if (isPlayingAyah && playingAyahNumber === ayahNum && !isRepeating && !isContinuousPageRecitation) {
      audioRef.current.pause();
      setIsPlayingAyah(false);
      return;
    }

    const targetVerse = surahVerses.find(v => v.numberInSurah === ayahNum);
    if (targetVerse?.page && targetVerse.page !== currentBookPage) {
      setCurrentBookPage(targetVerse.page);
    }

    const audioUrl = getEveryAyahAudioUrl(currentReciter.everyAyahFolder, selectedSurahId, ayahNum);
    audioRef.current.src = audioUrl;
    audioRef.current.currentTime = 0;
    audioRef.current.play().then(() => {
      setIsPlayingAyah(true);
      setPlayingAyahNumber(ayahNum);
      setSelectedAyahNumber(ayahNum);
    }).catch(e => {
      console.warn('Audio playback error:', e);
    });
  };

  // ----------------------------------------------------
  // Repetition Loop Handler
  // ----------------------------------------------------
  const startRepetitionLoop = () => {
    if (isRepeating) {
      // Stop repetition
      setIsRepeating(false);
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setIsPlayingAyah(false);
      return;
    }

    setIsRepeating(true);
    setCurrentRepetition(1);
    setRepetitionCompletedMessage(null);
    playAyah(selectedAyahNumber);
  };

  const handleAudioEnded = () => {
    if (isRepeating) {
      if (currentRepetition < repetitionTarget) {
        // Next repetition with optional pause
        setTimeout(() => {
          if (isRepeating) {
            setCurrentRepetition(prev => prev + 1);
            if (audioRef.current) {
              audioRef.current.currentTime = 0;
              audioRef.current.play().catch(e => console.warn(e));
            }
          }
        }, pauseBetweenReps * 1000);
      } else {
        // Finished repetition set!
        setIsRepeating(false);
        setIsPlayingAyah(false);
        const msg = `هنيئاً لك! أتممت تكرار الآية (${selectedAyahNumber}) من ${currentSurahMeta.name} ${repetitionTarget} مرات لتثبيت الحفظ في الصدر.`;
        setRepetitionCompletedMessage(msg);

        // Notify server and reward points
        fetch('/api/v1/hifz/repetition-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser?.id,
            surahNumber: selectedSurahId,
            ayahNumber: selectedAyahNumber,
            repetitionCount: repetitionTarget,
          }),
        }).then(r => r.json()).then(data => {
          if (data.bonusPoints && onRewardPoints) {
            onRewardPoints(data.bonusPoints, data.message);
          }
        }).catch(err => console.error(err));

        // Auto advance to next ayah if enabled
        if (autoAdvanceAyah && selectedAyahNumber < currentSurahMeta.ayasCount) {
          const nextAyah = selectedAyahNumber + 1;
          setSelectedAyahNumber(nextAyah);
        }
      }
    } else if (isContinuousPageRecitation) {
      // Auto-advance to next Ayah and flip page if needed
      if (selectedAyahNumber < currentSurahMeta.ayasCount) {
        const nextAyah = selectedAyahNumber + 1;
        setSelectedAyahNumber(nextAyah);
        const nextV = surahVerses.find((v) => v.numberInSurah === nextAyah);
        if (nextV?.page && nextV.page !== currentBookPage) {
          setCurrentBookPage(nextV.page);
        }
        playAyah(nextAyah);
      } else {
        setIsContinuousPageRecitation(false);
        setIsPlayingAyah(false);
        setPlayingAyahNumber(null);
      }
    } else {
      setIsPlayingAyah(false);
      setPlayingAyahNumber(null);
    }
  };

  // ----------------------------------------------------
  // Full Surah Continuous Player Controls
  // ----------------------------------------------------
  const togglePlayFullSurah = (overrideSurahId?: number | unknown) => {
    if (!fullSurahAudioRef.current) return;

    const validNum = typeof overrideSurahId === 'number' && !isNaN(overrideSurahId) ? overrideSurahId : undefined;
    const targetSurahId = validNum !== undefined ? validNum : selectedSurahId;
    if (validNum !== undefined && validNum !== selectedSurahId) {
      setSelectedSurahId(validNum);
      setSelectedAyahNumber(1);
    }

    if (isPlayingFullSurah && validNum === undefined) {
      fullSurahAudioRef.current.pause();
      setIsPlayingFullSurah(false);
    } else {
      const fullUrl = getFullSurahAudioUrl(currentReciter.fullSurahServerUrl, targetSurahId);
      fullSurahAudioRef.current.src = fullUrl;
      fullSurahAudioRef.current.playbackRate = fullSurahSpeed;
      fullSurahAudioRef.current.play().then(() => {
        setIsPlayingFullSurah(true);
      }).catch(err => {
        console.warn('Full surah play error:', err);
      });
    }
  };

  const changeReciter = (reciterId: string) => {
    setSelectedReciterId(reciterId);
    const reciter = RECITERS_LIST.find(r => r.id === reciterId);
    if (isPlayingFullSurah && fullSurahAudioRef.current && reciter) {
      const fullUrl = getFullSurahAudioUrl(reciter.fullSurahServerUrl, selectedSurahId);
      fullSurahAudioRef.current.src = fullUrl;
      fullSurahAudioRef.current.play().catch(e => console.warn(e));
    }
    if (isPlayingAyah && audioRef.current && reciter) {
      const ayahUrl = getEveryAyahAudioUrl(reciter.everyAyahFolder, selectedSurahId, selectedAyahNumber);
      audioRef.current.src = ayahUrl;
      audioRef.current.play().catch(e => console.warn(e));
    }
  };

  const handleNextSurah = () => {
    if (selectedSurahId < 114) {
      const nextId = selectedSurahId + 1;
      setSelectedSurahId(nextId);
      setSelectedAyahNumber(1);
      if (isPlayingFullSurah && fullSurahAudioRef.current) {
        const nextSurah = ALL_SURAHS.find(s => s.id === nextId);
        if (nextSurah) {
          fullSurahAudioRef.current.src = getFullSurahAudioUrl(currentReciter.fullSurahServerUrl, nextId);
          fullSurahAudioRef.current.play().catch(e => console.warn(e));
        }
      }
    }
  };

  const handlePrevSurah = () => {
    if (selectedSurahId > 1) {
      const prevId = selectedSurahId - 1;
      setSelectedSurahId(prevId);
      setSelectedAyahNumber(1);
      if (isPlayingFullSurah && fullSurahAudioRef.current) {
        fullSurahAudioRef.current.src = getFullSurahAudioUrl(currentReciter.fullSurahServerUrl, prevId);
        fullSurahAudioRef.current.play().catch(e => console.warn(e));
      }
    }
  };

  // Filtered Surahs List for the Mushaf Directory
  const filteredSurahs = ALL_SURAHS.filter(surah => {
    const matchesSearch =
      surah.name.includes(surahSearch) ||
      surah.englishName.toLowerCase().includes(surahSearch.toLowerCase()) ||
      String(surah.id) === surahSearch;
    const matchesType = typeFilter === 'all' || surah.type === typeFilter;
    const matchesJuz = juzFilter === 'all' || surah.juz === juzFilter;
    return matchesSearch && matchesType && matchesJuz;
  });

  // Tajweed Recording handlers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
        evaluateTajweedWithAi();
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingDuration(0);
      setAiTajweedEval(null);

      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const evaluateTajweedWithAi = async () => {
    setEvaluatingTajweed(true);
    try {
      const res = await fetch('/api/v1/quran/evaluate-tajweed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verseText: verseDetail?.text || 'الآية الكريمة',
          surah: selectedSurahId,
          ayah: selectedAyahNumber,
        }),
      });
      const data = await res.json();
      setAiTajweedEval(data.evaluation);
    } catch (err) {
      console.error(err);
    } finally {
      setEvaluatingTajweed(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div id="quran-root-section" className="space-y-4 animate-in fade-in duration-200">
      {/* Hidden Audio Elements */}
      <audio
        ref={audioRef}
        onEnded={handleAudioEnded}
        onError={() => {
          setIsPlayingAyah(false);
          setIsRepeating(false);
        }}
      />
      <audio
        ref={fullSurahAudioRef}
        onTimeUpdate={() => {
          if (fullSurahAudioRef.current) {
            setFullSurahTime(fullSurahAudioRef.current.currentTime);
            setFullSurahDuration(fullSurahAudioRef.current.duration || 0);
          }
        }}
        onEnded={() => {
          setIsPlayingFullSurah(false);
          if (autoNextSurah && selectedSurahId < 114) {
            handleNextSurah();
          }
        }}
      />

      {/* 🧭 Top Navigation for Quran Views */}
      <div className={`p-1.5 rounded-2xl flex flex-wrap items-center justify-between gap-1 text-xs border transition-colors ${
        isDark ? 'bg-stone-900/90 border-stone-800' : 'bg-white border-[#cde2ec] shadow-sm'
      }`}>
        <div className="flex items-center gap-1 overflow-x-auto py-0.5 max-w-full">
          <button
            id="tab-mushaf-btn"
            onClick={() => setQuranTab('mushaf')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${
              quranTab === 'mushaf'
                ? 'bg-cyan-700 text-white shadow'
                : isDark
                ? 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                : 'text-[#335568] hover:text-[#0a2737] hover:bg-[#f0f7fa]'
            }`}
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>المصحف الشريف (١١٤ سورة)</span>
          </button>

          <button
            id="tab-recitation-btn"
            onClick={() => setQuranTab('recitation')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${
              quranTab === 'recitation'
                ? 'bg-cyan-700 text-white shadow'
                : isDark
                ? 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                : 'text-[#335568] hover:text-[#0a2737] hover:bg-[#f0f7fa]'
            }`}
          >
            <Headphones className="w-4 h-4 text-cyan-400" />
            <span>التلاوة ومشغل القراء</span>
          </button>

          <button
            id="tab-repeater-btn"
            onClick={() => setQuranTab('repeater')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${
              quranTab === 'repeater'
                ? 'bg-amber-500 text-stone-950 shadow font-black'
                : isDark
                ? 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                : 'text-[#335568] hover:text-[#0a2737] hover:bg-[#f0f7fa]'
            }`}
          >
            <Repeat className="w-4 h-4" />
            <span>تكرار الآيات للحفظ</span>
          </button>

          <button
            id="tab-halaqat-btn"
            onClick={() => setQuranTab('halaqat')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold transition-all whitespace-nowrap relative ${
              quranTab === 'halaqat'
                ? 'bg-gradient-to-r from-cyan-600 via-teal-600 to-cyan-500 text-white shadow-lg'
                : isDark
                ? 'text-stone-300 hover:text-stone-100 hover:bg-stone-800'
                : 'text-[#335568] hover:text-[#0a2737] hover:bg-[#f0f7fa]'
            }`}
          >
            <Radio className="w-4 h-4 text-red-400 animate-pulse" />
            <span>حلقات الحفظ والتدبر (غرف)</span>
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          </button>

          <button
            id="tab-tajweed-btn"
            onClick={() => setQuranTab('tajweed')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${
              quranTab === 'tajweed'
                ? 'bg-cyan-700 text-white shadow'
                : isDark
                ? 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                : 'text-[#335568] hover:text-[#0a2737] hover:bg-[#f0f7fa]'
            }`}
          >
            <Mic className="w-4 h-4 text-amber-400" />
            <span>مختبر التسميع والذكاء</span>
          </button>

          <button
            id="tab-plans-btn"
            onClick={() => setQuranTab('plans')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${
              quranTab === 'plans'
                ? 'bg-cyan-700 text-white shadow'
                : isDark
                ? 'text-stone-400 hover:text-stone-200 hover:bg-stone-800'
                : 'text-[#335568] hover:text-[#0a2737] hover:bg-[#f0f7fa]'
            }`}
          >
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>خطط الحفظ</span>
          </button>
        </div>

        {/* Global Active Reciter Button Banner */}
        <button
          id="open-reciters-modal-btn"
          onClick={() => setIsRecitersModalOpen(true)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-[11px] transition-all shadow-sm group ${
            isDark
              ? 'bg-stone-950 hover:bg-stone-850 hover:border-cyan-700/60 border-stone-800 text-stone-300'
              : 'bg-[#f4f8fa] hover:bg-[#eaf3f7] border-[#cde2ec] text-[#0a2737]'
          }`}
          title="عرض قائمة اختيار القراء الكرام لاختيار قارئك المفضل"
        >
          <Volume2 className="w-3.5 h-3.5 text-amber-400 shrink-0 group-hover:scale-110 transition-transform" />
          <div className="flex items-center gap-1.5">
            <span className={isDark ? 'text-stone-400 hidden sm:inline' : 'text-[#335568] hidden sm:inline'}>
              القارئ:
            </span>
            <span className="text-amber-400 font-bold text-xs">{currentReciter.name}</span>
          </div>
          <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono transition-colors ${
            isDark ? 'bg-stone-800 text-stone-300 group-hover:bg-cyan-800 group-hover:text-white' : 'bg-[#e2eef3] text-[#0369a1] group-hover:bg-[#0891b2] group-hover:text-white'
          }`}>
            تغيير (١٧) ▾
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. MUSHAF VIEW: ALL 114 SURAHS BROWSER & READING                          */}
      {/* ========================================================================= */}
      {quranTab === 'mushaf' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          {/* Live Halaqat Mini Widget: واجهة مصغرة تفاعلية لعرض الحلقات المباشرة */}
          <LiveHalaqatMiniWidget
            currentUser={currentUser}
            onJoinRoom={(roomId, role) => {
              setTargetHalqaRoomId(roomId);
              setTargetHalqaRole(role);
              setQuranTab('halaqat');
            }}
            onOpenFullRooms={() => {
              setTargetHalqaRoomId(null);
              setQuranTab('halaqat');
            }}
            onRewardPoints={onRewardPoints}
            onPlayContinuousSurah={(surahId, reciterId) => {
              if (reciterId) {
                changeReciter(reciterId);
              }
              togglePlayFullSurah(surahId);
            }}
          />

          {/* Quick Surah & Juz Selector Banner */}
          <div className={`rounded-2xl p-4 border shadow-xl space-y-3 transition-colors ${
            isDark ? 'bg-stone-900 border-stone-800' : 'bg-white border-[#cde2ec]'
          }`}>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className={`font-bold text-sm flex items-center gap-2 ${
                  isDark ? 'text-stone-100' : 'text-[#0a2737]'
                }`}>
                  <BookOpen className="w-4 h-4 text-cyan-500" />
                  <span>المصحف الشريف الكامل — فهرس الـ ١١٤ سورة</span>
                </h3>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-stone-400' : 'text-[#335568]'}`}>
                  تصفح القرآن الكريم كاملاً، استمع لكل آية بصوت قارئك المختار، أو شغّل تكرار الحفظ بلمسة واحدة.
                </p>
              </div>

              {/* Font Size & Reading Controls */}
              <div className={`flex items-center gap-1.5 p-1 rounded-xl border text-xs ${
                isDark ? 'bg-stone-950 border-stone-800' : 'bg-[#f4f8fa] border-[#cde2ec]'
              }`}>
                <span className={`text-[11px] px-1 ${isDark ? 'text-stone-400' : 'text-[#335568]'}`}>حجم الخط:</span>
                <button
                  onClick={() => setFontSize('normal')}
                  className={`px-2 py-1 rounded-lg transition-colors ${fontSize === 'normal' ? 'bg-cyan-700 text-white' : isDark ? 'text-stone-400' : 'text-[#335568]'}`}
                >
                  صغير
                </button>
                <button
                  onClick={() => setFontSize('large')}
                  className={`px-2 py-1 rounded-lg transition-colors ${fontSize === 'large' ? 'bg-cyan-700 text-white' : isDark ? 'text-stone-400' : 'text-[#335568]'}`}
                >
                  متوسط
                </button>
                <button
                  onClick={() => setFontSize('xlarge')}
                  className={`px-2 py-1 rounded-lg transition-colors ${fontSize === 'xlarge' ? 'bg-cyan-700 text-white' : isDark ? 'text-stone-400' : 'text-[#335568]'}`}
                >
                  كبير
                </button>
              </div>
            </div>

            {/* Search and Filters for Surahs */}
            <div className={`grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2 border-t ${
              isDark ? 'border-stone-800/80' : 'border-[#cde2ec]'
            }`}>
              <div className="sm:col-span-2 relative">
                <Search className="w-4 h-4 text-stone-400 absolute right-3 top-2.5" />
                <input
                  type="text"
                  placeholder="ابحث عن اسم السورة (مثلاً: الكهف، مريم، البقرة) أو رقمها..."
                  value={surahSearch}
                  onChange={(e) => setSurahSearch(e.target.value)}
                  className={`w-full border rounded-xl pr-9 pl-3 py-2 text-xs outline-none transition-colors ${
                    isDark
                      ? 'bg-stone-950 border-stone-800 text-stone-200 placeholder-stone-500 focus:border-cyan-500'
                      : 'bg-[#f4f8fa] border-[#cde2ec] text-[#0a2737] placeholder-[#64748b] focus:border-[#0891b2]'
                  }`}
                />
              </div>

              <div>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as any)}
                  className={`w-full border rounded-xl px-3 py-2 text-xs outline-none transition-colors ${
                    isDark
                      ? 'bg-stone-950 border-stone-800 text-stone-300 focus:border-cyan-500'
                      : 'bg-[#f4f8fa] border-[#cde2ec] text-[#0a2737] focus:border-[#0891b2]'
                  }`}
                >
                  <option value="all">جميع السور (مكية ومدنية)</option>
                  <option value="مكية">السور المكية فقط</option>
                  <option value="مدنية">السور المدنية فقط</option>
                </select>
              </div>

              <div>
                <select
                  value={juzFilter === 'all' ? 'all' : String(juzFilter)}
                  onChange={(e) => setJuzFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  className={`w-full border rounded-xl px-3 py-2 text-xs outline-none transition-colors ${
                    isDark
                      ? 'bg-stone-950 border-stone-800 text-stone-300 focus:border-cyan-500'
                      : 'bg-[#f4f8fa] border-[#cde2ec] text-[#0a2737] focus:border-[#0891b2]'
                  }`}
                >
                  <option value="all">جميع الأجزاء (٣٠ جزءاً)</option>
                  {Array.from({ length: 30 }, (_, i) => (
                    <option key={i + 1} value={i + 1}>
                      الجزء {i + 1}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Horizontal Scrollable Quick Surahs Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 text-xs no-scrollbar">
              {filteredSurahs.slice(0, 25).map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setSelectedSurahId(s.id);
                    setSelectedAyahNumber(1);
                  }}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap text-xs transition-all flex items-center gap-1.5 shrink-0 ${
                    selectedSurahId === s.id
                      ? 'bg-amber-500 text-stone-950 font-black shadow-md'
                      : isDark
                      ? 'bg-stone-950 hover:bg-stone-800 text-stone-300 border border-stone-800'
                      : 'bg-[#f4f8fa] hover:bg-[#eaf3f7] text-[#0a2737] border border-[#cde2ec]'
                  }`}
                >
                  <span className="opacity-70 text-[10px] font-mono">#{s.id}</span>
                  <span>{s.name}</span>
                  <span className="text-[10px] opacity-60">({s.ayasCount})</span>
                </button>
              ))}
              {filteredSurahs.length > 25 && (
                <span className={`text-xs px-2 self-center shrink-0 ${isDark ? 'text-stone-500' : 'text-[#64748b]'}`}>
                  +{filteredSurahs.length - 25} سورة أخرى في القائمة
                </span>
              )}
            </div>
          </div>

          {/* ACTIVE SURAH HEADER & VERSES DISPLAY */}
          <div className={`rounded-2xl p-5 border shadow-2xl relative overflow-hidden transition-colors ${
            isDark ? 'bg-stone-900 border-cyan-800/30' : 'bg-white border-[#cde2ec]'
          }`}>
            {/* Surah Header Card */}
            <div className={`rounded-xl p-4 border mb-5 flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors ${
              isDark ? 'bg-stone-950/90 border-stone-800' : 'bg-[#f4f8fa] border-[#cde2ec]'
            }`}>
              <div className="flex items-center gap-3 text-right">
                <div className={`w-12 h-12 rounded-2xl border flex flex-col items-center justify-center shrink-0 font-mono font-bold shadow-inner ${
                  isDark ? 'bg-cyan-950 border-cyan-700/60 text-cyan-300' : 'bg-[#e0f2fe] border-[#7dd3fc] text-[#0369a1]'
                }`}>
                  <span className="text-[10px]">رقم</span>
                  <span className="text-base">{currentSurahMeta.id}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl sm:text-2xl font-black text-amber-500 font-quran">
                      سورة {currentSurahMeta.name}
                    </h2>
                    <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium border ${
                      isDark ? 'bg-stone-800 text-stone-300 border-stone-700' : 'bg-white text-[#335568] border-[#cde2ec]'
                    }`}>
                      {currentSurahMeta.type}
                    </span>
                  </div>
                  <div className={`text-xs mt-0.5 flex items-center gap-3 ${
                    isDark ? 'text-stone-400' : 'text-[#335568]'
                  }`}>
                    <span>عدد آياتها: {currentSurahMeta.ayasCount} آية</span>
                    <span>الجزء: {currentSurahMeta.juz}</span>
                    <span>الصفحة: {currentSurahMeta.page}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions for this Surah */}
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  id="play-continuous-surah-btn"
                  onClick={() => togglePlayFullSurah()}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 ${
                    isPlayingFullSurah
                      ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 font-black animate-pulse shadow-amber-900/40'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40'
                  }`}
                  title="الاستماع لتلاوة السورة كاملة متواصلة بدون توقف"
                >
                  {isPlayingFullSurah ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
                  <span>{isPlayingFullSurah ? 'إيقاف التلاوة المتواصلة' : 'تشغيل السورة كاملة باستمرار ▷'}</span>
                </button>

                <button
                  onClick={() => {
                    setQuranTab('recitation');
                    if (!isPlayingFullSurah) togglePlayFullSurah();
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold transition-all shadow"
                  title="فتح مشغل القراء المتقدم"
                >
                  <Headphones className="w-3.5 h-3.5 text-emerald-400" />
                  <span>مشغل القراء</span>
                </button>

                <button
                  onClick={() => {
                    setQuranTab('repeater');
                    setSelectedAyahNumber(1);
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold transition-all shadow"
                  title="بدء تكرار آيات السورة للحفظ"
                >
                  <Repeat className="w-3.5 h-3.5" />
                  <span>تكرار الحفظ</span>
                </button>
              </div>
            </div>

            {/* Continuous Full Surah Recitation Status Banner */}
            <div className="bg-gradient-to-r from-stone-950 via-emerald-950/30 to-stone-950 p-3 rounded-xl border border-emerald-800/30 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex flex-wrap items-center gap-2 text-stone-300">
                <Volume2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  <strong>التلاوة المتواصلة:</strong> بصوت{' '}
                  <button
                    onClick={() => setIsRecitersModalOpen(true)}
                    className="text-amber-300 font-bold hover:underline hover:text-amber-200 inline-flex items-center gap-1"
                    title="انقر لتغيير القارئ المفضل"
                  >
                    <span>{currentReciter.name}</span>
                    <span className="text-[10px] bg-stone-800 px-1.5 py-0.5 rounded text-stone-300">تبديل ▾</span>
                  </button>
                  <span className="text-stone-400 text-[11px] mr-1 hidden sm:inline">({currentReciter.subName})</span>
                </span>
                {isPlayingFullSurah && (
                  <span className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/70 px-2 py-0.5 rounded-full border border-emerald-800/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    قيد التلاوة المستمرة الآن ({formatTime(fullSurahTime)} / {formatTime(fullSurahDuration)})
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 text-[11px]">
                <button
                  onClick={() => setIsRecitersModalOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-stone-900 hover:bg-stone-800 text-amber-300 border border-stone-800 hover:border-amber-500/40 font-bold flex items-center gap-1 transition-all"
                >
                  <Headphones className="w-3.5 h-3.5 text-amber-400" />
                  <span>قائمة اختيار القراء ({RECITERS_LIST.length})</span>
                </button>

                <button
                  onClick={() => setQuranTab('halaqat')}
                  className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 hover:underline font-bold"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>مدارسة هذه السورة في الحلقات ⮌</span>
                </button>
              </div>
            </div>

            {/* View Mode Toggle: Book Format (مصحف الصفحات) vs Detailed List */}
            <div className={`flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl border mb-3 ${
              isDark ? 'bg-stone-950/60 border-stone-800' : 'bg-[#f4f8fa] border-[#cde2ec]'
            }`}>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setMushafViewMode('book')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    mushafViewMode === 'book'
                      ? 'bg-amber-600 hover:bg-amber-500 text-stone-950 shadow-md font-extrabold'
                      : isDark
                      ? 'bg-stone-900 text-stone-300 hover:text-white'
                      : 'bg-[#e2edf2] text-[#0a2737]'
                  }`}
                  title="عرض صفحات المصحف الشريف وتقليب الصفحات أثناء القراءة والتلاوة"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>كتاب المصحف الشريف (تقليب الصفحات)</span>
                </button>

                <button
                  onClick={() => setMushafViewMode('list')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    mushafViewMode === 'list'
                      ? 'bg-cyan-700 hover:bg-cyan-600 text-white shadow-md font-extrabold'
                      : isDark
                      ? 'bg-stone-900 text-stone-300 hover:text-white'
                      : 'bg-[#e2edf2] text-[#0a2737]'
                  }`}
                  title="عرض الآيات في قائمة تفصيلية مع خيارات كل آية"
                >
                  <List className="w-3.5 h-3.5" />
                  <span>قائمة الآيات المفصلة</span>
                </button>
              </div>

              {/* Tafsir Drawer Toggle */}
              <button
                onClick={() => setShowTafsirDrawer(!showTafsirDrawer)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  showTafsirDrawer
                    ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-stone-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{showTafsirDrawer ? 'إخفاء لوحة التفسير وأسباب النزول' : 'إظهار لوحة التفسير وأسباب النزول'}</span>
              </button>
            </div>

            {/* ========================================================================= */}
            {/* VIEW A: BOOK VIEW (شكل كتاب المصحف الشريف مع تقليب الصفحات والتلاوة)      */}
            {/* ========================================================================= */}
            {mushafViewMode === 'book' ? (
              <div className="space-y-4">
                {/* Book Navigation Bar (Top) */}
                <div className={`p-3 rounded-2xl border flex flex-wrap items-center justify-between gap-3 ${
                  isDark ? 'bg-stone-900/90 border-amber-500/30' : 'bg-[#fdfaf2] border-amber-300/80 shadow-xs'
                }`}>
                  {/* Previous / Next Page Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePrevPage}
                      disabled={currentBookPage <= 1}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 disabled:opacity-40 text-amber-300 text-xs font-bold transition-all border border-stone-700"
                      title="الانتقال إلى الصفحة السابقة"
                    >
                      <ChevronRight className="w-4 h-4" />
                      <span>الصفحة السابقة</span>
                    </button>

                    <div className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-200 font-mono">
                      <span>صفحة</span>
                      <span className="text-amber-400 font-extrabold">{currentBookPage}</span>
                      <span className="text-stone-500">/ ٦٠٤</span>
                    </div>

                    <button
                      onClick={handleNextPage}
                      disabled={currentBookPage >= 604}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 disabled:opacity-40 text-amber-300 text-xs font-bold transition-all border border-stone-700"
                      title="الانتقال إلى الصفحة التالية"
                    >
                      <span>الصفحة التالية</span>
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Continuous Page Recitation with Auto Page Turn */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={toggleContinuousPageRecitation}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow ${
                        isContinuousPageRecitation
                          ? 'bg-amber-500 text-stone-950 font-black animate-pulse ring-2 ring-amber-400'
                          : 'bg-emerald-700 hover:bg-emerald-600 text-white'
                      }`}
                      title="تلاوة متواصلة آية بآية مع تقليب صفحات المصحف تلقائياً عند انتهاء الصفحة"
                    >
                      {isContinuousPageRecitation ? (
                        <>
                          <Pause className="w-3.5 h-3.5" />
                          <span>إيقاف التلاوة المتتابعة</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" />
                          <span>تلاوة الصفحة وتقليبها تلقائياً ▷</span>
                        </>
                      )}
                    </button>

                    {/* Quick Surah Page Chips */}
                    {surahPages.length > 1 && (
                      <div className="flex items-center gap-1 overflow-x-auto max-w-xs py-1">
                        <span className="text-[11px] text-stone-400 shrink-0">صفحات السورة:</span>
                        {surahPages.map((pg) => (
                          <button
                            key={pg}
                            onClick={() => handleJumpToPage(pg)}
                            className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono transition-all ${
                              currentBookPage === pg
                                ? 'bg-amber-500 text-stone-950'
                                : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                            }`}
                          >
                            {pg}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* THE MEDINA MUSHAF PAGE (كتاب المصحف الشريف المذهب) */}
                {loadingVerses ? (
                  <div className="py-20 text-center text-stone-400 text-xs flex flex-col items-center justify-center gap-2">
                    <RefreshCw className="w-8 h-8 animate-spin text-amber-400" />
                    <span>جاري تحميل صفحات المصحف الشريف...</span>
                  </div>
                ) : (
                  <div
                    className={`relative rounded-2xl border-4 p-3 sm:p-6 transition-all shadow-2xl overflow-hidden ${
                      isDark
                        ? 'bg-[#07151e] border-amber-500/50 shadow-amber-950/30'
                        : 'bg-[#fffef8] border-amber-600/50 shadow-amber-100'
                    }`}
                  >
                    {/* Double Ornate Inner Frame */}
                    <div className="border border-amber-500/30 rounded-xl p-3 sm:p-5 relative">
                      
                      {/* Page Top Header */}
                      <div className="flex items-center justify-between pb-2 mb-3 border-b border-amber-500/30 text-xs text-amber-400 font-bold font-quran">
                        <span>سورة {currentSurahMeta.name} ({currentSurahMeta.type})</span>
                        <span className="hidden sm:inline">الجزء {currentSurahMeta.juz} • الحزب {Math.ceil(currentSurahMeta.juz * 2)}</span>
                        <span>صفحة {toArabicDigits(currentBookPage)}</span>
                      </div>

                      {/* Surah Title Banner (طرة السورة) if this page contains Ayah 1 */}
                      {currentPageVerses.some((v) => v.numberInSurah === 1) && (
                        <div className="my-3 text-center">
                          <div className={`mx-auto max-w-md py-2 px-4 rounded-xl border-2 border-amber-500/60 shadow-sm ${
                            isDark
                              ? 'bg-gradient-to-r from-amber-950/40 via-amber-900/30 to-amber-950/40 text-amber-200'
                              : 'bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 text-amber-900'
                          }`}>
                            <h3 className="font-quran text-lg sm:text-xl font-bold tracking-wide">
                              ﴿ سُورَةُ {currentSurahMeta.name.toUpperCase()} ﴾
                            </h3>
                            <span className="text-[11px] font-sans font-medium text-amber-400 block mt-0.5">
                              {currentSurahMeta.type} • آياتها {currentSurahMeta.ayasCount} • ترتيبها {currentSurahMeta.id}
                            </span>
                          </div>

                          {/* Basmalah (unless Surah At-Tawba) */}
                          {selectedSurahId !== 9 && (
                            <div className="text-center py-3 my-1">
                              <p className="font-quran text-2xl sm:text-3xl text-amber-300 drop-shadow">
                                بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Verses Flowing in Mushaf Format */}
                      <div
                        className={`text-justify font-quran select-text transition-all ${
                          fontSize === 'xlarge'
                            ? 'leading-[2.8] text-xl sm:text-2xl md:text-3xl'
                            : fontSize === 'large'
                            ? 'leading-[2.6] text-lg sm:text-xl md:text-2xl'
                            : 'leading-[2.4] text-base sm:text-lg md:text-xl'
                        }`}
                        dir="rtl"
                      >
                        {currentPageVerses.map((verse) => {
                          const isSelected = selectedAyahNumber === verse.numberInSurah;
                          const isPlayingThis = isPlayingAyah && playingAyahNumber === verse.numberInSurah;

                          return (
                            <span
                              key={verse.numberInSurah}
                              id={`book-ayah-${verse.numberInSurah}`}
                              onClick={() => {
                                setSelectedAyahNumber(verse.numberInSurah);
                                loadVerseDetail(selectedSurahId, verse.numberInSurah);
                                setShowTafsirDrawer(true);
                              }}
                              className={`inline cursor-pointer px-1 py-0.5 rounded transition-all duration-150 ${
                                isPlayingThis
                                  ? 'bg-amber-400/30 text-amber-300 font-bold ring-2 ring-amber-400 shadow-lg animate-pulse'
                                  : isSelected
                                  ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/50'
                                  : isDark
                                  ? 'text-stone-100 hover:bg-stone-800/60 hover:text-amber-200'
                                  : 'text-[#0a2737] hover:bg-amber-100/70 hover:text-amber-900'
                              }`}
                              title={`الآية (${verse.numberInSurah}): انقر لعرض التفسير وأسباب النزول والاستماع`}
                            >
                              {verse.text.replace(/[\r\n]+/g, ' ')}
                              {/* Calligraphic Ayah Number Emblem */}
                              <span className="inline-flex items-center justify-center mx-1 text-amber-500 font-bold font-quran text-[0.9em] select-none align-middle hover:scale-110 transition-transform">
                                ۝{toArabicDigits(verse.numberInSurah)}
                              </span>
                            </span>
                          );
                        })}
                      </div>

                      {/* Page Bottom Footer */}
                      <div className="pt-4 mt-4 border-t border-amber-500/30 flex items-center justify-between text-xs text-amber-400 font-bold">
                        <span className="text-[11px] text-stone-400 hidden sm:inline">
                          انقر على أي آية لعرض تفسيرها وأسباب نزولها بالأسفل
                        </span>
                        <span className="mx-auto font-mono text-sm px-3 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30">
                          — {toArabicDigits(currentBookPage)} —
                        </span>
                        <span className="text-[11px] text-stone-400 hidden sm:inline">
                          رواية حفص عن عاصم
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Book Navigation Bar (Bottom) */}
                <div className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                  isDark ? 'bg-stone-950/60 border-stone-800' : 'bg-[#f4f8fa] border-[#cde2ec]'
                }`}>
                  <button
                    onClick={handlePrevPage}
                    disabled={currentBookPage <= 1}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 disabled:opacity-40 text-amber-300 text-xs font-bold transition-all border border-stone-700"
                  >
                    <ChevronRight className="w-4 h-4" />
                    <span>الصفحة السابقة</span>
                  </button>

                  <div className="flex items-center gap-1.5 text-xs text-stone-300 font-bold">
                    <span>انتقال لصفحة:</span>
                    <input
                      type="number"
                      min={1}
                      max={604}
                      value={pageJumpInput}
                      onChange={(e) => setPageJumpInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleJumpToPage(Number(pageJumpInput));
                          setPageJumpInput('');
                        }
                      }}
                      placeholder={String(currentBookPage)}
                      className="w-16 bg-stone-900 border border-stone-700 rounded p-1 text-center text-xs font-mono text-amber-300 focus:outline-none focus:border-amber-500"
                    />
                    <button
                      onClick={() => {
                        if (pageJumpInput) {
                          handleJumpToPage(Number(pageJumpInput));
                          setPageJumpInput('');
                        }
                      }}
                      className="px-2 py-1 rounded bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold text-xs"
                    >
                      انتقال
                    </button>
                  </div>

                  <button
                    onClick={handleNextPage}
                    disabled={currentBookPage >= 604}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 disabled:opacity-40 text-amber-300 text-xs font-bold transition-all border border-stone-700"
                  >
                    <span>الصفحة التالية</span>
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* ========================================================================= */
              /* VIEW B: DETAILED LIST VIEW (عرض قائمة الآيات التفصيلية)                   */
              /* ========================================================================= */
              <div className="space-y-4">
                {/* Basmalah Display (except Surah At-Tawba) */}
                {selectedSurahId !== 9 && (
                  <div className="text-center py-3 mb-2">
                    <p className="font-quran text-2xl text-amber-200/90 drop-shadow">
                      بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                    </p>
                  </div>
                )}

                {loadingVerses ? (
                  <div className="py-16 text-center text-stone-400 text-xs flex flex-col items-center justify-center gap-2">
                    <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
                    <span>جاري تحميل آيات سورة {currentSurahMeta.name} من المصحف الشريف...</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {surahVerses.map((verse) => {
                      const isSelected = selectedAyahNumber === verse.numberInSurah;
                      const isCurrentlyPlaying = isPlayingAyah && playingAyahNumber === verse.numberInSurah;

                      return (
                        <div
                          key={verse.numberInSurah}
                          id={`ayah-${verse.numberInSurah}`}
                          className={`p-4 rounded-xl border transition-all text-right ${
                            isSelected
                              ? isDark
                                ? 'bg-emerald-950/40 border-emerald-700/60 shadow-lg'
                                : 'bg-emerald-50 border-emerald-400 shadow-md'
                              : isDark
                              ? 'bg-stone-950/60 border-stone-800/80 hover:border-stone-700'
                              : 'bg-[#f8fafc] border-[#cde2ec] hover:border-cyan-400 shadow-sm'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                            {/* Ayah text */}
                            <p
                              className={`font-quran leading-loose flex-1 select-text ${
                                isDark ? 'text-amber-100' : 'text-[#0a2737]'
                              } ${
                                fontSize === 'xlarge'
                                  ? 'text-2xl sm:text-3xl'
                                  : fontSize === 'large'
                                  ? 'text-xl sm:text-2xl'
                                  : 'text-lg sm:text-xl'
                              }`}
                            >
                              {verse.text}
                              <span className={`inline-flex items-center justify-center mx-2 w-7 h-7 rounded-full border font-mono text-xs font-bold align-middle ${
                                isDark
                                  ? 'border-amber-500/50 text-amber-400 bg-amber-950/40'
                                  : 'border-amber-500 text-amber-800 bg-amber-50 shadow-xs'
                              }`}>
                                {verse.numberInSurah}
                              </span>
                            </p>
                          </div>

                          {/* Ayah Actions Tray: Play, Repeat, Tafsir, Reciter Voice */}
                          <div className={`flex items-center justify-between pt-2 border-t text-xs ${
                            isDark ? 'border-stone-800/60' : 'border-[#cde2ec]'
                          }`}>
                            <div className="flex items-center gap-1.5">
                              {/* Play / Stop Ayah */}
                              <button
                                onClick={() => playAyah(verse.numberInSurah)}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                  isCurrentlyPlaying
                                    ? 'bg-amber-500 text-stone-950 animate-pulse'
                                    : 'bg-emerald-800/70 hover:bg-emerald-700 text-white'
                                }`}
                                title={`استماع للآية بصوت ${currentReciter.name}`}
                              >
                                {isCurrentlyPlaying ? (
                                  <>
                                    <Pause className="w-3.5 h-3.5" />
                                    <span>إيقاف</span>
                                  </>
                                ) : (
                                  <>
                                    <Play className="w-3.5 h-3.5" />
                                    <span>استماع للآية</span>
                                  </>
                                )}
                              </button>

                              {/* Jump to Repeater */}
                              <button
                                onClick={() => {
                                  setSelectedAyahNumber(verse.numberInSurah);
                                  setQuranTab('repeater');
                                }}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 text-xs transition-colors"
                                title="تكرار هذه الآية عدة مرات للحفظ والتثبيت"
                              >
                                <Repeat className="w-3 h-3" />
                                <span>تكرار للحفظ</span>
                              </button>

                              {/* Show Tafsir / Hadith */}
                              <button
                                onClick={() => {
                                  setSelectedAyahNumber(verse.numberInSurah);
                                  loadVerseDetail(selectedSurahId, verse.numberInSurah);
                                  setShowTafsirDrawer(true);
                                }}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs transition-colors"
                                title="عرض التفسير وأحكام التجويد"
                              >
                                <Info className="w-3 h-3" />
                                <span>التفسير والأحكام</span>
                              </button>
                            </div>

                            <span className="text-[11px] text-stone-500 font-mono">
                              الآية {verse.numberInSurah} من {currentSurahMeta.ayasCount}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ========================================================================= */}
            {/* COMPREHENSIVE TAFSIR & ASBAB AN-NUZUL PANEL (لوحة التفسير وأسباب النزول)   */}
            {/* ========================================================================= */}
            {showTafsirDrawer && (
              <div className={`mt-6 rounded-2xl border p-5 transition-all shadow-xl space-y-4 text-right ${
                isDark
                  ? 'bg-gradient-to-b from-stone-900 to-stone-950 border-emerald-800/40 text-stone-100'
                  : 'bg-white border-[#cde2ec] text-[#0a2737]'
              }`}>
                {/* Panel Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                      <Sparkles className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-stone-100 font-quran">
                        التفسير الميسر وبيان أسباب النزول والأحكام
                      </h3>
                      <p className={`text-xs ${isDark ? 'text-stone-400' : 'text-[#64748b]'}`}>
                        سورة {currentSurahMeta.name} • الآية ({selectedAyahNumber}) من {currentSurahMeta.ayasCount}
                      </p>
                    </div>
                  </div>

                  {/* Panel Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => playAyah(selectedAyahNumber)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold transition-all shadow"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>استماع للآية ({selectedAyahNumber})</span>
                    </button>

                    <button
                      onClick={() => {
                        setQuranTab('repeater');
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-stone-950 text-xs font-bold transition-all"
                    >
                      <Repeat className="w-3.5 h-3.5" />
                      <span>تكرار للحفظ</span>
                    </button>

                    <button
                      onClick={() => {
                        if (verseDetail) {
                          const textToCopy = `﴿${verseDetail.text}﴾\n[سورة ${currentSurahMeta.name}: الآية ${selectedAyahNumber}]\n\nالتفسير الميسر:\n${verseDetail.tafsir || verseDetail.asbab_nuzul}\n\nأسباب النزول:\n${verseDetail.asbab_nuzul}\n\nأحكام التجويد:\n${verseDetail.tajweed_tips}`;
                          navigator.clipboard.writeText(textToCopy);
                          setCopiedTafsir(true);
                          setTimeout(() => setCopiedTafsir(false), 2500);
                        }
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                        copiedTafsir
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : 'bg-stone-800 hover:bg-stone-700 text-stone-300 border-stone-700'
                      }`}
                    >
                      {copiedTafsir ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-300" />
                          <span>تم النسخ!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-amber-400" />
                          <span>نسخ التفسير</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Selected Verse Text Display */}
                <div className={`p-4 rounded-xl border text-center ${
                  isDark ? 'bg-stone-950/80 border-stone-800' : 'bg-[#fffdf8] border-amber-300/60'
                }`}>
                  <p className="font-quran text-xl sm:text-2xl text-amber-300 font-bold leading-relaxed">
                    {loadingVerseDetail ? (
                      <span className="text-stone-400 text-xs">جاري تحميل الآية وتفسيرها...</span>
                    ) : (
                      verseDetail?.text || `﴿ آية ${selectedAyahNumber} من سورة ${currentSurahMeta.name} ﴾`
                    )}
                  </p>
                </div>

                {/* Detailed Cards Grid */}
                {verseDetail && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {/* Card 1: التفسير الميسر */}
                    <div className={`p-4 rounded-xl border space-y-2 ${
                      isDark ? 'bg-stone-950/70 border-stone-800' : 'bg-[#f4f8fa] border-[#cde2ec]'
                    }`}>
                      <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                        <BookOpen className="w-4 h-4" />
                        <span>التفسير الميسر المعتمد (مجمع الملك فهد):</span>
                      </div>
                      <p className={`text-xs sm:text-sm leading-relaxed ${
                        isDark ? 'text-stone-200' : 'text-[#0a2737]'
                      }`}>
                        {verseDetail.tafsir || verseDetail.asbab_nuzul}
                      </p>
                    </div>

                    {/* Card 2: أسباب النزول وسياق الآية */}
                    <div className={`p-4 rounded-xl border space-y-2 ${
                      isDark ? 'bg-stone-950/70 border-stone-800' : 'bg-[#f4f8fa] border-[#cde2ec]'
                    }`}>
                      <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                        <Sparkles className="w-4 h-4" />
                        <span>أسباب النزول وسياق الآية المباركة:</span>
                      </div>
                      <p className={`text-xs sm:text-sm leading-relaxed ${
                        isDark ? 'text-stone-200' : 'text-[#0a2737]'
                      }`}>
                        {verseDetail.asbab_nuzul || 'بيان أسباب النزول وسياق ورود الآية الكريمة.'}
                      </p>
                    </div>

                    {/* Card 3: أحكام التجويد ومخارج الحروف */}
                    <div className={`p-4 rounded-xl border space-y-2 ${
                      isDark ? 'bg-stone-950/70 border-stone-800' : 'bg-[#f4f8fa] border-[#cde2ec]'
                    }`}>
                      <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                        <Award className="w-4 h-4" />
                        <span>أحكام التجويد ومخارج الحروف:</span>
                      </div>
                      <p className={`text-xs sm:text-sm leading-relaxed ${
                        isDark ? 'text-stone-200' : 'text-[#0a2737]'
                      }`}>
                        {verseDetail.tajweed_tips || 'مراعاة أحكام الغنن والمدود والإدغام والإخفاء عند التلاوة.'}
                      </p>
                    </div>

                    {/* Card 4: الحديث النبوي الشريف أو الفائدة الإيمانية */}
                    <div className={`p-4 rounded-xl border space-y-2 ${
                      isDark ? 'bg-stone-950/70 border-stone-800' : 'bg-[#f4f8fa] border-[#cde2ec]'
                    }`}>
                      <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                        <FileText className="w-4 h-4" />
                        <span>الحديث النبوي الشريف والفائدة الإيمانية:</span>
                      </div>
                      <p className={`text-xs sm:text-sm leading-relaxed ${
                        isDark ? 'text-stone-200' : 'text-[#0a2737]'
                      }`}>
                        {verseDetail.hadith_sharif || 'قال رسول الله ﷺ: «خيركم من تعلم القرآن وعلمه».'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. RECITATION VIEW: CONTINUOUS QURAN AUDIO PLAYER & RECITERS               */}
      {/* ========================================================================= */}
      {quranTab === 'recitation' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-gradient-to-b from-stone-900 to-stone-900/90 rounded-2xl p-6 border border-emerald-800/40 shadow-2xl relative overflow-hidden text-center">
            <div className="absolute -top-12 -left-12 w-48 h-48 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-md mx-auto space-y-4">
              {/* Radio Icon & Title */}
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-950 border border-emerald-700/60 text-emerald-400 shadow-xl mb-1">
                <Headphones className="w-8 h-8 animate-pulse" />
              </div>

              <div>
                <span className="text-xs text-amber-400 font-bold tracking-wider block mb-1">
                  إذاعة وتلاوة القرآن الكريم العادية
                </span>
                <h2 className="text-2xl font-black text-stone-100 font-quran">
                  سورة {currentSurahMeta.name}
                </h2>
                <p className="text-xs text-stone-400 mt-1">
                  بصوت فضيلة {currentReciter.name} ({currentReciter.subName})
                </p>
              </div>

              {/* Active Reciter Quick Card & Open Full List Trigger */}
              <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 text-right space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-amber-400 font-bold flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>القارئ المختار للتلاوة:</span>
                  </span>
                  <button
                    onClick={() => setIsRecitersModalOpen(true)}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-bold hover:underline flex items-center gap-1"
                  >
                    <span>فتح قائمة القراء ({RECITERS_LIST.length})</span>
                    <span>▾</span>
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-stone-900 border border-stone-800">
                  <div>
                    <h4 className="font-bold text-sm text-stone-100 font-quran">{currentReciter.name}</h4>
                    <p className="text-[11px] text-stone-400 mt-0.5">{currentReciter.subName}</p>
                    {currentReciter.description && (
                      <p className="text-[10px] text-stone-500 mt-1 line-clamp-1">{currentReciter.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => setIsRecitersModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-bold transition-all shrink-0 mr-2 shadow"
                  >
                    تغيير القارئ
                  </button>
                </div>
              </div>

              {/* Surah Selector for Continuous Listening */}
              <div className="bg-stone-950 p-3 rounded-xl border border-stone-800 flex items-center justify-between text-xs">
                <span className="text-stone-400">اختيار السورة:</span>
                <select
                  value={selectedSurahId}
                  onChange={(e) => {
                    const id = Number(e.target.value);
                    setSelectedSurahId(id);
                    setSelectedAyahNumber(1);
                    if (isPlayingFullSurah && fullSurahAudioRef.current) {
                      fullSurahAudioRef.current.src = getFullSurahAudioUrl(currentReciter.fullSurahServerUrl, id);
                      fullSurahAudioRef.current.play().catch(err => console.warn(err));
                    }
                  }}
                  className="bg-stone-900 text-amber-300 border border-stone-700 rounded-lg px-3 py-1.5 font-bold outline-none cursor-pointer"
                >
                  {ALL_SURAHS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.id}. سورة {s.name} ({s.ayasCount} آية - {s.type})
                    </option>
                  ))}
                </select>
              </div>

              {/* Scrubber Progress Bar */}
              <div className="space-y-1 pt-2">
                <div className="w-full bg-stone-800 rounded-full h-2 overflow-hidden cursor-pointer">
                  <div
                    className="bg-emerald-500 h-full transition-all rounded-full"
                    style={{
                      width: `${fullSurahDuration ? (fullSurahTime / fullSurahDuration) * 100 : 0}%`,
                    }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-stone-400 font-mono">
                  <span>{formatTime(fullSurahTime)}</span>
                  <span>{formatTime(fullSurahDuration)}</span>
                </div>
              </div>

              {/* Master Player Controls */}
              <div className="flex items-center justify-center gap-4 pt-2">
                <button
                  onClick={handlePrevSurah}
                  disabled={selectedSurahId <= 1}
                  className="w-10 h-10 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-200 flex items-center justify-center transition-all disabled:opacity-30"
                  title="السورة السابقة"
                >
                  <SkipForward className="w-4 h-4" />
                </button>

                <button
                  onClick={() => togglePlayFullSurah()}
                  className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white flex items-center justify-center transition-all shadow-xl shadow-emerald-950/50 active:scale-95"
                >
                  {isPlayingFullSurah ? (
                    <Pause className="w-7 h-7" />
                  ) : (
                    <Play className="w-7 h-7 translate-x-0.5" />
                  )}
                </button>

                <button
                  onClick={handleNextSurah}
                  disabled={selectedSurahId >= 114}
                  className="w-10 h-10 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-200 flex items-center justify-center transition-all disabled:opacity-30"
                  title="السورة التالية"
                >
                  <SkipBack className="w-4 h-4" />
                </button>
              </div>

              {/* Playback speed & Auto-next Toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-stone-800 text-xs text-stone-400">
                <div className="flex items-center gap-1.5">
                  <span>السرعة:</span>
                  {[0.75, 1.0, 1.25, 1.5].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => {
                        setFullSurahSpeed(speed);
                        if (fullSurahAudioRef.current) {
                          fullSurahAudioRef.current.playbackRate = speed;
                        }
                      }}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                        fullSurahSpeed === speed ? 'bg-emerald-800 text-white font-bold' : 'bg-stone-800 text-stone-400'
                      }`}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>

                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoNextSurah}
                    onChange={(e) => setAutoNextSurah(e.target.checked)}
                    className="rounded accent-emerald-600"
                  />
                  <span>الانتقال للسورة التالية تلقائياً</span>
                </label>
              </div>
            </div>
          </div>

          {/* Full Reciters Selection Directory */}
          <RecitersSelector
            mode="inline"
            selectedReciterId={selectedReciterId}
            onSelectReciter={(reciterId, autoPlay) => {
              changeReciter(reciterId);
              if (autoPlay && fullSurahAudioRef.current) {
                const reciter = RECITERS_LIST.find((r) => r.id === reciterId);
                if (reciter) {
                  const fullUrl = getFullSurahAudioUrl(reciter.fullSurahServerUrl, selectedSurahId);
                  fullSurahAudioRef.current.src = fullUrl;
                  fullSurahAudioRef.current
                    .play()
                    .then(() => setIsPlayingFullSurah(true))
                    .catch((err) => console.warn('Playback error:', err));
                }
              }
            }}
            currentSurahId={selectedSurahId}
            currentSurahName={currentSurahMeta.name}
            isPlayingFullSurah={isPlayingFullSurah}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. REPEATER VIEW: REPETITION COUNTER FOR HIFZ (عدد مرات تكرار الحفظ)        */}
      {/* ========================================================================= */}
      {quranTab === 'repeater' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-gradient-to-b from-stone-900 to-stone-900/90 rounded-2xl p-5 border border-amber-500/30 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-800">
              <div className="flex items-center gap-2">
                <Repeat className="w-5 h-5 text-amber-400 animate-spin-slow" />
                <div>
                  <h3 className="font-bold text-stone-100 text-sm">
                    مختبر تكرار الآيات لتثبيت الحفظ في الصدور
                  </h3>
                  <p className="text-[11px] text-stone-400">
                    تكرار الآية في صوت الشيخ لتثبيت الحفظ ونيل إجازة الإتقان
                  </p>
                </div>
              </div>

              {/* Bonus Points Indicator */}
              <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-950/60 border border-amber-700/50 rounded-xl text-amber-300 text-xs font-mono">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>+١٠ نقاط لكل جلسة تكرار مكتملة</span>
              </div>
            </div>

            {/* Current Ayah Card */}
            <div className="bg-stone-950 p-5 rounded-xl border border-stone-800 text-center space-y-3">
              <div className="flex items-center justify-between text-xs text-stone-400">
                <span className="text-amber-400 font-bold">
                  سورة {currentSurahMeta.name} - الآية {selectedAyahNumber} من {currentSurahMeta.ayasCount}
                </span>

                {/* Ayah Navigator */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      if (selectedAyahNumber > 1) setSelectedAyahNumber(prev => prev - 1);
                    }}
                    disabled={selectedAyahNumber <= 1}
                    className="px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 disabled:opacity-40"
                  >
                    الآية السابقة
                  </button>
                  <button
                    onClick={() => {
                      if (selectedAyahNumber < currentSurahMeta.ayasCount) setSelectedAyahNumber(prev => prev + 1);
                    }}
                    disabled={selectedAyahNumber >= currentSurahMeta.ayasCount}
                    className="px-2 py-1 rounded bg-stone-800 hover:bg-stone-700 disabled:opacity-40"
                  >
                    الآية التالية
                  </button>
                </div>
              </div>

              {/* The Calligraphic Ayah Text */}
              <div className="py-3 px-2">
                <p className="font-quran text-xl sm:text-2xl text-amber-100 font-bold leading-relaxed">
                  {verseDetail?.text || 'جاري تحميل الآية الكريمة...'}
                </p>
              </div>

              {/* Reciter for repetition */}
              <div className="pt-2 border-t border-stone-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="text-stone-400">القارئ المختار للترديد:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5" />
                  {currentReciter.name} ({currentReciter.subName})
                </span>
              </div>
            </div>

            {/* REPETITION ENGINE CONTROLLER (عدد مرات تكرار الحفظ) */}
            <div className="bg-stone-950/80 p-4 rounded-xl border border-stone-800 mt-4 space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-amber-400 block">
                    اختر عدد مرات التكرار المطلوبة:
                  </span>
                  <span className="text-[11px] text-stone-400">
                    طريقة الشناقطة والسلف: ٥ إلى ١٠ مرات لتثبيت الحفظ، و٢٠ مرة لرسوخ الآية
                  </span>
                </div>

                {/* Preset Repetition Counts */}
                <div className="flex items-center gap-1.5">
                  {[3, 5, 7, 10, 20].map((count) => (
                    <button
                      key={count}
                      onClick={() => setRepetitionTarget(count)}
                      disabled={isRepeating}
                      className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all ${
                        repetitionTarget === count
                          ? 'bg-amber-500 text-stone-950 shadow-md scale-105'
                          : 'bg-stone-900 text-stone-300 hover:bg-stone-800 border border-stone-800'
                      }`}
                    >
                      {count} مرات
                    </button>
                  ))}
                </div>
              </div>

              {/* Active Repetition Progress Counter Visual */}
              <div className="p-4 rounded-xl bg-stone-900 border border-stone-800/90 text-center space-y-2">
                <div className="flex items-center justify-between text-xs text-stone-400">
                  <span>عداد التكرار الحالي:</span>
                  <span className="font-mono text-amber-400 font-bold text-sm">
                    {currentRepetition} من {repetitionTarget}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-stone-950 rounded-full h-3 overflow-hidden p-0.5 border border-stone-800">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-amber-500 h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${(currentRepetition / repetitionTarget) * 100}%`,
                    }}
                  />
                </div>

                {/* Status text */}
                <div className="text-xs">
                  {isRepeating ? (
                    <span className="text-emerald-400 font-bold animate-pulse flex items-center justify-center gap-1.5">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>جلسة الحفظ نشطة: جاري التكرار رقم ({currentRepetition}) في صوت {currentReciter.name}...</span>
                    </span>
                  ) : (
                    <span className="text-stone-400">
                      اضغط زر البدء لتشغيل الآية بالتكرار المحدد ({repetitionTarget} مرات)
                    </span>
                  )}
                </div>
              </div>

              {/* Settings: Pause between reps & Auto advance */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                <div className="flex items-center justify-between bg-stone-900 p-2.5 rounded-lg border border-stone-800">
                  <span className="text-stone-400">فترة الترديد والصمت بين التكرارات:</span>
                  <select
                    value={pauseBetweenReps}
                    onChange={(e) => setPauseBetweenReps(Number(e.target.value))}
                    disabled={isRepeating}
                    className="bg-stone-950 text-amber-300 border border-stone-700 rounded px-2 py-1 text-xs"
                  >
                    <option value={0}>بدون توقف (مباشر)</option>
                    <option value={1}>١ ثانية (راحة قصيرة)</option>
                    <option value={1.5}>١.٥ ثانية (متوازن)</option>
                    <option value={3}>٣ ثوانٍ (للترديد بصوتك)</option>
                    <option value={5}>٥ ثوانٍ (ترديد كامل خلف الشيخ)</option>
                  </select>
                </div>

                <div className="flex items-center justify-between bg-stone-900 p-2.5 rounded-lg border border-stone-800">
                  <span className="text-stone-400">الانتقال للآية التالية عند الإتمام:</span>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoAdvanceAyah}
                      onChange={(e) => setAutoAdvanceAyah(e.target.checked)}
                      className="rounded accent-emerald-600"
                    />
                    <span className="text-stone-300">مفعل</span>
                  </label>
                </div>
              </div>

              {/* Master Repetition Launch Button */}
              <div className="pt-2">
                <button
                  id="launch-repetition-loop-btn"
                  onClick={startRepetitionLoop}
                  className={`w-full py-3.5 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-xl active:scale-98 ${
                    isRepeating
                      ? 'bg-red-600 hover:bg-red-500 text-white'
                      : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 shadow-amber-500/10'
                  }`}
                >
                  {isRepeating ? (
                    <>
                      <Pause className="w-5 h-5" />
                      <span>إيقاف جلسة التكرار</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      <span>بدء جلسة تكرار الآية ({repetitionTarget} مرات) الآن</span>
                    </>
                  )}
                </button>
              </div>

              {/* Completed message banner */}
              {repetitionCompletedMessage && (
                <div className="p-3 bg-emerald-950/80 border border-emerald-700/60 rounded-xl text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>{repetitionCompletedMessage}</span>
                </div>
              )}
            </div>

            {/* Asbab Nuzul & Tajweed rule box */}
            {verseDetail && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-stone-950 p-3.5 rounded-xl border border-stone-800">
                  <span className="text-emerald-400 font-bold block mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    البيان وتفسير الآية:
                  </span>
                  <p className="text-stone-300 leading-relaxed text-[11px]">
                    {verseDetail.asbab_nuzul}
                  </p>
                </div>

                <div className="bg-stone-950 p-3.5 rounded-xl border border-stone-800">
                  <span className="text-amber-400 font-bold block mb-1 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5" />
                    أحكام التجويد للآية:
                  </span>
                  <p className="text-stone-300 leading-relaxed text-[11px]">
                    {verseDetail.tajweed_tips}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TAJWEED LAB: MIC RECORDING & AI EVALUATION                             */}
      {/* ========================================================================= */}
      {quranTab === 'tajweed' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-stone-900 rounded-2xl p-5 border border-stone-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mic className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-stone-100 text-sm">
                  مختبر التسميع الصوتي والتقييم بالذكاء الاصطناعي
                </h3>
              </div>
              <span className="text-xs text-stone-400 bg-stone-800 px-2.5 py-1 rounded-lg">
                إجازة برواية حفص عن عاصم
              </span>
            </div>

            {/* Selected Verse for recitation */}
            <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 text-center space-y-2">
              <span className="text-xs text-amber-400">
                الآية المستهدفة للتسميع: سورة {currentSurahMeta.name} (الآية {selectedAyahNumber})
              </span>
              <p className="font-quran text-xl text-amber-100 font-bold">
                {verseDetail?.text || 'جاري تحميل الآية الكريمة...'}
              </p>
            </div>

            {/* Mic Controls */}
            <div className="bg-stone-950 p-5 rounded-xl border border-stone-800/80 flex flex-col items-center justify-center space-y-3">
              <div className="flex items-center gap-4">
                {!isRecording ? (
                  <button
                    id="start-recording-btn"
                    onClick={startRecording}
                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg hover:shadow-emerald-900/30 active:scale-95"
                  >
                    <Mic className="w-4 h-4" />
                    <span>بدء التسميع الصوتي المباشر</span>
                  </button>
                ) : (
                  <button
                    id="stop-recording-btn"
                    onClick={stopRecording}
                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-lg animate-pulse"
                  >
                    <MicOff className="w-4 h-4" />
                    <span>إيقاف التسجيل وإنهاء التسميع ({recordingDuration} ثانية)</span>
                  </button>
                )}
              </div>

              {isRecording && (
                <div className="flex items-center gap-1.5 text-xs text-amber-400 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-red-500 inline-block animate-ping" />
                  <span>المايكروفون يستمع لتلاوتك ويحلل مخارج الحروف والغنن وأحكام المدود...</span>
                </div>
              )}

              {recordedAudioUrl && !isRecording && (
                <div className="w-full pt-2 flex flex-col items-center gap-2 text-xs">
                  <div className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تم حفظ التسجيل الصوتي بنجاح</span>
                  </div>
                  <audio controls className="w-full max-w-sm h-9">
                    <source src={recordedAudioUrl} type="audio/webm" />
                    متصفحك لا يدعم تشغيل الصوت المباشر.
                  </audio>
                </div>
              )}
            </div>

            {/* AI Evaluation */}
            {evaluatingTajweed && (
              <div className="p-4 rounded-xl bg-stone-950/80 border border-emerald-800/40 text-center text-xs text-stone-300 flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                <span>خوارزمية منهاج تفحص أحكام النون والميم وتفخيم حروف الاستعلاء...</span>
              </div>
            )}

            {aiTajweedEval && (
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-800/40 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    نتيجة تقييم التسميع الشرعي:
                  </span>
                  <span className="px-2.5 py-0.5 rounded bg-emerald-800/50 text-emerald-200 font-bold">
                    نسبة الإتقان: {aiTajweedEval.score}%
                  </span>
                </div>
                <p className="text-stone-300"><strong>المخارج: </strong>{aiTajweedEval.makharij}</p>
                <p className="text-stone-300"><strong>الأحكام: </strong>{aiTajweedEval.tajweedRules}</p>
                <p className="text-amber-300/90"><strong>التوجيه: </strong>{aiTajweedEval.recommendation}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. PLANS VIEW: PERSONAL HIFZ SCHEDULE (خطط الحفظ الشخصية)                 */}
      {/* ========================================================================= */}
      {quranTab === 'plans' && (
        <div className="space-y-4 animate-in fade-in duration-200">
          <div className="bg-stone-900 rounded-2xl p-5 border border-stone-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-stone-100 text-sm">
                  خطط الحفظ الشخصية وجدول المراجعة
                </h3>
              </div>
              <button
                onClick={() => setIsAddingPlan(!isAddingPlan)}
                className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-medium transition-colors"
              >
                {isAddingPlan ? 'إلغاء' : '+ خطة حفظ جديدة'}
              </button>
            </div>

            {isAddingPlan && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const newPlan = {
                    id: 'hp-' + Date.now(),
                    surahName: newPlanSurah,
                    verseStart: newPlanStart,
                    verseEnd: newPlanEnd,
                    targetDate: newPlanDate,
                    repetitionCount: newPlanReps,
                    isCompleted: false,
                    tajweedNotes: 'خطة حفظ جديدة ومتابعة تثبيت الآيات',
                  };
                  setHifzPlans([newPlan, ...hifzPlans]);
                  setIsAddingPlan(false);
                }}
                className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-3 text-xs"
              >
                <span className="font-bold text-emerald-400 block">إضافة خطة حفظ مستهدفة:</span>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="text-stone-400 block mb-1">اسم السورة:</label>
                    <input
                      type="text"
                      value={newPlanSurah}
                      onChange={(e) => setNewPlanSurah(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-stone-200"
                      placeholder="مثلاً: سورة الكهف"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-stone-400 block mb-1">من آية إلى آية:</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        value={newPlanStart}
                        onChange={(e) => setNewPlanStart(Number(e.target.value))}
                        className="w-1/2 bg-stone-900 border border-stone-700 rounded-lg p-2 text-stone-200"
                        placeholder="من"
                        required
                      />
                      <input
                        type="number"
                        value={newPlanEnd}
                        onChange={(e) => setNewPlanEnd(Number(e.target.value))}
                        className="w-1/2 bg-stone-900 border border-stone-700 rounded-lg p-2 text-stone-200"
                        placeholder="إلى"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-stone-400 block mb-1">مرات التكرار المستهدفة:</label>
                    <select
                      value={newPlanReps}
                      onChange={(e) => setNewPlanReps(Number(e.target.value))}
                      className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-stone-200"
                    >
                      <option value={3}>٣ مرات (مراجعة سريعة)</option>
                      <option value={5}>٥ مرات (حفظ أولي)</option>
                      <option value={10}>١٠ مرات (تثبيت متين)</option>
                      <option value={20}>٢٠ مرة (إتقان تام)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-stone-400 block mb-1">الموعد المستهدف:</label>
                    <input
                      type="date"
                      value={newPlanDate}
                      onChange={(e) => setNewPlanDate(e.target.value)}
                      className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-stone-200"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors"
                >
                  تثبيت الخطة في جدول الحفظ
                </button>
              </form>
            )}

            <div className="space-y-2.5">
              {hifzPlans.map((plan) => (
                <div
                  key={plan.id}
                  className={`p-3.5 rounded-xl border transition-all flex items-center justify-between text-xs ${
                    plan.isCompleted
                      ? 'bg-emerald-950/30 border-emerald-800/40 text-stone-300'
                      : 'bg-stone-950/60 border-stone-800 text-stone-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setHifzPlans(
                          hifzPlans.map((p) => (p.id === plan.id ? { ...p, isCompleted: !p.isCompleted } : p))
                        );
                      }}
                      className={`w-6 h-6 rounded-full flex items-center justify-center border transition-colors ${
                        plan.isCompleted
                          ? 'bg-emerald-600 border-emerald-500 text-white'
                          : 'border-stone-600 hover:border-emerald-500 text-transparent'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <div>
                      <div className="flex items-center gap-2 font-bold text-sm">
                        <span className={plan.isCompleted ? 'line-through text-stone-400' : 'text-stone-100'}>
                          {plan.surahName}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-stone-800 text-amber-300 font-mono">
                          الآيات {plan.verseStart} - {plan.verseEnd}
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-400 mt-1 flex items-center gap-3">
                        <span>الموعد: {plan.targetDate}</span>
                        <span className="text-amber-400 font-bold">التكرار: {plan.repetitionCount} مرات</span>
                        {plan.tajweedNotes && <span className="text-emerald-400/80">{plan.tajweedNotes}</span>}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      const matchedSurah = ALL_SURAHS.find((s) => plan.surahName.includes(s.name));
                      if (matchedSurah) {
                        setSelectedSurahId(matchedSurah.id);
                        setSelectedAyahNumber(plan.verseStart);
                        setRepetitionTarget(plan.repetitionCount);
                        setQuranTab('repeater');
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-amber-300 font-medium transition-colors"
                  >
                    بدء تكرار الخطة
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. HALAQAT & TADABBUR ROOMS (حلقات الحفظ والتدبر وغرف الأسئلة الشرعية)      */}
      {/* ========================================================================= */}
      {quranTab === 'halaqat' && (
        <div className="animate-in fade-in duration-200">
          <HalaqatTadabburRooms
            currentUser={currentUser}
            wallet={wallet}
            selectedReciterId={currentReciter.id}
            displayMode="full"
            initialRoomId={targetHalqaRoomId}
            initialRole={targetHalqaRole}
            onRewardPoints={onRewardPoints}
            onPlayContinuousSurah={(surahId, reciterId) => {
              if (reciterId) {
                changeReciter(reciterId);
              }
              togglePlayFullSurah(surahId);
            }}
            onSelectSurahInMushaf={(surahId) => {
              setSelectedSurahId(surahId);
              setSelectedAyahNumber(1);
              setQuranTab('mushaf');
            }}
          />
        </div>
      )}

      {/* ========================================================================= */}
      {/* GLOBAL STICKY CONTINUOUS RECITER AUDIO PLAYER                             */}
      {/* ========================================================================= */}
      {isPlayingFullSurah && (
        <div className="fixed bottom-3 left-3 right-3 sm:left-6 sm:right-6 max-w-4xl mx-auto z-50 bg-stone-900/95 backdrop-blur-md border border-emerald-600/60 rounded-2xl shadow-2xl p-3 text-stone-100 flex flex-col gap-2 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center justify-between gap-3">
            {/* Playing Info */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shrink-0 shadow-md">
                <Volume2 className="w-5 h-5 animate-pulse" />
              </div>
              <div className="truncate">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-amber-300 text-sm">سورة {currentSurahMeta.name}</span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-700/50 px-2 py-0.5 rounded-full font-mono">
                    تلاوة كاملة متواصلة
                  </span>
                </div>
                <div className="text-[11px] text-stone-400 truncate flex items-center gap-1.5">
                  <span>القارئ:</span>
                  <button
                    onClick={() => setIsRecitersModalOpen(true)}
                    className="text-amber-300 font-bold hover:underline hover:text-amber-200 inline-flex items-center gap-1"
                    title="انقر لتغيير القارئ المفضل"
                  >
                    <span>{currentReciter.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-stone-800 text-stone-300">تغيير ▾</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handlePrevSurah}
                disabled={selectedSurahId <= 1}
                className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 disabled:opacity-30"
                title="السورة السابقة"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <button
                onClick={() => togglePlayFullSurah()}
                className="w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition-all shadow active:scale-95"
              >
                {isPlayingFullSurah ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
              </button>

              <button
                onClick={handleNextSurah}
                disabled={selectedSurahId >= 114}
                className="p-2 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 disabled:opacity-30"
                title="السورة التالية"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  if (fullSurahAudioRef.current) {
                    fullSurahAudioRef.current.pause();
                  }
                  setIsPlayingFullSurah(false);
                }}
                className="p-2 rounded-lg bg-stone-800 hover:bg-red-900/60 text-stone-400 hover:text-red-200 transition-colors mr-1"
                title="إغلاق المشغل المتواصل"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-stone-400 font-mono w-10 text-right">{formatTime(fullSurahTime)}</span>
            <div className="flex-1 bg-stone-800 rounded-full h-1.5 overflow-hidden cursor-pointer">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{
                  width: `${fullSurahDuration ? (fullSurahTime / fullSurahDuration) * 100 : 0}%`,
                }}
              />
            </div>
            <span className="text-[10px] text-stone-400 font-mono w-10">{formatTime(fullSurahDuration)}</span>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. RECITERS SELECTION MODAL (قائمة اختيار القراء الكرام)                     */}
      {/* ========================================================================= */}
      <RecitersSelector
        mode="modal"
        isOpen={isRecitersModalOpen}
        onClose={() => setIsRecitersModalOpen(false)}
        selectedReciterId={selectedReciterId}
        onSelectReciter={(reciterId, autoPlay) => {
          changeReciter(reciterId);
          if (autoPlay && fullSurahAudioRef.current) {
            const reciter = RECITERS_LIST.find((r) => r.id === reciterId);
            if (reciter) {
              const fullUrl = getFullSurahAudioUrl(reciter.fullSurahServerUrl, selectedSurahId);
              fullSurahAudioRef.current.src = fullUrl;
              fullSurahAudioRef.current
                .play()
                .then(() => setIsPlayingFullSurah(true))
                .catch((err) => console.warn('Playback error:', err));
            }
          }
        }}
        currentSurahId={selectedSurahId}
        currentSurahName={currentSurahMeta.name}
        isPlayingFullSurah={isPlayingFullSurah}
      />
    </div>
  );
}
