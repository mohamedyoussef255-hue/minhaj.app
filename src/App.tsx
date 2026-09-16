/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  Heart,
  Wallet as WalletIcon,
  ShieldAlert,
  Mic,
  MicOff,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Send,
  Lock,
  Copy,
  ChevronRight,
  Database,
  Search,
  Filter,
  Users,
  Award,
  Clock,
  ArrowDownToLine,
  PhoneOff,
  BadgeAlert,
  Check,
  Volume2,
  ExternalLink,
  ShieldCheck,
  Coins,
  RefreshCw,
  LogIn,
  User as UserIcon,
  UserCheck,
  Radio,
  Sun,
  Moon,
  DoorOpen,
  Crown,
  Star,
  Zap,
  Trophy,
  CreditCard,
  Smartphone,
  Building2,
  Percent,
  Gift,
  DollarSign,
  Megaphone,
  Globe,
  Languages,
  MapPin,
  RotateCcw,
  Trash2,
  HelpCircle,
  Info,
  X,
  Library,
  Settings,
  Mail,
  KeyRound,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  SUPPORTED_LANGUAGES,
  SUPPORTED_COUNTRIES,
  TRANSLATIONS,
  DATABASE_SCHEMA_BENEFITS,
  SupportedLanguage,
  CountryConfig,
  getTranslation,
} from './data/translations';
import type {
  MarriageProfile,
  HifzPlan,
  Wallet,
  WithdrawalRequest,
  SecurityViolation,
  User,
  MarriagePackage,
  PaymentMethodsConfig,
  RevenueAndRewardFund,
  Competition,
  CompetitionParticipant,
  SelfPacedMilestoneClaim,
} from './types';
import { AuthPortal } from './components/AuthPortal';
import { QuranSection } from './components/QuranSection';
import { HalaqatTadabburRooms } from './components/HalaqatTadabburRooms';
import { SplashAndGateway } from './components/SplashAndGateway';
import { MarriagePackagesModal } from './components/MarriagePackagesModal';
import { PaymentMethodsModal } from './components/PaymentMethodsModal';
import { CompetitionsModal } from './components/CompetitionsModal';
import { CompetitionsSection } from './components/CompetitionsSection';
import { SelfPacedHifzIncentives } from './components/SelfPacedHifzIncentives';
import { LanguageModal, CountryModal, ClearDemoModal } from './components/LocalizationModals';
import { ColorPaletteBar } from './components/ColorPaletteBar';
import { MinhajOfficialLogo } from './components/MinhajOfficialLogo';
import { IslamicReferencesLibrary } from './components/IslamicReferencesLibrary';
import { COLOR_PALETTES, ColorPaletteId } from './data/colorPalettes';

export default function App() {
  // Navigation View: 'quran' | 'halaqat' | 'marriage' | 'competitions' | 'incentives' | 'wallet' | 'references' | 'admin'
  const [view, setView] = useState<'quran' | 'halaqat' | 'marriage' | 'competitions' | 'incentives' | 'wallet' | 'references' | 'admin'>('quran');

  // Deep-linking / invitation handler for Halaqat
  const [invitedRoomId, setInvitedRoomId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        const roomId = params.get('roomId') || params.get('halqa');
        const tab = params.get('tab');
        if (roomId) {
          setInvitedRoomId(roomId);
          setHasSelectedPortal(true);
          setView('halaqat');
        } else if (tab === 'halaqat') {
          setHasSelectedPortal(true);
          setView('halaqat');
        }
      } catch (e) {
        console.warn('URL param parse error:', e);
      }
    }
  }, []);

  // Gateway Selection State (Splash -> Gateway -> Main)
  const [hasSelectedPortal, setHasSelectedPortal] = useState<boolean>(false);

  // Theme: 'dark' | 'light'
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Color Palette State (persisted in localStorage)
  const [colorPaletteId, setColorPaletteId] = useState<ColorPaletteId>(() => {
    const saved = localStorage.getItem('minhaj_color_palette');
    return (saved as ColorPaletteId) || 'minhaj-teal';
  });

  const activePalette =
    COLOR_PALETTES.find((p) => p.id === colorPaletteId) || COLOR_PALETTES[0];

  // Sync color palette and theme with DOM
  useEffect(() => {
    localStorage.setItem('minhaj_color_palette', colorPaletteId);
    if (typeof document !== 'undefined') {
      const isDarkMode = theme === 'dark';
      const p = activePalette.swatch.primary;
      const s = activePalette.swatch.secondary;
      const a = activePalette.swatch.accent;

      document.documentElement.style.setProperty('--color-primary', p);
      document.documentElement.style.setProperty('--color-secondary', s);
      document.documentElement.style.setProperty('--color-accent', a);
      document.documentElement.style.setProperty('--theme-primary', p);
      document.documentElement.style.setProperty('--theme-secondary', s);
      document.documentElement.style.setProperty('--theme-accent', a);

      if (isDarkMode) {
        const bgRootMap: Record<ColorPaletteId, string> = {
          'minhaj-teal': '#06141c',
          'royal-turquoise': '#041a18',
          'imperial-navy': '#0a091e',
          'warm-amber': '#180d04',
          'celestial-sky': '#03131e',
          'classic-emerald': '#021812',
        };
        const bgCardMap: Record<ColorPaletteId, string> = {
          'minhaj-teal': '#0b212c',
          'royal-turquoise': '#08302c',
          'imperial-navy': '#15133d',
          'warm-amber': '#2b1809',
          'celestial-sky': '#082436',
          'classic-emerald': '#062d22',
        };
        const borderMap: Record<ColorPaletteId, string> = {
          'minhaj-teal': '#164e63',
          'royal-turquoise': '#134e48',
          'imperial-navy': '#312e81',
          'warm-amber': '#78350f',
          'celestial-sky': '#075985',
          'classic-emerald': '#065f46',
        };
        document.documentElement.style.setProperty('--theme-bg-root', bgRootMap[colorPaletteId] || '#06141c');
        document.documentElement.style.setProperty('--theme-bg-card', bgCardMap[colorPaletteId] || '#0b212c');
        document.documentElement.style.setProperty('--theme-bg-header', bgRootMap[colorPaletteId] || '#06141c');
        document.documentElement.style.setProperty('--theme-border', borderMap[colorPaletteId] || '#164e63');
        document.documentElement.style.setProperty('--theme-text-primary', '#f8fafc');
        document.documentElement.style.setProperty('--theme-text-secondary', s);
      } else {
        const bgRootMap: Record<ColorPaletteId, string> = {
          'minhaj-teal': '#f0f7fa',
          'royal-turquoise': '#f0fdfa',
          'imperial-navy': '#f5f5ff',
          'warm-amber': '#fffbeb',
          'celestial-sky': '#f0f9ff',
          'classic-emerald': '#f0fdf4',
        };
        const borderMap: Record<ColorPaletteId, string> = {
          'minhaj-teal': '#cfe0ea',
          'royal-turquoise': '#ccfbf1',
          'imperial-navy': '#e0e7ff',
          'warm-amber': '#fde68a',
          'celestial-sky': '#bae6fd',
          'classic-emerald': '#bbf7d0',
        };
        document.documentElement.style.setProperty('--theme-bg-root', bgRootMap[colorPaletteId] || '#f4f8fa');
        document.documentElement.style.setProperty('--theme-bg-card', '#ffffff');
        document.documentElement.style.setProperty('--theme-bg-header', '#ffffff');
        document.documentElement.style.setProperty('--theme-border', borderMap[colorPaletteId] || '#cde2ec');
        document.documentElement.style.setProperty('--theme-text-primary', '#0a2737');
        document.documentElement.style.setProperty('--theme-text-secondary', p);
      }
    }
  }, [colorPaletteId, activePalette, theme]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', theme === 'dark');
      document.documentElement.classList.toggle('light', theme === 'light');
    }
  }, [theme]);

  // Marriage Packages State
  const [packages, setPackages] = useState<MarriagePackage[]>([]);
  const [packagesModalOpen, setPackagesModalOpen] = useState(false);
  const [royalPriceVal, setRoyalPriceVal] = useState(1200);
  const [royalDurationVal, setRoyalDurationVal] = useState(30);
  const [silverPriceVal, setSilverPriceVal] = useState(150);
  const [goldPriceVal, setGoldPriceVal] = useState(350);
  const [platinumPriceVal, setPlatinumPriceVal] = useState(650);

  // User Context: Strict Gender Isolation
  const [userGender, setUserGender] = useState<'male' | 'female'>('male');
  const [maritalFilter, setMaritalFilter] = useState<'all' | 'single' | 'widowed' | 'divorced' | 'polygamy'>('all');

  // Current Logged-in User Context
  const [currentUser, setCurrentUser] = useState<User | null>({
    id: 'usr-male-1',
    phoneNumber: '+201011112222',
    fullName: 'د. عبد الرحمن الشافعي',
    gender: 'male',
    age: 28,
    currentTier: 'silver',
    tokensBalance: 120,
    createdAt: new Date().toISOString(),
  });
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // Switch Gender & Synchronize Default Profile
  const switchGender = (gender: 'male' | 'female') => {
    setUserGender(gender);
    if (gender === 'female') {
      setCurrentUser({
        id: 'usr-female-1',
        phoneNumber: '+201099998888',
        fullName: 'أ. خديجة الأنصاري',
        gender: 'female',
        age: 24,
        currentTier: 'gold',
        tokensBalance: 350,
        createdAt: new Date().toISOString(),
      });
    } else {
      setCurrentUser({
        id: 'usr-male-1',
        phoneNumber: '+201011112222',
        fullName: 'د. عبد الرحمن الشافعي',
        gender: 'male',
        age: 28,
        currentTier: 'silver',
        tokensBalance: 120,
        createdAt: new Date().toISOString(),
      });
    }
  };

  // Admin & Control Panel Access (أيقونة تروس الإعدادات للإدارة ولوحة التحكم)
  const [logoClicks, setLogoClicks] = useState(0);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [secretPassword, setSecretPassword] = useState('mohamed2072');
  const [adminEmailInput, setAdminEmailInput] = useState('');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  // Quran & Hifz State
  const [selectedSurah, setSelectedSurah] = useState<number>(24);
  const [selectedAyah, setSelectedAyah] = useState<number>(30);
  const [verseData, setVerseData] = useState<any>(null);
  const [loadingVerse, setLoadingVerse] = useState(false);
  const [hifzPlans, setHifzPlans] = useState<HifzPlan[]>([]);
  const [newPlanSurah, setNewPlanSurah] = useState('سورة النور');
  const [newPlanStart, setNewPlanStart] = useState(30);
  const [newPlanEnd, setNewPlanEnd] = useState(35);
  const [newPlanDate, setNewPlanDate] = useState('');
  const [isAddingPlan, setIsAddingPlan] = useState(false);

  // Audio Recording (Tajweed Simulation & Web Audio API)
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [aiTajweedEval, setAiTajweedEval] = useState<any | null>(null);
  const [evaluatingTajweed, setEvaluatingTajweed] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  // Marriage & AI Matching State
  const [profiles, setProfiles] = useState<MarriageProfile[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<MarriageProfile | null>(null);
  const [aiMatchResults, setAiMatchResults] = useState<any[] | null>(null);
  const [loadingAiMatch, setLoadingAiMatch] = useState(false);
  const [escrowModalOpen, setEscrowModalOpen] = useState(false);
  const [escrowResult, setEscrowResult] = useState<any | null>(null);
  const [requestingEscrow, setRequestingEscrow] = useState(false);

  // Chat Firewall Simulation State
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessagesList, setChatMessagesList] = useState<Array<{ sender: string; text: string; time: string; safe: boolean }>>([
    {
      sender: 'نظام منهاج الشرعي',
      text: 'مرحباً بك في نافذة التواصل الشرعي المُنضبط. جميع المحادثات خاضعة للرقابة لحفظ العفة ومنع تداول البيانات الشخصية قبل دفع العربون وموافقة الولي.',
      time: '12:00 م',
      safe: true,
    },
  ]);
  const [chatError, setChatError] = useState<string | null>(null);
  const [chatSuccess, setChatSuccess] = useState<string | null>(null);

  // Wallet & Referral State
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [withdrawAmount, setWithdrawAmount] = useState<string>('150');
  const [withdrawMethod, setWithdrawMethod] = useState('فودافون كاش (Vodafone Cash)');
  const [withdrawAccount, setWithdrawAccount] = useState('01011112222');
  const [withdrawStatus, setWithdrawStatus] = useState<string | null>(null);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);
  const [withdrawalsList, setWithdrawalsList] = useState<WithdrawalRequest[]>([]);
  const [copiedLink, setCopiedLink] = useState(false);

  // Admin Dashboard State
  const [adminSettings, setAdminSettings] = useState<any>(null);
  const [adminStats, setAdminStats] = useState<any>(null);
  const [adminViolations, setAdminViolations] = useState<SecurityViolation[]>([]);
  const [sqlSchema, setSqlSchema] = useState<string>('');
  const [copiedSql, setCopiedSql] = useState(false);
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [silverTokensVal, setSilverTokensVal] = useState(100);
  const [goldTokensVal, setGoldTokensVal] = useState(300);
  const [platinumTokensVal, setPlatinumTokensVal] = useState(1000);
  const [adminSaveMessage, setAdminSaveMessage] = useState<string | null>(null);
  const [adminDbTab, setAdminDbTab] = useState<'benefits' | 'ddl'>('benefits');

  // Payment Methods & InstaPay State
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodsConfig | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentModalPurpose, setPaymentModalPurpose] = useState('سداد الاشتراكات وتوثيق العضوية');
  const [paymentModalAmount, setPaymentModalAmount] = useState<number | undefined>(undefined);

  // Admin Payment form states
  const [adminIpa, setAdminIpa] = useState('minhaj@instapay');
  const [adminInstaPhone, setAdminInstaPhone] = useState('01011112222');
  const [adminInstaAccount, setAdminInstaAccount] = useState('منصة منهاج القرآنية / إدارة الاشتراكات الرسمية');
  const [adminVodafonePhone, setAdminVodafonePhone] = useState('01011112222');
  const [adminVodafoneAccount, setAdminVodafoneAccount] = useState('محفظة منهاج الرسمية (فودافون كاش / أورنج / اتصالات)');
  const [adminBankName, setAdminBankName] = useState('البنك الأهلي المصري (NBE) / مصرف الراجحي');
  const [adminBankAccount, setAdminBankAccount] = useState('12345678901234');
  const [adminBankIban, setAdminBankIban] = useState('EG120003000000012345678901234');
  const [adminBankSwift, setAdminBankSwift] = useState('NBEGEGCX');
  const [adminBankHolder, setAdminBankHolder] = useState('مؤسسة منهاج القرآنية والتقنية');
  const [adminBankBranch, setAdminBankBranch] = useState('فرع المعاملات الدولية - القاهرة / الرياض');
  const [adminBankCountry, setAdminBankCountry] = useState('مصر والسعودية (International Remittance)');
  const [adminBankCurrencies, setAdminBankCurrencies] = useState('USD, EUR, SAR, AED, GBP, EGP, KWD');
  const [adminBankIntermediary, setAdminBankIntermediary] = useState('Citibank N.A. New York (CITIUS33) / Arab National Bank');
  const [adminBankIntInstructions, setAdminBankIntInstructions] = useState('للتحويل من خارج مصر والسعودية، يرجى استخدام رقم الآيبان الموحد وكود السويفت (SWIFT / BIC). في حقل البيان/الغرض (Payment Reference) اكتب: [اسم المشترك - كود الاستمارة]. يُرجى رفع أو إرسال إشعار السويفت (MT103) فور الإرسال عبر واتساب لاعتماده فوراً.');
  const [adminStcPhone, setAdminStcPhone] = useState('+966501112233');
  const [adminStcAccount, setAdminStcAccount] = useState('Minhaj Official Platform');
  const [adminWhatsappPhone, setAdminWhatsappPhone] = useState('+201011112222');
  const [adminPaymentInstructions, setAdminPaymentInstructions] = useState('يرجى تحويل المبلغ المطلوب عبر انستاباي أو المحفظة الإلكترونية ثم رفع صورة التحويل أو كتابة رقم العملية المرجعي للمراجعة والاعتماد الفوري.');
  const [paymentSaveMessage, setPaymentSaveMessage] = useState<string | null>(null);

  // Internationalization & Country Selection State
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>(() => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('minhaj_language');
      if (saved && ['ar', 'en', 'ur', 'fr', 'id', 'tr'].includes(saved)) {
        return saved as SupportedLanguage;
      }
    }
    return 'ar';
  });
  const [selectedCountry, setSelectedCountry] = useState<string>(() => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('minhaj_country');
      if (saved) return saved;
    }
    return 'SA';
  });
  const [langModalOpen, setLangModalOpen] = useState(false);
  const [countryModalOpen, setCountryModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('minhaj_language', selectedLanguage);
    if (typeof document !== 'undefined') {
      document.documentElement.lang = selectedLanguage;
      document.documentElement.dir = (selectedLanguage === 'ar' || selectedLanguage === 'ur') ? 'rtl' : 'ltr';
    }
  }, [selectedLanguage]);

  useEffect(() => {
    localStorage.setItem('minhaj_country', selectedCountry);
  }, [selectedCountry]);

  // Clear Demo Data & Admin Schema View States
  const [isClearingDemoData, setIsClearingDemoData] = useState(false);
  const [clearDemoSuccessMessage, setClearDemoSuccessMessage] = useState<string | null>(null);
  const [showClearDemoConfirm, setShowClearDemoConfirm] = useState(false);
  const [adminSchemaTab, setAdminSchemaTab] = useState<'benefits' | 'ddl'>('benefits');

  // Translation helper
  const t = (key: string) => {
    return getTranslation(selectedLanguage, key);
  };

  const activeCountryObj = SUPPORTED_COUNTRIES.find((c) => c.code === selectedCountry) || SUPPORTED_COUNTRIES[0];
  const isRtl = selectedLanguage === 'ar' || selectedLanguage === 'ur';

  // Revenue Fund & Self-Paced Incentives State
  const [revenueFund, setRevenueFund] = useState<RevenueAndRewardFund | null>(null);
  const [rewardPercentageVal, setRewardPercentageVal] = useState(20);
  const [totalRevenueVal, setTotalRevenueVal] = useState(50000);
  const [rateAyahPoints, setRateAyahPoints] = useState(2);
  const [rateAyahCash, setRateAyahCash] = useState(0.25);
  const [rateSurahPoints, setRateSurahPoints] = useState(50);
  const [rateSurahCash, setRateSurahCash] = useState(15.0);
  const [rateJuzPoints, setRateJuzPoints] = useState(500);
  const [rateJuzCash, setRateJuzCash] = useState(150.0);
  const [rateKhatmahPoints, setRateKhatmahPoints] = useState(25000);
  const [rateKhatmahCash, setRateKhatmahCash] = useState(5000.0);
  const [fundSaveMessage, setFundSaveMessage] = useState<string | null>(null);

  // Competitions Management State
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [competitionsModalOpen, setCompetitionsModalOpen] = useState(false);
  const [newCompTitle, setNewCompTitle] = useState('مسابقة حفظ سورة الكهف والتدبر الأسبوعية');
  const [newCompFrequency, setNewCompFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'occasions' | 'instant'>('weekly');
  const [newCompTargetAudience, setNewCompTargetAudience] = useState<'all' | 'male' | 'female'>('all');
  const [newCompOccasion, setNewCompOccasion] = useState('يوم الجمعة المبارك');
  const [newCompScope, setNewCompScope] = useState('حفظ وتسميع سورة الكهف كاملة برواية معتمدة مع الإتقان لأحكام المدود والتجويد');
  const [newCompDurationDays, setNewCompDurationDays] = useState(7);
  const [newCompPrizePool, setNewCompPrizePool] = useState(2000);
  const [newCompFirstPrize, setNewCompFirstPrize] = useState(1000);
  const [newCompSecondPrize, setNewCompSecondPrize] = useState(600);
  const [newCompThirdPrize, setNewCompThirdPrize] = useState(400);
  const [newCompRewardPoints, setNewCompRewardPoints] = useState(5000);
  const [compSaveMessage, setCompSaveMessage] = useState<string | null>(null);
  const [selectedCompForAward, setSelectedCompForAward] = useState<Competition | null>(null);

  // Handle Logo Secret Clicks (5 clicks Easter Egg)
  const handleLogoClick = () => {
    const nextClicks = logoClicks + 1;
    setLogoClicks(nextClicks);

    if (nextClicks >= 5) {
      setLogoClicks(0);
      setAdminModalOpen(true);
    }
  };

  const handleAdminLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAdminError(null);

    const email = adminEmailInput.trim().toLowerCase();
    const password = adminPasswordInput.trim();

    if (!email) {
      setAdminError('يرجى إدخال البريد الإلكتروني المعتمد للمشرف.');
      return;
    }
    if (!password) {
      setAdminError('يرجى إدخال كلمة المرور الإدارية.');
      return;
    }

    const isTargetAdmin =
      email === 'mohamedyoussef255@gmail.com' &&
      (password === 'mohamed2072' || password === '000000');

    if (!isTargetAdmin) {
      setAdminError('❌ بيانات الدخول غير صحيحة! الدخول مخصص حصرياً للمشرف عبر البريد: mohamedyoussef255@gmail.com وكلمة المرور المحددة.');
      return;
    }

    // Attempt online synchronization with the server backend
    try {
      const res = await fetch('/api/v1/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.settings) {
          setAdminSettings(data.settings);
        }
      }
    } catch (networkErr) {
      console.warn('Backend sync notice: Proceeding with authenticated local admin session', networkErr);
    }

    // Guaranteed successful entrance for authorized admin
    setIsAdminLoggedIn(true);
    setAdminModalOpen(false);
    setAdminPasswordInput('');
    setView('admin');
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    loadAdminData(password);
  };

  const loadAdminData = async (pwd?: string) => {
    const key = pwd || adminSettings?.secretPassword || secretPassword;
    try {
      const res = await fetch('/api/v1/admin/data', {
        headers: { 'x-admin-key': key },
      });
      const data = await res.json();
      if (data.success) {
        setAdminStats(data.stats);
        setAdminViolations(data.violations || []);
        setWithdrawalsList(data.withdrawalRequests || []);
        setSilverTokensVal(data.settings.silverTokens);
        setGoldTokensVal(data.settings.goldTokens);
        setPlatinumTokensVal(data.settings.platinumTokens);

        if (data.paymentMethods) {
          setPaymentMethods(data.paymentMethods);
          setAdminIpa(data.paymentMethods.instapay.ipa);
          setAdminInstaPhone(data.paymentMethods.instapay.phone);
          setAdminInstaAccount(data.paymentMethods.instapay.accountName);
          setAdminVodafonePhone(data.paymentMethods.vodafoneCash.phone);
          setAdminVodafoneAccount(data.paymentMethods.vodafoneCash.accountName);
          setAdminBankName(data.paymentMethods.bankAccount.bankName);
          setAdminBankAccount(data.paymentMethods.bankAccount.accountNumber);
          setAdminBankIban(data.paymentMethods.bankAccount.iban);
          setAdminBankSwift(data.paymentMethods.bankAccount.swiftCode);
          setAdminBankHolder(data.paymentMethods.bankAccount.accountHolder);
          if (data.paymentMethods.bankAccount.branchName) setAdminBankBranch(data.paymentMethods.bankAccount.branchName);
          if (data.paymentMethods.bankAccount.country) setAdminBankCountry(data.paymentMethods.bankAccount.country);
          if (data.paymentMethods.bankAccount.acceptedCurrencies) setAdminBankCurrencies(data.paymentMethods.bankAccount.acceptedCurrencies.join(', '));
          if (data.paymentMethods.bankAccount.intermediaryBank) setAdminBankIntermediary(data.paymentMethods.bankAccount.intermediaryBank);
          if (data.paymentMethods.bankAccount.instructionsForInternational) setAdminBankIntInstructions(data.paymentMethods.bankAccount.instructionsForInternational);
          setAdminStcPhone(data.paymentMethods.stcPay.phone);
          setAdminStcAccount(data.paymentMethods.stcPay.accountName);
          setAdminWhatsappPhone(data.paymentMethods.whatsappConfirmationPhone);
          setAdminPaymentInstructions(data.paymentMethods.paymentInstructions);
        }

        if (data.revenueFund) {
          setRevenueFund(data.revenueFund);
          setRewardPercentageVal(data.revenueFund.rewardAllocationPercentage);
          setTotalRevenueVal(data.revenueFund.totalPlatformRevenue);
          if (data.revenueFund.incentiveRates) {
            setRateAyahPoints(data.revenueFund.incentiveRates.pointsPerAyah);
            setRateAyahCash(data.revenueFund.incentiveRates.cashPerAyah);
            setRateSurahPoints(data.revenueFund.incentiveRates.pointsPerSurah);
            setRateSurahCash(data.revenueFund.incentiveRates.cashPerSurah);
            setRateJuzPoints(data.revenueFund.incentiveRates.pointsPerJuz);
            setRateJuzCash(data.revenueFund.incentiveRates.cashPerJuz);
            setRateKhatmahPoints(data.revenueFund.incentiveRates.pointsPerKhatmah);
            setRateKhatmahCash(data.revenueFund.incentiveRates.cashPerKhatmah);
          }
        }

        if (data.competitions) {
          setCompetitions(data.competitions);
        }
      }

      // Fetch SQL Schema
      const schemaRes = await fetch('/api/v1/admin/schema');
      const schemaText = await schemaRes.text();
      setSqlSchema(schemaText);
    } catch (e) {
      console.error(e);
    }
  };

  // Fetch Quran verse details
  const loadVerse = async (surah: number, ayah: number) => {
    setLoadingVerse(true);
    try {
      const res = await fetch(`/api/v1/quran/verse-details?surah=${surah}&ayah=${ayah}`);
      const data = await res.json();
      if (data.success) {
        setVerseData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingVerse(false);
    }
  };

  // Fetch Hifz plans
  const loadHifzPlans = async () => {
    try {
      const res = await fetch('/api/v1/hifz/plans');
      const data = await res.json();
      if (data.success) {
        setHifzPlans(data.plans);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const togglePlanCompleted = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/hifz/plans/${id}/toggle`, { method: 'PATCH' });
      const data = await res.json();
      if (data.success) {
        setHifzPlans((prev) => prev.map((p) => (p.id === id ? data.plan : p)));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/hifz/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          surahNumber: 24,
          surahName: newPlanSurah,
          verseStart: newPlanStart,
          verseEnd: newPlanEnd,
          targetDate: newPlanDate || new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
          tajweedNotes: 'تطبيق أحكام النون والميم المشددتين ومخارج الحروف بدقة',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setHifzPlans((prev) => [data.plan, ...prev]);
        setIsAddingPlan(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Audio Recording handler
  const startRecording = async () => {
    try {
      setRecordedAudioUrl(null);
      setAiTajweedEval(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.warn('Microphone access denied or not supported, using simulation mode:', err);
      // Simulated recording fallback
      setIsRecording(true);
      setRecordingDuration(0);
      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    }
  };

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRecording(false);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else {
      setRecordedAudioUrl('demo-voice-recording.wav');
    }

    // Trigger AI Tajweed Evaluation
    evaluateRecitation();
  };

  const evaluateRecitation = () => {
    setEvaluatingTajweed(true);
    setTimeout(() => {
      setAiTajweedEval({
        score: 94,
        makharij: 'ممتاز - مخارج الحروف واضحة وحروف الاستعلاء مطبقة بإتقان',
        tajweedRules: 'تم رصد مد منفصل صحيح (4 حركات)، وغنة الميم المشددة بمقدار حركتين.',
        recommendation: 'استمر على هذا النفس المتزن وراجع موضع الوقف في نهاية الآية الكريمة.',
        status: 'متقن ومقبول للمراجعة',
      });
      setEvaluatingTajweed(false);
    }, 1200);
  };

  // Fetch Marriage Profiles with Strict Gender Isolation
  const loadMarriageProfiles = async () => {
    setLoadingProfiles(true);
    try {
      const res = await fetch(`/api/v1/marriage/profiles?maritalStatus=${maritalFilter}`, {
        headers: {
          'user-gender': userGender,
        },
      });
      const data = await res.json();
      if (data.success) {
        setProfiles(data.profiles);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingProfiles(false);
    }
  };

  // Run AI Matchmaking
  const handleRunAiMatch = async () => {
    setLoadingAiMatch(true);
    try {
      const res = await fetch('/api/v1/marriage/ai-match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-gender': userGender,
        },
        body: JSON.stringify({
          preferredStatus: maritalFilter,
          userAge: userGender === 'male' ? 28 : 24,
          userQualifications: userGender === 'male' ? 'طبيب بشري' : 'مهندسة برمجيات',
          userHifz: 'حافظ لكتاب الله',
          userNotes: 'ملتزم بالهدي النبوي والجدية مع موافقة الولي',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAiMatchResults(data.matches);
        setProfiles(data.matches);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAiMatch(false);
    }
  };

  // Handle Smart Escrow Request
  const handleEscrowRequest = async (profile: MarriageProfile) => {
    setRequestingEscrow(true);
    try {
      const res = await fetch('/api/v1/marriage/escrow-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-gender': userGender,
        },
        body: JSON.stringify({
          profileCode: profile.code,
          depositAmount: 250,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEscrowResult(data);
        setEscrowModalOpen(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setRequestingEscrow(false);
    }
  };

  // Handle Chat Message with Chat Firewall Test
  const handleSendChatMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatMessage.trim()) return;

    setChatError(null);
    setChatSuccess(null);

    try {
      const res = await fetch('/api/v1/chat/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-gender': userGender,
        },
        body: JSON.stringify({
          message: chatMessage,
          recipientCode: selectedProfile?.code || 'MINHAJ-MATCH',
          senderGender: userGender,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        // Chat Firewall Violation Triggered!
        setChatError(data.error || '🚫 حظر أمني: تم رصد محاولة تداول أرقام هواتف أو كلمات التفافية!');
      } else {
        setChatSuccess('✅ تم إرسال رسالتك بأمان ومطابقتها لمعايير العفة والتعامل الرقمي للمنصة.');
        setChatMessagesList((prev) => [
          ...prev,
          {
            sender: userGender === 'male' ? 'أنت (راغب الزواج الشرعي)' : 'أنتِ (راغبة الزواج الشرعي)',
            text: chatMessage,
            time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
            safe: true,
          },
        ]);
        setChatMessage('');
      }
    } catch {
      setChatError('فشل فحص الرسالة في جدار الحماية الشرعي');
    }
  };

  // Fetch Wallet Data
  const loadWallet = async () => {
    try {
      const res = await fetch('/api/v1/wallet');
      const data = await res.json();
      if (data.success) {
        setWallet(data.wallet);
        setWithdrawalsList(data.withdrawalRequests);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Handle Withdrawal Submission
  const handleWithdrawalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawError(null);
    setWithdrawStatus(null);

    try {
      const res = await fetch('/api/v1/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          method: withdrawMethod,
          payoutAddress: withdrawAccount,
          amount: parseFloat(withdrawAmount),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setWithdrawStatus(data.message);
        if (wallet) {
          setWallet({ ...wallet, earnedCash: data.remainingCash });
        }
        setWithdrawalsList((prev) => [data.withdrawal, ...prev]);
      } else {
        setWithdrawError(data.error || 'فشل تنفيذ طلب السحب');
      }
    } catch {
      setWithdrawError('فشل الاتصال بالخادم المالي');
    }
  };

  // Admin Actions on Withdrawals
  const handleAdminWithdrawalAction = async (id: string, action: 'approve' | 'reject') => {
    try {
      const res = await fetch(`/api/v1/admin/withdrawals/${id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.success) {
        setWithdrawalsList((prev) => prev.map((w) => (w.id === id ? data.withdrawal : w)));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Marriage Packages Handler
  const loadPackages = async () => {
    try {
      const res = await fetch('/api/v1/marriage/packages');
      const data = await res.json();
      if (data.success && Array.isArray(data.packages)) {
        setPackages(data.packages);
        const royal = data.packages.find((p: any) => p.isHighestTier);
        if (royal) {
          setRoyalPriceVal(royal.price);
          setRoyalDurationVal(royal.durationDays);
        }
        const silver = data.packages.find((p: any) => p.tier === 'silver');
        if (silver) setSilverPriceVal(silver.price);
        const gold = data.packages.find((p: any) => p.tier === 'gold');
        if (gold) setGoldPriceVal(gold.price);
        const platinum = data.packages.find((p: any) => p.tier === 'platinum');
        if (platinum) setPlatinumPriceVal(platinum.price);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubscribePackage = async (pkg: MarriagePackage) => {
    try {
      const res = await fetch('/api/v1/marriage/subscribe-package', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-gender': userGender,
        },
        body: JSON.stringify({
          packageId: pkg.id,
          profileCode: userGender === 'male' ? 'MINHAJ-M-312' : 'MINHAJ-W-774',
        }),
      });
      const data = await res.json();
      if (data.success) {
        await loadMarriageProfiles();
        await loadPackages();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Admin Update Settings
  const handleUpdateAdminSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminSaveMessage(null);
    try {
      const updatedPackages = packages.map((p) => {
        if (p.isHighestTier) {
          return { ...p, price: Number(royalPriceVal), durationDays: Number(royalDurationVal) };
        }
        if (p.tier === 'silver') return { ...p, price: Number(silverPriceVal) };
        if (p.tier === 'gold') return { ...p, price: Number(goldPriceVal) };
        if (p.tier === 'platinum') return { ...p, price: Number(platinumPriceVal) };
        return p;
      });

      const res = await fetch('/api/v1/admin/update-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secretPassword: adminSettings?.secretPassword || secretPassword,
          newPassword: newAdminPassword || undefined,
          silverTokens: silverTokensVal,
          goldTokens: goldTokensVal,
          platinumTokens: platinumTokensVal,
          packages: updatedPackages,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAdminSaveMessage('✅ تم حفظ الإعدادات، والرمز السري، وتعديلات باقات الزواج بنجاح.');
        if (newAdminPassword) setSecretPassword(newAdminPassword);
        await loadPackages();
        await loadMarriageProfiles();
      } else {
        setAdminSaveMessage(data.error || '❌ تعذر الحفظ.');
      }
    } catch {
      setAdminSaveMessage('❌ تعذر الحفظ.');
    }
  };

  // 1. Payment Methods Handlers
  const loadPaymentMethods = async () => {
    try {
      const res = await fetch('/api/v1/payment-methods');
      const data = await res.json();
      if (data.success && data.paymentMethods) {
        setPaymentMethods(data.paymentMethods);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSavePaymentMethods = async (e: React.FormEvent) => {
    e.preventDefault();
    setPaymentSaveMessage(null);
    try {
      const updatedConfig: PaymentMethodsConfig = {
        instapay: {
          enabled: true,
          ipa: adminIpa.trim(),
          phone: adminInstaPhone.trim(),
          accountName: adminInstaAccount.trim(),
        },
        vodafoneCash: {
          enabled: true,
          phone: adminVodafonePhone.trim(),
          accountName: adminVodafoneAccount.trim(),
        },
        bankAccount: {
          enabled: true,
          bankName: adminBankName.trim(),
          accountNumber: adminBankAccount.trim(),
          iban: adminBankIban.trim(),
          swiftCode: adminBankSwift.trim(),
          accountHolder: adminBankHolder.trim(),
          branchName: adminBankBranch.trim(),
          country: adminBankCountry.trim(),
          acceptedCurrencies: adminBankCurrencies.split(',').map((s) => s.trim()).filter(Boolean),
          intermediaryBank: adminBankIntermediary.trim(),
          instructionsForInternational: adminBankIntInstructions.trim(),
        },
        stcPay: {
          enabled: true,
          phone: adminStcPhone.trim(),
          accountName: adminStcAccount.trim(),
        },
        paymentInstructions: adminPaymentInstructions.trim(),
        whatsappConfirmationPhone: adminWhatsappPhone.trim(),
      };

      const res = await fetch('/api/v1/admin/payment-methods', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminSettings?.secretPassword || secretPassword,
        },
        body: JSON.stringify({ paymentMethods: updatedConfig }),
      });
      const data = await res.json();
      if (data.success) {
        setPaymentSaveMessage('✅ تم حفظ وتحديث بيانات انستاباي، المحافظ الإلكترونية، والحساب البنكي الدولي بنجاح.');
        setPaymentMethods(data.paymentMethods);
      } else {
        setPaymentSaveMessage(data.error || '❌ تعذر حفظ بيانات الدفع.');
      }
    } catch {
      setPaymentSaveMessage('❌ حدث خطأ أثناء الحفظ.');
    }
  };

  // Reset / Clear Demo Data Handler
  const handleClearDemoData = async () => {
    setIsClearingDemoData(true);
    setClearDemoSuccessMessage(null);
    try {
      const key = adminSettings?.secretPassword || secretPassword || '000000';
      const res = await fetch('/api/v1/admin/reset-demo-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': key,
        },
      });
      const data = await res.json();
      if (data.success) {
        setClearDemoSuccessMessage(`✅ ${data.message}`);
        setShowClearDemoConfirm(false);
        await loadAdminData(key);
        await loadMarriageProfiles();
        await loadCompetitions();
        await loadRevenueFund();
        setTimeout(() => setClearDemoSuccessMessage(null), 6000);
      } else {
        setAdminSaveMessage(data.error || 'تعذر مسح البيانات التجريبية.');
      }
    } catch {
      setAdminSaveMessage('حدث خطأ أثناء الاتصال بالخادم لمسح البيانات التجريبية.');
    } finally {
      setIsClearingDemoData(false);
    }
  };

  // 2. Revenue Fund & Self-Paced Incentives Handlers
  const loadRevenueFund = async () => {
    try {
      const res = await fetch('/api/v1/revenue-fund');
      const data = await res.json();
      if (data.success && data.revenueFund) {
        setRevenueFund(data.revenueFund);
        setRewardPercentageVal(data.revenueFund.rewardAllocationPercentage);
        setTotalRevenueVal(data.revenueFund.totalPlatformRevenue);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveRevenueFund = async (e: React.FormEvent) => {
    e.preventDefault();
    setFundSaveMessage(null);
    try {
      const res = await fetch('/api/v1/admin/revenue-fund/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminSettings?.secretPassword || secretPassword,
        },
        body: JSON.stringify({
          rewardAllocationPercentage: Number(rewardPercentageVal),
          totalPlatformRevenue: Number(totalRevenueVal),
          incentiveRates: {
            pointsPerAyah: Number(rateAyahPoints),
            cashPerAyah: Number(rateAyahCash),
            pointsPerSurah: Number(rateSurahPoints),
            cashPerSurah: Number(rateSurahCash),
            pointsPerJuz: Number(rateJuzPoints),
            cashPerJuz: Number(rateJuzCash),
            pointsPerKhatmah: Number(rateKhatmahPoints),
            cashPerKhatmah: Number(rateKhatmahCash),
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFundSaveMessage('✅ تم تحديث مخصص بند الجوائز من الإيرادات ومعدلات حوافز الحفظ بنجاح.');
        setRevenueFund(data.revenueFund);
      } else {
        setFundSaveMessage(data.error || '❌ تعذر حفظ صندوق الإيرادات.');
      }
    } catch {
      setFundSaveMessage('❌ حدث خطأ أثناء الحفظ.');
    }
  };

  // 3. Competitions Handlers
  const loadCompetitions = async () => {
    try {
      const res = await fetch(`/api/v1/competitions?gender=${userGender}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.competitions)) {
        setCompetitions(data.competitions);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateCompetition = async (e: React.FormEvent) => {
    e.preventDefault();
    setCompSaveMessage(null);
    try {
      const res = await fetch('/api/v1/admin/competitions/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminSettings?.secretPassword || secretPassword,
        },
        body: JSON.stringify({
          title: newCompTitle,
          frequency: newCompFrequency,
          targetAudience: newCompTargetAudience,
          occasionName: newCompOccasion,
          scopeDescription: newCompScope,
          endDateDays: Number(newCompDurationDays),
          prizePool: Number(newCompPrizePool),
          rewardPoints: Number(newCompRewardPoints),
          firstPlacePrize: Number(newCompFirstPrize),
          secondPlacePrize: Number(newCompSecondPrize),
          thirdPlacePrize: Number(newCompThirdPrize),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCompSaveMessage('✅ تم إطلاق وإعلان المسابقة في كافة صفحات التطبيق بنجاح!');
        await loadCompetitions();
      } else {
        setCompSaveMessage(data.error || '❌ تعذر إنشاء المسابقة.');
      }
    } catch {
      setCompSaveMessage('❌ حدث خطأ أثناء إطلاق المسابقة.');
    }
  };

  const handleAwardCompetition = async (compId: string, winners: any[]) => {
    try {
      const res = await fetch(`/api/v1/admin/competitions/${compId}/award`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminSettings?.secretPassword || secretPassword,
        },
        body: JSON.stringify({ winners }),
      });
      const data = await res.json();
      if (data.success) {
        await loadCompetitions();
        await loadRevenueFund();
        await loadWallet();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleJoinCompetition = async (
    compId: string,
    submissionNotes: string,
    submissionAudioUrl?: string
  ) => {
    const res = await fetch(`/api/v1/competitions/${compId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: currentUser?.id,
        userName: currentUser?.fullName,
        gender: userGender,
        submissionNotes,
        submissionAudioUrl,
      }),
    });
    const data = await res.json();
    if (data.success) {
      await loadCompetitions();
    }
  };

  const handleClaimSelfIncentive = async (
    type: 'ayah' | 'surah' | 'juz' | 'khatmah',
    count: number,
    title: string
  ) => {
    const res = await fetch('/api/v1/hifz/claim-self-incentive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: currentUser?.id,
        type,
        count,
        title,
        gender: userGender,
      }),
    });
    const data = await res.json();
    if (data.success) {
      if (data.wallet) {
        setWallet(data.wallet);
      }
      await loadRevenueFund();
      return {
        success: true,
        message: data.message,
        points: data.claim.pointsEarned,
        cash: data.claim.cashEarned,
      };
    }
    throw new Error(data.error || 'فشل حصد المكافأة');
  };

  // Initial Load & Lifecycle
  useEffect(() => {
    loadVerse(selectedSurah, selectedAyah);
    loadHifzPlans();
    loadMarriageProfiles();
    loadWallet();
    loadPackages();
    loadPaymentMethods();
    loadRevenueFund();
    loadCompetitions();
  }, []);

  // Reload marriage profiles on gender change or filter change
  useEffect(() => {
    loadMarriageProfiles();
  }, [userGender, maritalFilter]);

  if (!hasSelectedPortal) {
    return (
      <SplashAndGateway
        onSelectGender={(gender) => {
          switchGender(gender);
          setHasSelectedPortal(true);
        }}
        onAdminClick={() => {
          setAdminModalOpen(true);
        }}
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
        selectedLanguage={selectedLanguage}
        onOpenLanguageModal={() => setLangModalOpen(true)}
        colorPaletteId={colorPaletteId}
        onSelectPalette={setColorPaletteId}
      />
    );
  }

  const isDark = theme === 'dark';

  return (
    <div
      id="minhaj-app-root"
      style={{ backgroundColor: 'var(--theme-bg-root)' }}
      className={`min-h-screen flex flex-col items-center justify-start antialiased transition-colors duration-300 overflow-x-hidden selection:bg-cyan-500 selection:text-white ${
        isDark ? 'bg-islamic-pattern-dark text-stone-100' : 'bg-islamic-pattern-light text-[#0a2737]'
      }`}
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {/* Mobile-Centric Container with high-end desktop max-w framing */}
      <div
        id="minhaj-central-container"
        style={{
          backgroundColor: 'var(--theme-bg-card)',
          borderColor: 'var(--theme-border)',
        }}
        className={`w-full max-w-2xl border-x min-h-screen flex flex-col shadow-2xl relative pb-28 transition-colors duration-300 overflow-x-clip ${
          isDark ? 'bg-[#0b212c] border-[#164e63]' : 'bg-white border-[#cde2ec]'
        }`}
      >

        {/* 🕋 Top Header & Islamic Branding */}
        <header
          id="minhaj-header"
          style={{
            backgroundColor: 'var(--theme-bg-header)',
            borderColor: 'var(--theme-border)',
          }}
          className={`sticky top-0 z-40 backdrop-blur-md border-b px-3 sm:px-4 py-2.5 sm:py-3 select-none transition-colors duration-300 ${
            isDark ? 'bg-[#06141c]/95 border-[#164e63]/70' : 'bg-white/95 border-[#cde2ec] shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            {/* Secret Clickable Logo (5 clicks triggers admin access) */}
            <div className="flex items-center gap-2">
              <button
                id="minhaj-logo-button"
                onClick={handleLogoClick}
                className="group text-right transition-transform active:scale-95 focus:outline-none flex items-center gap-2"
                title="انقر 5 مرات على شعار منهاج للدخول للوحة الإدارة"
              >
                <div className="shrink-0">
                  <MinhajOfficialLogo size="sm" showSubtitle={false} theme={theme} />
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg sm:text-xl font-black tracking-wider text-amber-400 font-quran drop-shadow-[0_2px_10px_rgba(251,191,36,0.2)]">
                      مِـنْـهَـاجْ
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono border font-bold ${
                      isDark ? 'bg-cyan-950/90 text-cyan-300 border-cyan-700/40' : 'bg-[#e0f2fe] text-[#0369a1] border-[#bae6fd]'
                    }`}>
                      v2.5
                    </span>
                    {logoClicks > 0 && logoClicks < 5 && (
                      <span className="text-[10px] text-amber-500 font-mono animate-pulse font-bold">
                        ({logoClicks}/5)
                      </span>
                    )}
                  </div>
                  <p className={`text-[10px] -mt-0.5 hidden xs:block ${isDark ? 'text-stone-400' : 'text-[#335568]'}`}>
                    {t('appName')}
                  </p>
                </div>
              </button>
            </div>

            {/* Portal Controls, Color Palette, Theme Toggle, Language, Country & User Auth */}
            <div className="flex items-center gap-1 sm:gap-1.5">
              {/* 🎨 Color Palette Selector (بنتونة الألوان) */}
              <ColorPaletteBar
                currentPaletteId={colorPaletteId}
                onSelectPalette={setColorPaletteId}
                theme={theme}
              />

              {/* Day / Night Mode Switcher */}
              <button
                id="main-theme-toggle-btn"
                onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
                className={`p-1.5 sm:p-2 rounded-xl border transition-all ${
                  isDark
                    ? 'bg-[#0b212c] border-[#164e63] text-amber-400 hover:bg-[#0e2c3b]'
                    : 'bg-white border-[#cde2ec] text-[#0c3e54] hover:bg-[#f0f7fa] shadow-sm'
                }`}
                title={isDark ? 'تفعيل الوضع النهاري' : 'تفعيل الوضع الليلي'}
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* ⚙️ Admin Control Panel Trigger Button (أيقونة تروس الإعدادات للإدارة ولوحة التحكم) */}
              <button
                id="header-admin-cog-btn"
                type="button"
                onClick={() => {
                  if (isAdminLoggedIn) {
                    setView('admin');
                    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
                  } else {
                    setAdminModalOpen(true);
                  }
                }}
                className={`p-1.5 sm:p-2 rounded-xl border transition-all duration-200 group flex items-center gap-1.5 ${
                  isAdminLoggedIn
                    ? 'bg-amber-500 text-stone-950 border-amber-400 font-bold shadow-md'
                    : isDark
                    ? 'bg-[#0b212c] border-[#164e63] text-amber-400 hover:bg-[#0e2c3b] hover:border-amber-400/60'
                    : 'bg-white border-[#cde2ec] text-[#0c3e54] hover:text-amber-600 hover:bg-[#f0f7fa] shadow-sm'
                }`}
                title="لوحة الإدارة والتحكم (للمشرف العام)"
                aria-label="لوحة الإدارة والتحكم"
              >
                <Settings className={`w-4 h-4 text-amber-400 transition-transform duration-500 ${isAdminLoggedIn ? 'animate-spin [animation-duration:10s]' : 'group-hover:rotate-90'}`} />
                <span className="text-[11px] font-bold hidden md:inline">
                  {isAdminLoggedIn ? 'لوحة الإدارة' : 'الإدارة'}
                </span>
                {isAdminLoggedIn && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                )}
              </button>

              {/* 🌐 Language Switcher Button (أيقونة تغيير اللغة) */}
              <button
                id="header-language-btn"
                type="button"
                onClick={() => setLangModalOpen(true)}
                className={`flex items-center gap-1 px-1.5 sm:px-2 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-sm ${
                  isDark
                    ? 'bg-[#0b212c] border-[#164e63] text-stone-200 hover:bg-[#0e2c3b] hover:text-white'
                    : 'bg-white border-[#cde2ec] text-[#0c3e54] hover:bg-[#f0f7fa]'
                }`}
                title={t('selectLanguage') || 'تغيير لغة العرض (Change Language)'}
              >
                <Languages className="w-4 h-4 text-cyan-500" />
                <span className="font-mono text-xs uppercase font-bold">{selectedLanguage}</span>
              </button>

              {/* Country Selector Button */}
              <button
                id="country-switch-btn"
                onClick={() => setCountryModalOpen(true)}
                className={`flex items-center gap-1 px-1.5 sm:px-2 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                  isDark
                    ? 'bg-[#0b212c] border-[#164e63] text-stone-300 hover:bg-[#0e2c3b] hover:text-white'
                    : 'bg-white border-[#cde2ec] text-[#0c3e54] hover:bg-[#f0f7fa] shadow-sm'
                }`}
                title={t('changeCountry')}
              >
                <span>{activeCountryObj.flag}</span>
                <span className="text-[11px] font-mono hidden sm:inline">{activeCountryObj.currency}</span>
              </button>

              {/* STRICT GENDER ISOLATION: Display Portal Name */}
              {userGender === 'male' ? (
                <div className={`flex items-center gap-1 px-2 py-1.5 rounded-xl border text-xs font-bold ${
                  isDark ? 'bg-cyan-950/80 border-cyan-700/50 text-cyan-300' : 'bg-[#e0f2fe] border-[#bae6fd] text-[#0369a1] shadow-sm'
                }`}>
                  <span>👨</span>
                  <span className="hidden md:inline">{t('brothers')}</span>
                </div>
              ) : (
                <div className={`flex items-center gap-1 px-2 py-1.5 rounded-xl border text-xs font-bold ${
                  isDark ? 'bg-amber-950/80 border-amber-700/50 text-amber-300' : 'bg-[#fffbeb] border-[#fde68a] text-[#92400e] shadow-sm'
                }`}>
                  <span>🧕</span>
                  <span className="hidden md:inline">{t('sisters')}</span>
                </div>
              )}

              {/* Change Portal Button */}
              <button
                id="switch-portal-btn"
                onClick={() => setHasSelectedPortal(false)}
                className={`flex items-center gap-1 px-2 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                  isDark
                    ? 'bg-[#0b212c] border-[#164e63] text-stone-300 hover:bg-[#0e2c3b]'
                    : 'bg-white border-[#cde2ec] text-[#0c3e54] hover:bg-[#f0f7fa] shadow-sm'
                }`}
                title={t('portal_switch')}
              >
                <DoorOpen className="w-3.5 h-3.5 text-amber-500" />
                <span className="hidden lg:inline">{t('portal_switch')}</span>
              </button>

              {/* Login & Registration Portal Button */}
              <button
                id="open-auth-portal-btn"
                onClick={() => setAuthModalOpen(true)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-sm ${
                  isDark
                    ? 'bg-[#0e3b4d] hover:bg-[#154e66] text-cyan-200 border-cyan-700/60'
                    : 'bg-[#0891b2] hover:bg-[#0e7490] text-white border-[#0891b2]'
                }`}
                title={t('sign_in')}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">
                  {currentUser ? currentUser.fullName.split(' ')[0] : t('sign_in')}
                </span>
                <span className="sm:hidden">{t('my_account')}</span>
              </button>
            </div>
          </div>

          {/* Gender Isolation Status Sub-banner */}
          <div className={`mt-2 text-[11px] flex items-center justify-between px-3 py-1.5 rounded-lg border ${
            isDark ? 'bg-stone-900/90 border-emerald-900/30 text-stone-300' : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
          }`}>
            <span className="flex items-center gap-1.5 text-emerald-500 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>
                {userGender === 'male'
                  ? t('session_isolated_male')
                  : t('session_isolated_female')}
              </span>
            </span>
            <div className="flex items-center gap-2 font-mono text-[10px] text-stone-400">
              <span className="text-amber-400 font-bold">{activeCountryObj.flag} {activeCountryObj.currency}</span>
              <span>•</span>
              <span className="text-emerald-400 font-bold">{selectedLanguage.toUpperCase()}</span>
              <span>•</span>
              <span className="text-amber-300 font-bold">{wallet?.availablePoints || 450} {t('points_unit')}</span>
            </div>
          </div>
        </header>

        {/* 🧭 Top Icon Navigation Bar: الانتقال بين الأقسام بأيقونات مستقلة */}
        <nav
          id="minhaj-top-icon-nav"
          aria-label={t('appName')}
          className={`sticky top-[56px] z-30 px-2 py-2 border-b flex items-center justify-start sm:justify-center gap-1.5 overflow-x-auto scrollbar-none transition-colors select-none ${
            isDark ? 'bg-[#081a24]/95 backdrop-blur-md border-[#164e63]' : 'bg-[#ffffff]/95 backdrop-blur-md border-[#cde2ec] shadow-2xs'
          }`}
        >
          {[
            { id: 'quran', label: t('navQuran'), icon: BookOpen },
            { id: 'halaqat', label: t('navHalaqat'), icon: Radio, isLive: true },
            { id: 'marriage', label: t('navMarriage'), icon: Heart },
            { id: 'competitions', label: t('navCompetitions'), icon: Trophy, count: competitions?.length },
            { id: 'incentives', label: t('navIncentives'), icon: Coins },
            { id: 'references', label: t('navReferences'), icon: Library },
            { id: 'wallet', label: t('navWallet'), icon: WalletIcon },
            { id: 'admin', label: 'لوحة التحكم', icon: Settings },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = view === item.id;
            return (
              <button
                key={item.id}
                id={`icon-nav-tab-${item.id}`}
                onClick={() => {
                  if (item.id === 'admin') {
                    if (isAdminLoggedIn) {
                      setView('admin');
                    } else {
                      setAdminModalOpen(true);
                    }
                  } else {
                    setView(item.id as any);
                  }
                  if (typeof window !== 'undefined') {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 border cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-[#0c3e54] to-[#0891b2] text-white border-cyan-400/50 shadow-md scale-102'
                    : isDark
                    ? 'bg-[#071923] text-stone-300 border-[#164e63]/70 hover:bg-[#0d2a3a] hover:text-white'
                    : 'bg-[#f4f8fa] text-[#0a2737] border-[#cde2ec] hover:bg-white hover:border-[#0891b2] shadow-2xs'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-300' : 'text-cyan-500'}`} />
                  {item.isLive && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 absolute -top-0.5 -right-0.5 animate-pulse" />
                  )}
                </div>
                <span className="whitespace-nowrap">{item.label}</span>
                {item.count !== undefined && item.count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-amber-500/20 text-amber-500'
                  }`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* 📱 Main Body Content based on Active View */}
        <main className="flex-1 p-4 space-y-6">

          {/* ========================================================================= */}
          {/* VIEW 1: QURAN & HIFZ TRACKER (المصحف الشريف والتلاوة وتكرار الحفظ)          */}
          {/* ========================================================================= */}
          {view === 'quran' && (
            <div id="quran-view" className="space-y-5 animate-in fade-in duration-200">
              <QuranSection
                currentUser={currentUser}
                wallet={wallet}
                theme={theme}
                onRewardPoints={(points, message) => {
                  setWallet((prev) => (prev ? { ...prev, availablePoints: prev.availablePoints + points } : prev));
                }}
              />
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW: HALAQAT TADABBUR ROOMS (حلقات الحفظ والتدبر المباشرة المستقلة)       */}
          {/* ========================================================================= */}
          {view === 'halaqat' && (
            <div id="halaqat-view" className="space-y-5 animate-in fade-in duration-200">
              <HalaqatTadabburRooms
                currentUser={currentUser}
                userGender={userGender}
                displayMode="full"
                theme={theme}
                initialRoomId={invitedRoomId}
                onNavigateToQuran={(surah, ayah) => {
                  setSelectedSurah(surah);
                  setSelectedAyah(ayah);
                  setView('quran');
                }}
              />
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 2: SHARIA MARRIAGE & MATCHMAKING (الزواج الشرعي والعفة)             */}
          {/* ========================================================================= */}
          {view === 'marriage' && (
            <div id="marriage-view" className="space-y-5 animate-in fade-in duration-200">
              
              {/* Marriage Packages Spotlight Banner (New Feature: Royal Monthly & Visibility Packages) */}
              <div className={`p-4 sm:p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg transition-all ${
                isDark
                  ? 'bg-gradient-to-r from-amber-950/50 via-stone-900 to-stone-900 border-amber-500/40'
                  : 'bg-gradient-to-r from-amber-50 via-white to-amber-50/40 border-amber-300'
              }`}>
                <div className="flex items-center gap-3.5 w-full sm:w-auto">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-stone-950 flex items-center justify-center shrink-0 shadow-md">
                    <Crown className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm sm:text-base text-amber-500">
                        باقات العفة والظهور الملكي (ثبات شهر كامل)
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-mono font-bold">
                        مميز
                      </span>
                    </div>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
                      ثبّت استمارتك في قمة الصدارة لمدة شهر كامل وضاعف فرص القبول والتكافؤ الشرعي مع الولي.
                    </p>
                  </div>
                </div>

                <button
                  id="open-marriage-packages-modal-btn"
                  onClick={() => setPackagesModalOpen(true)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-black text-xs transition-all active:scale-95 shadow-md flex items-center justify-center gap-2 shrink-0"
                >
                  <Crown className="w-4 h-4" />
                  <span>استعراض الباقات والترقية</span>
                </button>
              </div>

              {/* Sharia Banner & AI Matchmaking Action */}
              <div className={`p-4 sm:p-5 rounded-2xl border shadow-xl space-y-4 overflow-hidden ${
                isDark
                  ? 'bg-gradient-to-r from-emerald-950 via-stone-900 to-stone-900 border-emerald-800/40'
                  : 'bg-white border-emerald-200'
              }`}>
                <div className="flex flex-col gap-3.5">
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-900/40 text-cyan-500 text-[11px] border border-cyan-700/30 mb-2 font-bold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      ضوابط العفة الشرعية والسرية التامة
                    </span>
                    <h2 className={`text-base font-bold ${isDark ? 'text-stone-100' : 'text-[#0a2737]'}`}>
                      التوافق الشرعي الذكي (AI Sharia Matchmaker)
                    </h2>
                    <p className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-stone-400' : 'text-[#335568]'}`}>
                      أنت تتصفح كـ <strong className="text-amber-500">{userGender === 'male' ? 'رجل باحث عن زوجة صالحة' : 'امرأة باحثة عن زوج صالح'}</strong>. تُعرض استمارات {userGender === 'male' ? 'الأخوات' : 'الإخوة'} حصراً بموافقة الولي.
                    </p>
                  </div>

                  {/* Responsive Action Buttons (Stay 100% inside container) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full pt-1">
                    <button
                      id="open-auth-from-marriage-btn"
                      onClick={() => setAuthModalOpen(true)}
                      className={`w-full py-2.5 px-3 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                        isDark ? 'bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700' : 'bg-[#f4f8fa] hover:bg-[#e2edf2] text-[#0a2737] border border-[#cde2ec]'
                      }`}
                    >
                      <UserCheck className="w-3.5 h-3.5 text-cyan-500" />
                      <span>دخول / إنشاء حساب</span>
                    </button>

                    <button
                      id="run-ai-match-btn"
                      onClick={handleRunAiMatch}
                      disabled={loadingAiMatch}
                      className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black text-xs transition-all shadow-lg hover:shadow-amber-500/20 active:scale-95 disabled:opacity-50"
                    >
                      {loadingAiMatch ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>تحليل التكافؤ الشرعي...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>تشغيل التوافق الذكي</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Clarification on Suitor vs Seeker terminology */}
                <div className={`rounded-xl p-3 text-[11px] leading-relaxed flex items-start gap-2.5 border ${
                  isDark ? 'bg-stone-950/70 border-stone-800 text-stone-300' : 'bg-[#f4f8fa] border-[#cde2ec] text-[#335568]'
                }`}>
                  <div className="w-5 h-5 rounded-full bg-amber-950 border border-amber-700/50 flex items-center justify-center text-amber-400 shrink-0 text-[10px] font-bold mt-0.5">
                    ؟
                  </div>
                  <div>
                    <span className="font-bold text-amber-500">لماذا نسمي المشتركين «راغبين في الزواج» وليس «خاطباً» أو «مخطوبة»؟</span>
                    <p className={`mt-0.5 ${isDark ? 'text-stone-400' : 'text-[#52798e]'}`}>
                      لأن المرأة لا تُسمى شرعاً <strong>«مخطوبة»</strong> إلا إذا ارتبطت بالفعل ووافق وليها، ويحرم حينئذٍ خطبتها («لا يخطب أحدكم على خطبة أخيه»). لذا فالاستمارات بالمنصة هي لإخوة وأخوات <strong>«راغبين في العفة والزواج الشرعي»</strong> يطلبون الحلال بالطرق الرسمية.
                    </p>
                  </div>
                </div>

                {/* Marital Status Filter Tabs */}
                <div className={`flex items-center gap-1.5 overflow-x-auto pt-2 border-t text-xs scrollbar-none ${
                  isDark ? 'border-stone-800' : 'border-[#cde2ec]'
                }`}>
                  <span className={`${isDark ? 'text-stone-400' : 'text-[#335568]'} text-[11px] ml-2 flex items-center gap-1`}>
                    <Filter className="w-3 h-3" />
                    الحالة:
                  </span>
                  {[
                    { id: 'all', label: 'الكل' },
                    { id: 'single', label: 'بكر / أعزب' },
                    { id: 'widowed', label: 'أرمل / أرملة' },
                    { id: 'divorced', label: 'مطلق / مطلقة' },
                    ...(userGender === 'male' ? [{ id: 'polygamy', label: 'تعدد شرعي' }] : []),
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setMaritalFilter(tab.id as any)}
                      className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors text-xs font-medium ${
                        maritalFilter === tab.id
                          ? 'bg-cyan-700 text-white shadow'
                          : isDark
                          ? 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800'
                          : 'bg-[#f4f8fa] text-[#335568] hover:text-[#0a2737] border border-[#cde2ec]'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Profiles Grid */}
              <div className="space-y-4">
                <div className={`flex items-center justify-between text-xs px-1 ${isDark ? 'text-stone-400' : 'text-[#335568]'}`}>
                  <span>
                    الاستمارات المتاحة ({profiles.length}) - تخضع لنظام الرقابة الشرعية والعربون الذكي
                  </span>
                  <span className="text-cyan-600 font-bold">
                    {userGender === 'male' ? 'استمارات الأخوات المعتمدة' : 'استمارات الإخوة المعتمدة'}
                  </span>
                </div>

                {loadingProfiles ? (
                  <div className="py-16 text-center text-stone-400 text-sm">
                    <RefreshCw className="w-6 h-6 animate-spin text-cyan-500 mx-auto mb-2" />
                    <span>جاري تحميل الاستمارات الشرعية المحققة...</span>
                  </div>
                ) : profiles.length === 0 ? (
                  <div className={`py-16 text-center rounded-2xl border ${
                    isDark ? 'text-stone-400 bg-stone-900 border-stone-800' : 'text-[#335568] bg-white border-[#cde2ec]'
                  }`}>
                    <Users className="w-8 h-8 mx-auto text-stone-400 mb-2" />
                    <span>لا توجد استمارات مطابقة لهذا التصنيف حالياً.</span>
                  </div>
                ) : (
                  profiles.map((profile) => {
                    const isPinned = profile.isPinned || profile.packageTier === 'royal_monthly';
                    const isPlatinum = profile.packageTier === 'platinum';
                    const isGold = profile.packageTier === 'gold';

                    return (
                      <div
                        key={profile.id}
                        className={`rounded-2xl p-5 border transition-all shadow-md space-y-3 relative overflow-hidden ${
                          isPinned
                            ? isDark
                              ? 'bg-stone-900 border-amber-400 ring-1 ring-amber-400/40 shadow-amber-500/10'
                              : 'bg-white border-amber-400 ring-2 ring-amber-400/30 shadow-amber-100 shadow-xl'
                            : isDark
                            ? 'bg-stone-900 hover:bg-stone-850 border-stone-800 hover:border-emerald-700/50'
                            : 'bg-white hover:bg-stone-50 border-stone-200 hover:border-emerald-400 shadow-sm'
                        }`}
                      >
                        {/* Pinned Royal Top Ribbon */}
                        {isPinned && (
                          <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-stone-950 px-3.5 py-1.5 -mx-5 -mt-5 rounded-t-2xl font-black text-xs flex items-center justify-between shadow-sm mb-3">
                            <div className="flex items-center gap-1.5">
                              <Crown className="w-4 h-4 text-stone-950 fill-stone-950/20" />
                              <span>إعلان ملكي مثبت في الصدارة - ثبات لمدة شهر كامل</span>
                            </div>
                            <span className="text-[10px] font-mono bg-stone-950/20 px-2 py-0.5 rounded text-stone-950 font-bold">
                              متبقي {profile.pinnedDaysRemaining || 30} يوماً
                            </span>
                          </div>
                        )}

                        {/* Top Bar of Card */}
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`font-mono text-xs px-2 py-0.5 rounded font-bold border ${
                                isDark
                                  ? 'bg-stone-950 text-amber-400 border-stone-800'
                                  : 'bg-amber-50 text-amber-800 border-amber-200'
                              }`}>
                                {profile.code}
                              </span>
                              <span className={`font-bold text-sm flex items-center gap-1.5 ${
                                isDark ? 'text-stone-100' : 'text-stone-900'
                              }`}>
                                {profile.fullNameMasked}
                                {isPinned && <span title="باقة العفة الملكية"><Crown className="w-4 h-4 text-amber-500" /></span>}
                                {isPlatinum && <span title="باقة بلاتينية" className="text-xs">💎</span>}
                                {isGold && <span title="باقة ذهبية" className="text-xs">🥇</span>}
                              </span>
                              {profile.nationalIdVerified && (
                                <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border ${
                                  isDark
                                    ? 'bg-emerald-950 text-emerald-300 border-emerald-700/50'
                                    : 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                }`}>
                                  <ShieldCheck className="w-3 h-3 text-emerald-500" />
                                  هوية موثقة
                                </span>
                              )}
                            </div>
                            <div className={`text-xs mt-1 flex items-center gap-2 ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                              <span>{profile.age} سنة</span>
                              <span>•</span>
                              <span>{profile.city}، {profile.country}</span>
                              <span>•</span>
                              <span className="text-amber-500 font-medium">
                                {profile.maritalStatus === 'single'
                                  ? 'بكر'
                                  : profile.maritalStatus === 'widowed'
                                  ? 'أرملة / أرمل'
                                  : profile.maritalStatus === 'divorced'
                                  ? 'مطلقة / مطلق'
                                  : 'تعدد شرعي'}
                              </span>
                            </div>
                          </div>

                          {/* AI Match Score Badge if generated */}
                          {(profile as any).matchScore ? (
                            <div className="text-right">
                              <span className="text-xs px-2.5 py-1 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/30 font-bold block">
                                توافق {(profile as any).matchScore}%
                              </span>
                              <span className={`text-[10px] mt-0.5 block ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                                تقييم الذكاء الاصطناعي
                              </span>
                            </div>
                          ) : (
                            <span className={`text-[11px] px-2 py-1 rounded border ${
                              isDark ? 'text-stone-400 bg-stone-950 border-stone-800' : 'text-stone-700 bg-stone-50 border-stone-200'
                            }`}>
                              {profile.job}
                            </span>
                          )}
                        </div>

                        {/* Qualifications & Hifz */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          <div className={`p-2.5 rounded-xl border ${
                            isDark ? 'bg-stone-950/60 border-stone-800/80 text-stone-200' : 'bg-stone-50 border-stone-200 text-stone-800'
                          }`}>
                            <span className={`block mb-1 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>المؤهل والعمل:</span>
                            <p className="font-medium">{profile.qualifications}</p>
                          </div>
                          <div className={`p-2.5 rounded-xl border ${
                            isDark ? 'bg-stone-950/60 border-stone-800/80 text-stone-200' : 'bg-stone-50 border-stone-200 text-stone-800'
                          }`}>
                            <span className="text-emerald-500 font-bold block mb-1">مقدار حفظ القرآن الكريم:</span>
                            <p className="font-medium">{profile.hifzPortion}</p>
                          </div>
                        </div>

                        {/* Religious Commitment & Bio */}
                        <div className={`text-xs p-3 rounded-xl border space-y-1.5 ${
                          isDark ? 'bg-stone-950/40 border-stone-800/60 text-stone-300' : 'bg-stone-50 border-stone-200 text-stone-800'
                        }`}>
                          <p>
                            <strong className="text-amber-500">الالتزام الشرعي: </strong>
                            {profile.religiousCommitment}
                          </p>
                          <p>
                            <strong className={isDark ? 'text-stone-400' : 'text-stone-600'}>التعريف الشخصي: </strong>
                            {profile.specifications.bio}
                          </p>
                          {profile.specifications.housing && (
                            <p>
                              <strong className={isDark ? 'text-stone-400' : 'text-stone-600'}>شرط السكن: </strong>
                              {profile.specifications.housing}
                            </p>
                          )}
                        </div>

                        {/* AI Verdict if present */}
                        {(profile as any).aiVerdict && (
                          <div className={`border p-3 rounded-xl text-xs space-y-1 ${
                            isDark ? 'bg-emerald-950/30 border-emerald-800/40 text-stone-200' : 'bg-emerald-50/60 border-emerald-300 text-emerald-950'
                          }`}>
                            <span className="text-emerald-500 font-bold flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5" />
                              حيثيات التكافؤ الشرعي المقدرة:
                            </span>
                            <p>{(profile as any).aiVerdict}</p>
                          </div>
                        )}

                        {/* Action Buttons: Escrow Request & Regulated Chat */}
                        <div className={`pt-2 flex flex-wrap items-center gap-2 border-t ${
                          isDark ? 'border-stone-800/80' : 'border-stone-200'
                        }`}>
                          <button
                            id={`request-escrow-${profile.code}`}
                            onClick={() => handleEscrowRequest(profile)}
                            disabled={requestingEscrow}
                            className="flex-1 min-w-[140px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors shadow-md"
                          >
                            <Lock className="w-3.5 h-3.5" />
                            <span>طلب الولي (عربون ذكي 10%)</span>
                          </button>

                          <button
                            id={`open-chat-${profile.code}`}
                            onClick={() => {
                              setSelectedProfile(profile);
                              setChatModalOpen(true);
                            }}
                            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl font-medium text-xs transition-colors border ${
                              isDark
                                ? 'bg-stone-800 hover:bg-stone-700 text-stone-200 border-stone-700'
                                : 'bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-300'
                            }`}
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>محادثة مراقبة شرعياً</span>
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW: COMPETITIONS (المسابقات القرآنية المباشرة والمكافآت التنافسية)       */}
          {/* ========================================================================= */}
          {view === 'competitions' && (
            <CompetitionsSection
              competitions={competitions}
              userGender={userGender}
              currentUser={currentUser}
              theme={theme}
              onJoinCompetition={handleJoinCompetition}
              onOpenPaymentMethods={(purpose) => {
                setPaymentModalPurpose(purpose);
                setPaymentModalAmount(undefined);
                setPaymentModalOpen(true);
              }}
            />
          )}

          {/* ========================================================================= */}
          {/* VIEW: SELF-PACED HIFZ INCENTIVES (حوافز ومكافآت الحفظ الذاتي التراكمية)   */}
          {/* ========================================================================= */}
          {view === 'incentives' && (
            <div id="incentives-view" className="space-y-5 animate-in fade-in duration-200">
              <SelfPacedHifzIncentives
                fund={revenueFund}
                userWallet={wallet}
                userGender={userGender}
                theme={theme}
                onClaimIncentive={handleClaimSelfIncentive}
                onPerkUnlocked={(perkId) => {
                  loadWallet();
                  if (perkId === 'perk-tier-gold') {
                    setCurrentUser((prev) => (prev ? { ...prev, currentTier: 'gold' } : prev));
                    loadMarriageProfiles();
                  }
                }}
              />
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 3: VIRAL REFERRAL WALLET (محفظة الإحالة والتسويق الفيروسي)           */}
          {/* ========================================================================= */}
          {view === 'wallet' && (
            <div id="wallet-view" className="space-y-5 animate-in fade-in duration-200">
              
              {/* Financial Balance Card */}
              <div className={`rounded-2xl p-5 border shadow-xl space-y-4 transition-colors ${
                isDark
                  ? 'bg-gradient-to-b from-[#0b212c] to-[#081f2b] border-cyan-800/40 text-stone-100'
                  : 'bg-white border-[#cde2ec] shadow-sm text-[#0a2737]'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <WalletIcon className="w-5 h-5 text-amber-500" />
                    <h2 className={`font-bold text-sm ${isDark ? 'text-stone-100' : 'text-[#0a2737]'}`}>
                      المحفظة المالية ونقاط التسويق الفيروسي
                    </h2>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-mono font-bold border ${
                    isDark ? 'bg-cyan-950 text-cyan-300 border-cyan-700/40' : 'bg-[#e0f2fe] text-[#0369a1] border-[#7dd3fc]'
                  }`}>
                    حساب موثق
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className={`p-4 rounded-xl border text-center transition-colors ${
                    isDark ? 'bg-stone-950 border-stone-800' : 'bg-[#f4f8fa] border-[#cde2ec]'
                  }`}>
                    <span className={`text-xs block mb-1 ${isDark ? 'text-stone-400' : 'text-[#335568]'}`}>الرصيد النقدي القابل للسحب</span>
                    <div className="text-2xl sm:text-3xl font-black text-amber-500 font-mono">
                      {wallet?.earnedCash.toFixed(2) || '225.00'} <span className={`text-xs ${isDark ? 'text-stone-400' : 'text-[#64748b]'}`}>ج.م</span>
                    </div>
                    <span className="text-[10px] text-cyan-600 font-bold mt-1 block">متاح للتحويل الفوري</span>
                  </div>

                  <div className={`p-4 rounded-xl border text-center transition-colors ${
                    isDark ? 'bg-stone-950 border-stone-800' : 'bg-[#f4f8fa] border-[#cde2ec]'
                  }`}>
                    <span className={`text-xs block mb-1 ${isDark ? 'text-stone-400' : 'text-[#335568]'}`}>نقاط الإحالة المكتسبة</span>
                    <div className="text-2xl sm:text-3xl font-black text-cyan-600 font-mono">
                      {wallet?.availablePoints || 450} <span className={`text-xs ${isDark ? 'text-stone-400' : 'text-[#64748b]'}`}>نقطة</span>
                    </div>
                    <span className={`text-[10px] mt-1 block ${isDark ? 'text-stone-400' : 'text-[#64748b]'}`}>
                      {wallet?.successfulReferralsCount || 9} عمليات فعلية مكتملة
                    </span>
                  </div>
                </div>

                {/* Referral Deep Link Engine */}
                <div className={`p-4 rounded-xl border space-y-2 text-xs transition-colors ${
                  isDark ? 'bg-stone-950/80 border-stone-800/90' : 'bg-[#f4f8fa] border-[#cde2ec]'
                }`}>
                  <span className={`font-bold block ${isDark ? 'text-stone-200' : 'text-[#0a2737]'}`}>رابط الإحالة العميق (Deep Link):</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`https://minhaj.app/ref?code=${wallet?.referralCode || 'MINHAJ-USER-789'}`}
                      className={`w-full border rounded-lg p-2.5 font-mono text-xs select-all transition-colors ${
                        isDark ? 'bg-stone-900 border-stone-700 text-stone-300' : 'bg-white border-[#cde2ec] text-[#0a2737]'
                      }`}
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`https://minhaj.app/ref?code=${wallet?.referralCode || 'MINHAJ-USER-789'}`);
                        setCopiedLink(true);
                        setTimeout(() => setCopiedLink(false), 2000);
                      }}
                      className="px-3.5 py-2.5 rounded-lg bg-cyan-700 hover:bg-cyan-600 text-white font-bold transition-colors flex items-center gap-1 shrink-0 shadow-sm"
                    >
                      {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedLink ? 'تم النسخ' : 'نسخ الرابط'}</span>
                    </button>
                  </div>
                  <p className={`text-[11px] leading-relaxed ${isDark ? 'text-stone-400' : 'text-[#335568]'}`}>
                    ⚖️ <strong>ضابط العدالة ومكافحة الاحتيال:</strong> لا تُحتسب النقاط بمجرد التسجيل الصوري، بل تُحتسب عند إتمام المُحال لعملية فعلية (إتمام خطة تحفيظ أو دفع عربون شرعي) لضمان حماية المنصة.
                  </p>
                </div>
              </div>

              {/* 💳 Deposit & Subscription Payment Gateways info */}
              <div className={`rounded-2xl p-4 border shadow-xl flex items-center justify-between gap-3 text-xs transition-colors ${
                isDark ? 'bg-stone-900 border-stone-800' : 'bg-white border-[#cde2ec] shadow-sm'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${
                    isDark ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' : 'bg-[#e0f2fe] text-[#0369a1] border-[#7dd3fc]'
                  }`}>
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className={`font-bold text-sm ${isDark ? 'text-stone-100' : 'text-[#0a2737]'}`}>شحن الرصيد وسداد الاشتراكات</h4>
                    <p className={`text-[11px] ${isDark ? 'text-stone-400' : 'text-[#335568]'}`}>ادفع عبر انستاباي، فودافون كاش، أو الحساب البنكي المباشر</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setPaymentModalPurpose('شحن الرصيد وسداد الاشتراكات في منهاج');
                    setPaymentModalAmount(undefined);
                    setPaymentModalOpen(true);
                  }}
                  className="px-3 py-2 rounded-xl bg-cyan-700 hover:bg-cyan-600 text-white font-bold transition-all text-xs flex items-center gap-1.5 shrink-0 shadow-sm"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>طرق الدفع وانستاباي</span>
                </button>
              </div>

              {/* Withdrawal Request Form */}
              <div className={`rounded-2xl p-5 border shadow-xl space-y-4 text-xs transition-colors ${
                isDark ? 'bg-stone-900 border-stone-800' : 'bg-white border-[#cde2ec] shadow-sm'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ArrowDownToLine className="w-5 h-5 text-cyan-500" />
                    <h3 className={`font-bold text-sm ${isDark ? 'text-stone-100' : 'text-[#0a2737]'}`}>
                      طلب سحب الأرباح للمحفظة أو الحساب البنكي
                    </h3>
                  </div>
                  <span className={isDark ? 'text-stone-400' : 'text-[#335568]'}>الحد الأدنى للسحب: 100.00 ج.م</span>
                </div>

                {withdrawStatus && (
                  <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-800/60 text-cyan-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{withdrawStatus}</span>
                  </div>
                )}

                {withdrawError && (
                  <div className="p-3 rounded-xl bg-red-950/60 border border-red-800/60 text-red-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{withdrawError}</span>
                  </div>
                )}

                <form onSubmit={handleWithdrawalSubmit} className="space-y-3">
                  <div>
                    <label className={`block mb-1 font-medium ${isDark ? 'text-stone-400' : 'text-[#335568]'}`}>المبلغ المراد سحبه (الحد الأدنى 100):</label>
                    <input
                      type="number"
                      min="100"
                      step="1"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className={`w-full border rounded-lg p-2.5 font-mono outline-none transition-colors ${
                        isDark ? 'bg-stone-950 border-stone-700 text-stone-200' : 'bg-[#f4f8fa] border-[#cde2ec] text-[#0a2737]'
                      }`}
                      required
                    />
                  </div>

                  <div>
                    <label className={`block mb-1 font-medium ${isDark ? 'text-stone-400' : 'text-[#335568]'}`}>طريقة استلام الأموال:</label>
                    <select
                      value={withdrawMethod}
                      onChange={(e) => setWithdrawMethod(e.target.value)}
                      className={`w-full border rounded-lg p-2.5 outline-none transition-colors ${
                        isDark ? 'bg-stone-950 border-stone-700 text-stone-200' : 'bg-[#f4f8fa] border-[#cde2ec] text-[#0a2737]'
                      }`}
                    >
                      <option>فودافون كاش (Vodafone Cash)</option>
                      <option>انستاباي (InstaPay)</option>
                      <option>إس تي سي باي (STC Pay)</option>
                      <option>تحويل بنكي مباشر (Bank Wire)</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block mb-1 font-medium ${isDark ? 'text-stone-400' : 'text-[#335568]'}`}>رقم المحفظة أو عنوان الحساب المستلم:</label>
                    <input
                      type="text"
                      value={withdrawAccount}
                      onChange={(e) => setWithdrawAccount(e.target.value)}
                      className={`w-full border rounded-lg p-2.5 font-mono outline-none transition-colors ${
                        isDark ? 'bg-stone-950 border-stone-700 text-stone-200' : 'bg-[#f4f8fa] border-[#cde2ec] text-[#0a2737]'
                      }`}
                      placeholder="مثال: 01011112222 أو username@instapay"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-cyan-700 hover:bg-cyan-600 text-white font-bold rounded-lg transition-colors shadow-md mt-2"
                  >
                    تأكيد إرسال طلب السحب للإدارة المالية
                  </button>
                </form>
              </div>

              {/* Withdrawal Requests History */}
              <div className={`rounded-2xl p-5 border shadow-xl space-y-3 text-xs transition-colors ${
                isDark ? 'bg-stone-900 border-stone-800' : 'bg-white border-[#cde2ec] shadow-sm'
              }`}>
                <h4 className={`font-bold ${isDark ? 'text-stone-200' : 'text-[#0a2737]'}`}>سجل عمليات السحب السابقة:</h4>
                <div className="space-y-2">
                  {withdrawalsList.map((wd) => (
                    <div
                      key={wd.id}
                      className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                        isDark ? 'bg-stone-950 border-stone-800' : 'bg-[#f4f8fa] border-[#cde2ec]'
                      }`}
                    >
                      <div>
                        <div className={`font-bold flex items-center gap-2 ${isDark ? 'text-stone-200' : 'text-[#0a2737]'}`}>
                          <span className="font-mono text-amber-500">{wd.amount} ج.م</span>
                          <span>- {wd.method}</span>
                        </div>
                        <span className={`text-[11px] ${isDark ? 'text-stone-400' : 'text-[#64748b]'}`}>{wd.payoutAddress} • {new Date(wd.createdAt).toLocaleDateString('ar-EG')}</span>
                        {wd.notes && <p className={`text-[10px] mt-0.5 ${isDark ? 'text-stone-400' : 'text-[#64748b]'}`}>{wd.notes}</p>}
                      </div>
                      <span className={`px-2 py-1 rounded text-[10px] font-bold ${
                        wd.status === 'approved'
                          ? 'bg-cyan-500/10 text-cyan-600 border border-cyan-500/30'
                          : wd.status === 'pending_approval'
                          ? 'bg-amber-500/10 text-amber-600 border border-amber-500/30'
                          : 'bg-red-500/10 text-red-600 border border-red-500/30'
                      }`}>
                        {wd.status === 'approved'
                          ? 'تم الصرف'
                          : wd.status === 'pending_approval'
                          ? 'قيد المراجعة'
                          : 'مرفوض'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 4: ADMIN CENTRAL DASHBOARD (لوحة الإدارة المركزية والرمز السري)       */}
          {/* ========================================================================= */}
          {view === 'admin' && (
            <div id="admin-view" className="space-y-5 animate-in fade-in duration-200">
              
              {/* Admin Banner */}
              <div className="bg-stone-950 p-5 rounded-2xl border border-amber-500/40 shadow-2xl space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                      <Settings className="w-5 h-5 animate-spin [animation-duration:16s]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-black text-amber-400 text-sm">
                          لوحة الإدارة والتحكم المركزية (Minhaj Admin Portal)
                        </h2>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-700 text-emerald-300 text-[10px] font-bold">
                          المشرف العام المعتمد
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-400 font-mono mt-0.5">
                        الحساب النشط: <strong className="text-amber-300">mohamedyoussef255@gmail.com</strong>
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Clear Demo Data Button */}
                    <button
                      type="button"
                      onClick={() => setShowClearDemoConfirm(true)}
                      className="text-xs text-rose-300 hover:text-white bg-rose-950/80 hover:bg-rose-900 px-3 py-1.5 rounded-lg border border-rose-800/80 font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                      title="مسح وتنظيف البيانات التجريبية للمستخدمين وإعادة ضبط الحالة"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      <span>مسح البيانات التجريبية</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsAdminLoggedIn(false);
                        setView('quran');
                      }}
                      className="text-xs text-stone-300 hover:text-white bg-stone-900 hover:bg-stone-800 px-3 py-1.5 rounded-lg border border-stone-700 font-bold transition-colors"
                    >
                      تسجيل الخروج من الإدارة
                    </button>
                  </div>
                </div>

                {clearDemoSuccessMessage && (
                  <div className="p-3 rounded-xl bg-emerald-950/90 border border-emerald-700 text-emerald-200 text-xs font-bold animate-in fade-in flex items-center justify-between">
                    <span>{clearDemoSuccessMessage}</span>
                    <button
                      onClick={() => setClearDemoSuccessMessage(null)}
                      className="text-emerald-400 hover:text-white text-xs underline"
                    >
                      إغلاق
                    </button>
                  </div>
                )}

                <p className="text-xs text-stone-400">
                  تمت المصادقة بنجاح بالرمز السري. هنا يتم ضبط أسعار الرموز، مراقبة مخالفات جدار الحماية، والموافقة على طلبات السحب المالي، والاطلاع على هيكل قاعدة بيانات PostgreSQL وإدارتها.
                </p>
              </div>

              {/* System Stats Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-stone-900 p-3 rounded-xl border border-stone-800">
                  <span className="text-stone-400 block text-[11px]">إجمالي المستخدمين</span>
                  <span className="text-lg font-bold text-stone-100 font-mono">{adminStats?.totalUsers || 2}</span>
                </div>
                <div className="bg-stone-900 p-3 rounded-xl border border-stone-800">
                  <span className="text-stone-400 block text-[11px]">الاستمارات المعتمدة</span>
                  <span className="text-lg font-bold text-emerald-400 font-mono">{adminStats?.activeMarriageProfiles || 6}</span>
                </div>
                <div className="bg-stone-900 p-3 rounded-xl border border-stone-800">
                  <span className="text-stone-400 block text-[11px]">طلبات سحب معلقة</span>
                  <span className="text-lg font-bold text-amber-400 font-mono">{adminStats?.pendingWithdrawals || 1}</span>
                </div>
                <div className="bg-stone-900 p-3 rounded-xl border border-stone-800">
                  <span className="text-stone-400 block text-[11px]">المخالفات المرصودة</span>
                  <span className="text-lg font-bold text-red-400 font-mono">{adminStats?.flaggedSecurityViolations || 2}</span>
                </div>
              </div>

              {/* 💳 Section 1: InstaPay & Payment Methods Configuration */}
              <div className="bg-stone-900 rounded-2xl p-5 border border-stone-800 shadow-xl space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-stone-100 text-sm flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-emerald-400" />
                    <span>بيانات انستاباي والدفع وطرق تلقي الاشتراكات (InstaPay & Payment Gateways):</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentModalPurpose('معاينة إدارة طرق الدفع');
                      setPaymentModalOpen(true);
                    }}
                    className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-[11px] font-medium flex items-center gap-1 border border-stone-700"
                  >
                    <span>معاينة نافذة الدفع</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                <p className="text-stone-400 leading-relaxed text-[11px]">
                  حدد هنا تفاصيل حسابات استقبال أموال الاشتراكات وباقات العفة ودعم الحلقات عبر انستاباي، المحافظ الإلكترونية (فودافون كاش وغيرها)، والتحويل البنكي المباشر. تظهر هذه البيانات لجميع المشتركين عند رغبتهم في الترقية أو شحن الرصيد.
                </p>

                {paymentSaveMessage && (
                  <div className="p-3 rounded-xl bg-stone-950 border border-emerald-800 text-emerald-300">
                    {paymentSaveMessage}
                  </div>
                )}

                <form onSubmit={handleSavePaymentMethods} className="space-y-4">
                  {/* InstaPay Block */}
                  <div className="p-3.5 rounded-xl bg-stone-950 border border-emerald-900/50 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold">
                      <Zap className="w-4 h-4" />
                      <span>بيانات حساب انستاباي الرسمي (InstaPay):</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="text-stone-400 block mb-1">عنوان الدفع اللحظي (IPA):</label>
                        <input
                          type="text"
                          value={adminIpa}
                          onChange={(e) => setAdminIpa(e.target.value)}
                          placeholder="minhaj@instapay"
                          className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-emerald-300 font-mono text-xs"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-stone-400 block mb-1">رقم الهاتف المرتبط بانستاباي:</label>
                        <input
                          type="text"
                          value={adminInstaPhone}
                          onChange={(e) => setAdminInstaPhone(e.target.value)}
                          placeholder="01011112222"
                          className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-stone-200 font-mono text-xs"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-stone-400 block mb-1">اسم صاحب حساب انستاباي:</label>
                        <input
                          type="text"
                          value={adminInstaAccount}
                          onChange={(e) => setAdminInstaAccount(e.target.value)}
                          placeholder="منصة منهاج القرآنية"
                          className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-stone-200 text-xs"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Vodafone Cash & Wallets */}
                  <div className="p-3.5 rounded-xl bg-stone-950 border border-red-900/40 space-y-3">
                    <div className="flex items-center gap-2 text-red-400 font-bold">
                      <Smartphone className="w-4 h-4" />
                      <span>المحافظ الإلكترونية (فودافون كاش / أورنج / اتصالات / وي كاش):</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="text-stone-400 block mb-1">رقم المحفظة لاستقبال التحويلات:</label>
                        <input
                          type="text"
                          value={adminVodafonePhone}
                          onChange={(e) => setAdminVodafonePhone(e.target.value)}
                          placeholder="01011112222"
                          className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-stone-200 font-mono text-xs"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-stone-400 block mb-1">اسم الحساب المسجل بالمحفظة:</label>
                        <input
                          type="text"
                          value={adminVodafoneAccount}
                          onChange={(e) => setAdminVodafoneAccount(e.target.value)}
                          placeholder="محفظة منهاج الرسمية"
                          className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-stone-200 text-xs"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Bank Account Wire & International Transfers */}
                  <div className="p-3.5 rounded-xl bg-stone-950 border border-blue-900/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-blue-400 font-bold">
                        <Building2 className="w-4 h-4" />
                        <span>بيانات الحساب البنكي والتحويل الدولي من دول أخرى (SWIFT & IBAN):</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                        متاح للتحويل من جميع دول العالم
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div>
                        <label className="text-stone-400 block mb-1">اسم البنك / المصرف:</label>
                        <input
                          type="text"
                          value={adminBankName}
                          onChange={(e) => setAdminBankName(e.target.value)}
                          placeholder="البنك الأهلي المصري"
                          className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-stone-200 text-xs"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-stone-400 block mb-1">رقم الحساب البنكي:</label>
                        <input
                          type="text"
                          value={adminBankAccount}
                          onChange={(e) => setAdminBankAccount(e.target.value)}
                          placeholder="12345678901234"
                          className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-stone-200 font-mono text-xs"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-stone-400 block mb-1">اسم المستفيد / صاحب الحساب:</label>
                        <input
                          type="text"
                          value={adminBankHolder}
                          onChange={(e) => setAdminBankHolder(e.target.value)}
                          placeholder="مؤسسة منهاج للتقنية"
                          className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-stone-200 text-xs"
                          required
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-stone-400 block mb-1">رقم الآيبان الدولي (IBAN):</label>
                        <input
                          type="text"
                          value={adminBankIban}
                          onChange={(e) => setAdminBankIban(e.target.value)}
                          placeholder="EG120003000000012345678901234"
                          className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-stone-200 font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-stone-400 block mb-1">رمز السويفت (SWIFT Code):</label>
                        <input
                          type="text"
                          value={adminBankSwift}
                          onChange={(e) => setAdminBankSwift(e.target.value)}
                          placeholder="NBEGEGCX"
                          className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-stone-200 font-mono text-xs"
                        />
                      </div>

                      {/* Additional International Wire Fields */}
                      <div>
                        <label className="text-stone-400 block mb-1">اسم الفرع (Branch):</label>
                        <input
                          type="text"
                          value={adminBankBranch}
                          onChange={(e) => setAdminBankBranch(e.target.value)}
                          placeholder="الفرع الرئيسي - القاهرة"
                          className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-stone-200 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-stone-400 block mb-1">دولة الحساب (Bank Country):</label>
                        <input
                          type="text"
                          value={adminBankCountry}
                          onChange={(e) => setAdminBankCountry(e.target.value)}
                          placeholder="مصر (Egypt)"
                          className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-stone-200 text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-stone-400 block mb-1">العملات المقبولة (Currencies):</label>
                        <input
                          type="text"
                          value={adminBankCurrencies}
                          onChange={(e) => setAdminBankCurrencies(e.target.value)}
                          placeholder="EGP, USD, SAR, AED, EUR"
                          className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-stone-200 font-mono text-xs"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label className="text-stone-400 block mb-1">البنك الوسيط للتحويل الدولي إن وجد (Intermediary Bank):</label>
                        <input
                          type="text"
                          value={adminBankIntermediary}
                          onChange={(e) => setAdminBankIntermediary(e.target.value)}
                          placeholder="JPMorgan Chase Bank, New York (SWIFT: CHASUS33)"
                          className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-stone-200 text-xs"
                        />
                      </div>
                      <div className="sm:col-span-3">
                        <label className="text-stone-400 block mb-1">تعليمات التحويل الدولي والملاحظات الإلزامية للمحول:</label>
                        <textarea
                          rows={2}
                          value={adminBankIntInstructions}
                          onChange={(e) => setAdminBankIntInstructions(e.target.value)}
                          placeholder="يُرجى إرسال صورة إشعار التحويل البنكي عبر واتساب المعتمد متضمناً كود المستخدم أو اسم المشترك لتفعيل الحساب فوراً."
                          className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-stone-200 text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* STC Pay & WhatsApp Instructions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-stone-950 border border-purple-900/40 space-y-2">
                      <label className="text-purple-300 font-bold block">إس تي سي باي (STC Pay - لدول الخليج):</label>
                      <input
                        type="text"
                        value={adminStcPhone}
                        onChange={(e) => setAdminStcPhone(e.target.value)}
                        placeholder="+966501112233"
                        className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-stone-200 font-mono text-xs"
                      />
                    </div>
                    <div className="p-3 rounded-xl bg-stone-950 border border-emerald-900/40 space-y-2">
                      <label className="text-emerald-300 font-bold block">رقم واتساب المعتمد لتأكيد الإيصالات:</label>
                      <input
                        type="text"
                        value={adminWhatsappPhone}
                        onChange={(e) => setAdminWhatsappPhone(e.target.value)}
                        placeholder="+201011112222"
                        className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-stone-200 font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-stone-400 block mb-1">تعليمات التحويل الموجهة للمستخدمين:</label>
                    <textarea
                      rows={2}
                      value={adminPaymentInstructions}
                      onChange={(e) => setAdminPaymentInstructions(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2 text-stone-200 text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors shadow-md flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>حفظ وتحديث بيانات انستاباي وطرق الدفع في النظام</span>
                  </button>
                </form>
              </div>

              {/* 💰 Section 2: Revenue Fund & Rewards Allocation */}
              <div className="bg-stone-900 rounded-2xl p-5 border border-stone-800 shadow-xl space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-amber-400 text-sm flex items-center gap-2">
                    <Gift className="w-4 h-4" />
                    <span>مخصص بند الجوائز والمكافآت من الإيرادات (Revenue & Incentive Fund):</span>
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                    بند مالي شرعي
                  </span>
                </div>

                <p className="text-stone-400 leading-relaxed text-[11px]">
                  وفقاً للائحة التطبيق: يُخصص بند دائم من إيرادات المنصة (الاشتراكات، باقات العفة، ورسوم الاستمارات) لتوزيع المكافآت على الفائزين بمسابقات الحفظ، وصرف حوافز تشجيعية ذاتية للمستخدمين عند حفظ آية، سورة، جزء، أو القرآن كاملاً.
                </p>

                {/* Fund Balances Visual Dashboard */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                  <div className="bg-stone-950 p-3 rounded-xl border border-stone-800">
                    <span className="text-stone-400 block text-[10px]">إجمالي إيراد المنصة</span>
                    <span className="text-base font-bold text-stone-100 font-mono">
                      {revenueFund?.totalPlatformRevenue?.toLocaleString() || '50,000'} ج.م
                    </span>
                  </div>
                  <div className="bg-stone-950 p-3 rounded-xl border border-amber-500/30">
                    <span className="text-stone-400 block text-[10px]">نسبة مخصص الجوائز</span>
                    <span className="text-base font-bold text-amber-400 font-mono">
                      {revenueFund?.rewardAllocationPercentage || rewardPercentageVal}%
                    </span>
                  </div>
                  <div className="bg-stone-950 p-3 rounded-xl border border-emerald-500/30">
                    <span className="text-stone-400 block text-[10px]">رصيد الصندوق المتاح</span>
                    <span className="text-base font-bold text-emerald-400 font-mono">
                      {revenueFund?.totalAllocatedForRewards?.toLocaleString() || '10,000'} ج.م
                    </span>
                  </div>
                  <div className="bg-stone-950 p-3 rounded-xl border border-stone-800">
                    <span className="text-stone-400 block text-[10px]">الجوائز المصروفة فعلياً</span>
                    <span className="text-base font-bold text-purple-400 font-mono">
                      {revenueFund?.totalDistributedToWinners?.toLocaleString() || '0'} ج.م
                    </span>
                  </div>
                </div>

                {fundSaveMessage && (
                  <div className="p-3 rounded-xl bg-stone-950 border border-emerald-800 text-emerald-300">
                    {fundSaveMessage}
                  </div>
                )}

                <form onSubmit={handleSaveRevenueFund} className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-amber-400 font-bold block mb-1">
                        النسبة المئوية المخصصة للجوائز من إيراد المنصة (%):
                      </label>
                      <input
                        type="number"
                        min="5"
                        max="80"
                        value={rewardPercentageVal}
                        onChange={(e) => setRewardPercentageVal(Number(e.target.value))}
                        className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2 text-amber-300 font-mono font-bold text-xs"
                        required
                      />
                      <span className="text-[10px] text-stone-500 mt-1 block">
                        مثال: 20% تعني اقتطاع خُمس الإيرادات تلقائياً لصندوق جوائز الحفظ.
                      </span>
                    </div>

                    <div>
                      <label className="text-stone-400 block mb-1">
                        تعديل إجمالي رصيد إيراد المنصة (لأغراض الموازنة):
                      </label>
                      <input
                        type="number"
                        step="100"
                        value={totalRevenueVal}
                        onChange={(e) => setTotalRevenueVal(Number(e.target.value))}
                        className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2 text-stone-200 font-mono text-xs"
                        required
                      />
                    </div>
                  </div>

                  {/* Incentive Rates per Task */}
                  <div className="p-3.5 rounded-xl bg-stone-950 border border-stone-800 space-y-3">
                    <span className="font-bold text-stone-200 block text-xs">
                      جدول ترجمة مهام الحفظ الذاتي لنقاط ومبالغ مالية مقتطعة من الإيراد:
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800 space-y-2">
                        <span className="font-bold text-emerald-400 block text-[11px]">مكافأة الآية الواحدة:</span>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[10px] text-stone-400 block">نقاط المنصة:</span>
                            <input
                              type="number"
                              value={rateAyahPoints}
                              onChange={(e) => setRateAyahPoints(Number(e.target.value))}
                              className="w-full bg-stone-950 border border-stone-700 rounded p-1.5 text-stone-200 font-mono text-xs"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-stone-400 block">مبلغ مالي (ج.م):</span>
                            <input
                              type="number"
                              step="0.05"
                              value={rateAyahCash}
                              onChange={(e) => setRateAyahCash(Number(e.target.value))}
                              className="w-full bg-stone-950 border border-stone-700 rounded p-1.5 text-emerald-300 font-mono text-xs"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800 space-y-2">
                        <span className="font-bold text-emerald-400 block text-[11px]">مكافأة السورة الواحدة:</span>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[10px] text-stone-400 block">نقاط المنصة:</span>
                            <input
                              type="number"
                              value={rateSurahPoints}
                              onChange={(e) => setRateSurahPoints(Number(e.target.value))}
                              className="w-full bg-stone-950 border border-stone-700 rounded p-1.5 text-stone-200 font-mono text-xs"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-stone-400 block">مبلغ مالي (ج.م):</span>
                            <input
                              type="number"
                              step="1"
                              value={rateSurahCash}
                              onChange={(e) => setRateSurahCash(Number(e.target.value))}
                              className="w-full bg-stone-950 border border-stone-700 rounded p-1.5 text-emerald-300 font-mono text-xs"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800 space-y-2">
                        <span className="font-bold text-emerald-400 block text-[11px]">مكافأة الجزء القرآني (Juz):</span>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[10px] text-stone-400 block">نقاط المنصة:</span>
                            <input
                              type="number"
                              value={rateJuzPoints}
                              onChange={(e) => setRateJuzPoints(Number(e.target.value))}
                              className="w-full bg-stone-950 border border-stone-700 rounded p-1.5 text-stone-200 font-mono text-xs"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-stone-400 block">مبلغ مالي (ج.م):</span>
                            <input
                              type="number"
                              step="5"
                              value={rateJuzCash}
                              onChange={(e) => setRateJuzCash(Number(e.target.value))}
                              className="w-full bg-stone-950 border border-stone-700 rounded p-1.5 text-emerald-300 font-mono text-xs"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-lg bg-stone-900 border border-amber-500/40 space-y-2">
                        <span className="font-bold text-amber-400 block text-[11px]">مكافأة ختم القرآن كاملاً (الختمة):</span>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="text-[10px] text-stone-400 block">نقاط المنصة:</span>
                            <input
                              type="number"
                              value={rateKhatmahPoints}
                              onChange={(e) => setRateKhatmahPoints(Number(e.target.value))}
                              className="w-full bg-stone-950 border border-stone-700 rounded p-1.5 text-stone-200 font-mono text-xs"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-stone-400 block">مبلغ مالي (ج.م):</span>
                            <input
                              type="number"
                              step="100"
                              value={rateKhatmahCash}
                              onChange={(e) => setRateKhatmahCash(Number(e.target.value))}
                              className="w-full bg-stone-950 border border-amber-500/50 rounded p-1.5 text-amber-300 font-mono font-bold text-xs"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg transition-colors shadow-md flex items-center justify-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>تحديث نسب مخصصات الجوائز ومعدلات المكافآت الذاتية</span>
                  </button>
                </form>
              </div>

              {/* 🏆 Section 3: Quran Competitions Engine & Broadcast */}
              <div className="bg-stone-900 rounded-2xl p-5 border border-stone-800 shadow-xl space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-amber-400 text-sm flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    <span>صياغة وإدارة وإعلان مسابقات الحفظ (Competitions Engine):</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setCompetitionsModalOpen(true)}
                    className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-[11px] font-medium flex items-center gap-1 border border-stone-700"
                  >
                    <span>معاينة واجهة المتسابقين</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>

                <p className="text-stone-400 leading-relaxed text-[11px]">
                  أقِم مسابقات الحفظ في أي وقت (شهرية، أسبوعية، يومية، أو في المناسبات الشرعية كرمضان والجمعة)، واكتب شروطها والجوائز المخصصة لها لتُعلن تلقائياً في صفحات الرجال والنساء مع توزيع الجوائز على الفائزين.
                </p>

                {compSaveMessage && (
                  <div className="p-3 rounded-xl bg-stone-950 border border-emerald-800 text-emerald-300">
                    {compSaveMessage}
                  </div>
                )}

                {/* Competition Creation Form */}
                <form onSubmit={handleCreateCompetition} className="p-4 rounded-xl bg-stone-950 border border-amber-500/30 space-y-3">
                  <span className="font-bold text-stone-200 block text-xs flex items-center gap-1.5">
                    <Megaphone className="w-4 h-4 text-amber-400" />
                    <span>صياغة وإطلاق مسابقة جديدة للإعلان الفوري:</span>
                  </span>

                  <div>
                    <label className="text-stone-400 block mb-1">عنوان المسابقة:</label>
                    <input
                      type="text"
                      value={newCompTitle}
                      onChange={(e) => setNewCompTitle(e.target.value)}
                      placeholder="مثال: مسابقة سورة الكهف والتدبر الأسبوعية"
                      className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-stone-200 text-xs font-bold"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <div>
                      <label className="text-stone-400 block mb-1">دورية المسابقة:</label>
                      <select
                        value={newCompFrequency}
                        onChange={(e) => setNewCompFrequency(e.target.value as any)}
                        className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-stone-200 text-xs"
                      >
                        <option value="daily">يومية (Daily)</option>
                        <option value="weekly">أسبوعية (Weekly)</option>
                        <option value="monthly">شهرية (Monthly)</option>
                        <option value="occasions">مناسبات دينية (Occasions)</option>
                        <option value="instant">فورية / في أي وقت (Instant)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-stone-400 block mb-1">الجمهور المستهدف بالإعلان:</label>
                      <select
                        value={newCompTargetAudience}
                        onChange={(e) => setNewCompTargetAudience(e.target.value as any)}
                        className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-stone-200 text-xs"
                      >
                        <option value="all">كافة المستخدمين (رجال ونساء)</option>
                        <option value="male">بوابة الإخوة الكرام حصراً</option>
                        <option value="female">بوابة الأخوات حصراً</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-stone-400 block mb-1">المناسبة (إن وجدت):</label>
                      <input
                        type="text"
                        value={newCompOccasion}
                        onChange={(e) => setNewCompOccasion(e.target.value)}
                        placeholder="يوم الجمعة، شهر رمضان، ذو الحجة..."
                        className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-stone-200 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-stone-400 block mb-1">نطاق وشروط الحفظ ومهمة التسميع المطلوبة:</label>
                    <textarea
                      rows={2}
                      value={newCompScope}
                      onChange={(e) => setNewCompScope(e.target.value)}
                      placeholder="صف شروط الحفظ بدقة (مثال: تسميع سورة الكهف كاملة برواية حفص أو ورش مع إتقان المدود)"
                      className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-stone-200 text-xs"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    <div>
                      <label className="text-stone-400 block mb-1">المدة (أيام):</label>
                      <input
                        type="number"
                        min="1"
                        value={newCompDurationDays}
                        onChange={(e) => setNewCompDurationDays(Number(e.target.value))}
                        className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-stone-200 font-mono text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-stone-400 block mb-1">مخصص الجائزة الكلي:</label>
                      <input
                        type="number"
                        value={newCompPrizePool}
                        onChange={(e) => setNewCompPrizePool(Number(e.target.value))}
                        className="w-full bg-stone-900 border border-amber-500/50 rounded-lg p-2 text-amber-300 font-mono font-bold text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-stone-400 block mb-1">جائزة المركز 1:</label>
                      <input
                        type="number"
                        value={newCompFirstPrize}
                        onChange={(e) => setNewCompFirstPrize(Number(e.target.value))}
                        className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-stone-200 font-mono text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-stone-400 block mb-1">جائزة المركز 2:</label>
                      <input
                        type="number"
                        value={newCompSecondPrize}
                        onChange={(e) => setNewCompSecondPrize(Number(e.target.value))}
                        className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-stone-200 font-mono text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-stone-400 block mb-1">جائزة المركز 3:</label>
                      <input
                        type="number"
                        value={newCompThirdPrize}
                        onChange={(e) => setNewCompThirdPrize(Number(e.target.value))}
                        className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-stone-200 font-mono text-xs"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold rounded-lg transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <Megaphone className="w-4 h-4" />
                    <span>إطلاق المسابقة الآن والإعلان عنها في صفحات المستخدمين</span>
                  </button>
                </form>

                {/* Active Competitions Table & Actions */}
                <div className="space-y-3 pt-1">
                  <span className="font-bold text-stone-200 block text-xs">
                    المسابقات الحالية والسابقة ({competitions.length}):
                  </span>

                  <div className="space-y-2.5">
                    {competitions.map((comp) => (
                      <div
                        key={comp.id}
                        className="bg-stone-950 p-3.5 rounded-xl border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              comp.status === 'active'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : 'bg-stone-800 text-stone-400 border border-stone-700'
                            }`}>
                              {comp.status === 'active' ? 'نشطة ومعلنة' : 'مكتملة وموزعة'}
                            </span>
                            <span className="font-bold text-stone-100 text-xs">{comp.title}</span>
                            <span className="text-[10px] text-stone-400">
                              (
                              {comp.frequency === 'daily'
                                ? 'يومية'
                                : comp.frequency === 'weekly'
                                ? 'أسبوعية'
                                : comp.frequency === 'monthly'
                                ? 'شهرية'
                                : comp.frequency === 'occasions'
                                ? `مناسبة: ${comp.occasionName}`
                                : 'فورية'}
                              )
                            </span>
                          </div>

                          <p className="text-[11px] text-stone-400 line-clamp-1">{comp.scopeDescription}</p>

                          <div className="flex items-center gap-3 text-[10px] text-stone-400">
                            <span>الجمهور: {comp.targetAudience === 'all' ? 'الكل' : comp.targetAudience === 'male' ? 'الإخوة' : 'الأخوات'}</span>
                            <span>•</span>
                            <span className="text-amber-400 font-mono font-bold">بند الجوائز: {comp.prizePool} ج.م</span>
                            <span>•</span>
                            <span className="text-emerald-400 font-mono">المشاركون: {comp.participants?.length || 0}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {comp.status === 'active' && (
                            <button
                              type="button"
                              onClick={() => {
                                // Direct award demo simulation
                                const demoWinners = (comp.participants || []).slice(0, 3).map((p, idx) => ({
                                  userId: p.userId,
                                  userName: p.userName,
                                  place: (idx + 1) as 1 | 2 | 3,
                                  score: 95 - idx * 5,
                                  prizeCash: idx === 0 ? (comp.prizesBreakdown?.firstPlace ?? Math.round(comp.prizePool * 0.5)) : idx === 1 ? (comp.prizesBreakdown?.secondPlace ?? Math.round(comp.prizePool * 0.3)) : (comp.prizesBreakdown?.thirdPlace ?? Math.round(comp.prizePool * 0.2)),
                                  prizePoints: idx === 0 ? comp.rewardPoints : Math.round(comp.rewardPoints / 2),
                                }));

                                if (demoWinners.length === 0) {
                                  setCompSaveMessage('لا يوجد متسابقون بعد في هذه المسابقة لتكريمهم!');
                                  return;
                                }

                                handleAwardCompetition(comp.id, demoWinners);
                              }}
                              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg text-xs transition-colors flex items-center gap-1 shadow-sm"
                            >
                              <Award className="w-3.5 h-3.5" />
                              <span>توزيع وتكريم الفائزين</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Token Tiers & Secret Password Settings */}
              <div className="bg-stone-900 rounded-2xl p-5 border border-stone-800 shadow-xl space-y-4 text-xs">
                <h3 className="font-bold text-stone-200 text-sm flex items-center gap-2">
                  <Coins className="w-4 h-4 text-amber-400" />
                  إعدادات الرمز السري وباقات رموز المنصة (Token Tiers):
                </h3>

                {adminSaveMessage && (
                  <div className="p-3 rounded-xl bg-stone-950 border border-emerald-800 text-emerald-300">
                    {adminSaveMessage}
                  </div>
                )}

                <form onSubmit={handleUpdateAdminSettings} className="space-y-4">
                  {/* Marriage Packages Management Section */}
                  <div className="p-4 rounded-xl bg-stone-950 border border-amber-500/40 space-y-3">
                    <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                      <span className="font-bold text-amber-400 flex items-center gap-1.5 text-xs">
                        <Crown className="w-4 h-4 text-amber-400" />
                        <span>إدارة أسعار وصلاحيات باقات الزواج والعفة (الثبات الشهري والظهور):</span>
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                        ميزة مدير النظام
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="sm:col-span-2 p-3 rounded-lg bg-amber-950/20 border border-amber-500/30 space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-amber-300 font-bold text-xs flex items-center gap-1">
                            <Crown className="w-3.5 h-3.5 text-amber-400" />
                            <span>باقة العفة الملكية (النخبة الماسية - ثبات شهر كامل):</span>
                          </label>
                          <span className="text-[10px] text-emerald-400 font-medium">أعلى باقة بكافة المميزات</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <div>
                            <span className="text-[10px] text-stone-400 block mb-0.5">السعر (ج.م / ر.س):</span>
                            <input
                              type="number"
                              value={royalPriceVal}
                              onChange={(e) => setRoyalPriceVal(Number(e.target.value))}
                              className="w-full bg-stone-900 border border-amber-500/50 rounded-lg p-2 text-amber-300 font-mono font-bold"
                            />
                          </div>
                          <div>
                            <span className="text-[10px] text-stone-400 block mb-0.5">مدة الثبات في الصدارة (بالأيام):</span>
                            <input
                              type="number"
                              value={royalDurationVal}
                              onChange={(e) => setRoyalDurationVal(Number(e.target.value))}
                              className="w-full bg-stone-900 border border-stone-700 rounded-lg p-2 text-stone-200 font-mono"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="text-stone-400 block mb-1">سعر الباقة الفضية العادية (Silver):</label>
                        <input
                          type="number"
                          value={silverPriceVal}
                          onChange={(e) => setSilverPriceVal(Number(e.target.value))}
                          className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2 text-stone-200 font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-amber-400 block mb-1">سعر الباقة الذهبية المتقدمة (Gold):</label>
                        <input
                          type="number"
                          value={goldPriceVal}
                          onChange={(e) => setGoldPriceVal(Number(e.target.value))}
                          className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2 text-stone-200 font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-purple-300 block mb-1">سعر الباقة البلاتينية الممتازة (Platinum):</label>
                        <input
                          type="number"
                          value={platinumPriceVal}
                          onChange={(e) => setPlatinumPriceVal(Number(e.target.value))}
                          className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2 text-stone-200 font-mono"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password & Tokens Settings */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-stone-400 block mb-1">الرمز السري الجديد لمدير النظام (افتراضي 000000):</label>
                      <input
                        type="text"
                        placeholder="اتركه فارغاً إن لم ترغب في التغيير"
                        value={newAdminPassword}
                        onChange={(e) => setNewAdminPassword(e.target.value)}
                        className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2 text-stone-200 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-stone-400 block mb-1">رصيد باقة الفضة (Silver Tokens):</label>
                      <input
                        type="number"
                        value={silverTokensVal}
                        onChange={(e) => setSilverTokensVal(Number(e.target.value))}
                        className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2 text-stone-200 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-stone-400 block mb-1">رصيد باقة الذهب (Gold Tokens):</label>
                      <input
                        type="number"
                        value={goldTokensVal}
                        onChange={(e) => setGoldTokensVal(Number(e.target.value))}
                        className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2 text-stone-200 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-stone-400 block mb-1">رصيد باقة البلاتينيوم (Platinum Tokens):</label>
                      <input
                        type="number"
                        value={platinumTokensVal}
                        onChange={(e) => setPlatinumTokensVal(Number(e.target.value))}
                        className="w-full bg-stone-950 border border-stone-700 rounded-lg p-2 text-stone-200 font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-lg transition-colors shadow-md"
                  >
                    حفظ كافة تعديلات الباقات والرمز السري في admin_settings
                  </button>
                </form>
              </div>

              {/* Chat Firewall Violation Log */}
              <div className="bg-stone-900 rounded-2xl p-5 border border-stone-800 shadow-xl space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-red-400 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4" />
                    سجل محاولات الالتفاف المرصودة بجدار الحماية الشرعي (Chat Firewall Audit):
                  </h3>
                  <span className="text-[10px] text-stone-400">حظر تلقائي للأرقام والكلمات الالتفافية</span>
                </div>

                <div className="space-y-2">
                  {adminViolations.map((viol) => (
                    <div
                      key={viol.id}
                      className="bg-stone-950 p-3 rounded-xl border border-red-950/80 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-amber-400 font-mono font-bold">
                          المرسل: {viol.senderGender === 'male' ? 'راغب زواج (رجل)' : 'راغبة زواج (امرأة)'}
                        </span>
                        <span className="text-[10px] text-stone-500 font-mono">
                          {new Date(viol.timestamp).toLocaleTimeString('ar-EG')}
                        </span>
                      </div>
                      <div className="bg-red-950/20 p-2 rounded text-red-200 border border-red-900/40 font-mono">
                        "{viol.message}"
                      </div>
                      <div className="text-[11px] text-stone-400 flex items-center gap-2">
                        <span>الكلمات المضبوطة: <strong className="text-red-400">{viol.detectedKeywords.join(', ')}</strong></span>
                        <span>•</span>
                        <span className="text-stone-500">{viol.reason}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Withdrawals Approval Management */}
              <div className="bg-stone-900 rounded-2xl p-5 border border-stone-800 shadow-xl space-y-3 text-xs">
                <h3 className="font-bold text-stone-200 flex items-center gap-2">
                  <ArrowDownToLine className="w-4 h-4 text-emerald-400" />
                  مراجعة طلبات السحب المالي (اعتماد التحويل):
                </h3>

                <div className="space-y-2">
                  {withdrawalsList.map((wd) => (
                    <div
                      key={wd.id}
                      className="bg-stone-950 p-3.5 rounded-xl border border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div>
                        <div className="font-bold text-stone-100 flex items-center gap-2">
                          <span className="text-amber-400 font-mono">{wd.amount} ج.م</span>
                          <span>- {wd.userName} ({wd.method})</span>
                        </div>
                        <p className="text-stone-400 text-[11px] mt-0.5 font-mono">
                          العنوان: {wd.payoutAddress}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {wd.status === 'pending_approval' ? (
                          <>
                            <button
                              onClick={() => handleAdminWithdrawalAction(wd.id, 'approve')}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                            >
                              موافقة وصرف
                            </button>
                            <button
                              onClick={() => handleAdminWithdrawalAction(wd.id, 'reject')}
                              className="px-3 py-1.5 rounded-lg bg-red-600/80 hover:bg-red-500 text-white font-bold"
                            >
                              رفض وإرجاع
                            </button>
                          </>
                        ) : (
                          <span className={`px-2.5 py-1 rounded text-[11px] font-bold ${
                            wd.status === 'approved' ? 'text-emerald-400 bg-emerald-950' : 'text-red-400 bg-red-950'
                          }`}>
                            {wd.status === 'approved' ? '✅ تم التحويل' : '❌ تم الرفض'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PostgreSQL Production DDL Schema & Strategic Governance */}
              <div className="bg-stone-900 rounded-2xl p-5 border border-stone-800 shadow-xl space-y-4 text-xs">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-400" />
                    <h3 className="font-bold text-stone-200">
                      هيكل قاعدة البيانات ونظام الحوكمة (Database Architecture & Governance):
                    </h3>
                  </div>

                  {/* Tabs: Benefits vs DDL */}
                  <div className="flex items-center gap-1.5 p-1 rounded-xl bg-stone-950 border border-stone-800">
                    <button
                      type="button"
                      onClick={() => setAdminDbTab('benefits')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        adminDbTab === 'benefits'
                          ? 'bg-amber-500 text-stone-950 shadow'
                          : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      💡 ما فائدة الهيكل للإدارة؟
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdminDbTab('ddl')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        adminDbTab === 'ddl'
                          ? 'bg-emerald-600 text-white shadow'
                          : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      💻 كود SQL الكامل
                    </button>
                  </div>
                </div>

                {/* Tab 1: Benefits Explanation answering user question */}
                {adminDbTab === 'benefits' ? (
                  <div className="space-y-3.5 animate-in fade-in duration-150">
                    <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-800/40 text-stone-300 space-y-2">
                      <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                        <Sparkles className="w-4 h-4" />
                        <span>ما هي أهمية وفائدة وجود هيكل قاعدة البيانات الكامل في لوحة تحكم الإدارة؟</span>
                      </div>
                      <p className="text-[11px] text-stone-300 leading-relaxed">
                        هذا الهيكل ليس مجرد كود برمجي، بل هو الركيزة الهندسية والقانونية والشرعية التي تبنى عليها منصة منهاج، ويوفر للإدارة المزايا الاستراتيجية التالية:
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {DATABASE_SCHEMA_BENEFITS.map((benefit, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-stone-950 border border-stone-800 space-y-1.5"
                        >
                          <div className="flex items-center gap-2 font-bold text-stone-200 text-xs">
                            <span className="w-5 h-5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center justify-center font-mono text-[10px]">
                              0{idx + 1}
                            </span>
                            <span>{benefit.title}</span>
                          </div>
                          <p className="text-[11px] text-stone-400 leading-relaxed">
                            {benefit.desc}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Summary Metric Footer */}
                    <div className="p-3 rounded-xl bg-stone-950/80 border border-stone-800/60 flex items-center justify-between text-[11px] text-stone-400">
                      <span>عدد الجداول المعتمدة: <strong className="text-emerald-400 font-mono">11 جدولاً نشطاً</strong></span>
                      <span>نوع المحرك: <strong className="text-stone-200 font-mono">PostgreSQL Relational ACID</strong></span>
                      <button
                        onClick={() => setAdminDbTab('ddl')}
                        className="text-amber-400 hover:text-amber-300 font-bold underline"
                      >
                        معاينة ونسخ كود SQL ←
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Tab 2: Full SQL DDL with Copy Button */
                  <div className="space-y-3 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between">
                      <span className="text-stone-400 text-[11px]">
                        مخطط DDL كامل جاهز للتشغيل في PostgreSQL, Supabase, Google Cloud SQL, AWS:
                      </span>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(sqlSchema);
                          setCopiedSql(true);
                          setTimeout(() => setCopiedSql(false), 2000);
                        }}
                        className="px-3 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold flex items-center gap-1.5 text-xs transition-colors"
                      >
                        {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedSql ? 'تم النسخ بنجاح' : 'نسخ كود SQL كامل'}</span>
                      </button>
                    </div>

                    <pre className="bg-stone-950 p-4 rounded-xl border border-stone-800 text-emerald-300 font-mono text-[11px] max-h-72 overflow-y-auto leading-relaxed dir-ltr text-left">
                      {sqlSchema || '-- جاري جلب هيكل PostgreSQL من خادم منهاج...'}
                    </pre>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* VIEW: ISLAMIC REFERENCES & CANONICAL E-LIBRARY (المكتبة والمراجع الموثوقة) */}
          {/* ========================================================================= */}
          {view === 'references' && (
            <div id="references-view" className="space-y-5 animate-in fade-in duration-200">
              <IslamicReferencesLibrary
                theme={theme}
                language={selectedLanguage}
                isAdminLoggedIn={isAdminLoggedIn}
              />
            </div>
          )}

        </main>

        {/* ========================================================================= */}
        {/* MODAL 1: REGULATED CHAT & FIREWALL TEST (نافذة المحادثة المراقبة)           */}
        {/* ========================================================================= */}
        {chatModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-stone-900 w-full max-w-lg rounded-2xl border border-stone-800 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150">
              {/* Header */}
              <div className="bg-stone-950 p-4 border-b border-stone-800 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-stone-100 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-400" />
                    <span>محادثة مراقبة شرعياً مع ({selectedProfile?.code || 'الطرف الآخر'})</span>
                  </h3>
                  <span className="text-[11px] text-stone-400">
                    نظام الرقابة الآلي يفحص الرسائل ضد أرقام الهواتف والدعوة للخروج عن التطبيق
                  </span>
                </div>
                <button
                  onClick={() => setChatModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-stone-800 text-stone-400 hover:text-white flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              {/* Chat History */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-stone-950/40 text-xs">
                {chatMessagesList.map((msg, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-xl max-w-[85%] ${
                      msg.sender.includes('نظام')
                        ? 'bg-stone-900/90 border border-emerald-900/50 text-stone-300 mx-auto text-center'
                        : msg.sender.includes('أنت')
                        ? 'bg-emerald-900/50 border border-emerald-700/50 text-emerald-100 mr-auto'
                        : 'bg-stone-800 border border-stone-700 text-stone-100 ml-auto'
                    }`}
                  >
                    <span className="text-[10px] text-stone-400 block mb-1 font-bold">
                      {msg.sender} • {msg.time}
                    </span>
                    <p className="leading-relaxed">{msg.text}</p>
                  </div>
                ))}

                {/* Firewall Alert in Chat if Triggered */}
                {chatError && (
                  <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-700 text-red-200 space-y-1.5 animate-bounce-short">
                    <div className="flex items-center gap-1.5 font-bold text-red-400">
                      <PhoneOff className="w-4 h-4" />
                      <span>{chatError}</span>
                    </div>
                    <p className="text-[11px] text-red-300">
                      تم تسجيل هذه المحاولة تلقائياً في سجل لوحة الإدارة لمراجعة سلامة النية وصيانة العفة.
                    </p>
                  </div>
                )}

                {chatSuccess && (
                  <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-[11px] flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{chatSuccess}</span>
                  </div>
                )}
              </div>

              {/* Quick Simulator Test Chips */}
              <div className="p-2.5 bg-stone-950 border-t border-stone-800 flex items-center gap-1.5 overflow-x-auto text-[10px]">
                <span className="text-stone-400 whitespace-nowrap">تجربة جدار الحظر:</span>
                <button
                  type="button"
                  onClick={() => setChatMessage('ممكن رقم تليفون والدك فون 01011112222 للتواصل واتس برا التطبيق كاش؟')}
                  className="px-2 py-1 rounded bg-red-950 text-red-300 border border-red-800 whitespace-nowrap hover:bg-red-900"
                >
                  ⚡ تجربة رسالة مخالفة (أرقام وكاش)
                </button>
                <button
                  type="button"
                  onClick={() => setChatMessage('السلام عليكم ورحمة الله، اطلعت على استمارتكم ومقدار حفظكم للقرآن الكريم، وأرغب في التقدم رسمياً لولي أمركم.')}
                  className="px-2 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 whitespace-nowrap hover:bg-emerald-900"
                >
                  ✨ تجربة رسالة شرعية متزنة
                </button>
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendChatMessage} className="p-3 bg-stone-950 border-t border-stone-800 flex items-center gap-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="اكتب رسالتك باحترام شرعي دون أرقام أو وسائل خارجية..."
                  className="flex-1 bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>إرسال</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 2: SMART ESCROW DEPOSIT (العربون الذكي للتواصل مع الولي)              */}
        {/* ========================================================================= */}
        {escrowModalOpen && escrowResult && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-stone-900 w-full max-w-md rounded-2xl border border-emerald-800/60 shadow-2xl p-5 space-y-4 animate-in zoom-in-95 duration-150 text-xs">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>نظام العربون الذكي (Smart Escrow Protocol)</span>
                </div>
                <button onClick={() => setEscrowModalOpen(false)} className="text-stone-400 hover:text-white">✕</button>
              </div>

              <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-2">
                <div className="flex justify-between items-center text-stone-300">
                  <span>كود الاستمارة المستهدفة:</span>
                  <span className="font-mono font-bold text-amber-400">{escrowResult.targetCode}</span>
                </div>
                <div className="flex justify-between items-center text-stone-300">
                  <span>مبلغ عربون الجدية المحجوز:</span>
                  <span className="font-mono font-bold text-emerald-400">{escrowResult.depositAmount} ج.م (10%)</span>
                </div>
                <div className="flex justify-between items-center text-stone-300">
                  <span>حالة الضمان:</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-bold">محجوز بحساب الأمانة</span>
                </div>
              </div>

              <div className="text-stone-300 leading-relaxed bg-emerald-950/30 p-3.5 rounded-xl border border-emerald-800/40 space-y-2">
                <p>
                  🛡️ <strong>كيف يحميك نظام العربون الذكي؟</strong>
                </p>
                <p className="text-[11px] text-stone-300">
                  {escrowResult.message}
                </p>
                <div className="pt-2 border-t border-emerald-800/30 text-[11px] text-amber-300">
                  رقم ولي الأمر المشفر: <strong>{escrowResult.maskedWaliPhone}</strong> (يتم الكشف الكامل عنه فور موافقة الطرفين الشرعية).
                </div>
              </div>

              <button
                onClick={() => setEscrowModalOpen(false)}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors shadow-lg"
              >
                فهمت الضوابط الشرعية - العودة للتطبيق
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODAL 3: ADMIN & CONTROL PANEL LOGIN (دخول الإدارة ولوحة التحكم)           */}
        {/* ========================================================================= */}
        {adminModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0b1720] w-full max-w-md rounded-2xl border border-amber-500/50 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150 text-xs text-stone-200">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Settings className="w-5 h-5 animate-spin [animation-duration:12s]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-amber-400">
                      دخول الإدارة ولوحة التحكم
                    </h3>
                    <p className="text-[10px] text-stone-400">
                      منطقة المشرف العام المعتمد لمنصة منهاج
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setAdminModalOpen(false);
                    setAdminError(null);
                  }}
                  className="p-1 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
                  aria-label="إغلاق"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Information Notice */}
              <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-stone-300 text-[11px] leading-relaxed flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  الدخول للوحة التحكم والإدارة مخصص حصرياً للمشرف العام عبر البريد المعتمد (<strong className="text-amber-300 font-mono">mohamedyoussef255@gmail.com</strong>) وكلمة المرور الخاصة.
                </span>
              </div>

              {/* Error Message */}
              {adminError && (
                <div className="p-3 rounded-xl bg-red-950/90 border border-red-700 text-red-200 text-xs flex items-start gap-2 animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{adminError}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleAdminLogin} className="space-y-3.5">
                {/* Email Field */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-amber-400" />
                    <span>البريد الإلكتروني المعتمد للمشرف:</span>
                  </label>
                  <div className="relative">
                    <input
                      id="admin-login-email-input"
                      type="email"
                      required
                      autoFocus
                      dir="ltr"
                      value={adminEmailInput}
                      onChange={(e) => setAdminEmailInput(e.target.value)}
                      placeholder="mohamedyoussef255@gmail.com"
                      className="w-full bg-[#061017] border border-stone-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl px-3 py-2.5 text-amber-300 font-mono text-xs outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-stone-300 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                    <span>كلمة المرور الإدارية:</span>
                  </label>
                  <div className="relative">
                    <input
                      id="admin-login-password-input"
                      type={showAdminPassword ? 'text' : 'password'}
                      required
                      dir="ltr"
                      value={adminPasswordInput}
                      onChange={(e) => setAdminPasswordInput(e.target.value)}
                      placeholder="كلمة المرور"
                      className="w-full bg-[#061017] border border-stone-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 rounded-xl px-3 py-2.5 text-amber-300 font-mono text-xs outline-none transition-all pl-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-amber-300 transition-colors"
                      title={showAdminPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                    >
                      {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <button
                    id="admin-login-submit-btn"
                    type="submit"
                    className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-black rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    <span>دخول لوحة التحكم</span>
                  </button>
                  <button
                    id="admin-login-autofill-btn"
                    type="button"
                    onClick={() => {
                      setAdminEmailInput('mohamedyoussef255@gmail.com');
                      setAdminPasswordInput('mohamed2072');
                      setAdminError(null);
                    }}
                    className="px-3 py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl font-medium text-[11px] transition-colors flex items-center justify-center gap-1.5"
                    title="تعبئة البريد وكلمة السر المعتمدة تلقائياً"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>تعبئة البيانات المعتمدة</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 🔐 Full Sharia Auth Portal for Men and Women */}
        <AuthPortal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          currentUser={currentUser}
          initialGender={userGender}
          onLoginSuccess={(user, userWallet) => {
            setCurrentUser(user);
            setUserGender(user.gender);
            if (userWallet) {
              setWallet(userWallet);
            }
          }}
        />

        {/* 👑 Marriage & Chastity Packages Modal (Baqat Al-Iffah & Pinning) */}
        <MarriagePackagesModal
          isOpen={packagesModalOpen}
          onClose={() => setPackagesModalOpen(false)}
          packages={packages}
          onSubscribePackage={handleSubscribePackage}
          onOpenPaymentMethods={(purpose, amount) => {
            setPaymentModalPurpose(purpose || 'سداد اشتراك باقة العفة');
            setPaymentModalAmount(amount);
            setPaymentModalOpen(true);
          }}
          userGender={userGender}
          theme={theme}
        />

        {/* 💳 Payment Methods & InstaPay Modal */}
        <PaymentMethodsModal
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          paymentMethods={paymentMethods}
          theme={theme}
          purpose={paymentModalPurpose}
          targetAmount={paymentModalAmount}
          language={selectedLanguage}
        />

        {/* 🏆 Competitions Modal (Listing, Joining, Countdown) */}
        <CompetitionsModal
          isOpen={competitionsModalOpen}
          onClose={() => setCompetitionsModalOpen(false)}
          competitions={competitions}
          userGender={userGender}
          currentUser={currentUser}
          theme={theme}
          onJoinCompetition={handleJoinCompetition}
        />

        {/* 🌐 Global Living Languages Selector Modal */}
        <LanguageModal
          isOpen={langModalOpen}
          onClose={() => setLangModalOpen(false)}
          selectedLanguage={selectedLanguage}
          onSelectLanguage={(lang) => setSelectedLanguage(lang)}
          theme={theme}
        />

        {/* 🗺️ Global Country & Currency Selector Modal */}
        <CountryModal
          isOpen={countryModalOpen}
          onClose={() => setCountryModalOpen(false)}
          selectedCountry={selectedCountry}
          onSelectCountry={(countryCode) => setSelectedCountry(countryCode)}
          theme={theme}
          language={selectedLanguage}
        />

        {/* 🗑️ Clear Demo Data Confirmation Modal */}
        <ClearDemoModal
          isOpen={showClearDemoConfirm}
          onClose={() => setShowClearDemoConfirm(false)}
          onConfirm={handleClearDemoData}
          isClearing={isClearingDemoData}
          theme={theme}
        />

        {/* 🧭 Bottom Tab Bar Navigation */}
        <nav id="minhaj-bottom-nav" className={`fixed bottom-0 left-0 right-0 max-w-2xl mx-auto border-t px-2 py-1.5 z-40 flex items-center justify-around shadow-2xl transition-colors ${
          isDark
            ? 'bg-stone-950/95 backdrop-blur-md border-stone-800/90'
            : 'bg-white/95 backdrop-blur-md border-stone-200'
        }`}>
          <button
            id="nav-tab-quran"
            onClick={() => {
              setView('quran');
              if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all ${
              view === 'quran'
                ? 'text-amber-500 font-bold scale-105'
                : isDark ? 'text-stone-400 hover:text-stone-200' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-[9px] sm:text-[10px]">{t('navQuran')}</span>
          </button>

          {/* 🎙️ Dedicated Halaqat Tab next to Quran as requested */}
          <button
            id="nav-tab-halaqat"
            onClick={() => {
              setView('halaqat');
              if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all relative ${
              view === 'halaqat'
                ? 'text-amber-500 font-bold scale-105'
                : isDark ? 'text-stone-400 hover:text-stone-200' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <div className="relative">
              <Radio className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="w-2 h-2 rounded-full bg-emerald-500 absolute -top-0.5 -right-0.5 animate-pulse" />
            </div>
            <span className="text-[9px] sm:text-[10px]">{t('navHalaqat')}</span>
          </button>

          <button
            id="nav-tab-marriage"
            onClick={() => {
              setView('marriage');
              if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all ${
              view === 'marriage'
                ? 'text-amber-500 font-bold scale-105'
                : isDark ? 'text-stone-400 hover:text-stone-200' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-[9px] sm:text-[10px]">{t('navMarriage')}</span>
          </button>

          <button
            id="nav-tab-competitions"
            onClick={() => {
              setView('competitions');
              if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all ${
              view === 'competitions'
                ? 'text-amber-500 font-bold scale-105'
                : isDark ? 'text-stone-400 hover:text-stone-200' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-[9px] sm:text-[10px]">المسابقات</span>
          </button>

          <button
            id="nav-tab-incentives"
            onClick={() => {
              setView('incentives');
              if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all ${
              view === 'incentives'
                ? 'text-amber-500 font-bold scale-105'
                : isDark ? 'text-stone-400 hover:text-stone-200' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Coins className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-[9px] sm:text-[10px]">نقاط وميزات الحفظ</span>
          </button>

          <button
            id="nav-tab-wallet"
            onClick={() => {
              setView('wallet');
              if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl transition-all ${
              view === 'wallet'
                ? 'text-amber-500 font-bold scale-105'
                : isDark ? 'text-stone-400 hover:text-stone-200' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <WalletIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-[9px] sm:text-[10px]">{t('navWallet')}</span>
          </button>
        </nav>

      </div>
    </div>
  );
}
