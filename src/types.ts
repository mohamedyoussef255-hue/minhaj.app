// Shared TypeScript Types and Constants for Minhaj Platform

export interface User {
  id: string;
  phoneNumber: string;
  fullName: string;
  gender: 'male' | 'female';
  age: number;
  currentTier: 'free' | 'silver' | 'gold' | 'platinum';
  tokensBalance: number;
  createdAt: string;
}

export interface MarriagePackage {
  id: string;
  tier: 'silver' | 'gold' | 'platinum' | 'royal_monthly';
  name: string;
  price: number;
  currency: string;
  durationDays: number;
  badge: string;
  isHighestTier?: boolean;
  pinOnTop?: boolean;
  visibilityMultiplier: number;
  features: string[];
  description: string;
}

export interface MarriageProfile {
  id: string;
  userId: string;
  code: string;
  fullNameMasked: string;
  gender: 'male' | 'female';
  maritalStatus: 'single' | 'widowed' | 'divorced' | 'polygamy';
  age: number;
  city: string;
  country: string;
  job: string;
  qualifications: string;
  hifzPortion: string;
  religiousCommitment: string;
  packageTier?: 'silver' | 'gold' | 'platinum' | 'royal_monthly';
  isPinned?: boolean;
  pinnedDaysRemaining?: number;
  specifications: {
    height?: number;
    hijabStyle?: string;
    bearded?: boolean;
    housing?: string;
    smoking: boolean;
    hobbies: string[];
    bio: string;
  };
  partnerRequirements: {
    ageRange: [number, number];
    preferredStatus: string[];
    religiosity: string;
    education: string;
    notes: string;
  };
  nationalIdVerified: boolean;
  waliPhoneMasked: string;
  isActive: boolean;
  createdAt: string;
}

export interface HifzPlan {
  id: string;
  userId: string;
  surahNumber: number;
  surahName: string;
  verseStart: number;
  verseEnd: number;
  targetDate: string;
  isCompleted: boolean;
  audioRecordingUrl?: string;
  tajweedNotes?: string;
  repetitionCount: number;
}

export interface Wallet {
  id: string;
  userId: string;
  availablePoints: number;
  earnedCash: number; // in EGP / SAR
  referralCode: string;
  successfulReferralsCount: number;
  updatedAt: string;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  userName: string;
  method: string;
  payoutAddress: string;
  amount: number;
  status: 'pending_approval' | 'approved' | 'rejected';
  createdAt: string;
  notes?: string;
}

export interface SecurityViolation {
  id: string;
  timestamp: string;
  senderGender: string;
  message: string;
  detectedKeywords: string[];
  reason: string;
}

export interface PaymentMethodsConfig {
  instapay: {
    enabled: boolean;
    ipa: string;
    phone: string;
    accountName: string;
    qrCodeUrl?: string;
  };
  vodafoneCash: {
    enabled: boolean;
    phone: string;
    accountName: string;
  };
  bankAccount: {
    enabled: boolean;
    bankName: string;
    accountNumber: string;
    iban: string;
    swiftCode: string;
    accountHolder: string;
    branchName?: string;
    country?: string;
    acceptedCurrencies?: string[];
    intermediaryBank?: string;
    instructionsForInternational?: string;
  };
  stcPay: {
    enabled: boolean;
    phone: string;
    accountName: string;
  };
  paymentInstructions: string;
  whatsappConfirmationPhone: string;
}

export interface RevenueAndRewardFund {
  totalPlatformRevenue: number;
  rewardAllocationPercentage: number;
  totalAllocatedForRewards: number;
  totalDistributedToWinners: number;
  availablePrizePool: number;
  incentiveRates: {
    pointsPerAyah: number;
    cashPerAyah: number;
    pointsPerSurah: number;
    cashPerSurah: number;
    pointsPerJuz: number;
    cashPerJuz: number;
    pointsPerKhatmah: number;
    cashPerKhatmah: number;
  };
}

export interface CompetitionParticipant {
  id: string;
  userId: string;
  userName: string;
  gender: 'male' | 'female';
  registeredAt: string;
  submissionAudioUrl?: string;
  submissionNotes?: string;
  score?: number;
  evaluatorNotes?: string;
  status: 'registered' | 'submitted' | 'evaluated' | 'won';
}

export interface Competition {
  id: string;
  title: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'occasions' | 'instant';
  targetAudience: 'all' | 'male' | 'female';
  occasionName?: string;
  scopeDescription: string;
  surahTarget?: number;
  juzTarget?: number;
  versesTarget?: string;
  startDate: string;
  endDate: string;
  prizePool: number;
  rewardPoints: number;
  prizesBreakdown: {
    firstPlace: number;
    secondPlace: number;
    thirdPlace: number;
    consolationPrizes: number;
  };
  rules: string[];
  status: 'active' | 'evaluating' | 'completed' | 'draft';
  participantsCount: number;
  participants: CompetitionParticipant[];
  winners?: {
    place: number;
    userId: string;
    userName: string;
    gender: 'male' | 'female';
    score: number;
    prizeCash: number;
    prizePoints: number;
    awardedAt: string;
  }[];
  createdAt: string;
}

export interface SelfPacedMilestoneClaim {
  id: string;
  userId: string;
  userName: string;
  type: 'ayah' | 'surah' | 'juz' | 'khatmah';
  title: string;
  count: number;
  pointsEarned: number;
  cashEarned: number;
  timestamp: string;
}

// Available Perks that can be unlocked using Hifz Points (سوق ميزات منهاج بنقاط الحفظ)
export interface PointPerk {
  id: string;
  title: string;
  description: string;
  category: 'marriage' | 'quran' | 'privilege' | 'certificate';
  pointsCost: number;
  iconName: string;
  badge: string;
}

export type ReferenceCategory =
  | 'tafseer'
  | 'hadith'
  | 'fiqh_marriage'
  | 'quran_tajweed'
  | 'aqeedah'
  | 'sharia_governance';

export interface ReferenceExcerpt {
  chapterTitle: string;
  page: number;
  volume?: number;
  textExcerpt: string;
  rulingOrBenefit: string;
}

export interface EbookFileInfo {
  fileName: string;
  fileSize: string;
  fileFormat: 'pdf' | 'epub' | 'txt' | 'doc';
  fileDataUrl?: string;
  downloadUrl?: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface IslamicReference {
  id: string;
  title: string;
  author: string;
  investigatorOrEditor?: string;
  category: ReferenceCategory;
  categoryLabelAr: string;
  categoryLabelEn: string;
  publisher: string;
  edition: string;
  publicationYearHijri?: string;
  publicationYearGregorian?: string;
  volumesCount?: number;
  totalPages?: number;
  isbnOrId?: string;
  verificationStatus: 'verified_authentic' | 'under_review' | 'community_contributed';
  verificationBadgeAr: string;
  verificationBadgeEn: string;
  appUsageScope: string;
  appUsageScopeEn?: string;
  summary: string;
  summaryEn?: string;
  citationFormat: string;
  sampleChaptersOrExcerpt: ReferenceExcerpt[];
  ebookFile?: EbookFileInfo;
  addedAt: string;
  isOfficialCurated: boolean;
}

export const INITIAL_ISLAMIC_REFERENCES: IslamicReference[] = [
  {
    id: 'ref-ibn-kathir',
    title: 'تفسير القرآن العظيم (تفسير ابن كثير)',
    author: 'الحافظ عماد الدين إسماعيل بن عمر بن كثير القرشي الدمشقي (ت 774 هـ)',
    investigatorOrEditor: 'سامي بن محمد السلامة',
    category: 'tafseer',
    categoryLabelAr: 'التفسير وعلوم القرآن',
    categoryLabelEn: 'Quran Exegesis (Tafseer)',
    publisher: 'دار طيبة للنشر والتوزيع - الرياض',
    edition: 'الطبعة الثانية، 1420هـ / 1999م',
    publicationYearHijri: '1420 هـ',
    publicationYearGregorian: '1999 م',
    volumesCount: 8,
    totalPages: 4120,
    isbnOrId: 'ISBN: 978-9960-903-12-8',
    verificationStatus: 'verified_authentic',
    verificationBadgeAr: 'مرجع معتمد أصيل',
    verificationBadgeEn: 'Verified Canonical Source',
    appUsageScope: 'يستقي منه التطبيق تدبر الآيات القرآنية، فضائل السور، وأسباب النزول في قسم المصحف وحلقات التدارس.',
    appUsageScopeEn: 'Used by the app for Quranic ayah reflection, surah virtues, and historical contexts in Quran & Halaqat modules.',
    summary: 'من أصح كتب التفسير بالمأثور، يفسر القرآن بالقرآن، ثم بالسنة النبوية الصحيحة، ثم بأقوال الصحابة والتابعين مع بيان صحة الأحاديث ونبذ الإسرائيليات.',
    summaryEn: 'One of the most authentic and authoritative classical exegeses, interpreting the Quran by the Quran, authentic Sunnah, and noble Companions.',
    citationFormat: 'ابن كثير، إسماعيل بن عمر. تفسير القرآن العظيم. تحقيق سامي السلامة. ط2. الرياض: دار طيبة، 1420هـ/1999م.',
    sampleChaptersOrExcerpt: [
      {
        chapterTitle: 'تفسير سورة النور - آية العفة والاستعفاف (آية 32-33)',
        volume: 6,
        page: 47,
        textExcerpt: 'قوله تعالى: ﴿وَأَنكِحُوا الْأَيَامَىٰ مِنكُمْ وَالصَّالِحِينَ مِنْ عِبَادِكُمْ وَإِمَائِكُمْ ۚ إِن يَكُونُوا فُقَرَاءَ يُغْنِهِمُ اللَّهُ مِن فَضْلِهِ﴾، هذا أمر بالتزويج، وذهب طائفة من العلماء إلى وجوبه على من قدر عليه، وقد روى ابن جرير عن ابن مسعود رضي الله عنه قال: التمسوا الغنى في النكاح.',
        rulingOrBenefit: 'الدلالة الشرعية على استحباب تيسير النكاح وإعانة الراغبين في العفة بوعد الله بالغنى والتوفيق، وهو أصل تأسيس منصة منهاج.',
      },
      {
        chapterTitle: 'تفسير سورة البقرة - فضل تلاوة القرآن وتدبره',
        volume: 1,
        page: 112,
        textExcerpt: 'بيان أن القرآن هدى للمتقين الذين يؤمنون بالغيب ويقيمون الصلاة، وأن الماهر بالقرآن مع السفرة الكرام البررة.',
        rulingOrBenefit: 'استنباط حوافز الحفظ والتلاوة وتأصيل رصد المكافآت لأهل القرآن.',
      },
    ],
    ebookFile: {
      fileName: 'Tafseer_Ibn_Kathir_Complete_8Vols.pdf',
      fileSize: '48.5 MB',
      fileFormat: 'pdf',
      downloadUrl: 'https://archive.org/download/Tafseer-Ibn-Katheer/Tafseer-Ibn-Katheer.pdf',
      uploadedAt: '2026-09-01',
      uploadedBy: 'هيئة التدقيق العلمي لمنهاج',
    },
    addedAt: '2026-09-01T00:00:00Z',
    isOfficialCurated: true,
  },
  {
    id: 'ref-sahih-bukhari',
    title: 'الجامع المسند الصحيح المختصر (صحيح البخاري)',
    author: 'الإمام محمد بن إسماعيل البخاري (ت 256 هـ)',
    investigatorOrEditor: 'محمد زهير بن ناصر الناصر (الطبعة السلطانية)',
    category: 'hadith',
    categoryLabelAr: 'الحديث الشريف والسنة',
    categoryLabelEn: 'Prophetic Hadith (Sunnah)',
    publisher: 'دار طوق النجاة (مصورة عن الطبعة الكبرى الأميرية ببولاق)',
    edition: 'الطبعة الأولى المحققة، 1422 هـ',
    publicationYearHijri: '1422 هـ',
    publicationYearGregorian: '2001 م',
    volumesCount: 9,
    totalPages: 3824,
    isbnOrId: 'ISBN: 978-977-628-091-2',
    verificationStatus: 'verified_authentic',
    verificationBadgeAr: 'أصح كتاب بعد كتاب الله',
    verificationBadgeEn: 'Highest Authenticity',
    appUsageScope: 'المرجع الأساسي لأحاديث فضل حفظ القرآن، آداب التلاوة، شروط النكاح والكفاءة، ومسؤولية الولي الشرعي.',
    appUsageScopeEn: 'Foundational source for hadiths on Quran memorization, guardian responsibilities, and Islamic marriage ethics.',
    summary: 'أجمع المسلمون على صحته وتلقي الأمة له بالقبول. يحتوي على أصح الأحاديث النبوية المرفوعة سندا ومتنا وفق شروط البخاري الصارمة.',
    summaryEn: 'The most authentic collection of Prophetic traditions, held in the highest esteem across the entire Islamic world.',
    citationFormat: 'البخاري، محمد بن إسماعيل. الجامع المسند الصحيح. تحقيق محمد زهير الناصر. ط1. بيروت: دار طوق النجاة، 1422هـ.',
    sampleChaptersOrExcerpt: [
      {
        chapterTitle: 'كتاب النكاح - باب لا ينكح الأب وغيره البكر والثيب إلا برضاها وباب الولي',
        volume: 7,
        page: 18,
        textExcerpt: 'عن عائشة رضي الله عنها قالت: قال رسول الله ﷺ: «أيما امرأة نكحت بغير إذن وليها فنكاحها باطل، فنكاحها باطل، فنكاحها باطل»، وعن أبي هريرة قال: «تستأمر اليتيمة في نفسها، فإن سكتت فهو إذنها».',
        rulingOrBenefit: 'التأكيد القطعي على اشتراط إذن الولي الشرعي ورضا الفتاة، وهو ركيزة العزل وحماية بيانات الأخوات في منصة منهاج.',
      },
      {
        chapterTitle: 'كتاب فضائل القرآن - باب خيركم من تعلم القرآن وعلمه',
        volume: 6,
        page: 192,
        textExcerpt: 'عن عثمان بن عفان رضي الله عنه عن النبي ﷺ قال: «خيركم من تعلم القرآن وعلمه».',
        rulingOrBenefit: 'تأسيس حلقات التحفيظ ومضاعفة النقاط التشجيعية للمتعلمين والمعلمين.',
      },
    ],
    ebookFile: {
      fileName: 'Sahih_Al_Bukhari_Sultaniyya.pdf',
      fileSize: '62.1 MB',
      fileFormat: 'pdf',
      downloadUrl: 'https://archive.org/download/Sahih-Bukhari-Arabic/Sahih-Bukhari.pdf',
      uploadedAt: '2026-09-01',
      uploadedBy: 'هيئة التدقيق العلمي لمنهاج',
    },
    addedAt: '2026-09-01T00:00:00Z',
    isOfficialCurated: true,
  },
  {
    id: 'ref-zad-al-maad',
    title: 'زاد المعاد في هدي خير العباد',
    author: 'شمس الدين محمد بن أبي بكر (ابن قيم الجوزية) (ت 751 هـ)',
    investigatorOrEditor: 'شعيب الأرنؤوط وعبد القادر الأرنؤوط',
    category: 'fiqh_marriage',
    categoryLabelAr: 'فقه الأسرة والنكاح',
    categoryLabelEn: 'Family & Marriage Fiqh',
    publisher: 'مؤسسة الرسالة - بيروت',
    edition: 'الطبعة السابعة والعشرون، 1418 هـ / 1998 م',
    publicationYearHijri: '1418 هـ',
    publicationYearGregorian: '1998 م',
    volumesCount: 5,
    totalPages: 2950,
    isbnOrId: 'ISBN: 978-9953-417-38-4',
    verificationStatus: 'verified_authentic',
    verificationBadgeAr: 'مرجع هدي النبوة في النكاح',
    verificationBadgeEn: 'Authoritative Prophetic Guidance',
    appUsageScope: 'يستند عليه التطبيق في بيان هدي النبي ﷺ في اختيار الزوجين، النظر الشرعي بضوابطه، وحرمة الخلوة والاختلاط.',
    appUsageScopeEn: 'Guides the platform in Prophetic marriage practices, modesty limits, looking at prospective spouse, and prohibiting seclusion.',
    summary: 'موسوعة إسلامية فريدة تجمع بين السيرة النبوية وفقه الأحكام وهدي النبي ﷺ في عباداته ومعاملاته وزواجه وعشرة أهله.',
    summaryEn: 'Comprehensive masterwork combining Prophetic biography and juristic rulings regarding marriage, transactions, and personal conduct.',
    citationFormat: 'ابن قيم الجوزية، محمد بن أبي بكر. زاد المعاد في هدي خير العباد. تحقيق شعيب الأرنؤوط. ط27. بيروت: مؤسسة الرسالة، 1418هـ.',
    sampleChaptersOrExcerpt: [
      {
        chapterTitle: 'فصل في هديه ﷺ في النكاح وتخير الأكفاء وتيسير الصداق',
        volume: 5,
        page: 98,
        textExcerpt: 'كان من هديه ﷺ الحث على نكاح ذات الدين، وتيسير الصداق، والمباركة في أيسرهن مؤونة، وحرم أن تُخطب المرأة على خطبة أخيها حتى ينكح أو يترك.',
        rulingOrBenefit: 'حظر المزاحمة والتنافس على الخطوبة، وضبط عدم إفشاء بيانات المخطوبة إلا لمتقدم واحد معتمد عبر الولي.',
      },
    ],
    ebookFile: {
      fileName: 'Zad_Al_Maad_Ibn_Qayyim.pdf',
      fileSize: '39.8 MB',
      fileFormat: 'pdf',
      downloadUrl: 'https://archive.org/download/Zad-Al-Maad/Zad-Al-Maad.pdf',
      uploadedAt: '2026-09-02',
      uploadedBy: 'هيئة التدقيق العلمي لمنهاج',
    },
    addedAt: '2026-09-02T00:00:00Z',
    isOfficialCurated: true,
  },
  {
    id: 'ref-al-mughni',
    title: 'المغني في فقه الشريعة الإسلامية',
    author: 'موفق الدين عبد الله بن أحمد بن قدامة المقدسي (ت 620 هـ)',
    investigatorOrEditor: 'د. عبد الله بن عبد المحسن التركي ود. عبد الفتاح محمد الحلو',
    category: 'fiqh_marriage',
    categoryLabelAr: 'الفقه المقارن والمعاملات',
    categoryLabelEn: 'Comparative Fiqh & Contracts',
    publisher: 'دار هجر للطباعة والنشر والتوزيع - القاهرة',
    edition: 'الطبعة الثالثة، 1417 هـ / 1997 م',
    publicationYearHijri: '1417 هـ',
    publicationYearGregorian: '1997 م',
    volumesCount: 15,
    totalPages: 8400,
    isbnOrId: 'ISBN: 978-977-256-118-4',
    verificationStatus: 'verified_authentic',
    verificationBadgeAr: 'موسوعة الفقه المقارن الكبرى',
    verificationBadgeEn: 'Major Jurisprudential Encyclopedia',
    appUsageScope: 'تأصيل مشروعية نظام العربون (Escrow)، استئذان الأيامى والبكارى، وحماية حقوق الأولياء في التزويج.',
    appUsageScopeEn: 'Validating down-payments/escrow under Islamic jurisprudence, guardian rights, and contract integrity.',
    summary: 'أعظم كتاب في الفقه المقارن، يستعرض أدلة المذاهب الأربعة وأقوال الصحابة مع الترجيح الرصين المبني على الكتاب والسنة.',
    summaryEn: 'One of the greatest comparative jurisprudence encyclopedias detailing all major schools with rigorous evidentiary analysis.',
    citationFormat: 'ابن قدامة، عبد الله بن أحمد. المغني. تحقيق عبد الله التركي وعبد الفتاح الحلو. ط3. القاهرة: دار هجر، 1417هـ.',
    sampleChaptersOrExcerpt: [
      {
        chapterTitle: 'كتاب النكاح - مسألة ولاية التزويج وترتيب الأولياء وشروطهم',
        volume: 9,
        page: 355,
        textExcerpt: 'لا يصح النكاح إلا بولي مرشد؛ فإن زوجت المرأة نفسها فنكاحها باطل، وأحق الناس بتزويج الحرة أبوها ثم وصيه ثم جدها ثم ابنها ثم بنوه ثم الأخ لأبوين.',
        rulingOrBenefit: 'الاعتماد الفقهي لطلب بيانات الولي الشرعي أولاً قبل فتح أي قناة تواصل مع أي أخت.',
      },
      {
        chapterTitle: 'كتاب البيوع - بيع العربون وجواز أخذه وحفظه أمانة',
        volume: 6,
        page: 331,
        textExcerpt: 'مسألة بيع العربون جائز، وروي عن عمر بن الخطاب رضي الله عنه أنه أجازه واشترى نافع بن عبد الحارث داراً للسجن لعمر من صفوان بن أمية فإن رضي عمر وإلا فله كذا وكذا.',
        rulingOrBenefit: 'التأصيل الفقهي لحجز عربون التوافق والجدية (10%) وحفظه في حساب الأمانات (Escrow).',
      },
    ],
    ebookFile: {
      fileName: 'Al_Mughni_Ibn_Qudama.pdf',
      fileSize: '88.4 MB',
      fileFormat: 'pdf',
      downloadUrl: 'https://archive.org/download/Al-Mughni-Ibn-Qudamah/Al-Mughni.pdf',
      uploadedAt: '2026-09-02',
      uploadedBy: 'هيئة التدقيق العلمي لمنهاج',
    },
    addedAt: '2026-09-02T00:00:00Z',
    isOfficialCurated: true,
  },
  {
    id: 'ref-jazariyyah-tajweed',
    title: 'المقدمة الجزرية في علم التجويد وشروحها المعتمدة',
    author: 'شمس الدين محمد بن محمد بن علي بن يوسف الجزري (ت 833 هـ)',
    investigatorOrEditor: 'د. أيمن رشدي سويد',
    category: 'quran_tajweed',
    categoryLabelAr: 'علوم التلاوة والتجويد',
    categoryLabelEn: 'Tajweed & Quranic Recitation Rules',
    publisher: 'دار ابن الجزري - دمشق',
    edition: 'الطبعة المعتمدة بالروايات المتواترة، 1427 هـ',
    publicationYearHijri: '1427 هـ',
    publicationYearGregorian: '2006 م',
    volumesCount: 1,
    totalPages: 248,
    isbnOrId: 'ISBN: 978-9933-401-05-9',
    verificationStatus: 'verified_authentic',
    verificationBadgeAr: 'متن التجويد المعتمد عالمياً',
    verificationBadgeEn: 'Canonical Tajweed Text',
    appUsageScope: 'المعيار الصوتي والبرمجي الذي يعتمد عليه نظام الذكاء الاصطناعي وتقييم المشايخ في فحص مخارج الحروف وأحكام النون الساكنة والمدود.',
    appUsageScopeEn: 'Phonetic and AI standard applied for vocal recitation scoring, letter exit points, and tajweed evaluation.',
    summary: 'المنظومة اللامية الأشهر التي تلخص أحكام تجويد القرآن ومخارج الحروف وصفاتها وأحكام الوقف والابتداء ورسم المصحف.',
    summaryEn: 'The definitive classical poem and curriculum encompassing letter articulation, phonetic rules, and recitation mastery.',
    citationFormat: 'ابن الجزري، محمد بن محمد. المقدمة الجزرية. تحقيق أيمن رشدي سويد. ط1. دمشق: دار ابن الجزري، 1427هـ.',
    sampleChaptersOrExcerpt: [
      {
        chapterTitle: 'باب مخارج الحروف وصفاتها والمدود اللازمة',
        page: 24,
        textExcerpt: 'مَخَارِجُ الحُرُوفِ سَبْعَةَ عَشَرْ ... عَلَى الَّذِي يَخْتَارُهُ مَنِ اخْتَبَرْ ... فَلِلْهَوَاءِ أَلِفٌ وَأُخْتَاهَا ... وَهْيَ حُرُوفُ مَدٍّ لِلْهَوَاءِ تَنْتَهِي.',
        rulingOrBenefit: 'خوارزمية الفحص الصوتي في منصة منهاج لتنبيه القارئ عند عدم وفاء حق حرف المد أو انحراف المخرج.',
      },
    ],
    ebookFile: {
      fileName: 'Al_Muqaddimah_Al_Jazariyyah.pdf',
      fileSize: '12.2 MB',
      fileFormat: 'pdf',
      downloadUrl: 'https://archive.org/download/Jazariyyah-Audio/Jazariyyah.pdf',
      uploadedAt: '2026-09-03',
      uploadedBy: 'هيئة التدقيق العلمي لمنهاج',
    },
    addedAt: '2026-09-03T00:00:00Z',
    isOfficialCurated: true,
  },
];

export const AVAILABLE_POINT_PERKS: PointPerk[] = [
  {
    id: 'perk-wali-request',
    title: 'طلب التواصل مع الولي الشرعي مجاناً',
    description: 'فتح وتفعيل التواصل المباشر مع ولي أمر المخطوبة دون دفع أي عربون مالي نقدي.',
    category: 'marriage',
    pointsCost: 300,
    iconName: 'ShieldCheck',
    badge: 'إعفاء من العربون',
  },
  {
    id: 'perk-tier-gold',
    title: 'ترقية الحساب للباقة الذهبية الموثقة',
    description: 'الحصول على شارة التميز الذهبية، وأولوية الظهور في التوفيق الشرعي لمدة 30 يوماً.',
    category: 'privilege',
    pointsCost: 800,
    iconName: 'Crown',
    badge: 'ترقية VIP',
  },
  {
    id: 'perk-private-recitation',
    title: 'جلسة تسميع فردية مع شيخ معتمد',
    description: 'حجز موعد تسميع مباشر ومستقل في غرفة مخصصة مع شيخ أو شيخة مجازين بالقراءات العشر.',
    category: 'quran',
    pointsCost: 250,
    iconName: 'Mic',
    badge: 'تسميع فردي',
  },
  {
    id: 'perk-hifz-certificate',
    title: 'إصدار شهادة إتمام حفظ رقمية موثقة',
    description: 'إصدار شهادة تقديرية إلكترونية معتمدة من إدارة منهاج برقم تسلسلي ورمز QR للتحقق.',
    category: 'certificate',
    pointsCost: 200,
    iconName: 'Award',
    badge: 'شهادة معتمدة',
  },
  {
    id: 'perk-competition-entry',
    title: 'تذكرة مشاركة في المسابقات الكبرى',
    description: 'المشاركة الفورية في المسابقات القرآنية الدورية والموسمية ذات الجوائز التكريمية.',
    category: 'quran',
    pointsCost: 150,
    iconName: 'Trophy',
    badge: 'تذكرة مسابقة',
  },
  {
    id: 'perk-tajweed-ai',
    title: 'تقرير التجويد الذكي بالذكاء الاصطناعي',
    description: 'فحص شامل لمخارج الحروف، أحكام النون والميم والمدود لتلاوتك المسجلة عبر الذكاء الاصطناعي.',
    category: 'quran',
    pointsCost: 50,
    iconName: 'Sparkles',
    badge: 'ذكاء اصطناعي',
  },
];

export interface HalqaTask {
  id: string;
  roomId: string;
  title: string;
  description?: string;
  type: 'hifz' | 'murajaah' | 'tafseer' | 'tajweed' | 'action';
  typeLabel?: string;
  deadline?: string;
  assignedTo: string;
  isCompleted: boolean;
  pointsReward: number;
  completedByUsers?: string[];
  createdAt: string;
}

export interface MeetingAnalysis {
  id: string;
  roomId: string;
  generatedAt: string;
  executiveSummary: string;
  keyThemes: string[];
  scholarlyTakeaways: string[];
  actionItems: HalqaTask[];
  studyRecommendations: string;
  recommendedRevisionPlan?: string;
}

export interface HalqaSchedule {
  id: string;
  title: string;
  surahId: number;
  surahName: string;
  ayahStart: number;
  ayahEnd: number;
  category: 'hifz' | 'tadabbur' | 'tajweed' | 'fatwa_qa';
  categoryLabel: string;
  daysOfWeek: number[];
  daysLabel: string;
  time: string;
  durationMinutes: number;
  sheikhName: string;
  meetingMode: 'audio_video' | 'audio_only';
  reminderMinutesBefore: number;
  isReminderActive: boolean;
  roomId?: string;
}

export interface TadabburNoteItem {
  id: string;
  authorId: string;
  authorName: string;
  authorGender: 'male' | 'female';
  surahId: number;
  surahName: string;
  ayahNumber: string;
  benefitText: string;
  categoryTag: 'tazkiyah' | 'iman' | 'action' | 'linguistic' | 'fiqh';
  categoryTagLabel: string;
  likesCount: number;
  likedBy: string[];
  createdAt: string;
  timestamp: string;
}

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
  hasVideo?: boolean;
  meetingMode?: 'audio_video' | 'audio_only';
  scheduledTime?: string;
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
  tadabburNotes?: TadabburNoteItem[];
  tasks?: HalqaTask[];
  meetingAnalysis?: MeetingAnalysis;
  invitedPhones?: string[];
  createdAt: string;
}


