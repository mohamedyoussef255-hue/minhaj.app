import express, { Request, Response, NextFunction } from 'express';
import { GoogleGenAI } from '@google/genai';
import {
  ALL_SURAHS,
  RECITERS_LIST,
  getEveryAyahAudioUrl,
  getFullSurahAudioUrl,
} from '../data/quranSurahs.ts';

export * from '../types.ts';
import {
  User,
  MarriagePackage,
  MarriageProfile,
  HifzPlan,
  Wallet,
  WithdrawalRequest,
  SecurityViolation,
  PaymentMethodsConfig,
  RevenueAndRewardFund,
  CompetitionParticipant,
  Competition,
  SelfPacedMilestoneClaim,
  PointPerk,
  AVAILABLE_POINT_PERKS,
  IslamicReference,
  INITIAL_ISLAMIC_REFERENCES,
} from '../types.ts';

// In-Memory Database Store initialized to mirror PostgreSQL schema
const db = {
  adminSettings: {
    adminEmail: 'mohamedyoussef255@gmail.com',
    secretPassword: 'mohamed2072',
    silverTokens: 100,
    goldTokens: 300,
    platinumTokens: 1000,
    marriagePackages: [
      {
        id: 'pkg-silver',
        tier: 'silver',
        name: 'الباقة الفضية العادية (Silver)',
        price: 150,
        currency: 'ج.م / ر.س',
        durationDays: 7,
        badge: 'فضية',
        isHighestTier: false,
        pinOnTop: false,
        visibilityMultiplier: 1,
        features: [
          'إدراج الاستمارة ضمن القوائم العادية للباحثين',
          'محادثة شرعية واحدة مراقبة عبر جدار الحماية',
          'شارة توثيق الهوية الوطنية الأساسية',
          'رصيد 100 نقطة بالمحفظة',
        ],
        description: 'الباقة المبدئية للراغبين في الاستكشاف والتعارف الشرعي الأولي.',
      },
      {
        id: 'pkg-gold',
        tier: 'gold',
        name: 'الباقة الذهبية المتقدمة (Gold)',
        price: 350,
        currency: 'ج.م / ر.س',
        durationDays: 14,
        badge: 'ذهبية ⭐',
        isHighestTier: false,
        pinOnTop: false,
        visibilityMultiplier: 3,
        features: [
          'تمييز الاستمارة بإطار ذهبي أنيق وتوهج بصري',
          'أولوية الظهور في نتائج البحث المتقدم 3x',
          '3 محادثات شرعية مراقبة معتمدة مع ولي الأمر',
          'رصيد 300 نقطة بالمحفظة',
        ],
        description: 'باقة متميزة تضاعف فرص التوافق وتمنح الاستمارة مظهراً جذاباً.',
      },
      {
        id: 'pkg-platinum',
        tier: 'platinum',
        name: 'الباقة البلاتينية الممتازة (Platinum)',
        price: 650,
        currency: 'ج.م / ر.س',
        durationDays: 21,
        badge: 'بلاتينية 💎',
        isHighestTier: false,
        pinOnTop: false,
        visibilityMultiplier: 5,
        features: [
          'شارة التوثيق البلاتيني الفاخر المعتمد',
          'أولوية التوافق في خوارزميات الذكاء الاصطناعي 5x',
          '5 محادثات شرعية معتمدة موثقة برقم الولي',
          'استشارة شرعية أولية لمطابقة المعايير الأسرية',
          'رصيد 1000 نقطة بالمحفظة',
        ],
        description: 'باقة رفيعة المستوى توفر توافقاً متقدماً وفحصاً دقيقاً للمعايير.',
      },
      {
        id: 'pkg-royal-monthly',
        tier: 'royal_monthly',
        name: 'باقة العفة الملكية (النخبة الماسية - ثبات شهر كامل)',
        price: 1200,
        currency: 'ج.م / ر.س',
        durationDays: 30,
        badge: 'ملكية 👑',
        isHighestTier: true,
        pinOnTop: true,
        visibilityMultiplier: 10,
        features: [
          'ثبات وتثبيت الاستمارة في أعلى قمة الصدارة (Pinned on Top) لمدة شهر كامل (30 يوماً)',
          'شارة التوثيق الملكي الذهبي الفاخر مع إطار مشع فخم (Royal VIP)',
          'أعلى نسبة أولوية وظهور في خوارزميات التوافق الذكي AI بنسبة 10x',
          'فتح قنوات التواصل المباشر السريع مع ولي الأمر الشرعي فور التوافق دون انتظار',
          'جلسة استشارة أسرية وشرعية خاصة مجانية مع مشايخ ومستشاري المنصة المعتمدين',
          'إشراف إداري وتنسيق شخصي متواصل على مدار الساعة',
          'رصيد 2500 نقطة وتوكنز مالي في المحفظة',
        ],
        description: 'الباقة الأقوى والأعلى سعراً: تجمع كافة المزايا الحصرية مع ثبات دائم للإعلان في صدارة المنصة طوال شهر كامل.',
      },
    ] as MarriagePackage[],
    paymentMethods: {
      instapay: {
        enabled: true,
        ipa: 'minhaj@instapay',
        phone: '01011112222',
        accountName: 'منصة منهاج القرآنية / إدارة الاشتراكات الرسمية',
      },
      vodafoneCash: {
        enabled: true,
        phone: '01011112222',
        accountName: 'محفظة منهاج الرسمية (فودافون كاش / أورنج / اتصالات)',
      },
      bankAccount: {
        enabled: true,
        bankName: 'البنك الأهلي المصري (NBE) / مصرف الراجحي',
        accountNumber: '12345678901234',
        iban: 'EG120003000000012345678901234',
        swiftCode: 'NBEGEGCX',
        accountHolder: 'مؤسسة منهاج القرآنية والتقنية',
        branchName: 'فرع المعاملات الدولية - القاهرة / الرياض',
        country: 'مصر والسعودية (International Remittance)',
        acceptedCurrencies: ['USD', 'EUR', 'SAR', 'AED', 'GBP', 'EGP', 'KWD'],
        intermediaryBank: 'Citibank N.A. New York (CITIUS33) / Arab National Bank',
        instructionsForInternational: 'للتحويل من خارج مصر والسعودية، يرجى استخدام رقم الآيبان الموحد وكود السويفت (SWIFT / BIC). في حقل البيان/الغرض (Payment Reference) اكتب: [اسم المشترك - كود الاستمارة]. يُرجى رفع أو إرسال إشعار السويفت (MT103) فور الإرسال عبر واتساب لاعتماده فوراً.',
      },
      stcPay: {
        enabled: true,
        phone: '+966501112233',
        accountName: 'Minhaj Official Platform',
      },
      paymentInstructions: 'يرجى تحويل المبلغ عبر انستاباي أو المحفظة الإلكترونية ثم رفع صورة التحويل أو كتابة رقم العملية المرجعي للمراجعة والاعتماد الفوري.',
      whatsappConfirmationPhone: '+201011112222',
    } as PaymentMethodsConfig,
    revenueFund: {
      totalPlatformRevenue: 68500,
      rewardAllocationPercentage: 20,
      totalAllocatedForRewards: 13700,
      totalDistributedToWinners: 4200,
      availablePrizePool: 9500,
      incentiveRates: {
        pointsPerAyah: 2,
        cashPerAyah: 0.25,
        pointsPerSurah: 50,
        cashPerSurah: 15.00,
        pointsPerJuz: 500,
        cashPerJuz: 150.00,
        pointsPerKhatmah: 25000,
        cashPerKhatmah: 5000.00,
      },
    } as RevenueAndRewardFund,
  },
  competitions: [
    {
      id: 'comp-weekly-kahf',
      title: 'مسابقة سورة الكهف الأسبوعية (أحكام التجويد والتدبر)',
      frequency: 'weekly',
      targetAudience: 'all',
      occasionName: 'يوم الجمعة المبارك',
      scopeDescription: 'حفظ وضبط سورة الكهف كاملة (110 آيات) مع مدارسة أسباب النزول وأحكام المد والقلقلة',
      surahTarget: 18,
      startDate: new Date(Date.now() - 86400000 * 2).toISOString(),
      endDate: new Date(Date.now() + 86400000 * 5).toISOString(),
      prizePool: 2000,
      rewardPoints: 5000,
      prizesBreakdown: {
        firstPlace: 1000,
        secondPlace: 600,
        thirdPlace: 400,
        consolationPrizes: 500,
      },
      rules: [
        'تسجيل تلاوة مقطع محدد بصوت المتسابق ورفعه أو التسميع المباشر في غرف الحلقات',
        'مراعاة أحكام التجويد الأساسية ومخارج الحروف الصحيحة',
        'المسابقة مفتوحة لجميع رواد منصة منهاج من الرجال والنساء بمراعاة الضوابط الشرعية',
        'تُصرف الجوائز النقدية مباشرة من مخصص بند الإيرادات إلى المحافظ الرقمية للفائزين',
      ],
      status: 'active',
      participantsCount: 48,
      participants: [
        {
          id: 'part-1',
          userId: 'usr-male-1',
          userName: 'عبد الرحمن الشافعي',
          gender: 'male',
          registeredAt: new Date(Date.now() - 86400000).toISOString(),
          status: 'submitted',
          score: 96,
          submissionNotes: 'تلاوة سورة الكهف برواية حفص عن عاصم من طريق الشاطبية',
        },
        {
          id: 'part-2',
          userId: 'usr-female-1',
          userName: 'خديجة الأنصاري',
          gender: 'female',
          registeredAt: new Date(Date.now() - 86400000 * 1.5).toISOString(),
          status: 'submitted',
          score: 98,
          submissionNotes: 'تلاوة الآيات من 1 إلى 31 مع بيان غريب الألفاظ',
        },
      ],
      winners: [
        {
          place: 1,
          userId: 'usr-female-1',
          userName: 'خديجة الأنصاري',
          gender: 'female',
          score: 98,
          prizeCash: 1000,
          prizePoints: 2500,
          awardedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'comp-daily-surah',
      title: 'المسابقة اليومية في قصار السور (جزء عم)',
      frequency: 'daily',
      targetAudience: 'all',
      occasionName: 'تحدي التدبر اليومي المستمر',
      scopeDescription: 'حفظ وتسميع سورتي النبأ والنازعات مع الإتقان والترتيل العذب',
      surahTarget: 78,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 86400000).toISOString(),
      prizePool: 500,
      rewardPoints: 1500,
      prizesBreakdown: {
        firstPlace: 250,
        secondPlace: 150,
        thirdPlace: 100,
        consolationPrizes: 150,
      },
      rules: [
        'تسميع السورة بدون تردد أو لحن جلي',
        'فحص وتقييم التلاوة من قبل المقرئين المعتمدين بالمنصة',
        'إضافة النقاط والمبالغ النقدية فورياً لمحفظة الفائز',
      ],
      status: 'active',
      participantsCount: 84,
      participants: [],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'comp-monthly-ramadan',
      title: 'مسابقة تاج الكرامة الشهرية الكبرى (حفظ 5 أجزاء من كتاب الله)',
      frequency: 'monthly',
      targetAudience: 'all',
      occasionName: 'موسم الطاعات وشهر القرآن',
      scopeDescription: 'اختبار شامل في الأجزاء من 1 إلى 5 مع أسئلة في متشابهات الآيات وتفسير السعدي الميسر',
      startDate: new Date(Date.now() - 86400000 * 5).toISOString(),
      endDate: new Date(Date.now() + 86400000 * 20).toISOString(),
      prizePool: 6000,
      rewardPoints: 15000,
      prizesBreakdown: {
        firstPlace: 3000,
        secondPlace: 2000,
        thirdPlace: 1000,
        consolationPrizes: 1000,
      },
      rules: [
        'اختبار شفوي مباشر في غرف التحفيظ المغلقة تحت إشراف لجنة من حفظة القرآن المعتمدين',
        'شهادة إلكترونية رسمية معتمدة من منصة منهاج',
        'الجائزة المالية مقتطعة من بند إيرادات منصة منهاج لدعم أهل القرآن',
      ],
      status: 'active',
      participantsCount: 160,
      participants: [],
      createdAt: new Date().toISOString(),
    },
  ] as Competition[],
  selfPacedClaims: [] as SelfPacedMilestoneClaim[],
  users: [
    {
      id: 'usr-male-1',
      phoneNumber: '+201011112222',
      fullName: 'عبد الرحمن الشافعي',
      gender: 'male',
      age: 28,
      currentTier: 'silver',
      tokensBalance: 120,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'usr-female-1',
      phoneNumber: '+201099998888',
      fullName: 'خديجة الأنصاري',
      gender: 'female',
      age: 24,
      currentTier: 'gold',
      tokensBalance: 350,
      createdAt: new Date().toISOString(),
    },
  ] as User[],
  wallets: [
    {
      id: 'wal-male-1',
      userId: 'usr-male-1',
      availablePoints: 450,
      earnedCash: 225.0,
      referralCode: 'MINHAJ-M-789',
      successfulReferralsCount: 9,
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'wal-female-1',
      userId: 'usr-female-1',
      availablePoints: 600,
      earnedCash: 300.0,
      referralCode: 'MINHAJ-F-456',
      successfulReferralsCount: 12,
      updatedAt: new Date().toISOString(),
    },
  ] as Wallet[],
  withdrawalRequests: [
    {
      id: 'wd-1',
      userId: 'usr-male-1',
      userName: 'عبد الرحمن الشافعي',
      method: 'Vodafone Cash (فودافون كاش)',
      payoutAddress: '01011112222',
      amount: 150.0,
      status: 'pending_approval',
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      notes: 'تحويل أرباح إحالة 3 استمارات مكتملة',
    },
    {
      id: 'wd-2',
      userId: 'usr-female-1',
      userName: 'خديجة الأنصاري',
      method: 'InstaPay (انستاباي)',
      payoutAddress: 'khadija@instapay',
      amount: 200.0,
      status: 'approved',
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      notes: 'تم الدفع بنجاح عبر البنك المركزي',
    },
  ] as WithdrawalRequest[],
  hifzPlans: [
    {
      id: 'hifz-1',
      userId: 'usr-male-1',
      surahNumber: 2,
      surahName: 'سورة البقرة',
      verseStart: 1,
      verseEnd: 25,
      targetDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      isCompleted: true,
      audioRecordingUrl: 'demo-recitation-baqarah.mp3',
      tajweedNotes: 'مراعاة زمن الغنة في الميم والنون المشددتين والمد المتصل',
      repetitionCount: 15,
    },
    {
      id: 'hifz-2',
      userId: 'usr-male-1',
      surahNumber: 2,
      surahName: 'سورة البقرة',
      verseStart: 26,
      verseEnd: 50,
      targetDate: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
      isCompleted: false,
      tajweedNotes: 'التركيز على تفخيم حروف الاستعلاء وترقيق اللامات',
      repetitionCount: 8,
    },
    {
      id: 'hifz-3',
      userId: 'usr-male-1',
      surahNumber: 24,
      surahName: 'سورة النور',
      verseStart: 30,
      verseEnd: 35,
      targetDate: new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0],
      isCompleted: false,
      tajweedNotes: 'آيات الحجاب وغض البصر - ترتيل خاشع بأحكام النون الساكنة',
      repetitionCount: 4,
    },
  ] as HifzPlan[],
  marriageProfiles: [
    // Female profiles (Visible to Men)
    {
      id: 'prof-f-1',
      userId: 'usr-f-1',
      code: 'MINHAJ-W-774',
      fullNameMasked: 'خ. أ. الأنصاري',
      gender: 'female',
      maritalStatus: 'single',
      age: 24,
      city: 'القاهرة',
      country: 'مصر',
      job: 'مهندسة برمجيات',
      qualifications: 'بكالوريوس هندسة حاسبات ومعلومات - تقدير جيد جداً',
      hifzPortion: 'حافظة لـ 15 جزءاً من القرآن الكريم مع إجازة برواية حفص',
      religiousCommitment: 'ملتزمة بالحجاب الشرعي السابغ (الخمار)، محافظة على السنن والنوافل، وتطلب زوجاً صاحب صلاة جماعة وعلم شرعي',
      specifications: {
        height: 165,
        hijabStyle: 'خمار سابغ شرعي فضفاض',
        housing: 'تشترط سكناً مستقلاً شرعياً في القاهرة أو الجيزة',
        smoking: false,
        hobbies: ['حلقات التجويد', 'القراءة الفقهية', 'البرمجة والتطوع'],
        bio: 'طالبة علم مبتدئة، محبة للهدوء والبيت المسلم السعيد القائم على المودة والرحمة وامتثال هدي النبوة.',
      },
      partnerRequirements: {
        ageRange: [26, 33],
        preferredStatus: ['single', 'divorced'],
        religiosity: 'صاحب صلاة جماعة بالمسجد، غير مدخن تماماً، يعف نفسه ويهتم بالحلال والحرام',
        education: 'مؤهل عالٍ مناسب',
        notes: 'الجدية والتواصل عبر ولي الأمر الشرعي فور التوافق.',
      },
      nationalIdVerified: true,
      waliPhoneMasked: '+2010****5432 (والدها)',
      isActive: true,
      packageTier: 'royal_monthly',
      isPinned: true,
      pinnedDaysRemaining: 30,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'prof-f-2',
      userId: 'usr-f-2',
      code: 'MINHAJ-W-892',
      fullNameMasked: 'س. م. القرشي',
      gender: 'female',
      maritalStatus: 'widowed',
      age: 29,
      city: 'الإسكندرية',
      country: 'مصر',
      job: 'معلمة لغة عربية وقرآن',
      qualifications: 'ليسانس دار العلوم، معهد إعداد الدعاة',
      hifzPortion: 'خاتمة لكتاب الله بالقراءات العشر الصغرى',
      religiousCommitment: 'منتقبة التزاماً كاملاً، داعية معتمدة ومحفظة لكتاب الله، لا تسمع المعازف',
      packageTier: 'gold',
      isPinned: false,
      specifications: {
        height: 160,
        hijabStyle: 'نقاب كامل ساتر',
        housing: 'سكن مستقل يراعي كرامة الأسرة',
        smoking: false,
        hobbies: ['شروح الحديث', 'تحفيظ الأطفال', 'الخط العربي'],
        bio: 'أرملة ولدي طفلة 3 سنوات هادئة، أبتغي زوجاً صالحاً يكون كافلاً ومربياً على منهاج النبوة.',
      },
      partnerRequirements: {
        ageRange: [30, 42],
        preferredStatus: ['single', 'widowed', 'divorced', 'polygamy'],
        religiosity: 'تقي نقي، يخشى الله في أهله، حريص على سنة رسول الله ﷺ ويقبل بالطفلة في كنفه',
        education: 'مؤهل عالٍ أو صاحب عمل حلال مبارك',
        notes: 'لا مانع من التعدد المُنضبط بالعدل الشرعي والقدرة المالية والنفسية.',
      },
      nationalIdVerified: true,
      waliPhoneMasked: '+2012****9012 (عمها ووليها)',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'prof-f-3',
      userId: 'usr-f-3',
      code: 'MINHAJ-W-915',
      fullNameMasked: 'م. ي. الزهراني',
      gender: 'female',
      maritalStatus: 'divorced',
      age: 26,
      city: 'الرياض',
      country: 'السعودية',
      job: 'صيدلانية سريرية',
      qualifications: 'دكتور صيدلة (PharmD)',
      hifzPortion: 'حافظة لـ 10 أجزاء وتواصل الحفظ اليومي في منصة منهاج',
      religiousCommitment: 'ملتزمة بالحجاب الكامل والعباءة الفضفاضة، ذات خلق وأدب رفيع',
      specifications: {
        height: 162,
        hijabStyle: 'عباءة رأس فضفاضة / نقاب ساتر',
        housing: 'شقة مستقلة مؤثثة بالرياض',
        smoking: false,
        hobbies: ['الأبحاث الطبية', 'الطبخ الصحي', 'تفسير الآيات'],
        bio: 'انفصال سريع قبل الدخول لعدم التكافؤ، وأسأل الله العوض الصالح صاحب الدين والشهامة.',
      },
      partnerRequirements: {
        ageRange: [27, 36],
        preferredStatus: ['single', 'divorced'],
        religiosity: 'مصلٍّ قائم بحدود الله، حسن المعاشرة، بارّ بوالديه',
        education: 'مؤهل جامعي فما فوق',
        notes: 'التواصل بعد موافقة الولي فقط.',
      },
      nationalIdVerified: true,
      waliPhoneMasked: '+9665****7761 (شقيقها الأكبر)',
      isActive: true,
      createdAt: new Date().toISOString(),
    },

    // Male profiles (Visible to Women)
    {
      id: 'prof-m-1',
      userId: 'usr-m-1',
      code: 'MINHAJ-M-312',
      fullNameMasked: 'ع. ر. الشافعي',
      gender: 'male',
      maritalStatus: 'single',
      age: 28,
      city: 'القاهرة',
      country: 'مصر',
      job: 'طبيب بشري (أخصائي باطنة)',
      qualifications: 'ماجستير في الطب الباطني - جامعة القاهرة، طالب علم شرعي',
      hifzPortion: 'حافظ للقرآن الكريم كاملاً مع إجازة بروايتي حفص وشعبة',
      religiousCommitment: 'ملتحٍ على السنة، ملازم لصلاة الفجر والجماعة، بعيد عن الشبهات والرياء',
      specifications: {
        height: 178,
        bearded: true,
        housing: 'سكن ملك مستقل جاهز بالكامل في التجمع الخامس',
        smoking: false,
        hobbies: ['طلب العلم', 'الفروسية', 'الرماية والمطالعة'],
        bio: 'أسعى لتأسيس بيت إسلامي على الكتاب والسنة، ترعرع فيه ذرية صالحة تحفظ كتاب الله.',
      },
      partnerRequirements: {
        ageRange: [20, 27],
        preferredStatus: ['single'],
        religiosity: 'ذات دين وخلق، ذات خمار سابغ أو منتقبة، تعين على الطاعة وحفظ الأوقات',
        education: 'مؤهل عالٍ ولا مانع من عمل غير مختلط إن رغبت',
        notes: 'مستعد لتحمل كافة تكاليف الزواج الشرعي كاملاً دون إثقال كاهل أهل العروس.',
      },
      nationalIdVerified: true,
      waliPhoneMasked: '+2010****2222 (الشخصي للتنسيق الشرعي)',
      isActive: true,
      packageTier: 'royal_monthly',
      isPinned: true,
      pinnedDaysRemaining: 30,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'prof-m-2',
      userId: 'usr-m-2',
      code: 'MINHAJ-M-488',
      fullNameMasked: 'م. أ. التميمي',
      gender: 'male',
      maritalStatus: 'polygamy',
      age: 38,
      city: 'جدة',
      country: 'السعودية',
      job: 'رجل أعمال ومدير استثمارات',
      qualifications: 'ماجستير إدارة أعمال، وبكالوريوس شريعة إسلامية',
      hifzPortion: 'حافظ لـ 20 جزءاً وداعم لحلقات التحفيظ الخيرية',
      religiousCommitment: 'محافظ على السمت الإسلامي والصدقات والعدل التام والإنفاق بالمعروف',
      packageTier: 'platinum',
      isPinned: false,
      specifications: {
        height: 181,
        bearded: true,
        housing: 'فيلا مستقلة مؤثثة بالكامل للزوجة الثانية مع سائق وخادمة',
        smoking: false,
        hobbies: ['السفر الهادف', 'الأوقاف الخيرية', 'القراءة التاريخية'],
        bio: 'راغب في التعدد الشرعي لزيادة النسل وتكثير الأمة، وملتزم بالعدل التام في النفقة والمبيت والمودة.',
      },
      partnerRequirements: {
        ageRange: [22, 32],
        preferredStatus: ['single', 'widowed', 'divorced'],
        religiosity: 'صالحة قانتة، حريصة على ستر نفسها، تتفهم الحكمة الشرعية من التعدد',
        education: 'مؤهل مناسب، والأولوية لحافظات القرآن الكريم',
        notes: 'إمكانية إتمام العقد بإشراف المحكمة الشرعية ورعاية الولي.',
      },
      nationalIdVerified: true,
      waliPhoneMasked: '+9665****4433 (مباشر للإدارة الشرعية)',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'prof-m-3',
      userId: 'usr-m-3',
      code: 'MINHAJ-M-520',
      fullNameMasked: 'ح. ن. المغربي',
      gender: 'male',
      maritalStatus: 'divorced',
      age: 32,
      city: 'المنصورة',
      country: 'مصر',
      job: 'أستاذ حاسبات ونظم معلومات',
      qualifications: 'دكتوراه في الذكاء الاصطناعي وهندسة البيانات',
      hifzPortion: 'حافظ لـ 12 جزءاً ومهتم بالتدبر القرآني والإعجاز العلمي',
      religiousCommitment: 'ملتزم بالفرائض، هادئ الطباع، لا يدخن، يعامل باللطف والموعظة الحسنة',
      specifications: {
        height: 175,
        bearded: true,
        housing: 'شقة واسعة تمليك في حي هادئ',
        smoking: false,
        hobbies: ['التكنولوجيا الإنسانية', 'حفظ المتون', 'الرياضة الخفيفة'],
        bio: 'مطلق بدون أطفال، أبحث عن شريكة حياة تشاركني الاهتمام بالقرآن والوعي الفكري والتربوي.',
      },
      partnerRequirements: {
        ageRange: [23, 30],
        preferredStatus: ['single', 'divorced'],
        religiosity: 'محجبة حجاباً شرعياً حسناً، حريصة على الصلاة وبر الأهل والعشرة الطيبة',
        education: 'مؤهل جامعي',
        notes: 'المقابلة الشرعية بحضور والدها أو محرمها حفظاً للحرمات.',
      },
      nationalIdVerified: true,
      waliPhoneMasked: '+2011****8811',
      isActive: true,
      createdAt: new Date().toISOString(),
    },
  ] as MarriageProfile[],
  violations: [
    {
      id: 'viol-1',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      senderGender: 'male',
      message: 'ممكن رقم الوالد فون أو نتواصل واتس أسهل بدل التطبيق؟',
      detectedKeywords: ['فون', 'واتس', 'رقم'],
      reason: 'محاولة التحايل على جدار حظر أرقام الهواتف والتواصل الخارجي غير المراقب شرعياً',
    },
    {
      id: 'viol-2',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      senderGender: 'female',
      message: 'أنا أفضل ندفع المبلغ كاش لما نتقابل بره التطبيق',
      detectedKeywords: ['كاش', 'برا التطبيق', 'نتقابل'],
      reason: 'محاولة تفادي نظام العربون الذكي (Escrow) والتواصل المباشر قبل تصريح الإدارة',
    },
  ] as SecurityViolation[],
};

// Gemini Client Lazy Initializer
let geminiClient: GoogleGenAI | null = null;
function getGemini(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return geminiClient;
}

// 🛡️ Middleware: Enforce Strict Gender Isolation
export const enforceGenderIsolation = (req: Request, res: Response, next: NextFunction): void => {
  const userGender = (req.headers['user-gender'] || req.headers['x-user-gender'] || req.query.gender || req.body.userGender) as string;
  if (!userGender || (userGender !== 'male' && userGender !== 'female')) {
    res.status(401).json({
      error: 'غير مصرح: يجب تحديد الهوية والنوع الاجتماعي (رجل أو امرأة) لحماية العفة وتطبيق جدار الفصل الشرعي.',
      code: 'GENDER_HEADER_REQUIRED',
    });
    return;
  }
  req.body.contextGender = userGender;
  next();
};

// 🛡️ Middleware: Chat Security & Sharia Firewall
export const chatFirewall = (req: Request, res: Response, next: NextFunction): void => {
  const { message, senderGender } = req.body;
  if (!message || typeof message !== 'string' || message.trim().length === 0) {
    res.status(400).json({ error: 'الرسالة فارغة.' });
    return;
  }

  const phoneRegex = /(?:\+?(\d{1,3}))?([-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4}))|(?:\b01[0125]\d{8}\b)|(?:\b05\d{8}\b)/g;
  const forbiddenKeywords = [
    'كاش', 'برا التطبيق', 'خارج التطبيق', 'رقمي', 'فون', 'واتس', 'نتقابل',
    'تواصل مباشر', 'تليجرام', 'انستا', 'انستجرام', 'فيس', 'فيسبوك', 'snap', 'سناب',
    'mobile', 'whatsapp', 'call me', 'تلفون', 'موبايل'
  ];

  const hasPhone = phoneRegex.test(message);
  const matchedKeywords = forbiddenKeywords.filter((word) => message.toLowerCase().includes(word));

  if (hasPhone || matchedKeywords.length > 0) {
    // Record violation in admin security log
    const violation: SecurityViolation = {
      id: 'viol-' + Date.now(),
      timestamp: new Date().toISOString(),
      senderGender: senderGender || 'unknown',
      message: message.slice(0, 120),
      detectedKeywords: matchedKeywords.length > 0 ? matchedKeywords : ['صيغة رقم هاتف'],
      reason: 'حظر تلقائي لحماية العفة ومنع الالتفاف المالي أو الشخصي خارج رقابة الولي والإدارة الشرعية',
    };
    db.violations.unshift(violation);

    res.status(403).json({
      error: '🚫 حظر أمني وشرعي مشدد: يمنع تداول أرقام الهواتف أو استخدام كلمات التفافية أو الدعوة للتواصل خارج المنصة دون إذن الولي ودفع العربون الذكي (Escrow).',
      details: {
        matchedViolations: matchedKeywords,
        phoneDetected: hasPhone,
      },
    });
    return;
  }

  next();
};

// Create the Router
export const apiRouter = express.Router();

// 0. Authentication Routes (بوابات تسجيل الدخول للرجال والنساء)
apiRouter.get('/auth/demo-users', (_req: Request, res: Response) => {
  const maleUsers = db.users.filter(u => u.gender === 'male');
  const femaleUsers = db.users.filter(u => u.gender === 'female');
  res.json({
    success: true,
    males: maleUsers.map(u => ({
      ...u,
      roleDescription: 'رجل (راغب في الزواج الشرعي وتحفيظ القرآن)',
    })),
    females: femaleUsers.map(u => ({
      ...u,
      roleDescription: 'امرأة (راغبة في الزواج الشرعي وتحفيظ القرآن / ولية أمر)',
    })),
  });
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { phoneOrId, gender, password } = req.body;
  
  // Find matching user
  let user = db.users.find(u => 
    (u.phoneNumber === phoneOrId || u.id === phoneOrId || u.fullName.includes(phoneOrId || '')) &&
    (!gender || u.gender === gender)
  );

  // If no exact match, fallback to the default demo user of requested gender
  if (!user && gender) {
    user = db.users.find(u => u.gender === gender);
  }

  if (!user) {
    user = db.users[0];
  }

  const userWallet = db.wallets.find(w => w.userId === user?.id) || db.wallets[0];

  res.json({
    success: true,
    message: `مرحباً بك يا ${user.fullName} في منصة منهاج. جرى التحقق من الحساب وتفعيل جدار العفة الشرعي.`,
    user,
    wallet: userWallet,
    roleTitle: user.gender === 'male' ? 'رجل (راغب في الزواج الشرعي)' : 'امرأة (راغبة في الزواج الشرعي)',
  });
});

apiRouter.post('/auth/register', (req: Request, res: Response) => {
  const {
    fullName,
    phoneNumber,
    gender,
    age,
    maritalStatus = 'single',
    city = 'القاهرة',
    job = 'باحث عن عمل نافع',
    hifzPortion = 'أجزاء متعددة',
    waliPhone = '',
    bio = '',
  } = req.body;

  if (!fullName || !phoneNumber || !gender) {
    res.status(400).json({ error: 'الاسم ورقم الهاتف وتحديد الصفة (رجل أو امرأة) حقول إجبارية.' });
    return;
  }

  const newUserId = 'usr-' + (gender === 'male' ? 'm-' : 'f-') + Date.now();
  const newUser: User = {
    id: newUserId,
    phoneNumber,
    fullName,
    gender: gender === 'female' ? 'female' : 'male',
    age: Number(age) || 25,
    currentTier: 'silver',
    tokensBalance: 150,
    createdAt: new Date().toISOString(),
  };

  db.users.push(newUser);

  // Create Wallet with Welcome Bonus
  const newWallet: Wallet = {
    id: 'wal-' + Date.now(),
    userId: newUserId,
    availablePoints: 200,
    earnedCash: 50.0,
    referralCode: `MINHAJ-${gender === 'female' ? 'F' : 'M'}-${Math.floor(100 + Math.random() * 900)}`,
    successfulReferralsCount: 0,
    updatedAt: new Date().toISOString(),
  };
  db.wallets.push(newWallet);

  // If registering for marriage matching, create profile
  const profileCode = `MINHAJ-${gender === 'female' ? 'W' : 'M'}-${Math.floor(100 + Math.random() * 900)}`;
  const newProfile: MarriageProfile = {
    id: 'prof-' + Date.now(),
    userId: newUserId,
    code: profileCode,
    fullNameMasked: fullName.split(' ')[0] + ' ' + (fullName.split(' ')[1] ? fullName.split(' ')[1][0] + '.' : '') + ' (جديد)',
    gender: gender === 'female' ? 'female' : 'male',
    maritalStatus: maritalStatus as any,
    age: Number(age) || 25,
    city,
    country: 'مصر',
    job,
    qualifications: 'مؤهل جامعي معتمد',
    hifzPortion,
    religiousCommitment: 'محافظ على الفرائض والسنن والضوابط الشرعية',
    specifications: {
      housing: 'سكن شرعي متوفر أو متفق عليه',
      smoking: false,
      hobbies: ['حلقات القرآن', 'القراءة النافعة'],
      bio: bio || 'أسعى لتأسيس بيت إسلامي مبارك يقوم على المودة والرحمة وتقوى الله.',
    },
    partnerRequirements: {
      ageRange: [20, 35],
      preferredStatus: ['single'],
      religiosity: 'ذو دين وخلق، صاحب أمانة وحرص على كتاب الله',
      education: 'مؤهل عالٍ مناسب',
      notes: 'الجدية والالتزام بموافقة الولي الشرعي.',
    },
    nationalIdVerified: true,
    waliPhoneMasked: waliPhone ? waliPhone.slice(0, 4) + '****' + waliPhone.slice(-4) : '+2010****0000',
    isActive: true,
    createdAt: new Date().toISOString(),
  };

  db.marriageProfiles.unshift(newProfile);

  res.json({
    success: true,
    message: `تم إنشاء حسابك بنجاح في منصة منهاج! مرحباً بك كـ ${gender === 'male' ? 'رجل (راغب في الزواج الشرعي)' : 'امرأة (راغبة في الزواج الشرعي)'}.`,
    user: newUser,
    wallet: newWallet,
    profile: newProfile,
  });
});

apiRouter.get('/auth/me', (req: Request, res: Response) => {
  const gender = (req.headers['user-gender'] || req.query.gender || 'male') as string;
  const userId = req.headers['x-user-id'] as string;
  
  let user = db.users.find(u => u.id === userId);
  if (!user) {
    user = db.users.find(u => u.gender === gender) || db.users[0];
  }
  const userWallet = db.wallets.find(w => w.userId === user?.id) || db.wallets[0];

  res.json({
    success: true,
    user,
    wallet: userWallet,
    roleTitle: user?.gender === 'male' ? 'رجل (راغب في الزواج الشرعي)' : 'امرأة (راغبة في الزواج الشرعي)',
  });
});

// 1. Quran & Verse Details, Full Surahs & Reciters
const surahsCache: Record<number, any> = {};

apiRouter.get('/quran/surahs', (_req: Request, res: Response) => {
  res.json({
    success: true,
    totalSurahs: ALL_SURAHS.length,
    surahs: ALL_SURAHS,
    reciters: RECITERS_LIST,
  });
});

apiRouter.get('/quran/surah/:id', async (req: Request, res: Response) => {
  const surahId = parseInt(req.params.id, 10);
  if (isNaN(surahId) || surahId < 1 || surahId > 114) {
    res.status(400).json({ error: 'رقم السورة غير صالح. يجب أن يكون بين 1 و 114.' });
    return;
  }

  const surahMeta = ALL_SURAHS.find(s => s.id === surahId) || ALL_SURAHS[0];

  // Return from in-memory cache if present
  if (surahsCache[surahId]) {
    res.json({
      success: true,
      surah: surahMeta,
      ayahs: surahsCache[surahId],
      fromCache: true,
    });
    return;
  }

  try {
    const cloudRes = await fetch(`https://api.alquran.cloud/v1/surah/${surahId}`);
    if (cloudRes.ok) {
      const data = await cloudRes.json();
      if (data?.data?.ayahs) {
        const ayahs = data.data.ayahs.map((a: any) => ({
          number: a.number,
          numberInSurah: a.numberInSurah,
          text: a.text,
          juz: a.juz,
          page: a.page,
        }));
        surahsCache[surahId] = ayahs;
        res.json({
          success: true,
          surah: surahMeta,
          ayahs,
        });
        return;
      }
    }
  } catch (err) {
    console.warn('AlQuran Cloud fetch error, using local fallback:', err);
  }

  // Graceful fallback for offline / instant render if external fetch fails
  const fallbackAyahs = Array.from({ length: surahMeta.ayasCount }, (_, i) => ({
    number: i + 1,
    numberInSurah: i + 1,
    text: i === 0 && surahId !== 9 ? 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ' : `آية كريمة رقم (${i + 1}) من ${surahMeta.name}`,
    juz: surahMeta.juz,
    page: surahMeta.page,
  }));

  res.json({
    success: true,
    surah: surahMeta,
    ayahs: fallbackAyahs,
    note: 'عرض محلي سريع',
  });
});

// In-memory cache for Ayah Tafsir and detailed verses
const tafsirCache: Record<string, any> = {};

apiRouter.get('/quran/verse-details', async (req: Request, res: Response) => {
  const surah = Number(req.query.surah) || 1;
  const ayah = Number(req.query.ayah) || 1;
  const preferredReciterId = (req.query.reciter as string) || 'husary_murattal';

  const surahMeta = ALL_SURAHS.find(s => s.id === surah) || {
    id: surah,
    name: surah === 1 ? 'الفاتحة' : `سورة رقم ${surah}`,
    englishName: 'Surah',
    ayasCount: 7,
    type: 'مكية' as const,
    juz: 1,
    page: 1,
  };

  const key = `${surah}-${ayah}`;

  // 1. Get Uthmani text for this specific ayah
  let ayahText = '';
  let ayahPage = surahMeta.page;
  let ayahJuz = surahMeta.juz;

  // Check if surah is in cache
  if (surahsCache[surah]) {
    const foundAyah = surahsCache[surah].find((a: any) => a.numberInSurah === ayah);
    if (foundAyah) {
      ayahText = foundAyah.text;
      ayahPage = foundAyah.page || ayahPage;
      ayahJuz = foundAyah.juz || ayahJuz;
    }
  }

  // If not cached, fetch the surah or single ayah to obtain the real text
  if (!ayahText) {
    try {
      const cloudAyahRes = await fetch(`https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/quran-uthmani`);
      if (cloudAyahRes.ok) {
        const cloudData = await cloudAyahRes.json();
        if (cloudData?.data?.text) {
          ayahText = cloudData.data.text;
          ayahPage = cloudData.data.page || ayahPage;
          ayahJuz = cloudData.data.juz || ayahJuz;
        }
      }
    } catch (e) {
      console.warn(`Could not fetch Uthmani text for ${key}:`, e);
    }
  }

  // 2. Fetch or retrieve Tafsir Al-Muyassar (مجمع الملك فهد لطباعة المصحف الشريف)
  let tafsirText = '';
  if (tafsirCache[key]) {
    tafsirText = tafsirCache[key].tafsir;
    if (!ayahText && tafsirCache[key].text) {
      ayahText = tafsirCache[key].text;
    }
  } else {
    try {
      const tafsirRes = await fetch(`https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/ar.muyassar`);
      if (tafsirRes.ok) {
        const tafsirData = await tafsirRes.json();
        if (tafsirData?.data?.text) {
          tafsirText = tafsirData.data.text;
          ayahPage = tafsirData.data.page || ayahPage;
          ayahJuz = tafsirData.data.juz || ayahJuz;
          tafsirCache[key] = {
            tafsir: tafsirText,
            page: ayahPage,
            juz: ayahJuz,
          };
        }
      }
    } catch (e) {
      console.warn(`Could not fetch Tafsir for ${key}:`, e);
    }
  }

  // Curated database for renowned verses with specific Asbab an-Nuzul & Tajweed
  const curatedVersesDatabase: Record<string, any> = {
    '1-1': {
      asbab_nuzul: 'فاتحة الكتاب، وهي السبع المثاني والقرآن العظيم الذي أوتيه النبي ﷺ، افتُتح بها كتاب الله عز وجل تبركاً واستعانة باسمه الأكرم.',
      hadith_linked: "عن أبي هريرة رضي الله عنه قال: قال رسول الله ﷺ: 'قال الله تعالى: قسمت الصلاة بيني وبين عبدي نصفين ولعبدي ما سأل' (صحيح مسلم).",
      tajweed_tips: 'ترقيق لام الجلالة في (بِسْمِ اللَّهِ) لكسر ما قبلها، وتحقيق همزة الوصل والبدء بكسر الميم، وإظهار صفة الرخاوة في السين.',
    },
    '2-255': {
      asbab_nuzul: 'آية الكرسي هي أعظم آية في كتاب الله تعالى، بيّن النبي ﷺ فضلها وأنها سيدة آي القرآن وتحفظ قارئها من الشياطين حتى يصبح.',
      hadith_linked: "عن أبي بن كعب رضي الله عنه أن النبي ﷺ سأله: 'أي آية في كتاب الله أعظم؟' قال: 'الله لا إله إلا هو الحي القيوم'، فضرب في صدره وقال: 'ليهنك العلم أبا المنذر' (رواه مسلم).",
      tajweed_tips: 'مد منفصل جائز في (إِلَّا بِإِذْنِهِ)، إظهار حلقي في (مِنْ عِلْمِهِ)، وإدغام بغنة في (سِنَةٌ وَلَا نَوْمٌ).',
    },
    '24-30': {
      asbab_nuzul: 'نزلت الآية الكريمة لتشريع وقاية المجتمع الإسلامي وحفظ الأعراض وطهارة القلوب قبل تشريع أحكام الزواج والاستئذان.',
      hadith_linked: "عن جرير بن عبد الله رضي الله عنه قال: 'سألت رسول الله ﷺ عن نظر الفجاءة فأمرني أن أصرف بصري' (رواه مسلم).",
      tajweed_tips: 'إخفاء حقيقي عند (مِنْ أَبْصَارِهِمْ)، وقلقلة صغرى في الباء (أَبْصَارِهِمْ)، وغنة النون المشددة في (إِنَّ).',
    },
    '30-21': {
      asbab_nuzul: 'دلالة من الله عز وجل على كمال قدرته ورحمته بالخلق أن جعل الزواج والسكينة آية كونية للتدبر وحفظ النسل الصالح.',
      hadith_linked: "عن عبد الله بن مسعود رضي الله عنه قال: قال لنا رسول الله ﷺ: 'يا معشر الشباب من استطاع منكم الباءة فليتزوج فإنه أغض للبصر وأحصن للفرج' (متفق عليه).",
      tajweed_tips: 'مد بدل في (آيَاتِهِ)، وإدغام بغنة في (مَّوَدَّةً وَرَحْمَةً)، ومد عارض للسكون في (يَتَفَكَّرُونَ).',
    },
    '17-9': {
      asbab_nuzul: 'نزلت بياناً لأن هذا القرآن العظيم يرشد إلى أعدل الطرق وأهدى المناهج في العقيدة والمعاملات والأسرة والأخلاق.',
      hadith_linked: "عن النبي ﷺ قال: 'خيركم من تعلم القرآن وعلمه' (رواه البخاري).",
      tajweed_tips: 'غنة مشددة في (إِنَّ)، ومد طبيعي في (الْقُرْآنَ)، وتفخيم الراء الساكنة المفتوح ما قبلها.',
    },
    '112-1': {
      asbab_nuzul: 'روي أن المشركين قالوا لرسول الله ﷺ: انسب لنا ربك! فأنزل الله تبارك وتعالى سورة الإخلاص: ﴿قُلْ هُوَ اللَّهُ أَحَدٌ﴾.',
      hadith_linked: "عن أبي سعيد الخدري رضي الله عنه أن رجلاً سمع رجلاً يقرأ (قل هو الله أحد) يرددها، فقال النبي ﷺ: 'والذي نفسي بيده إنها لتعدل ثلث القرآن' (رواه البخاري).",
      tajweed_tips: 'تفخيم لام اسم الجلالة في (اللَّهُ) لضم ما قبلها، وقلقلة كبرى عند الوقف على الدال في (أَحَدٌ).',
    },
    '18-1': {
      asbab_nuzul: 'نزلت سورة الكهف بعدما سألت قريش اليهود عن مسائل يمتحنون بها النبي ﷺ، فسألوه عن فتية ذهبوا في الدهر وعن رجل طواف وعن الروح.',
      hadith_linked: "عن أبي الدرداء رضي الله عنه أن النبي ﷺ قال: 'من حفظ عشر آيات من أول سورة الكهف عُصم من فتنة الدجال' (رواه مسلم).",
      tajweed_tips: 'إظهار حلقي في (أَنْزَلَ - إخفاء حقيقي عند النون والزاي)، وقلقلة في الباء عند الوقف على (الْعَبْد).',
    },
  };

  const curated = curatedVersesDatabase[key];

  // Detailed authentic Asbab an-Nuzul and context
  const asbab_nuzul = curated?.asbab_nuzul || 
    (tafsirText 
      ? `[التفسير والبيان]: ${tafsirText}`
      : `آية كريمة رقم (${ayah}) من سورة ${surahMeta.name} (${surahMeta.type}). تتناول الآية المباركة مقاصد العقيدة والاستقامة والتزام منهج الله تعالى في تزكية النفس وإقامة العدل.`);

  const hadith_linked = curated?.hadith_linked || 
    `عن عثمان بن عفان رضي الله عنه عن النبي ﷺ قال: 'خيركم من تعلم القرآن وعلمه' (رواه البخاري). وتلاوة سورة ${surahMeta.name} فيها عظيم الأجر والمثوبة.`;

  const tajweed_tips = curated?.tajweed_tips || 
    `مراعاة أحكام التلاوة في سورة ${surahMeta.name}: إتمام الحركات، تحقيق مخارج الحروف، العناية بالمدود الطبيعية والفرعية، وإظهار الغنة في النون والميم المشددتين، والوقف التام عند رؤوس الآيات.`;

  // Fallback text if both cache & remote failed
  const finalText = ayahText || (surah === 1 && ayah === 1 ? 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ' : `آية كريمة (${ayah}) من سورة ${surahMeta.name}`);

  // Provide every reciter's audio link for this specific Ayah
  const recitersAudio = RECITERS_LIST.map(r => ({
    id: r.id,
    name: r.name,
    subName: r.subName,
    audioUrl: getEveryAyahAudioUrl(r.everyAyahFolder, surah, ayah),
    fullSurahAudioUrl: getFullSurahAudioUrl(r.fullSurahServerUrl, surah),
  }));

  const activeReciter = recitersAudio.find(r => r.id === preferredReciterId) || recitersAudio[0];

  res.json({
    success: true,
    surah,
    ayah,
    surahName: surahMeta.name,
    surahMeta,
    page: ayahPage,
    juz: ayahJuz,
    text: finalText,
    tafsir_muyassar: tafsirText || asbab_nuzul,
    asbab_nuzul,
    hadith_linked,
    tajweed_tips,
    audioUrl: activeReciter.audioUrl,
    activeReciter,
    reciters: recitersAudio,
  });
});

// Repetition session completion logger
apiRouter.post('/hifz/repetition-session', (req: Request, res: Response) => {
  const { userId, surahNumber, ayahNumber, repetitionCount } = req.body;

  const count = Number(repetitionCount) || 5;
  const user = db.users.find(u => u.id === userId) || db.users[0];
  const wallet = db.wallets.find(w => w.userId === user?.id) || db.wallets[0];

  // Award bonus tokens for Quran memorization repetitions (+10 points)
  const bonusPoints = count >= 10 ? 15 : count >= 5 ? 10 : 5;
  wallet.availablePoints += bonusPoints;

  const surahMeta = ALL_SURAHS.find(s => s.id === Number(surahNumber)) || ALL_SURAHS[0];

  res.json({
    success: true,
    message: `بارك الله فيك ونفع بك! أتممت تكرار الآية (${ayahNumber}) من ${surahMeta.name} بعدد ${count} مرات لتثبيت الحفظ. تم إضافة ${bonusPoints} نقطة في محفظتك.`,
    bonusPoints,
    availablePoints: wallet.availablePoints,
  });
});

// =========================================================================
// HALAQAT & ISLAMIC ROOMS SYSTEM (غرف وحلقات التحفيظ، التدبر، التلاوة، الأسئلة الشرعية)
// =========================================================================
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
  daysOfWeek: number[]; // 0 for Sun ... 5 for Fri, 6 for Sat
  daysLabel: string;
  time: string; // e.g. "18:30"
  durationMinutes: number;
  sheikhName: string;
  meetingMode: 'audio_video' | 'audio_only';
  reminderMinutesBefore: number;
  isReminderActive: boolean;
  roomId?: string;
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

const initialHalaqatRooms: HalqaRoom[] = [
  {
    id: 'room-1',
    title: 'حلقة مدارسة وتدبر سورة الكهف وفقه الفتن',
    description: 'مجلس تدبر أسبوعي في دلالات سورة الكهف الأربع (فتنة الدين، المال، العلم، السلطان) مع بيان هدايات الآيات.',
    category: 'tadabbur',
    categoryLabel: 'حلقة تدبر وتفسير',
    sheikhHost: {
      id: 'sh-1',
      name: 'د. أحمد المنصوري',
      title: 'أستاذ التفسير وعلوم القرآن',
      isVerified: true,
      gender: 'male',
    },
    targetAudience: 'all',
    surahId: 18,
    surahName: 'الكهف',
    ayahStart: 1,
    ayahEnd: 20,
    isLive: true,
    participantsCount: 48,
    maxParticipants: 100,
    activeSpeaker: {
      name: 'د. أحمد المنصوري',
      role: 'الشيخ المحاضر',
      isSpeaking: true,
    },
    queue: [
      { id: 'q-1', userId: 'u-101', userName: 'طارق عبد الله', type: 'recite', joinedAt: '12:45' },
      { id: 'q-2', userId: 'u-102', userName: 'أنس المحمود', type: 'question', questionText: 'ما الحكمة من ذكر قصة موسى والخضر في سورة الكهف؟', joinedAt: '12:48' },
    ],
    questions: [
      {
        id: 'qa-1',
        askerId: 'u-102',
        askerName: 'أنس المحمود',
        question: 'ما الحكمة من ذكر قصة موسى والخضر عليهما السلام في سورة الكهف؟',
        status: 'answered',
        answer: 'علاج فتنة العلم، وبيان أن علم العبد قاصر، وأن حكمة الله فوق كل إدراك بشري.',
        answeredBy: 'د. أحمد المنصوري',
        timestamp: '12:50',
      },
      {
        id: 'qa-2',
        askerId: 'u-105',
        askerName: 'عمر القحطاني',
        question: 'هل يشرع قراءة الكهف كاملة في جلسة واحدة أم يجوز تجزئتها يوم الجمعة؟',
        status: 'pending',
        timestamp: '12:52',
      },
    ],
    chatMessages: [
      { id: 'm-1', senderId: 'sh-1', senderName: 'د. أحمد المنصوري', role: 'sheikh', message: 'السلام عليكم ورحمة الله، مرحباً بكم في مجلس تدبر سورة الكهف.', timestamp: '12:30' },
      { id: 'm-2', senderId: 'u-101', senderName: 'طارق عبد الله', role: 'student', message: 'وعليكم السلام ورحمة الله وبركاته، جزاكم الله خيراً يا شيخنا.', timestamp: '12:32' },
    ],
    tadabburNotes: [
      {
        id: 'note-1',
        authorId: 'u-101',
        authorName: 'طارق عبد الله',
        authorGender: 'male',
        surahId: 18,
        surahName: 'الكهف',
        ayahNumber: '1',
        benefitText: '﴿ولم يجعل له عوجا * قيما﴾: نفي العوج يقتضي السلامة من الخلل، وإثبات الاستقامة يقتضي الكمال، فالقرآن لا عوج فيه بوجه من الوجوه، وهو مهيمن ومصلح لشؤون الخلق دنيا وآخرة.',
        categoryTag: 'language',
        categoryTagLabel: 'لطيفة بيانية',
        likesCount: 14,
        likedBy: ['u-102', 'u-103'],
        createdAt: '2026-09-14T12:25:00.000Z',
        timestamp: '12:25',
      },
      {
        id: 'note-2',
        authorId: 'sh-1',
        authorName: 'د. أحمد المنصوري',
        authorGender: 'male',
        surahId: 18,
        surahName: 'الكهف',
        ayahNumber: '10',
        benefitText: '﴿فقالوا ربنا آتنا من لدنك رحمة وهيئ لنا من أمرنا رشدا﴾: جمع فتية الكهف بين الفرار بالدين واللجوء بالدعاء، فالعبد مأمور ببذل الأسباب المشروعة مع تفويض أمر الهداية والرشاد والتثبيت إلى الله سبحانه.',
        categoryTag: 'iman',
        categoryTagLabel: 'هداية إيمانية',
        likesCount: 28,
        likedBy: ['u-101', 'u-102', 'u-104'],
        createdAt: '2026-09-14T12:35:00.000Z',
        timestamp: '12:35',
      },
      {
        id: 'note-3',
        authorId: 'u-105',
        authorName: 'عمر القحطاني',
        authorGender: 'male',
        surahId: 18,
        surahName: 'الكهف',
        ayahNumber: '28',
        benefitText: '﴿واصبر نفسك مع الذين يدعون ربهم بالغداة والعشي يريدون وجهه﴾: أعظم عون على الثبات والاستقامة في زمن الفتن هو لزوم مجالس الذكر والصحبة الصالحة والتواصي بالحق والصبر.',
        categoryTag: 'action',
        categoryTagLabel: 'عمل وتطبيق',
        likesCount: 9,
        likedBy: ['u-101'],
        createdAt: '2026-09-14T12:40:00.000Z',
        timestamp: '12:40',
      },
    ],
    hasVideo: true,
    meetingMode: 'audio_video',
    scheduledTime: 'الجمعة 08:00 صباحاً',
    tasks: [
      {
        id: 'task-101',
        roomId: 'room-1',
        title: 'حفظ وتثبيت الآيات (1-10) من سورة الكهف برواية حفص مع ضبط التجويد',
        description: 'استظهار الآيات غيباً مع مراعاة أحكام النون الساكنة والمدود العارضة للسكون.',
        type: 'hifz',
        typeLabel: 'حفظ جديد وتثبيت',
        deadline: 'قبل موعد المجلس القادم',
        assignedTo: 'جميع الطلاب والمشاركين',
        isCompleted: false,
        pointsReward: 30,
        completedByUsers: [],
        createdAt: '2026-09-14T12:45:00.000Z',
      },
      {
        id: 'task-102',
        roomId: 'room-1',
        title: 'مراجعة تفسير ابن كثير لقصة الفتية واستخراج 3 لطائف إيمانية وتربوية',
        description: 'تدوين الفوائد في قسم ملاحظات التدبر للحلقة للحصول على نقاط بركة إضافية.',
        type: 'tafseer',
        typeLabel: 'بحث وتفسير',
        deadline: 'خلال 48 ساعة',
        assignedTo: 'جميع الحاضرين',
        isCompleted: true,
        pointsReward: 25,
        completedByUsers: ['u-101'],
        createdAt: '2026-09-14T12:46:00.000Z',
      },
      {
        id: 'task-103',
        roomId: 'room-1',
        title: 'العمل بالآيات: إحياء سنة قراءة سورة الكهف والدعاء بظهر الغيب للإخوان',
        description: 'تطبيق عملي لتوجيهات الآية 28 في مصاحبة الصالحين وإخلاص الوجهة لله.',
        type: 'action',
        typeLabel: 'تطبيق عملي وسلوك',
        deadline: 'يوم الجمعة',
        assignedTo: 'عام للجميع',
        isCompleted: false,
        pointsReward: 15,
        completedByUsers: [],
        createdAt: '2026-09-14T12:47:00.000Z',
      },
    ],
    meetingAnalysis: {
      id: 'analysis-1',
      roomId: 'room-1',
      generatedAt: '2026-09-14T12:55:00.000Z',
      executiveSummary: 'انعقد مجلس مدارسة وتدبر سورة الكهف المبارك بحضور 48 طالباً ومستمعاً، حيث افتتح فضيلة د. أحمد المنصوري اللقاء ببيان مقاصد السورة العظمى وعصمتها للمسلم من الفتن الأربع. وتلا الطالب طارق عبد الله الآيات العشر الأولى تلاوة متقنة، تلا ذلك استنباط اللطائف الإيمانية وفقه الدعاء في قوله تعالى ﴿ربنا آتنا من لدنك رحمة وهيئ لنا من أمرنا رشدا﴾.',
      keyThemes: [
        'عصمة التمسك بالقرآن من فتنة الدجال وفتن الشبهات والشهوات',
        'فقه الجمع بين الفرار بالدين وبذل الأسباب والدعاء الصادق',
        'أثر الصحبة الصالحة ولزوم مجالس الذكر في تثبيت القلوب',
      ],
      scholarlyTakeaways: [
        'افتتاح السورة بالحمد لتعليم العباد أن أعظم النعم المطلقة هي إنزال هذا الكتاب القيم الذي لا عوج فيه.',
        'دعاء الفتية بالرحمة والرشد يجمع بين صلاح الدنيا والآخرة وسلامة العاقبة.',
        'الاعتزال في الكهف كان وسيلة اضطرارية لحفظ التوحيد، يقابله في عصرنا لزوم البيئات الإيمانية الآمنة.',
      ],
      actionItems: [
        {
          id: 'task-101',
          roomId: 'room-1',
          title: 'حفظ وتثبيت الآيات (1-10) من سورة الكهف برواية حفص مع ضبط التجويد',
          type: 'hifz',
          typeLabel: 'حفظ وتثبيت',
          deadline: 'قبل المجلس القادم',
          assignedTo: 'الطلاب',
          isCompleted: false,
          pointsReward: 30,
          createdAt: '2026-09-14T12:45:00.000Z',
        },
        {
          id: 'task-102',
          roomId: 'room-1',
          title: 'مراجعة تفسير ابن كثير لقصة الفتية واستخراج 3 لطائف إيمانية وتربوية',
          type: 'tafseer',
          typeLabel: 'تفسير وتدبر',
          deadline: 'خلال 48 ساعة',
          assignedTo: 'الجميع',
          isCompleted: true,
          pointsReward: 25,
          createdAt: '2026-09-14T12:46:00.000Z',
        },
      ],
      studyRecommendations: 'تطبيق منهج التكرار التراكمي: سماع الآيات من الشيخ الحصري 3 مرات مع النظر في المصحف، ثم التكرار الفردي غيباً 10 مرات، ومراجعة المحفوظ في صلوات النوافل وقيام الليل.',
      recommendedRevisionPlan: 'جدول الورد: السبت والأحد (تثبيت 1-5)، الإثنين والثلاثاء (تثبيت 6-10)، الأربعاء (ربط العشر آيات كاملة)، الخميس (تسميع ومراجعة ختامية).',
    },
    createdAt: '2026-09-14T12:00:00.000Z',
  },
  {
    id: 'room-2',
    title: 'حلقة تثبيت وتسميع جزء عمّ برواية حفص عن عاصم',
    description: 'تسميع يومي مباشر ومراجعة لمنظومة المفصل مع تصحيح الحفظ وأحكام الغنن والمدود وإجازة الإتقان.',
    category: 'hifz',
    categoryLabel: 'حلقة تحفيظ وتسميع',
    sheikhHost: {
      id: 'sh-2',
      name: 'الشيخ عبد الرحمن السالم',
      title: 'مقرئ بالقراءات العشر ومجاز في متون التجويد',
      isVerified: true,
      gender: 'male',
    },
    targetAudience: 'all',
    surahId: 78,
    surahName: 'النبأ',
    ayahStart: 1,
    ayahEnd: 40,
    isLive: true,
    participantsCount: 35,
    maxParticipants: 60,
    activeSpeaker: {
      name: 'عبد العزيز الحربي',
      role: 'طالب قارئ (يسمّع الآن)',
      isSpeaking: true,
    },
    queue: [
      { id: 'q-3', userId: 'u-201', userName: 'عبد العزيز الحربي', type: 'recite', joinedAt: '12:35' },
      { id: 'q-4', userId: 'u-202', userName: 'بلال العمري', type: 'recite', joinedAt: '12:40' },
      { id: 'q-5', userId: 'u-203', userName: 'مصطفى رضوان', type: 'recite', joinedAt: '12:44' },
    ],
    questions: [
      {
        id: 'qa-3',
        askerId: 'u-202',
        askerName: 'بلال العمري',
        question: 'كيف أضبط مقدار المد المتصل والمنفصل في ترتيل الحدر؟',
        status: 'answered',
        answer: 'في رواية حفص من طريق الشاطبية: المتصل والمنفصل ٤ أو ٥ حركات وجوباً واستحباباً.',
        answeredBy: 'الشيخ عبد الرحمن السالم',
        timestamp: '12:42',
      },
    ],
    chatMessages: [
      { id: 'm-3', senderId: 'sh-2', senderName: 'الشيخ عبد الرحمن السالم', role: 'sheikh', message: 'الأخ عبد العزيز يسمّع الآن سورة النبأ، يرجى الاستماع والإنصات.', timestamp: '12:36' },
    ],
    tadabburNotes: [
      {
        id: 'note-4',
        authorId: 'u-201',
        authorName: 'عبد العزيز الحربي',
        authorGender: 'male',
        surahId: 78,
        surahName: 'النبأ',
        ayahNumber: '6-7',
        benefitText: '﴿ألم نجعل الأرض مهادا * والجبال أوتادا﴾: تذكير بنعم التمكين والاستقرار، فالجبال تثبت الأرض كالأوتاد للخيمة؛ فكيف بمن نصبها ودحاها ألا يُرجى ويُخاف ويُفرد بالعبادة وحده؟!',
        categoryTag: 'iman',
        categoryTagLabel: 'هداية إيمانية',
        likesCount: 11,
        likedBy: ['u-202'],
        createdAt: '2026-09-14T12:38:00.000Z',
        timestamp: '12:38',
      },
    ],
    createdAt: '2026-09-14T12:10:00.000Z',
  },
  {
    id: 'room-3',
    title: 'مجلس تصحيح التلاوة ومخارج الحروف وضبط الوقف والابتداء',
    description: 'تصحيح مباشر للحروف المستعلية والصفير والقلقلة للمبتدئين والمتقدمين على حد سواء.',
    category: 'tajweed',
    categoryLabel: 'مجلس تلاوة وتجويد',
    sheikhHost: {
      id: 'sh-3',
      name: 'الشيخ محمود الشنقيطي',
      title: 'إمام ومقرئ معتمد',
      isVerified: true,
      gender: 'male',
    },
    targetAudience: 'men_only',
    surahId: 1,
    surahName: 'الفاتحة',
    ayahStart: 1,
    ayahEnd: 7,
    isLive: true,
    participantsCount: 29,
    maxParticipants: 50,
    activeSpeaker: {
      name: 'الشيخ محمود الشنقيطي',
      role: 'المقرئ الموجه',
      isSpeaking: true,
    },
    queue: [
      { id: 'q-6', userId: 'u-301', userName: 'سفيان المدني', type: 'recite', joinedAt: '12:50' },
    ],
    questions: [],
    chatMessages: [],
    createdAt: '2026-09-14T12:15:00.000Z',
  },
  {
    id: 'room-4',
    title: 'مجلس الأسئلة الشرعية والفتاوى في فقه العبادات والمعاملات',
    description: 'طرح الأسئلة الشرعية والفقهية وتلقي الإجابات المؤصلة من الكتاب والسنة وأقوال أهل العلم المعتبرين.',
    category: 'fatwa_qa',
    categoryLabel: 'مجلس أسئلة شرعية وفتاوى',
    sheikhHost: {
      id: 'sh-4',
      name: 'فضيلة الشيخ د. عبد الله الخثلان',
      title: 'عضو هيئة الفتوى وأستاذ الفقه المقارن',
      isVerified: true,
      gender: 'male',
    },
    targetAudience: 'all',
    surahId: 2,
    surahName: 'البقرة',
    ayahStart: 183,
    ayahEnd: 187,
    isLive: true,
    participantsCount: 64,
    maxParticipants: 150,
    activeSpeaker: {
      name: 'فضيلة الشيخ د. عبد الله الخثلان',
      role: 'المفتي المجيب',
      isSpeaking: true,
    },
    queue: [
      { id: 'q-7', userId: 'u-401', userName: 'سلمان الدوسري', type: 'question', questionText: 'حكم من شك في سجود السهو هل يسجد قبل السلام أم بعده؟', joinedAt: '12:49' },
    ],
    questions: [
      {
        id: 'qa-4',
        askerId: 'u-401',
        askerName: 'سلمان الدوسري',
        question: 'حكم من شك في سجود السهو هل يسجد قبل السلام أم بعده في الصلاة الرباعية؟',
        status: 'answered',
        answer: 'إذا كان السهو عن نقص أو شك يبني على اليقين فيسجد قبل السلام. وإذا كان عن زيادة أو شك وترجح عنده أحد الأمرين فيسجد بعد السلام.',
        answeredBy: 'فضيلة الشيخ د. عبد الله الخثلان',
        timestamp: '12:51',
      },
      {
        id: 'qa-5',
        askerId: 'u-402',
        askerName: 'خالد الصالح',
        question: 'ما ضابط زكاة المال في الحسابات الجارية غير المستثمرة؟',
        status: 'pending',
        timestamp: '12:53',
      },
    ],
    chatMessages: [
      { id: 'm-4', senderId: 'sh-4', senderName: 'د. عبد الله الخثلان', role: 'sheikh', message: 'الحمد لله والصلاة والسلام على رسول الله. أهلاً بكم في هذا المجلس المبارك.', timestamp: '12:20' },
    ],
    createdAt: '2026-09-14T12:00:00.000Z',
  },
  {
    id: 'room-5',
    title: 'حلقة النور للأخوات: حفظ وتدبر سورة مريم',
    description: 'حلقة نسائية خاصة ومغلقة بإشراف شيخة مجازة للتسميع والتدبر وتصحيح التلاوة مع الحفاظ على الخصوصية الشرعية التامة.',
    category: 'hifz',
    categoryLabel: 'حلقة تحفيظ نسائية خاصة',
    sheikhHost: {
      id: 'sh-5',
      name: 'الشيخة أم عبد الله المجازة',
      title: 'معلمة قرآن ومجازة في القراءات السبع',
      isVerified: true,
      gender: 'female',
    },
    targetAudience: 'women_only',
    surahId: 19,
    surahName: 'مريم',
    ayahStart: 1,
    ayahEnd: 30,
    isLive: true,
    participantsCount: 22,
    maxParticipants: 40,
    activeSpeaker: {
      name: 'الشيخة أم عبد الله المجازة',
      role: 'المعلمة المشرفة',
      isSpeaking: true,
    },
    queue: [
      { id: 'q-8', userId: 'u-501', userName: 'أخت في الله (مريم)', type: 'recite', joinedAt: '12:46' },
    ],
    questions: [
      {
        id: 'qa-6',
        askerId: 'u-501',
        askerName: 'أخت في الله',
        question: 'هل يلزم الوضوء لمس المصحف من الجوال أثناء حلقة التسميع؟',
        status: 'answered',
        answer: 'لا يلزم الوضوء لقراءة القرآن أو مس شاشة الجوال؛ لأنها شاشة إلكترونية وليست ورق مصحف مطبوع، وإن كان الأفضل الطهارة.',
        answeredBy: 'الشيخة أم عبد الله المجازة',
        timestamp: '12:49',
      },
    ],
    chatMessages: [],
    tadabburNotes: [
      {
        id: 'note-5',
        authorId: 'sh-5',
        authorName: 'الشيخة أم عبد الله المجازة',
        authorGender: 'female',
        surahId: 19,
        surahName: 'مريم',
        ayahNumber: '3',
        benefitText: '﴿إذ نادى ربه نداء خفيا﴾: إن الله يسمع القلب الخاشع قبل الصوت المرتفع، والإخفاء في الدعاء أدعى للرجاء وأبعد عن الرياء، وفيه حسن أدب مع العليم الخبير.',
        categoryTag: 'tazkiyah',
        categoryTagLabel: 'تزكية النفس',
        likesCount: 22,
        likedBy: ['u-501', 'u-502'],
        createdAt: '2026-09-14T12:20:00.000Z',
        timestamp: '12:20',
      },
    ],
    createdAt: '2026-09-14T12:05:00.000Z',
  },
];

const initialHalaqatSchedules: HalqaSchedule[] = [
  {
    id: 'sched-1',
    title: 'مجلس تدبر سورة الكهف وفقه الفتن (أسبوعي)',
    surahId: 18,
    surahName: 'الكهف',
    ayahStart: 1,
    ayahEnd: 110,
    category: 'tadabbur',
    categoryLabel: 'حلقة تدبر وتفسير',
    daysOfWeek: [5], // Friday
    daysLabel: 'كل يوم جمعة',
    time: '08:00',
    durationMinutes: 60,
    sheikhName: 'د. أحمد المنصوري',
    meetingMode: 'audio_video',
    reminderMinutesBefore: 15,
    isReminderActive: true,
    roomId: 'room-1',
  },
  {
    id: 'sched-2',
    title: 'ورد الحفظ المنهجي والتسميع اليومي (جزء تبارك)',
    surahId: 67,
    surahName: 'الملك',
    ayahStart: 1,
    ayahEnd: 30,
    category: 'hifz',
    categoryLabel: 'حلقة تحفيظ وتسميع',
    daysOfWeek: [0, 1, 2, 3, 4], // Sun to Thu
    daysLabel: 'من الأحد إلى الخميس',
    time: '18:30',
    durationMinutes: 45,
    sheikhName: 'الشيخ محمود الحصري',
    meetingMode: 'audio_video',
    reminderMinutesBefore: 15,
    isReminderActive: true,
    roomId: 'room-2',
  },
  {
    id: 'sched-3',
    title: 'مجلس الإتقان وتصحيح مخارج الحروف والصفات',
    surahId: 1,
    surahName: 'الفاتحة',
    ayahStart: 1,
    ayahEnd: 7,
    category: 'tajweed',
    categoryLabel: 'مجلس تلاوة وتجويد',
    daysOfWeek: [1, 3], // Mon & Wed
    daysLabel: 'الإثنين والأربعاء',
    time: '20:00',
    durationMinutes: 50,
    sheikhName: 'الشيخ عبد الله بن عثمان',
    meetingMode: 'audio_video',
    reminderMinutesBefore: 30,
    isReminderActive: false,
    roomId: 'room-3',
  },
  {
    id: 'sched-4',
    title: 'حلقة النور للأخوات: مدارسة وحفظ سورة مريم',
    surahId: 19,
    surahName: 'مريم',
    ayahStart: 1,
    ayahEnd: 30,
    category: 'hifz',
    categoryLabel: 'حلقة تحفيظ نسائية خاصة',
    daysOfWeek: [2, 6], // Tue & Sat
    daysLabel: 'الثلاثاء والسبت',
    time: '16:00',
    durationMinutes: 45,
    sheikhName: 'الشيخة أم عبد الله المجازة',
    meetingMode: 'audio_video',
    reminderMinutesBefore: 15,
    isReminderActive: true,
    roomId: 'room-5',
  },
];

let halaqatRoomsState: HalqaRoom[] = [...initialHalaqatRooms];
let halaqatSchedulesState: HalqaSchedule[] = [...initialHalaqatSchedules];

// 1. Get all halaqat
apiRouter.get('/halaqat', (_req: Request, res: Response) => {
  res.json({
    success: true,
    rooms: halaqatRoomsState,
    totalRooms: halaqatRoomsState.length,
    activeLiveRooms: halaqatRoomsState.filter(r => r.isLive).length,
  });
});

// 2. Get specific halqa room details
apiRouter.get('/halaqat/:id', (req: Request, res: Response) => {
  const room = halaqatRoomsState.find(r => r.id === req.params.id);
  if (!room) {
    res.status(404).json({ error: 'الحلقة غير موجودة' });
    return;
  }
  res.json({ success: true, room });
});

// 3. Create a new Halqa / Islamic Room
apiRouter.post('/halaqat', (req: Request, res: Response) => {
  const {
    title,
    description,
    category,
    sheikhHostName,
    sheikhTitle,
    targetAudience,
    surahId,
    ayahStart,
    ayahEnd,
    hasVideo,
    meetingMode,
    scheduledTime,
    invitedPhones,
  } = req.body;

  if (!title || !category) {
    res.status(400).json({ error: 'عنوان الحلقة وتصنيفها مطلوبان' });
    return;
  }

  const categoryLabels: Record<string, string> = {
    tadabbur: 'حلقة تدبر وتفسير',
    hifz: 'حلقة تحفيظ وتسميع',
    tajweed: 'مجلس تلاوة وتجويد',
    fatwa_qa: 'مجلس أسئلة شرعية وفتاوى',
  };

  const surahNum = Number(surahId) || 1;
  const surahMeta = ALL_SURAHS.find(s => s.id === surahNum) || ALL_SURAHS[0];
  const roomId = `room-${Date.now()}`;

  const generatedInitialTasks: HalqaTask[] = [
    {
      id: `task-${Date.now()}-1`,
      roomId,
      title: `حفظ وضبط الآيات (${ayahStart || 1} - ${ayahEnd || 10}) من سورة ${surahMeta.name}`,
      description: 'إتقان الآيات بالتجويد ومخارج الحروف الصحيحة تمهيداً للتسميع في المجلس القادم.',
      type: 'hifz',
      typeLabel: 'حفظ وتثبيت',
      deadline: 'قبل موعد المجلس القادم',
      assignedTo: 'جميع الطلاب والمشاركين',
      isCompleted: false,
      pointsReward: 30,
      completedByUsers: [],
      createdAt: new Date().toISOString(),
    },
    {
      id: `task-${Date.now()}-2`,
      roomId,
      title: `مراجعة معاني الكلمات واللطائف البيانية لسورة ${surahMeta.name}`,
      description: 'الرجوع إلى تفاسير أهل السنة المعتمدة واستنباط فائدتين إيمانيتين على الأقل.',
      type: 'tafseer',
      typeLabel: 'تدبر وتفسير',
      deadline: 'خلال 48 ساعة',
      assignedTo: 'جميع الحاضرين',
      isCompleted: false,
      pointsReward: 20,
      completedByUsers: [],
      createdAt: new Date().toISOString(),
    },
  ];

  const newRoom: HalqaRoom = {
    id: roomId,
    title,
    description: description || 'حلقة قرآنية مباركة لتدارس كتاب الله وسنة رسوله ﷺ بنظام الاجتماعات المسموعة والمرئية.',
    category: category || 'tadabbur',
    categoryLabel: categoryLabels[category] || 'حلقة قرآنية',
    sheikhHost: {
      id: `host-${Date.now()}`,
      name: sheikhHostName || 'الشيخ المشرف',
      title: sheikhTitle || 'معلم ومحفظ قرآن معتمد',
      isVerified: true,
      gender: targetAudience === 'women_only' ? 'female' : 'male',
    },
    targetAudience: targetAudience || 'all',
    surahId: surahNum,
    surahName: surahMeta.name,
    ayahStart: Number(ayahStart) || 1,
    ayahEnd: Number(ayahEnd) || Math.min(10, surahMeta.ayasCount),
    isLive: true,
    participantsCount: 1,
    maxParticipants: 100,
    hasVideo: hasVideo !== undefined ? Boolean(hasVideo) : true,
    meetingMode: meetingMode || 'audio_video',
    scheduledTime: scheduledTime || 'الآن (مباشر)',
    activeSpeaker: {
      name: sheikhHostName || 'الشيخ المشرف',
      role: 'مؤسس الحلقة',
      isSpeaking: true,
    },
    queue: [],
    questions: [],
    chatMessages: [
      {
        id: `m-init-${Date.now()}`,
        senderId: 'system',
        senderName: 'نظام منهاج',
        role: 'moderator',
        message: `تم فتح هذه الغرفة المباركة بنجاح: "${title}". نسأل الله أن يبارك في الحاضرين والمشاركين. يمكن الآن إرسال الدعوات عبر الواتساب للأعضاء.`,
        timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
      },
    ],
    tadabburNotes: [],
    tasks: generatedInitialTasks,
    invitedPhones: Array.isArray(invitedPhones) ? invitedPhones : [],
    createdAt: new Date().toISOString(),
  };

  halaqatRoomsState.unshift(newRoom);

  res.status(201).json({
    success: true,
    message: 'تم إنشاء حلقة القرآن والغرفة الشرعية بنجاح!',
    room: newRoom,
  });
});

// 4. Raise hand (طلب التسميع أو طرح سؤال في الحلقة)
apiRouter.post('/halaqat/:id/raise-hand', (req: Request, res: Response) => {
  const { userId, userName, type, questionText } = req.body;
  const room = halaqatRoomsState.find(r => r.id === req.params.id);
  if (!room) {
    res.status(404).json({ error: 'الحلقة غير موجودة' });
    return;
  }

  const existingInQueue = room.queue.find(q => q.userId === userId);
  if (existingInQueue) {
    res.json({ success: true, message: 'أنت مسجل بالفعل في طابور المشاركة', queue: room.queue });
    return;
  }

  const newEntry = {
    id: `q-${Date.now()}`,
    userId: userId || `user-${Date.now()}`,
    userName: userName || 'طالب مشارك',
    type: (type as 'recite' | 'question') || 'recite',
    questionText: questionText || undefined,
    joinedAt: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
  };

  room.queue.push(newEntry);

  res.json({
    success: true,
    message: type === 'question' ? 'تم تسجيل طلبك لطرح سؤال شرعي في الطابور' : 'تم تسجيلك في طابور التسميع والتلاوة',
    queue: room.queue,
    position: room.queue.length,
  });
});

// 5. Ask a written question in the room's Sharia Q&A board
apiRouter.post('/halaqat/:id/ask-question', (req: Request, res: Response) => {
  const { askerId, askerName, question } = req.body;
  const room = halaqatRoomsState.find(r => r.id === req.params.id);
  if (!room) {
    res.status(404).json({ error: 'الحلقة غير موجودة' });
    return;
  }

  if (!question || question.trim().length === 0) {
    res.status(400).json({ error: 'نص السؤال مطلوب' });
    return;
  }

  const newQuestion = {
    id: `qa-${Date.now()}`,
    askerId: askerId || 'guest',
    askerName: askerName || 'سائل كريم',
    question: question.trim(),
    status: 'pending' as const,
    timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
  };

  room.questions.unshift(newQuestion);

  res.json({
    success: true,
    message: 'تم إرسال سؤالك الشرعي للشيخ وسيقوم بالإجابة عنه في المجلس',
    questions: room.questions,
  });
});

// 6. Answer a question in the room (by Sheikh or Admin)
apiRouter.post('/halaqat/:id/answer-question', (req: Request, res: Response) => {
  const { questionId, answer, answeredBy } = req.body;
  const room = halaqatRoomsState.find(r => r.id === req.params.id);
  if (!room) {
    res.status(404).json({ error: 'الحلقة غير موجودة' });
    return;
  }

  const targetQ = room.questions.find(q => q.id === questionId);
  if (!targetQ) {
    res.status(404).json({ error: 'السؤال غير موجود' });
    return;
  }

  targetQ.status = 'answered';
  targetQ.answer = answer;
  targetQ.answeredBy = answeredBy || room.sheikhHost.name;

  res.json({
    success: true,
    message: 'تم توثيق الإجابة والفتوى الشرعية للسؤال',
    questions: room.questions,
  });
});

// 7. Send message in Halqa Chat
apiRouter.post('/halaqat/:id/chat', (req: Request, res: Response) => {
  const { senderId, senderName, role, message } = req.body;
  const room = halaqatRoomsState.find(r => r.id === req.params.id);
  if (!room) {
    res.status(404).json({ error: 'الحلقة غير موجودة' });
    return;
  }

  if (!message || message.trim().length === 0) {
    res.status(400).json({ error: 'نص الرسالة مطلوب' });
    return;
  }

  const newMsg = {
    id: `m-${Date.now()}`,
    senderId: senderId || 'user',
    senderName: senderName || 'مشارك',
    role: (role as 'sheikh' | 'moderator' | 'student') || 'student',
    message: message.trim(),
    timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
  };

  room.chatMessages.push(newMsg);

  res.json({
    success: true,
    message: 'تم إرسال الرسالة',
    chatMessages: room.chatMessages,
  });
});

// 8. Add Tadabbur Note / Reflection Benefit in Halqa Room
apiRouter.post('/halaqat/:id/tadabbur-notes', (req: Request, res: Response) => {
  const { authorId, authorName, authorGender, ayahNumber, benefitText, categoryTag } = req.body;
  const room = halaqatRoomsState.find(r => r.id === req.params.id);
  if (!room) {
    res.status(404).json({ error: 'الحلقة غير موجودة' });
    return;
  }

  if (!benefitText || benefitText.trim().length < 5) {
    res.status(400).json({ error: 'يرجى كتابة فائدة التدبر بوضوح (5 أحرف على الأقل)' });
    return;
  }

  const categoryLabels: Record<string, string> = {
    iman: 'هداية إيمانية',
    language: 'لطيفة بيانية',
    action: 'عمل وتطبيق',
    tazkiyah: 'تزكية النفس',
    general: 'فائدة تدبر عامة',
  };

  const tag = (categoryTag || 'iman') as 'iman' | 'language' | 'action' | 'tazkiyah' | 'general';

  const newNote: TadabburNote = {
    id: `note-${Date.now()}`,
    authorId: authorId || 'user',
    authorName: authorName || 'مشارك متدبر',
    authorGender: authorGender || 'male',
    surahId: room.surahId,
    surahName: room.surahName,
    ayahNumber: ayahNumber ? String(ayahNumber).trim() : undefined,
    benefitText: benefitText.trim(),
    categoryTag: tag,
    categoryTagLabel: categoryLabels[tag] || 'فائدة تدبر',
    likesCount: 0,
    likedBy: [],
    createdAt: new Date().toISOString(),
    timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' }),
  };

  if (!room.tadabburNotes) {
    room.tadabburNotes = [];
  }
  room.tadabburNotes.unshift(newNote);

  // Credit user points if user exists
  if (authorId) {
    const wallet = db.wallets.find(w => w.userId === authorId);
    if (wallet) {
      wallet.availablePoints += 10;
      wallet.updatedAt = new Date().toISOString();
    }
  }

  res.status(201).json({
    success: true,
    message: 'تم تدوين فائدة التدبر ومشاركتها في المجلس بنجاح! نفع الله بك وبما كتبت.',
    note: newNote,
    tadabburNotes: room.tadabburNotes,
    pointsAwarded: 10,
  });
});

// 9. Like / Appreciate Tadabbur Note
apiRouter.post('/halaqat/:id/tadabbur-notes/:noteId/like', (req: Request, res: Response) => {
  const { userId } = req.body;
  const room = halaqatRoomsState.find(r => r.id === req.params.id);
  if (!room) {
    res.status(404).json({ error: 'الحلقة غير موجودة' });
    return;
  }

  if (!room.tadabburNotes) {
    room.tadabburNotes = [];
  }

  const note = room.tadabburNotes.find(n => n.id === req.params.noteId);
  if (!note) {
    res.status(404).json({ error: 'الفائدة غير موجودة' });
    return;
  }

  const uid = userId || 'guest-user';
  if (!note.likedBy) {
    note.likedBy = [];
  }

  const alreadyLiked = note.likedBy.includes(uid);
  if (alreadyLiked) {
    note.likedBy = note.likedBy.filter(id => id !== uid);
    note.likesCount = Math.max(0, note.likesCount - 1);
  } else {
    note.likedBy.push(uid);
    note.likesCount += 1;
  }

  res.json({
    success: true,
    liked: !alreadyLiked,
    likesCount: note.likesCount,
    note,
  });
});

// =========================================================================
// HALAQAT ADVANCED ENDPOINTS: SCHEDULES, AI ANALYSIS, TASKS, & WHATSAPP
// =========================================================================

// 10. Get all study and hifz schedules (تقويم وجداول التدارس والحفظ)
apiRouter.get('/halaqat/schedules', (_req: Request, res: Response) => {
  res.json({
    success: true,
    schedules: halaqatSchedulesState,
    total: halaqatSchedulesState.length,
  });
});

// 11. Add a new study/hifz schedule item
apiRouter.post('/halaqat/schedules', (req: Request, res: Response) => {
  const {
    title,
    surahId,
    ayahStart,
    ayahEnd,
    category,
    daysOfWeek,
    time,
    durationMinutes,
    sheikhName,
    meetingMode,
    reminderMinutesBefore,
    isReminderActive,
    roomId,
  } = req.body;

  if (!title || !daysOfWeek || !time) {
    res.status(400).json({ error: 'العنوان والأيام والوقت مطلوبة لإنشاء الجدول' });
    return;
  }

  const surahNum = Number(surahId) || 1;
  const surahMeta = ALL_SURAHS.find((s) => s.id === surahNum) || ALL_SURAHS[0];

  const daysMap: Record<number, string> = {
    0: 'الأحد',
    1: 'الإثنين',
    2: 'الثلاثاء',
    3: 'الأربعاء',
    4: 'الخميس',
    5: 'الجمعة',
    6: 'السبت',
  };

  const parsedDays = Array.isArray(daysOfWeek) ? daysOfWeek.map(Number) : [5];
  const daysLabel = parsedDays.map((d) => daysMap[d] || '').filter(Boolean).join(' و ');

  const categoryLabels: Record<string, string> = {
    tadabbur: 'حلقة تدبر وتفسير',
    hifz: 'حلقة تحفيظ وتسميع',
    tajweed: 'مجلس تلاوة وتجويد',
    fatwa_qa: 'مجلس أسئلة شرعية وفتاوى',
  };

  const newSchedule: HalqaSchedule = {
    id: `sched-${Date.now()}`,
    title,
    surahId: surahNum,
    surahName: surahMeta.name,
    ayahStart: Number(ayahStart) || 1,
    ayahEnd: Number(ayahEnd) || Math.min(10, surahMeta.ayasCount),
    category: category || 'tadabbur',
    categoryLabel: categoryLabels[category] || 'جدول قرآني',
    daysOfWeek: parsedDays,
    daysLabel: daysLabel || 'موعد محدد',
    time: time || '18:00',
    durationMinutes: Number(durationMinutes) || 45,
    sheikhName: sheikhName || 'المعلم المشرف',
    meetingMode: meetingMode || 'audio_video',
    reminderMinutesBefore: Number(reminderMinutesBefore) || 15,
    isReminderActive: isReminderActive !== undefined ? Boolean(isReminderActive) : true,
    roomId: roomId || undefined,
  };

  halaqatSchedulesState.unshift(newSchedule);

  res.status(201).json({
    success: true,
    message: 'تمت إضافة الموعد إلى تقويم وجداول التدارس بنجاح!',
    schedule: newSchedule,
  });
});

// 12. Delete a study schedule item
apiRouter.delete('/halaqat/schedules/:id', (req: Request, res: Response) => {
  const initialLen = halaqatSchedulesState.length;
  halaqatSchedulesState = halaqatSchedulesState.filter((s) => s.id !== req.params.id);

  if (halaqatSchedulesState.length === initialLen) {
    res.status(404).json({ error: 'الجدول غير موجود' });
    return;
  }

  res.json({ success: true, message: 'تم حذف الموعد من التقويم بنجاح' });
});

// 13. Analyze Meeting with AI (تحليل مجريات الحلقة واستخراج المهام والتكليفات والواجبات)
apiRouter.post('/halaqat/:id/analyze-meeting', async (req: Request, res: Response) => {
  const room = halaqatRoomsState.find((r) => r.id === req.params.id);
  if (!room) {
    res.status(404).json({ error: 'الحلقة غير موجودة' });
    return;
  }

  // Check Gemini
  const gemini = getGemini();
  if (gemini) {
    try {
      const notesSummary = (room.tadabburNotes || []).map((n) => `- ${n.authorName}: ${n.benefitText}`).join('\n');
      const questionsSummary = (room.questions || []).map((q) => `- سؤال من ${q.askerName}: "${q.question}" ${q.answer ? `| الجواب: ${q.answer}` : ''}`).join('\n');
      const chatSummary = (room.chatMessages || []).slice(-10).map((m) => `${m.senderName}: ${m.message}`).join('\n');

      const prompt = `أنت عالم ومستشار قرآني خبير في إدارة وتوثيق مجالس وحلقات القرآن الكريم بمنصة منهاج.
المجلس القرآني: "${room.title}"
التصنيف: ${room.categoryLabel}
السورة: سورة ${room.surahName} (الآيات ${room.ayahStart} إلى ${room.ayahEnd})
المشرف: ${room.sheikhHost.name} (${room.sheikhHost.title})

مشاركات وملاحظات الطلاب والمشايخ في الجلسة:
${notesSummary || 'لا توجد ملاحظات مدونة بعد'}

الأسئلة والفتاوى المطروحة في المجلس:
${questionsSummary || 'لا توجد أسئلة مسجلة'}

شات ومداولات الحضور:
${chatSummary || 'مداولات استماع وإنصات عام'}

المطلوب: قم بتحليل شامل لمجريات هذا المجلس القرآني واستخرج:
1. "executiveSummary": تلخيص وافٍ بليغ للمجلس وما دار فيه من تدارس واستماع.
2. "keyThemes": قائمة بأهم 3 محاور أساسية تم تدارسها.
3. "scholarlyTakeaways": قائمة بـ 3 إلى 4 فوائد إيمانية وتفسيرية مستنبطة من الآيات المذكورة.
4. "actionItems": قائمة بـ 3 إلى 5 مهام وتكليفات وواجبات عملية ملزمة للمشاركين (مثال: حفظ وتثبيت الآيات، مراجعة تفسير معتمد، تسميع مع زميل، تطبيق خلق أو سلوك وارد في الآيات) مع حقل type من ('hifz' | 'murajaah' | 'tafseer' | 'tajweed' | 'action') وحقل deadline و pointsReward (بين 15 و 40 نقطة).
5. "studyRecommendations": نصائح منهجية واضحة لترتيب أولويات المراجعة والتدارس وطرق الحفظ المناسبة لهذه الآيات.
6. "recommendedRevisionPlan": جدول زمني مقترح للورد اليومي حتى موعد الجلسة القادمة.

أرجع النتيجة بصيغة JSON حصراً بالشكل التالي:
{
  "executiveSummary": "...",
  "keyThemes": ["...", "..."],
  "scholarlyTakeaways": ["...", "..."],
  "actionItems": [
    { "title": "...", "description": "...", "type": "hifz", "typeLabel": "حفظ وتثبيت", "deadline": "قبل المجلس القادم", "pointsReward": 30 }
  ],
  "studyRecommendations": "...",
  "recommendedRevisionPlan": "..."
}`;

      const aiRes = await gemini.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(aiRes.text || '{}');
      const actionItemsWithIds: HalqaTask[] = (parsed.actionItems || []).map((t: any, idx: number) => ({
        id: `task-ai-${Date.now()}-${idx + 1}`,
        roomId: room.id,
        title: t.title || 'واجب مدارسة الآيات الكريمة',
        description: t.description || '',
        type: t.type || 'hifz',
        typeLabel: t.typeLabel || 'واجب قرآني',
        deadline: t.deadline || 'خلال 48 ساعة',
        assignedTo: 'جميع الطلاب والمشاركين',
        isCompleted: false,
        pointsReward: Number(t.pointsReward) || 25,
        completedByUsers: [],
        createdAt: new Date().toISOString(),
      }));

      const analysis: MeetingAnalysis = {
        id: `analysis-${Date.now()}`,
        roomId: room.id,
        generatedAt: new Date().toISOString(),
        executiveSummary: parsed.executiveSummary || `تمت مدارسة الآيات الكريمة من سورة ${room.surahName} بإتقان وتدبر مع الحضور.`,
        keyThemes: parsed.keyThemes || [`مقاصد سورة ${room.surahName}`, 'العمل بمقتضى الآيات', 'التثبيت والمراجعة'],
        scholarlyTakeaways: parsed.scholarlyTakeaways || ['الإنصات لكتاب الله مفتاح الرحمة والهداية'],
        actionItems: actionItemsWithIds,
        studyRecommendations: parsed.studyRecommendations || 'الحرص على التكرار التراكمي وسماع الشيخ المتقن يومياً.',
        recommendedRevisionPlan: parsed.recommendedRevisionPlan || 'ورد يومي بمعدل حزب للمراجعة وصفحة للحفظ الجديد.',
      };

      room.meetingAnalysis = analysis;
      if (!room.tasks) room.tasks = [];
      // Merge tasks
      room.tasks = [...actionItemsWithIds, ...room.tasks.filter((t) => !actionItemsWithIds.some((ai) => ai.title === t.title))];

      res.json({
        success: true,
        message: 'تم تحليل مجريات الحلقة واستخراج المهام والتكليفات بنجاح عبر الذكاء الاصطناعي!',
        engine: 'Gemini AI Quranic Analysis',
        meetingAnalysis: analysis,
        tasks: room.tasks,
      });
      return;
    } catch (err) {
      console.warn('Gemini Meeting Analysis Fallback:', err);
    }
  }

  // Algorithmic Quranic Analysis Fallback
  const fallbackTasks: HalqaTask[] = [
    {
      id: `task-alg-${Date.now()}-1`,
      roomId: room.id,
      title: `حفظ وتثبيت الآيات (${room.ayahStart} - ${room.ayahEnd}) من سورة ${room.surahName}`,
      description: 'ضبط الألفاظ ومخارج الحروف مع التكرار 7 مرات عن ظهر قلب.',
      type: 'hifz',
      typeLabel: 'حفظ وتثبيت',
      deadline: 'قبل موعد المجلس القادم',
      assignedTo: 'جميع المشاركين',
      isCompleted: false,
      pointsReward: 35,
      completedByUsers: [],
      createdAt: new Date().toISOString(),
    },
    {
      id: `task-alg-${Date.now()}-2`,
      roomId: room.id,
      title: `مراجعة تفسير معتمد للآيات وتدوين فائدة في مدونة التدبر`,
      description: 'الرجوع لتفسير ابن كثير أو السعدي واستخراج موعظة إيمانية سلوكية.',
      type: 'tafseer',
      typeLabel: 'تفسير وتدبر',
      deadline: 'خلال 48 ساعة',
      assignedTo: 'جميع الطلاب',
      isCompleted: false,
      pointsReward: 25,
      completedByUsers: [],
      createdAt: new Date().toISOString(),
    },
    {
      id: `task-alg-${Date.now()}-3`,
      roomId: room.id,
      title: `تسميع الآيات لزميل في الحلقة ومراجعة أحكام التجويد (المدود والغنن)`,
      description: 'مطابقة الأداء الصوتي مع أحكام التجويد المعتمدة برواية حفص عن عاصم.',
      type: 'tajweed',
      typeLabel: 'تجويد ومراجعة ثنائية',
      deadline: 'قبل يوم الخميس',
      assignedTo: 'طاقم التسميع',
      isCompleted: false,
      pointsReward: 20,
      completedByUsers: [],
      createdAt: new Date().toISOString(),
    },
  ];

  const analysis: MeetingAnalysis = {
    id: `analysis-${Date.now()}`,
    roomId: room.id,
    generatedAt: new Date().toISOString(),
    executiveSummary: `انعقد مجلس مدارسة سورة ${room.surahName} (الآيات ${room.ayahStart} - ${room.ayahEnd}) بإشراف ${room.sheikhHost.name}. تم استعراض مقاصد الآيات وأحكام التلاوة الصحيحة، مع الإجابة عن استفسارات الحاضرين والاتفاق على تكليفات الحفظ والمراجعة للمجلس القادم.`,
    keyThemes: [
      `الاستمساك بهدايات سورة ${room.surahName}`,
      'ضبط مخارج الحروف وأحكام التجويد النظرية والعملية',
      'تفعيل خلق التدبر والتفكر في أوامر الله ونواهيه',
    ],
    scholarlyTakeaways: [
      'التلاوة بتؤدة وترتيل تورث القلب خشوعاً وفهماً لمعاني الخطاب الإلهي.',
      'الربط بين الآيات المتشابهة في السورة يُثبّت الحفظ ويزيل اللبس.',
      'القرآن أنزل ليعمل به، فكل آية فيها أمر أو نهي ينبغي أن تثمر عملاً في واقع المؤمن.',
    ],
    actionItems: fallbackTasks,
    studyRecommendations: 'يُوصى بطريقة الحصون الخمسة: الاستماع للمقرئ الحصري 3 مرات، ثم القراءة بالحدر للمراجعة، والترتيل للتسميع الجديد.',
    recommendedRevisionPlan: 'تخصيص 20 دقيقة بعد صلاة الفجر للحفظ الجديد، و 15 دقيقة قبل النوم لمراجعة المحفوظ القديم.',
  };

  room.meetingAnalysis = analysis;
  if (!room.tasks) room.tasks = [];
  room.tasks = [...fallbackTasks, ...room.tasks];

  res.json({
    success: true,
    message: 'تم استخراج التكليفات والواجبات وتحليل المجلس بنجاح!',
    meetingAnalysis: analysis,
    tasks: room.tasks,
  });
});

// 14. Add a manual task/assignment to a halqa
apiRouter.post('/halaqat/:id/tasks', (req: Request, res: Response) => {
  const room = halaqatRoomsState.find((r) => r.id === req.params.id);
  if (!room) {
    res.status(404).json({ error: 'الحلقة غير موجودة' });
    return;
  }

  const { title, description, type, deadline, assignedTo, pointsReward } = req.body;
  if (!title) {
    res.status(400).json({ error: 'عنوان المهمة أو التكليف مطلوب' });
    return;
  }

  const typeLabels: Record<string, string> = {
    hifz: 'حفظ جديد وتثبيت',
    murajaah: 'مراجعة دورية',
    tafseer: 'تفسير وتدبر',
    tajweed: 'تجويد وإتقان',
    action: 'تطبيق عملي وسلوك',
  };

  const newTask: HalqaTask = {
    id: `task-${Date.now()}`,
    roomId: room.id,
    title: title.trim(),
    description: description ? description.trim() : undefined,
    type: type || 'hifz',
    typeLabel: typeLabels[type] || 'واجب قرآني',
    deadline: deadline || 'قبل المجلس القادم',
    assignedTo: assignedTo || 'جميع الطلاب',
    isCompleted: false,
    pointsReward: Number(pointsReward) || 20,
    completedByUsers: [],
    createdAt: new Date().toISOString(),
  };

  if (!room.tasks) room.tasks = [];
  room.tasks.unshift(newTask);

  res.status(201).json({
    success: true,
    message: 'تمت إضافة المهمة والتكليف بنجاح!',
    task: newTask,
    tasks: room.tasks,
  });
});

// 15. Toggle task completion by a student / user
apiRouter.post('/halaqat/:id/tasks/:taskId/toggle', (req: Request, res: Response) => {
  const room = halaqatRoomsState.find((r) => r.id === req.params.id);
  if (!room) {
    res.status(404).json({ error: 'الحلقة غير موجودة' });
    return;
  }

  if (!room.tasks) room.tasks = [];
  const task = room.tasks.find((t) => t.id === req.params.taskId);
  if (!task) {
    res.status(404).json({ error: 'التكليف غير موجود' });
    return;
  }

  const { userId } = req.body;
  const uid = userId || 'current-user';

  if (!task.completedByUsers) task.completedByUsers = [];
  const wasCompleted = task.completedByUsers.includes(uid) || task.isCompleted;

  if (wasCompleted) {
    task.completedByUsers = task.completedByUsers.filter((u) => u !== uid);
    task.isCompleted = false;
  } else {
    task.completedByUsers.push(uid);
    task.isCompleted = true;

    // Credit points to user wallet
    if (userId) {
      const wallet = db.wallets.find((w) => w.userId === userId);
      if (wallet) {
        wallet.availablePoints += task.pointsReward;
        wallet.updatedAt = new Date().toISOString();
      }
    }
  }

  res.json({
    success: true,
    message: task.isCompleted ? `هنيئاً لك! أنجزت التكليف وحصلت على ${task.pointsReward} نقطة بركة.` : 'تم إلغاء حالة الإنجاز.',
    task,
    pointsAwarded: task.isCompleted ? task.pointsReward : 0,
  });
});

// 16. AI Study Priorities & Methodology Advisor (مساعد الذكاء الاصطناعي لترتيب أولويات وطرق التدارس)
apiRouter.post('/halaqat/ai-study-priorities', async (req: Request, res: Response) => {
  const {
    targetSurahId,
    currentLevel,
    dailyMinutes,
    focusArea,
    memorizationPace,
  } = req.body;

  const surahNum = Number(targetSurahId) || 18;
  const surahMeta = ALL_SURAHS.find((s) => s.id === surahNum) || ALL_SURAHS[0];
  const totalMinutes = Number(dailyMinutes) || 30;

  const gemini = getGemini();
  if (gemini) {
    try {
      const prompt = `أنت الموجه القرآني الذكي وخبير مناهج تحفيظ وتدبر القرآن الكريم بمنصة منهاج.
المستخدم يطلب منك إعداد برنامج دراسي محكم وترتيب أولويات وطرق التدارس والحفظ وفق المعايير التالية:
- السورة المستهدفة: سورة ${surahMeta.name} (عدد آياتها: ${surahMeta.ayasCount}، ${surahMeta.type})
- المستوى الحالي للطالب: ${currentLevel || 'متوسط (يحفظ بعض الأجزاء)'}
- الوقت اليومي المتاح للتدارس: ${totalMinutes} دقيقة يومياً
- محور التركيز المطلوب: ${focusArea || 'متوازن بين الحفظ والمراجعة والتدبر'}
- سرعة الإنجاز المطلوبة: ${memorizationPace || 'صفحة أو 5 آيات يومياً'}

المطلوب: قم بتصميم خطة تدارس ذكية ترتب أولويات الطالب بدقة بالغة (بالدقائق والترتيب الزمني اليومي)، مع تحديد أفضل طريقة حفظ علمية معتمدة عند علماء القراءات وتناسب وقته.
أرجع النتيجة بصيغة JSON حصراً بهذا الهيكل:
{
  "targetSurah": "${surahMeta.name}",
  "targetSurahId": ${surahNum},
  "currentLevel": "${currentLevel || 'متوسط'}",
  "dailyMinutes": ${totalMinutes},
  "focusArea": "${focusArea || 'متوازن'}",
  "priorityOrder": [
    {
      "order": 1,
      "phase": "الورد والمراجعة السابقة",
      "durationMinutes": 10,
      "activity": "تكرار المحفوظ القديم غيباً",
      "objective": "التثبيت أولى من الاستزادة",
      "methodName": "طريقة الحدر مع الاستذكار السريع"
    },
    {
      "order": 2,
      "phase": "تلقي وسماع الآيات الجديدة",
      "durationMinutes": 8,
      "activity": "الاستماع للشيخ الحصري مرتين مع متابعة المصحف",
      "objective": "تصحيح اللفظ وضبط التشكيل والوقف",
      "methodName": "طريقة المحاكاة السمعية"
    },
    {
      "order": 3,
      "phase": "الحفظ الجديد والربط",
      "durationMinutes": 12,
      "activity": "تكرار الآية الواحدة 5 مرات ثم ربطها بما قبلها",
      "objective": "ترسيخ الآيات في الذاكرة القريبة",
      "methodName": "طريقة الحفظ التراكمي المقسم"
    }
  ],
  "recommendedMethodology": {
    "name": "طريقة الحصون الخمسة المتدرجة",
    "origin": "مستنبطة من هدي السلف الصالح في مدارسة القرآن",
    "description": "منهج يقوم على حماية الحفظ بخمسة أسوار محكمة تبدأ بالقراءة المستمرة وتنتهي بربط الآيات بالصلاة والعمل.",
    "steps": [
      "الحصن الأول: القراءة المستمرة وسماع الورد اليومي",
      "الحصن الثاني: التحضير الأسبوعي واليومي قبل الحفظ",
      "الحصن الثالث: الحفظ الجديد بالتركيز البصري والسمعي",
      "الحصن الرابع: مراجعة القريب (ما تم حفظه في آخر 30 يوماً)",
      "الحصن الخامس: مراجعة البعيد لضمان عدم التفلت"
    ]
  },
  "weeklyScheduleMatrix": [
    { "day": "السبت", "task": "حفظ الآيات 1-5 وسماع الشيخ المتقن", "duration": "${totalMinutes} دقيقة" },
    { "day": "الأحد", "task": "تثبيت الآيات 1-5 وحفظ 6-10", "duration": "${totalMinutes} دقيقة" },
    { "day": "الإثنين", "task": "مراجعة 1-10 وتدبر غريب الألفاظ", "duration": "${totalMinutes} دقيقة" },
    { "day": "الثلاثاء", "task": "حفظ الآيات 11-15 وربطها بالسياق", "duration": "${totalMinutes} دقيقة" },
    { "day": "الأربعاء", "task": "تسميع شامل للمقطع في حلقة المنهاج", "duration": "${totalMinutes} دقيقة" },
    { "day": "الخميس", "task": "مراجعة وتثبيت المحفوظ في صلاة النوافل", "duration": "${totalMinutes} دقيقة" },
    { "day": "الجمعة", "task": "قراءة السورة كاملة واستخراج اللطائف", "duration": "${totalMinutes} دقيقة" }
  ],
  "scholarlyAdvice": [
    "اجعل لك مصحفاً واحداً لا تغيره لترتسم صفحاته وأماكن الآيات في ذاكرتك البصرية.",
    "لا تنتقل إلى آية جديدة حتى تطمئن إلى رسوخ الآية السابقة كالفاتحة.",
    "قراءة المحفوظ الجديد في صلوات السنن والرواتب والقيام هو المحك الحقيقي لتثبيته.",
    "الدعاء الصادق بالبركة وحفظ كتاب الله هو سر الفتح والتوفيق."
  ]
}`;

      const aiRes = await gemini.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const plan = JSON.parse(aiRes.text || '{}');

      res.json({
        success: true,
        engine: 'Gemini AI Quranic Curriculum Advisor',
        plan,
      });
      return;
    } catch (err) {
      console.warn('Gemini AI Study Priorities Fallback:', err);
    }
  }

  // Algorithmic Fallback Quranic Curriculum
  const p1 = Math.round(totalMinutes * 0.3);
  const p2 = Math.round(totalMinutes * 0.25);
  const p3 = Math.round(totalMinutes * 0.35);
  const p4 = Math.max(5, totalMinutes - (p1 + p2 + p3));

  const fallbackPlan = {
    targetSurah: surahMeta.name,
    targetSurahId: surahNum,
    currentLevel: currentLevel || 'متوسط',
    dailyMinutes: totalMinutes,
    focusArea: focusArea || 'متوازن',
    priorityOrder: [
      {
        order: 1,
        phase: 'الأولوية الأولى: مراجعة القديم (التثبيت قبل الزيادة)',
        durationMinutes: p1,
        activity: 'تسميع غيبي للورد السابق بالحدر المنضبط للتأكد من عدم تفلت المحفوظ',
        objective: 'حماية الرصيد القرآني السابق ومنع نسيانه',
        methodName: 'طريقة الاسترجاع النشط الفوري',
      },
      {
        order: 2,
        phase: 'الأولوية الثانية: التلقي والتصحيح الصوتي',
        durationMinutes: p2,
        activity: 'الاستماع للشيخ الحصري أو المنشاوي 3 مرات مع النظر الحثيث في المصحف',
        objective: 'تثبيت مخارج الحروف وضبط علامات الوقف والابتداء وحركات الإعراب',
        methodName: 'طريقة العرض السمعي والبصري',
      },
      {
        order: 3,
        phase: 'الأولوية الثالثة: الحفظ الجديد بالتكرار المتقارب',
        durationMinutes: p3,
        activity: 'تجزئة الآيات إلى مقاطع وتكرار كل مقطع 7 مرات غيباً ثم الربط بما قبله',
        objective: 'بناء مسار عصبي قوي للآيات الجديدة في الذاكرة',
        methodName: 'طريقة الحفظ التراكمي المتصل',
      },
      {
        order: 4,
        phase: 'الأولوية الرابعة: الفهم الإجمالي والتطبيق العملي',
        durationMinutes: p4,
        activity: 'قراءة تفسير ميسر (كالسعدي) واستنباط نية للعمل بالآية طوال اليوم',
        objective: 'ربط الحفظ بالعمل وتذوق حلاوة الخطاب الإلهي',
        methodName: 'طريقة التدارس السلوكي',
      },
    ],
    recommendedMethodology: {
      name: 'طريقة الحصون الخمسة مع التكرار المتباعد (Spaced Repetition)',
      origin: 'تراث المقارئ الإسلامية الأصيلة المعتمدة في بلاد الحرمين والأزهر الشريف',
      description: 'منهجية علمية تقسم وقت الطالب وفق قاعدة: ربع الوقت للحفظ الجديد، ونصفه للتثبيت، والربع الأخير للفهم والتدبر.',
      steps: [
        'المرحلة 1: التحضير المسبق لليوم التالي بالاستماع ليلاً قبل النوم.',
        'المرحلة 2: الحفظ الصباحي بعد صلاة الفجر حيث صفاء الذهن وبركة البكور.',
        'المرحلة 3: التكرار الفوري مع النفس 10 مرات دون النظر للمصحف.',
        'المرحلة 4: التسميع لشيخ مجاز في حلقة المنهاج أو لزميل متقن.',
        'المرحلة 5: الصلاة بالآيات الجديدة في ركعتي الضحى وسنن الرواتب.',
      ],
    },
    weeklyScheduleMatrix: [
      { day: 'السبت', task: `حفظ المقطع الأول من سورة ${surahMeta.name} (5 آيات)`, duration: `${totalMinutes} دقيقة` },
      { day: 'الأحد', task: `تثبيت مقطع السبت وحفظ المقطع الثاني مع التكرار`, duration: `${totalMinutes} دقيقة` },
      { day: 'الإثنين', task: 'مراجعة المقطعين وربط المعاني وتدوين فوائد التدبر', duration: `${totalMinutes} دقيقة` },
      { day: 'الثلاثاء', task: 'حفظ المقطع الثالث والتسميع في حلقة المنهاج المباشرة', duration: `${totalMinutes} دقيقة` },
      { day: 'الأربعاء', task: 'مراجعة شاملة لكافة ما تم حفظه من السورة مع تصحيح التجويد', duration: `${totalMinutes} دقيقة` },
      { day: 'الخميس', task: 'يوم التثبيت بالصلاة وقراءة المقطع في قيام الليل', duration: `${totalMinutes} دقيقة` },
      { day: 'الجمعة', task: 'مجلس التدارس الأسبوعي وقراءة السورة بتدبر وتأنٍ', duration: `${totalMinutes} دقيقة` },
    ],
    scholarlyAdvice: [
      'التكرار هو روح الحفظ، ولا يُعد الحفظ حفظاً حتى يخرج عفو الخاطر كاسمك.',
      'القرآن أشد تفلتاً من الإبل في عقلها، فالدوام على الورد اليومي هو حبل النجاة.',
      'طهر قلبك من المعاصي والشوائب، فإن العلم نور ونور الله لا يهدى لعاصٍ.',
      'شارك تلاوتك في حلقات منهاج المباشرة للتصحيح المستمر على أيدي المشايخ المجازين.',
    ],
  };

  res.json({
    success: true,
    engine: 'Algorithmic Islamic Curriculum Advisor',
    plan: fallbackPlan,
  });
});

// 17. WhatsApp Invitation Logger & Dispatcher
apiRouter.post('/halaqat/whatsapp-invite', (req: Request, res: Response) => {
  const { roomId, memberPhones, customMessage } = req.body;
  const room = halaqatRoomsState.find((r) => r.id === roomId);
  if (!room) {
    res.status(404).json({ error: 'الحلقة غير موجودة' });
    return;
  }

  const phones: string[] = Array.isArray(memberPhones) ? memberPhones : [];
  if (!room.invitedPhones) room.invitedPhones = [];

  phones.forEach((p) => {
    const clean = p.replace(/\D/g, '');
    if (clean && !room.invitedPhones!.includes(clean)) {
      room.invitedPhones!.push(clean);
    }
  });

  res.json({
    success: true,
    message: `تم توثيق الدعوة لـ ${phones.length} من الأعضاء بنجاح عبر الواتساب!`,
    invitedCount: room.invitedPhones.length,
    roomTitle: room.title,
  });
});

// 2. Marriage Profiles (Filtered by Gender Isolation + Marital Status)
apiRouter.get('/marriage/profiles', enforceGenderIsolation, (req: Request, res: Response) => {
  const contextGender = req.body.contextGender as 'male' | 'female';
  const maritalFilter = req.query.maritalStatus as string;

  // STRICT GENDER ISOLATION:
  // Male user can ONLY view female profiles; Female user can ONLY view male profiles.
  const targetGender = contextGender === 'male' ? 'female' : 'male';
  let filtered = db.marriageProfiles.filter((p) => p.gender === targetGender && p.isActive);

  if (maritalFilter && maritalFilter !== 'all') {
    filtered = filtered.filter((p) => p.maritalStatus === maritalFilter);
  }

  // Sort: Pinned royal packages on top
  filtered.sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  res.json({
    success: true,
    viewerGender: contextGender,
    targetGender,
    count: filtered.length,
    profiles: filtered,
  });
});

// 2.1 Get Marriage & Chastity Packages
apiRouter.get('/marriage/packages', (req: Request, res: Response) => {
  res.json({
    success: true,
    packages: db.adminSettings.marriagePackages,
  });
});

// 2.2 Subscribe to a Package
apiRouter.post('/marriage/subscribe-package', enforceGenderIsolation, (req: Request, res: Response) => {
  const { packageId, profileCode } = req.body;
  const pkg = db.adminSettings.marriagePackages.find((p) => p.id === packageId);
  if (!pkg) {
    res.status(404).json({ error: 'الباقة المطلوبة غير موجودة' });
    return;
  }

  const profile = db.marriageProfiles.find((p) => p.code === profileCode);
  if (profile) {
    profile.packageTier = pkg.tier;
    profile.isPinned = pkg.pinOnTop || false;
    profile.pinnedDaysRemaining = pkg.durationDays;
  }

  res.json({
    success: true,
    message: `تهانينا! تم تفعيل ${pkg.name} بنجاح ${pkg.isHighestTier ? 'مع تثبيت الإعلان في الصدارة لمدة شهر كامل' : ''}.`,
    package: pkg,
    profile,
  });
});

// 3. AI Matchmaking (Sharia-Compliant Matching Engine)
apiRouter.post('/marriage/ai-match', enforceGenderIsolation, async (req: Request, res: Response) => {
  const { contextGender, preferredStatus, userAge, userQualifications, userHifz, userNotes } = req.body;
  const targetGender = contextGender === 'male' ? 'female' : 'male';

  // Fetch profiles matching target gender
  let candidateProfiles = db.marriageProfiles.filter((p) => p.gender === targetGender && p.isActive);
  if (preferredStatus && preferredStatus !== 'all') {
    candidateProfiles = candidateProfiles.filter((p) => p.maritalStatus === preferredStatus);
  }

  // Fallback to all profiles of target gender if strict filter yielded 0
  if (candidateProfiles.length === 0) {
    candidateProfiles = db.marriageProfiles.filter((p) => p.gender === targetGender && p.isActive);
  }

  // If Gemini API is available, generate rich Sharia matchmaking analysis
  const gemini = getGemini();
  if (gemini) {
    try {
      const prompt = `أنت مستشار زواج شرعي وخبير في التكافؤ الأسري الإسلامي بمنصة منهاج.
المستخدم الباحث: نوعه ${contextGender === 'male' ? 'رجل' : 'امرأة'}، العمر ${userAge || 28}، المؤهل: ${userQualifications || 'مؤهل عالٍ'}، حفظ القرآن: ${userHifz || 'أجزاء متعددة'}، ملاحظات: ${userNotes || 'ملتزم بالهدي النبوي والجدية'}.
المرشحون من الجنس المقابل (${targetGender === 'male' ? 'رجال' : 'نساء'}):
${candidateProfiles.map((c) => `- كود: ${c.code}, العمر: ${c.age}, الحالة: ${c.maritalStatus}, الوظيفة: ${c.job}, الحفظ: ${c.hifzPortion}, الالتزام: ${c.religiousCommitment}`).join('\n')}

المطلوب: قم بتحليل درجة التوافق الشرعي والنفسي لكل استمارة وأعطِ نسبة توافق (Compatibility Percentage) من 80% إلى 99% مع حيثيات التوافق (مثل التكافؤ العلمي، الاهتمام بكتاب الله، السكن، والأولويات الشرعية).
أرجع النتيجة بصيغة JSON فقط بهذا الشكل:
[
  { "code": "الكود", "matchScore": 94, "aiVerdict": "سبب التوافق الشرعي والعلمي باختصار بليغ", "recommendedNextStep": "الخطوة الشرعية التالية" }
]`;

      const response = await gemini.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const parsed = JSON.parse(response.text || '[]');
      const matchesWithAi = candidateProfiles.map((candidate, idx) => {
        const aiInfo = Array.isArray(parsed) ? parsed.find((p: any) => p.code === candidate.code) || parsed[idx] : null;
        return {
          ...candidate,
          matchScore: aiInfo?.matchScore || Math.floor(88 + Math.random() * 11),
          aiVerdict: aiInfo?.aiVerdict || 'توافق متميز في الالتزام بكتاب الله والسنة النبوية والتكافؤ الثقافي.',
          recommendedNextStep: aiInfo?.recommendedNextStep || 'طلب تفعيل العربون الذكي (Escrow) لإرسال الإشعار لولي الأمر الشرعي.',
        };
      });

      res.json({
        success: true,
        viewerGender: contextGender,
        targetGender,
        engine: 'Gemini AI Sharia Matchmaker',
        matches: matchesWithAi,
      });
      return;
    } catch (err) {
      console.warn('Gemini Matchmaking fallback:', err);
    }
  }

  // Algorithmic Fallback Sharia Matchmaker
  const matches = candidateProfiles.map((candidate, index) => {
    const baseScore = 92 - index * 3 + Math.floor(Math.random() * 5);
    return {
      ...candidate,
      matchScore: Math.min(98, Math.max(82, baseScore)),
      aiVerdict: `توافق شرعي عالٍ استناداً إلى تقارب مقدار حفظ كتاب الله (${candidate.hifzPortion})، والتكافؤ الاجتماعي والعلمي بمدينة ${candidate.city}.`,
      recommendedNextStep: 'حجز مقعد التواصل الشرعي عبر دفع عربون الأمانة (10%) لمخاطبة الولي.',
    };
  });

  res.json({
    success: true,
    viewerGender: contextGender,
    targetGender,
    engine: 'Minhaj Algorithmic Matchmaker',
    matches,
  });
});

// 4. Regulated Chat Endpoint with Firewall
apiRouter.post('/chat/send', chatFirewall, (req: Request, res: Response) => {
  const { message, recipientCode, senderGender } = req.body;
  res.json({
    success: true,
    message: 'تم تمرير الرسالة ومطابقتها لمعايير العفة والرقابة الشرعية للمنصة بنجاح.',
    timestamp: new Date().toISOString(),
    recipientCode: recipientCode || 'MINHAJ-REPRESENTATIVE',
    status: 'VERIFIED_SHARIA_COMPLIANT',
  });
});

// 5. Smart Escrow Request (العربون الذكي 10% للتواصل مع الولي)
apiRouter.post('/marriage/escrow-request', enforceGenderIsolation, (req: Request, res: Response) => {
  const { profileCode, depositAmount = 250, notes } = req.body;
  const targetProfile = db.marriageProfiles.find((p) => p.code === profileCode);

  if (!targetProfile) {
    res.status(404).json({ error: 'الاستمارة المطلوبة غير موجودة.' });
    return;
  }

  res.json({
    success: true,
    escrowId: 'ESCROW-' + Math.floor(100000 + Math.random() * 900000),
    targetCode: targetProfile.code,
    depositAmount,
    status: 'ESCROW_LOCKED',
    guardianContactAuthorized: false,
    message: `تم حجز العربون الذكي بقيمة ${depositAmount} ج.م في حساب الضمان (Escrow). سيتم إرسال إشعار رسمي لولي أمر صاحبة/صاحب الكود (${targetProfile.code}) للموافقة على فتح نافذة الرؤية الشرعية. المبلغ محمي ولا يُصرف إلا بموافقة الطرفين.`,
    maskedWaliPhone: targetProfile.waliPhoneMasked,
  });
});

// 6. Hifz Plans Management
apiRouter.get('/hifz/plans', (req: Request, res: Response) => {
  res.json({
    success: true,
    plans: db.hifzPlans,
    completedCount: db.hifzPlans.filter((p) => p.isCompleted).length,
    totalCount: db.hifzPlans.length,
  });
});

apiRouter.post('/hifz/plans', (req: Request, res: Response) => {
  const { surahNumber, surahName, verseStart, verseEnd, targetDate, tajweedNotes } = req.body;
  const newPlan: HifzPlan = {
    id: 'hifz-' + (db.hifzPlans.length + 1),
    userId: 'usr-male-1',
    surahNumber: Number(surahNumber) || 2,
    surahName: surahName || 'سورة البقرة',
    verseStart: Number(verseStart) || 1,
    verseEnd: Number(verseEnd) || 10,
    targetDate: targetDate || new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
    isCompleted: false,
    tajweedNotes: tajweedNotes || 'مراجعة متقنة مع التطبيق العملي للغنن والمدود',
    repetitionCount: 0,
  };
  db.hifzPlans.unshift(newPlan);
  res.json({ success: true, plan: newPlan });
});

apiRouter.patch('/hifz/plans/:id/toggle', (req: Request, res: Response) => {
  const plan = db.hifzPlans.find((p) => p.id === req.params.id);
  if (!plan) {
    res.status(404).json({ error: 'الخطة غير موجودة.' });
    return;
  }
  plan.isCompleted = !plan.isCompleted;
  if (plan.isCompleted) {
    plan.repetitionCount += 1;
  }
  res.json({ success: true, plan });
});

// 7. Wallet & Viral Marketing Referral
apiRouter.get('/wallet', (req: Request, res: Response) => {
  const gender = (req.headers['user-gender'] || req.query.gender || 'male') as string;
  const userId = req.headers['x-user-id'] as string;
  let user = db.users.find(u => u.id === userId);
  if (!user) {
    user = db.users.find(u => u.gender === gender) || db.users[0];
  }
  const wallet = db.wallets.find(w => w.userId === user?.id) || db.wallets[0];
  res.json({
    success: true,
    wallet,
    referralLink: `https://minhaj.app/ref?code=${wallet.referralCode}`,
    rewardRules: {
      pointsPerApprovedMatch: 50,
      cashPerApprovedEscrow: '25.00 EGP / SAR',
      minimumWithdrawal: 100.0,
      note: 'لا تُحتسب نقاط الإحالة إلا عند إتمام المُحال لعملية فعلية (إتمام خطة تحفيظ أو دفع عربون شرعي) لضمان حماية النظام من الاحتيال.',
    },
    withdrawalRequests: db.withdrawalRequests.filter(w => !user || w.userId === user.id),
  });
});

apiRouter.post('/wallet/withdraw', (req: Request, res: Response) => {
  const { method, payoutAddress, amount } = req.body;
  const numAmount = Number(amount);

  if (!method || !payoutAddress) {
    res.status(400).json({ error: 'طريقة الدفع وبيانات الحساب مطلوبة.' });
    return;
  }

  if (numAmount < 100) {
    res.status(400).json({
      error: `عذراً: الحد الأدنى لطلب السحب هو 100.00 (المبلغ المدخل: ${numAmount}). يرجى زيادة رصيد الأرباح الفعلي أولاً.`,
    });
    return;
  }

  const wallet = db.wallets[0];
  if (wallet.earnedCash < numAmount) {
    res.status(400).json({
      error: `الرصيد المتاح للسحب (${wallet.earnedCash}) أقل من المبلغ المطلوب (${numAmount}).`,
    });
    return;
  }

  wallet.earnedCash -= numAmount;
  const newWithdrawal: WithdrawalRequest = {
    id: 'wd-' + (db.withdrawalRequests.length + 1),
    userId: wallet.userId,
    userName: 'عبد الرحمن الشافعي',
    method,
    payoutAddress,
    amount: numAmount,
    status: 'pending_approval',
    createdAt: new Date().toISOString(),
    notes: 'طلب سحب جديد قيد المراجعة الإدارية والتحقق المالي',
  };

  db.withdrawalRequests.unshift(newWithdrawal);
  res.json({
    success: true,
    message: 'تم رفع طلب السحب بنجاح إلى الإدارة المالية، وتتم المراجعة خلال 24 ساعة.',
    withdrawal: newWithdrawal,
    remainingCash: wallet.earnedCash,
  });
});

// 8. Admin Secret Backdoor & Settings
const isAuthorizedAdmin = (authKey: any) => {
  return (
    authKey === db.adminSettings.secretPassword ||
    authKey === 'mohamed2072' ||
    authKey === '000000'
  );
};

apiRouter.post('/admin/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const targetEmail = 'mohamedyoussef255@gmail.com';
  const targetPassword = 'mohamed2072';

  const inputEmail = (email || '').toString().trim().toLowerCase();
  const inputPassword = (password || '').toString().trim();

  // Strict authentication: ONLY mohamedyoussef255@gmail.com and mohamed2072
  if (inputEmail === targetEmail && inputPassword === targetPassword) {
    res.json({
      success: true,
      message: 'مرحباً بمدير النظام في منصة منهاج. تم فتح بوابة الإدارة والتحكم بنجاح.',
      settings: db.adminSettings,
      adminUser: {
        email: targetEmail,
        role: 'super_admin',
        name: 'محمد يوسف (المشرف العام)',
      },
    });
  } else {
    res.status(401).json({
      error: '❌ بيانات الدخول غير صحيحة! الدخول للوحة التحكم مقتصر حصرياً على البريد الإلكتروني: mohamedyoussef255@gmail.com وكلمة المرور المعتمدة.',
    });
  }
});

apiRouter.get('/admin/data', (req: Request, res: Response) => {
  const authKey = req.headers['x-admin-key'];
  if (!isAuthorizedAdmin(authKey)) {
    res.status(401).json({ error: 'غير مصرح للوصول إلى بيانات لوحة الإدارة.' });
    return;
  }

  res.json({
    success: true,
    settings: db.adminSettings,
    stats: {
      totalUsers: db.users.length,
      activeMarriageProfiles: db.marriageProfiles.length,
      totalHifzPlans: db.hifzPlans.length,
      pendingWithdrawals: db.withdrawalRequests.filter((w) => w.status === 'pending_approval').length,
      flaggedSecurityViolations: db.violations.length,
      totalCompetitions: db.competitions.length,
      activeCompetitions: db.competitions.filter((c) => c.status === 'active').length,
      totalRevenue: db.adminSettings.revenueFund.totalPlatformRevenue,
      rewardsPool: db.adminSettings.revenueFund.availablePrizePool,
    },
    withdrawalRequests: db.withdrawalRequests,
    violations: db.violations,
    profiles: db.marriageProfiles,
    paymentMethods: db.adminSettings.paymentMethods,
    revenueFund: db.adminSettings.revenueFund,
    competitions: db.competitions,
    selfPacedClaims: db.selfPacedClaims,
  });
});

// 9. Payment Methods & InstaPay Endpoints
apiRouter.get('/payment-methods', (_req: Request, res: Response) => {
  res.json({
    success: true,
    paymentMethods: db.adminSettings.paymentMethods,
  });
});

apiRouter.post('/admin/payment-methods', (req: Request, res: Response) => {
  const authKey = req.headers['x-admin-key'] as string;
  if (!isAuthorizedAdmin(authKey)) {
    res.status(401).json({ error: 'غير مصرح للوصول إلى إعدادات الدفع.' });
    return;
  }

  const { paymentMethods } = req.body;
  if (paymentMethods) {
    db.adminSettings.paymentMethods = {
      ...db.adminSettings.paymentMethods,
      ...paymentMethods,
    };
  }

  res.json({
    success: true,
    message: 'تم حفظ وتحديث بيانات انستاباي والمحافظ الإلكترونية والتحويل البنكي بنجاح.',
    paymentMethods: db.adminSettings.paymentMethods,
  });
});

// 10. Revenue Fund & Self-Paced Incentives
apiRouter.get('/revenue-fund', (_req: Request, res: Response) => {
  res.json({
    success: true,
    revenueFund: db.adminSettings.revenueFund,
  });
});

apiRouter.post('/admin/revenue-fund/update', (req: Request, res: Response) => {
  const authKey = req.headers['x-admin-key'] as string;
  if (!isAuthorizedAdmin(authKey)) {
    res.status(401).json({ error: 'غير مصرح للوصول إلى صندوق الإيرادات والجوائز.' });
    return;
  }

  const {
    rewardAllocationPercentage,
    totalPlatformRevenue,
    incentiveRates,
  } = req.body;

  const fund = db.adminSettings.revenueFund;
  if (rewardAllocationPercentage !== undefined) {
    fund.rewardAllocationPercentage = Number(rewardAllocationPercentage);
  }
  if (totalPlatformRevenue !== undefined) {
    fund.totalPlatformRevenue = Number(totalPlatformRevenue);
  }
  if (incentiveRates) {
    fund.incentiveRates = {
      ...fund.incentiveRates,
      ...incentiveRates,
    };
  }

  // Recalculate allocation and available pool
  fund.totalAllocatedForRewards = Math.round(
    fund.totalPlatformRevenue * (fund.rewardAllocationPercentage / 100)
  );
  fund.availablePrizePool = Math.max(
    0,
    fund.totalAllocatedForRewards - fund.totalDistributedToWinners
  );

  res.json({
    success: true,
    message: 'تم تحديث مخصص بند الإيرادات ومعدلات حوافز الحفظ بنجاح.',
    revenueFund: fund,
  });
});

// 11. Quran Memorization Competitions
apiRouter.get('/competitions', (req: Request, res: Response) => {
  const gender = req.query.gender as string;
  let comps = db.competitions;
  if (gender === 'male' || gender === 'female') {
    comps = comps.filter((c) => c.targetAudience === 'all' || c.targetAudience === gender);
  }
  res.json({
    success: true,
    competitions: comps,
    activeCount: comps.filter((c) => c.status === 'active').length,
    revenueFund: {
      availablePrizePool: db.adminSettings.revenueFund.availablePrizePool,
      rewardAllocationPercentage: db.adminSettings.revenueFund.rewardAllocationPercentage,
    },
  });
});

apiRouter.post('/competitions/:id/join', (req: Request, res: Response) => {
  const comp = db.competitions.find((c) => c.id === req.params.id);
  if (!comp) {
    res.status(404).json({ error: 'المسابقة غير موجودة.' });
    return;
  }

  const { userId, userName, gender, submissionNotes, submissionAudioUrl } = req.body;
  const participantName = userName || (gender === 'female' ? 'خديجة الأنصاري' : 'عبد الرحمن الشافعي');
  const participantUserId = userId || (gender === 'female' ? 'usr-female-1' : 'usr-male-1');
  const participantGender = gender === 'female' ? 'female' : 'male';

  const existingIdx = comp.participants.findIndex((p) => p.userId === participantUserId);
  if (existingIdx !== -1) {
    comp.participants[existingIdx].submissionNotes = submissionNotes || comp.participants[existingIdx].submissionNotes;
    comp.participants[existingIdx].submissionAudioUrl = submissionAudioUrl || comp.participants[existingIdx].submissionAudioUrl;
    comp.participants[existingIdx].status = 'submitted';
    res.json({
      success: true,
      message: 'تم تحديث مشاركتك في المسابقة وتأكيد إرسال التلاوة بنجاح!',
      participant: comp.participants[existingIdx],
      competition: comp,
    });
    return;
  }

  const newParticipant: CompetitionParticipant = {
    id: 'part-' + (comp.participants.length + 1) + '-' + Date.now(),
    userId: participantUserId,
    userName: participantName,
    gender: participantGender,
    registeredAt: new Date().toISOString(),
    submissionAudioUrl,
    submissionNotes: submissionNotes || 'تسميع مسجل ضمن ضوابط المسابقة',
    status: submissionAudioUrl || submissionNotes ? 'submitted' : 'registered',
  };

  comp.participants.push(newParticipant);
  comp.participantsCount = comp.participants.length;

  res.json({
    success: true,
    message: 'تهانينا! تم تسجيل مشاركتك في المسابقة بنجاح، وستتم مراجعة تلاوتك من قبل لجنة التحفيظ.',
    participant: newParticipant,
    competition: comp,
  });
});

apiRouter.post('/admin/competitions/create', (req: Request, res: Response) => {
  const authKey = req.headers['x-admin-key'] as string;
  if (!isAuthorizedAdmin(authKey)) {
    res.status(401).json({ error: 'غير مصرح بإقامة مسابقة جديدة.' });
    return;
  }

  const {
    title,
    frequency,
    targetAudience,
    occasionName,
    scopeDescription,
    surahTarget,
    juzTarget,
    versesTarget,
    endDateDays,
    prizePool,
    rewardPoints,
    firstPlacePrize,
    secondPlacePrize,
    thirdPlacePrize,
    rules,
  } = req.body;

  if (!title || !scopeDescription) {
    res.status(400).json({ error: 'عنوان المسابقة ومجال الحفظ المطلوب حقول إلزامية.' });
    return;
  }

  const days = Number(endDateDays) || (frequency === 'daily' ? 1 : frequency === 'weekly' ? 7 : 30);
  const totalPrize = Number(prizePool) || 1000;
  const first = Number(firstPlacePrize) || Math.round(totalPrize * 0.5);
  const second = Number(secondPlacePrize) || Math.round(totalPrize * 0.3);
  const third = Number(thirdPlacePrize) || Math.round(totalPrize * 0.2);

  const newComp: Competition = {
    id: 'comp-' + Date.now(),
    title: title.trim(),
    frequency: frequency || 'weekly',
    targetAudience: targetAudience || 'all',
    occasionName: occasionName ? occasionName.trim() : undefined,
    scopeDescription: scopeDescription.trim(),
    surahTarget: surahTarget ? Number(surahTarget) : undefined,
    juzTarget: juzTarget ? Number(juzTarget) : undefined,
    versesTarget: versesTarget ? versesTarget.trim() : undefined,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 86400000 * days).toISOString(),
    prizePool: totalPrize,
    rewardPoints: Number(rewardPoints) || totalPrize * 2.5,
    prizesBreakdown: {
      firstPlace: first,
      secondPlace: second,
      thirdPlace: third,
      consolationPrizes: Math.max(0, totalPrize - (first + second + third)),
    },
    rules: Array.isArray(rules) && rules.length > 0
      ? rules
      : [
          'الالتزام بقواعد التجويد ومخارج الحروف',
          'التسميع المباشر في غرف الحلقات أو تسجيل تلاوة نقية',
          'المسابقة معلنة لجميع رواد منصة منهاج من الرجال والنساء',
          'تُصرف الجوائز النقدية مباشرة من مخصص بند الإيرادات إلى المحافظ الرقمية',
        ],
    status: 'active',
    participantsCount: 0,
    participants: [],
    createdAt: new Date().toISOString(),
  };

  db.competitions.unshift(newComp);

  res.json({
    success: true,
    message: 'تمت صياغة وإطلاق المسابقة وإعلانها في كافة صفحات الرجال والنساء بنجاح!',
    competition: newComp,
  });
});

apiRouter.post('/admin/competitions/:id/award', (req: Request, res: Response) => {
  const authKey = req.headers['x-admin-key'] as string;
  if (!isAuthorizedAdmin(authKey)) {
    res.status(401).json({ error: 'غير مصرح للوصول إلى توزيع جوائز المسابقات.' });
    return;
  }

  const comp = db.competitions.find((c) => c.id === req.params.id);
  if (!comp) {
    res.status(404).json({ error: 'المسابقة غير موجودة.' });
    return;
  }

  const { winners } = req.body; // array of { place, userId, userName, gender, score, prizeCash, prizePoints }
  if (!Array.isArray(winners) || winners.length === 0) {
    res.status(400).json({ error: 'قائمة الفائزين غير محددة.' });
    return;
  }

  let totalPrizeAwarded = 0;
  comp.winners = winners.map((w: any) => {
    const cash = Number(w.prizeCash) || 0;
    const points = Number(w.prizePoints) || 0;
    totalPrizeAwarded += cash;

    // Credit winner's wallet
    let wallet = db.wallets.find((wl) => wl.userId === w.userId);
    if (!wallet) {
      wallet = db.wallets[0]; // fallback
    }
    if (wallet) {
      wallet.earnedCash += cash;
      wallet.availablePoints += points;
      wallet.updatedAt = new Date().toISOString();
    }

    // Mark participant as won
    const part = comp.participants.find((p) => p.userId === w.userId);
    if (part) {
      part.status = 'won';
      part.score = w.score || 98;
    }

    return {
      place: w.place,
      userId: w.userId,
      userName: w.userName,
      gender: w.gender || 'male',
      score: w.score || 98,
      prizeCash: cash,
      prizePoints: points,
      awardedAt: new Date().toISOString(),
    };
  });

  comp.status = 'completed';

  // Deduct from available prize pool and add to distributed
  const fund = db.adminSettings.revenueFund;
  fund.totalDistributedToWinners += totalPrizeAwarded;
  fund.availablePrizePool = Math.max(
    0,
    fund.totalAllocatedForRewards - fund.totalDistributedToWinners
  );

  res.json({
    success: true,
    message: `تم توزيع الجوائز النقدية بقيمة ${totalPrizeAwarded} ج.م/ر.س مباشرة من بند الإيرادات إلى محافظ الفائزين!`,
    competition: comp,
    revenueFund: fund,
  });
});

// In-memory record of unlocked perks
const userUnlockedPerks: Array<{
  userId: string;
  perkId: string;
  unlockedAt: string;
}> = [
  {
    userId: 'usr-male-1',
    perkId: 'perk-tajweed-ai',
    unlockedAt: new Date(Date.now() - 86400000).toISOString(),
  }
];

// Get perks status
apiRouter.get('/wallet/perks', (req: Request, res: Response) => {
  const userId = (req.query.userId || req.headers['x-user-id'] || 'usr-male-1') as string;
  const unlocked = userUnlockedPerks.filter(p => p.userId === userId).map(p => p.perkId);
  
  res.json({
    success: true,
    perks: AVAILABLE_POINT_PERKS.map(p => ({
      ...p,
      isUnlocked: unlocked.includes(p.id),
      unlockedAt: userUnlockedPerks.find(u => u.userId === userId && u.perkId === p.id)?.unlockedAt,
    })),
  });
});

// Redeem points to unlock feature
apiRouter.post('/wallet/redeem-perk', (req: Request, res: Response) => {
  const { userId, perkId, gender } = req.body;
  const targetUserId = userId || (gender === 'female' ? 'usr-female-1' : 'usr-male-1');
  
  const perk = AVAILABLE_POINT_PERKS.find(p => p.id === perkId);
  if (!perk) {
    res.status(404).json({ error: 'الميزة المطلوبة غير متوفرة.' });
    return;
  }

  let wallet = db.wallets.find((w) => w.userId === targetUserId) || db.wallets[0];

  if (wallet.availablePoints < perk.pointsCost) {
    res.status(400).json({
      error: `نقاطك الحالية (${wallet.availablePoints}) غير كافية لفتح هذه الميزة. تحتاج إلى ${perk.pointsCost} نقطة. احفظ مزيداً من الآيات والسور لجمع النقاط!`
    });
    return;
  }

  // Deduct points
  wallet.availablePoints -= perk.pointsCost;
  wallet.updatedAt = new Date().toISOString();

  // If already unlocked, refresh or confirm
  const existing = userUnlockedPerks.find(u => u.userId === targetUserId && u.perkId === perkId);
  if (!existing) {
    userUnlockedPerks.push({
      userId: targetUserId,
      perkId,
      unlockedAt: new Date().toISOString(),
    });
  }

  // Apply real effects if applicable
  if (perkId === 'perk-tier-gold') {
    const user = db.users.find(u => u.id === targetUserId);
    if (user) {
      user.currentTier = 'gold';
    }
    const profile = db.marriageProfiles.find(p => p.userId === targetUserId);
    if (profile) {
      profile.packageTier = 'gold';
      profile.isPinned = true;
    }
  }

  res.json({
    success: true,
    message: `بارك الله فيك! تم بنجاح استبدال ${perk.pointsCost} نقطة وفتح ميزة: "${perk.title}". يمكنك الآن الاستفادة منها مباشرة داخل التطبيق.`,
    wallet,
    perkId,
    availablePoints: wallet.availablePoints,
  });
});

// 12. Self-Paced Memorization Incentives Claims (حفظ آية، سورة، جزء، القرآن كله - نقاط قرآنية حصراً)
apiRouter.post('/hifz/claim-self-incentive', (req: Request, res: Response) => {
  const { userId, type, count, title, gender } = req.body;
  const claimType = (type || 'ayah') as 'ayah' | 'surah' | 'juz' | 'khatmah';
  const claimCount = Number(count) || 1;

  // Pure Quranic Points Scheme (نقاط بركة الحفظ الخالصة بدون أي تعامل مالي على الحفظ)
  let pointsAwarded = 0;

  if (claimType === 'ayah') {
    pointsAwarded = 10 * claimCount; // 10 points per Ayah
  } else if (claimType === 'surah') {
    pointsAwarded = 250 * claimCount; // 250 points per Surah
  } else if (claimType === 'juz') {
    pointsAwarded = 3000 * claimCount; // 3,000 points per Juz
  } else if (claimType === 'khatmah') {
    pointsAwarded = 100000 * claimCount; // 100,000 points for Complete Khatmah
  }

  // Credit user's wallet points
  const targetUserId = userId || (gender === 'female' ? 'usr-female-1' : 'usr-male-1');
  const targetUserName = gender === 'female' ? 'خديجة الأنصاري' : 'عبد الرحمن الشافعي';
  let wallet = db.wallets.find((w) => w.userId === targetUserId);
  if (!wallet) {
    wallet = db.wallets[0];
  }

  wallet.availablePoints += pointsAwarded;
  wallet.updatedAt = new Date().toISOString();

  const newClaim: SelfPacedMilestoneClaim = {
    id: 'claim-' + Date.now(),
    userId: targetUserId,
    userName: targetUserName,
    type: claimType,
    title: title || (claimType === 'ayah' ? `حفظ ${claimCount} آية مباركة` : claimType === 'surah' ? 'حفظ سورة مباركة' : claimType === 'juz' ? 'إتمام جزء كامل' : 'ختم القرآن الكريم كاملاً'),
    count: claimCount,
    pointsEarned: pointsAwarded,
    cashEarned: 0,
    timestamp: new Date().toISOString(),
  };

  db.selfPacedClaims.unshift(newClaim);

  res.json({
    success: true,
    message: `هنيئاً لك بحفظ كلام الله! أضيفت لك ${pointsAwarded} نقطة من نقاط الحفظ في رصيدك (رصيدك الحالي: ${wallet.availablePoints} نقطة) لتفتح وتستفيد بها من كافة مميزات وخدمات منصة منهاج.`,
    claim: newClaim,
    wallet,
  });
});

apiRouter.post('/admin/update-settings', (req: Request, res: Response) => {
  const {
    secretPassword,
    newPassword,
    silverTokens,
    goldTokens,
    platinumTokens,
    packages,
  } = req.body;

  if (secretPassword && secretPassword !== db.adminSettings.secretPassword) {
    res.status(401).json({ error: 'الرمز السري الحالي غير صحيح.' });
    return;
  }

  if (newPassword && newPassword.trim().length >= 4) {
    db.adminSettings.secretPassword = newPassword.trim();
  }
  if (silverTokens) db.adminSettings.silverTokens = Number(silverTokens);
  if (goldTokens) db.adminSettings.goldTokens = Number(goldTokens);
  if (platinumTokens) db.adminSettings.platinumTokens = Number(platinumTokens);

  if (Array.isArray(packages)) {
    db.adminSettings.marriagePackages = packages;
  }

  res.json({
    success: true,
    message: 'تم تحديث إعدادات باقات الائتمان وباقات الزواج والرمز السري بنجاح.',
    settings: db.adminSettings,
  });
});

apiRouter.post('/admin/packages/update', (req: Request, res: Response) => {
  const authKey = req.headers['x-admin-key'] as string;
  if (!isAuthorizedAdmin(authKey)) {
    res.status(401).json({ error: 'غير مصرح للوصول إلى تعديل باقات الزواج.' });
    return;
  }

  const { packages, updatedPackage } = req.body;
  if (Array.isArray(packages)) {
    db.adminSettings.marriagePackages = packages;
  } else if (updatedPackage && updatedPackage.id) {
    const idx = db.adminSettings.marriagePackages.findIndex((p) => p.id === updatedPackage.id);
    if (idx !== -1) {
      db.adminSettings.marriagePackages[idx] = {
        ...db.adminSettings.marriagePackages[idx],
        ...updatedPackage,
      };
    }
  }

  res.json({
    success: true,
    message: 'تم حفظ تعديلات باقات الزواج بنجاح.',
    packages: db.adminSettings.marriagePackages,
  });
});

apiRouter.post('/admin/withdrawals/:id/action', (req: Request, res: Response) => {
  const { action, notes } = req.body;
  const wd = db.withdrawalRequests.find((w) => w.id === req.params.id);
  if (!wd) {
    res.status(404).json({ error: 'طلب السحب غير موجود.' });
    return;
  }

  if (action === 'approve') {
    wd.status = 'approved';
    wd.notes = notes || 'تمت الموافقة والتحويل البنكي/المحفظة بنجاح.';
  } else if (action === 'reject') {
    wd.status = 'rejected';
    wd.notes = notes || 'تم رفض الطلب لعدم اكتمال شروط الإحالة الشرعية.';
    // Refund the amount to wallet
    const wallet = db.wallets.find((w) => w.userId === wd.userId);
    if (wallet) {
      wallet.earnedCash += wd.amount;
    }
  }

  res.json({ success: true, withdrawal: wd });
});

// Reset Demo Data for Users
apiRouter.post('/admin/reset-demo-data', (req: Request, res: Response) => {
  const authKey = req.headers['x-admin-key'] as string;
  if (!isAuthorizedAdmin(authKey)) {
    res.status(401).json({ error: 'غير مصرح للوصول إلى عملية مسح البيانات التجريبية.' });
    return;
  }

  // 1. Reset Violations to clean baseline audit
  db.violations = [
    {
      id: 'violation-demo-base',
      timestamp: new Date().toISOString(),
      senderGender: 'male',
      message: 'رقم هاتف تجريبي 01012345678',
      detectedKeywords: ['01012345678'],
      reason: 'جدار حماية العفة: حظر تبادل أرقام الهواتف أو الروابط قبل إيداع العربون الشرعي (Escrow 10%).',
    },
  ];

  // 2. Reset Withdrawal Requests
  db.withdrawalRequests = [
    {
      id: 'wd-sample-1',
      userId: 'usr-male-1',
      userName: 'عبد الرحمن الشافعي',
      method: 'instapay',
      payoutAddress: 'abdurrahman@instapay',
      amount: 150.00,
      status: 'pending_approval',
      createdAt: new Date().toISOString(),
      notes: 'طلب سحب رصيد حوافز الحفظ والإحالات الشرعية قيد المراجعة',
    },
  ];

  // 3. Reset Self-Paced Claims
  db.selfPacedClaims = [];

  // 4. Reset User Wallets
  if (db.wallets && db.wallets.length > 0) {
    db.wallets[0].availablePoints = 350;
    db.wallets[0].earnedCash = 120.00;
    db.wallets[0].successfulReferralsCount = 2;
    db.wallets[0].updatedAt = new Date().toISOString();
  }

  // 5. Clean up extra user marriage profiles beyond baseline 6
  if (db.marriageProfiles.length > 6) {
    db.marriageProfiles = db.marriageProfiles.slice(0, 6);
  }

  // 6. Reset competition participant demo submissions
  db.competitions.forEach((comp) => {
    if (comp.participants) {
      comp.participants = comp.participants.filter(p => p.id === 'part-1' || p.id === 'part-2');
    }
  });

  res.json({
    success: true,
    message: '✅ تم مسح البيانات التجريبية للمستخدمين وتصفير سجلات الاختبار وإعادة تهيئة النظام بنجاح.',
    stats: {
      totalUsers: db.users.length,
      activeMarriageProfiles: db.marriageProfiles.length,
      totalHifzPlans: db.hifzPlans.length,
      pendingWithdrawals: db.withdrawalRequests.filter((w) => w.status === 'pending_approval').length,
      flaggedSecurityViolations: db.violations.length,
      totalCompetitions: db.competitions.length,
      activeCompetitions: db.competitions.filter((c) => c.status === 'active').length,
      totalRevenue: db.adminSettings.revenueFund.totalPlatformRevenue,
      rewardsPool: db.adminSettings.revenueFund.availablePrizePool,
    },
  });
});

// 9. Return Full PostgreSQL Schema
apiRouter.get('/admin/schema', (_req: Request, res: Response) => {
  const sql = `-- ============================================================================
-- MINHAJ POSTGRESQL DATABASE SCHEMA (PRODUCTION DDL)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum Types
CREATE TYPE user_gender AS ENUM ('male', 'female');
CREATE TYPE marital_status_enum AS ENUM ('single', 'widowed', 'divorced', 'polygamy');
CREATE TYPE subscription_tier_enum AS ENUM ('free', 'silver', 'gold', 'platinum');
CREATE TYPE withdrawal_status_enum AS ENUM ('pending_approval', 'approved', 'rejected');
CREATE TYPE escrow_status_enum AS ENUM ('pending_deposit', 'held_in_escrow', 'released_to_wali', 'refunded');

-- Users Core Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    gender user_gender NOT NULL,
    age INT NOT NULL CHECK (age >= 18),
    current_tier subscription_tier_enum DEFAULT 'free',
    tokens_balance INT DEFAULT 0 CHECK (tokens_balance >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Wallets & Viral Growth Engine
CREATE TABLE user_wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    available_points INT DEFAULT 0 CHECK (available_points >= 0),
    earned_cash DECIMAL(10, 2) DEFAULT 0.00 CHECK (earned_cash >= 0.00),
    referral_code VARCHAR(50) UNIQUE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Financial Withdrawal Requests
CREATE TABLE withdrawal_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    method VARCHAR(50) NOT NULL,
    payout_address VARCHAR(150) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 100.00),
    status withdrawal_status_enum DEFAULT 'pending_approval',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Quran Hifz Plans & Audio Recording Logs
CREATE TABLE hifz_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    surah_number INT NOT NULL CHECK (surah_number BETWEEN 1 AND 114),
    verse_start INT NOT NULL,
    verse_end INT NOT NULL,
    target_date DATE NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    audio_recording_url TEXT,
    tajweed_feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sharia Marriage Profiles with Strict Gender Isolation
CREATE TABLE marriage_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    code VARCHAR(20) UNIQUE NOT NULL,
    gender user_gender NOT NULL,
    marital_status marital_status_enum NOT NULL,
    job VARCHAR(150) NOT NULL,
    qualifications TEXT NOT NULL,
    specifications JSONB NOT NULL,
    partner_requirements JSONB NOT NULL,
    national_id_verified BOOLEAN DEFAULT FALSE,
    wali_phone VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Smart Escrow (10% Deposit) for Wali Contact Authorization
CREATE TABLE marriage_escrows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_id UUID REFERENCES users(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES marriage_profiles(id) ON DELETE CASCADE,
    deposit_amount DECIMAL(10, 2) NOT NULL CHECK (deposit_amount > 0),
    status escrow_status_enum DEFAULT 'held_in_escrow',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- System Admin Configuration & Secret Key Vault
CREATE TABLE admin_settings (
    id INT PRIMARY KEY DEFAULT 1,
    secret_password VARCHAR(100) DEFAULT '000000',
    silver_tokens INT DEFAULT 100,
    gold_tokens INT DEFAULT 300,
    platinum_tokens INT DEFAULT 1000,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Security Chat Firewall Audit Logs
CREATE TABLE chat_firewall_audit (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
    raw_message TEXT NOT NULL,
    detected_violations TEXT[] NOT NULL,
    blocked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO admin_settings (id, secret_password, silver_tokens, gold_tokens, platinum_tokens) 
VALUES (1, '000000', 100, 300, 1000) 
ON CONFLICT (id) DO NOTHING;

-- Production High-Performance Indexes
CREATE INDEX idx_users_gender ON users(gender);
CREATE INDEX idx_marriage_gender_status ON marriage_profiles(gender, marital_status);
CREATE INDEX idx_hifz_user_target ON hifz_plans(user_id, target_date);
CREATE INDEX idx_wallets_user ON user_wallets(user_id);
`;

  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.send(sql);
});

// =========================================================================
// Islamic References & Canonical Knowledge Base Endpoints (المراجع والمصادر الموثوقة)
// =========================================================================
let storedIslamicReferences: IslamicReference[] = [...INITIAL_ISLAMIC_REFERENCES];

// Get all verified and uploaded references
apiRouter.get('/references', (req: Request, res: Response) => {
  res.json({
    success: true,
    count: storedIslamicReferences.length,
    references: storedIslamicReferences,
  });
});

// Add / Upload new reference or e-book
apiRouter.post('/references', (req: Request, res: Response) => {
  const {
    title,
    author,
    investigatorOrEditor,
    category,
    categoryLabelAr,
    categoryLabelEn,
    publisher,
    edition,
    publicationYearHijri,
    publicationYearGregorian,
    volumesCount,
    totalPages,
    isbnOrId,
    appUsageScope,
    appUsageScopeEn,
    summary,
    summaryEn,
    citationFormat,
    sampleChaptersOrExcerpt,
    ebookFile,
  } = req.body;

  if (!title || !author) {
    return res.status(400).json({
      success: false,
      error: 'عنوان الكتاب واسم المؤلف مطلوبان لإتمام التوثيق العلمي للمرجع',
    });
  }

  const newRef: IslamicReference = {
    id: `ref-user-${Date.now()}`,
    title: String(title).trim(),
    author: String(author).trim(),
    investigatorOrEditor: investigatorOrEditor ? String(investigatorOrEditor).trim() : undefined,
    category: category || 'fiqh_marriage',
    categoryLabelAr: categoryLabelAr || 'فقه وأحكام شرعية',
    categoryLabelEn: categoryLabelEn || 'Islamic Jurisprudence',
    publisher: publisher ? String(publisher).trim() : 'دار نشر معتمدة',
    edition: edition ? String(edition).trim() : 'الطبعة الأولى',
    publicationYearHijri: publicationYearHijri ? String(publicationYearHijri).trim() : undefined,
    publicationYearGregorian: publicationYearGregorian ? String(publicationYearGregorian).trim() : undefined,
    volumesCount: Number(volumesCount) || 1,
    totalPages: Number(totalPages) || undefined,
    isbnOrId: isbnOrId ? String(isbnOrId).trim() : undefined,
    verificationStatus: 'verified_authentic',
    verificationBadgeAr: 'مرجع موثق معتمد',
    verificationBadgeEn: 'Verified Source',
    appUsageScope: appUsageScope || 'يستند عليه التطبيق في ترسيخ الضوابط الشرعية والاستدلال بالأحكام المعتمدة.',
    appUsageScopeEn: appUsageScopeEn || 'Consulted by Minhaj for Sharia compliance, rulings, and verified citations.',
    summary: summary || 'مرجع إسلامي موثق يستعين به التطبيق في استقاء المعلومات وتوثيق الأحكام الشرعية.',
    summaryEn: summaryEn || 'Verified Islamic scholarly source consulted by Minhaj platform for authentic rulings.',
    citationFormat: citationFormat || `${author}. ${title}. ${publisher ? publisher + '، ' : ''}${edition || ''}.`,
    sampleChaptersOrExcerpt: Array.isArray(sampleChaptersOrExcerpt) && sampleChaptersOrExcerpt.length > 0
      ? sampleChaptersOrExcerpt
      : [
          {
            chapterTitle: 'الفصل التمهيدي في الأحكام الشرعية والضوابط المنضبطة',
            page: 1,
            textExcerpt: 'بيان الضوابط الشرعية المعتمدة ومقاصد الشريعة الإسلامية في حفظ الدين والنفس والعقل والعرض والمال.',
            rulingOrBenefit: 'الاستدلال والتأصيل المقاصدي لمنهجية التطبيق.',
          }
        ],
    ebookFile: ebookFile || undefined,
    addedAt: new Date().toISOString(),
    isOfficialCurated: false,
  };

  storedIslamicReferences.unshift(newRef);

  res.status(201).json({
    success: true,
    message: 'تم إضافة المرجع والكتاب الإلكتروني بنجاح إلى مصادر التطبيق المعتمدة',
    reference: newRef,
  });
});

// Delete reference (if user-contributed)
apiRouter.delete('/references/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const initialLength = storedIslamicReferences.length;
  storedIslamicReferences = storedIslamicReferences.filter((r) => r.id !== id);

  if (storedIslamicReferences.length < initialLength) {
    res.json({ success: true, message: 'تم إزالة المرجع بنجاح' });
  } else {
    res.status(404).json({ success: false, error: 'المرجع غير موجود' });
  }
});

