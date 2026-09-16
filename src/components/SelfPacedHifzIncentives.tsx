import React, { useState, useEffect } from 'react';
import {
  Coins,
  Sparkles,
  CheckCircle,
  Trophy,
  BookOpen,
  Award,
  ShieldCheck,
  Crown,
  Mic,
  Gift,
  ArrowRight,
  Lock,
  Unlock,
  Layers,
  Star,
} from 'lucide-react';
import { RevenueAndRewardFund, PointPerk, AVAILABLE_POINT_PERKS } from '../types';

interface SelfPacedHifzIncentivesProps {
  fund?: RevenueAndRewardFund;
  userWallet: any;
  userGender: 'male' | 'female';
  theme: 'dark' | 'light';
  onClaimIncentive: (
    type: 'ayah' | 'surah' | 'juz' | 'khatmah',
    count: number,
    title: string
  ) => Promise<{ success: boolean; message: string; points: number; cash: number }>;
  onPerkUnlocked?: (perkId: string) => void;
}

export function SelfPacedHifzIncentives({
  fund,
  userWallet,
  userGender,
  theme,
  onClaimIncentive,
  onPerkUnlocked,
}: SelfPacedHifzIncentivesProps) {
  const [claimingType, setClaimingType] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [customAyahCount, setCustomAyahCount] = useState<number>(5);

  // Perks state
  const [perks, setPerks] = useState<Array<PointPerk & { isUnlocked?: boolean }>>(AVAILABLE_POINT_PERKS);
  const [redeemingPerkId, setRedeemingPerkId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'earn' | 'redeem'>('earn');

  const isDark = theme === 'dark';

  // Points rates
  const rates = {
    pointsPerAyah: 10,
    pointsPerSurah: 250,
    pointsPerJuz: 3000,
    pointsPerKhatmah: 100000,
  };

  const userPoints = userWallet?.availablePoints || 0;

  // Fetch perks status on mount
  useEffect(() => {
    fetch('/api/wallet/perks')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.perks) {
          setPerks(data.perks);
        }
      })
      .catch(() => {
        // Keep fallback
      });
  }, []);

  const handleClaim = async (
    type: 'ayah' | 'surah' | 'juz' | 'khatmah',
    count: number,
    title: string
  ) => {
    setClaimingType(type);
    setSuccessNotice(null);
    try {
      const res = await onClaimIncentive(type, count, title);
      setSuccessNotice(res.message);
    } catch (e: any) {
      setSuccessNotice('حدث خطأ أثناء حصد النقاط، يرجى المحاولة لاحقاً.');
    } finally {
      setClaimingType(null);
    }
  };

  const handleRedeemPerk = async (perk: PointPerk & { isUnlocked?: boolean }) => {
    if (perk.isUnlocked) {
      setSuccessNotice(`هذه الميزة ("${perk.title}") مفتوحة ومفعلة بالفعل في حسابك!`);
      return;
    }

    if (userPoints < perk.pointsCost) {
      setSuccessNotice(`عذراً، رصيدك الحالي (${userPoints} نقطة) لا يكفي. تحتاج إلى ${perk.pointsCost} نقطة. احفظ مزيداً من الآيات لجمع النقاط!`);
      return;
    }

    setRedeemingPerkId(perk.id);
    setSuccessNotice(null);
    try {
      const res = await fetch('/api/wallet/redeem-perk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          perkId: perk.id,
          gender: userGender,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessNotice(data.message);
        setPerks(prev =>
          prev.map(p => (p.id === perk.id ? { ...p, isUnlocked: true } : p))
        );
        if (userWallet) {
          userWallet.availablePoints = data.availablePoints;
        }
        if (onPerkUnlocked) {
          onPerkUnlocked(perk.id);
        }
      } else {
        setSuccessNotice(data.error || 'تعذر استبدال النقاط حالياً.');
      }
    } catch (e: any) {
      setSuccessNotice('حدث خطأ في الاتصال بالخادم، يرجى إعادة المحاولة.');
    } finally {
      setRedeemingPerkId(null);
    }
  };

  return (
    <div
      id="self-paced-hifz-incentives"
      className={`rounded-3xl border p-5 sm:p-6 space-y-6 transition-all shadow-xl ${
        isDark
          ? 'bg-gradient-to-b from-[#092230] via-[#071923] to-[#040f16] border-[#0891b2]/40 text-stone-100'
          : 'bg-gradient-to-b from-cyan-50/40 via-white to-stone-50 border-[#cde2ec] text-[#0a2737]'
      }`}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cyan-500/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-amber-400">
                برنامج نقاط بركة الحفظ والمكافآت القرآنية
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                نقاط تفتح لك كافة مميزات التطبيق
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              كل آية أو سورة تحفظها تتحول فورياً إلى نقاط بركة في رصيدك تمكنك من فتح المميزات، طلب الولي الشرعي، وترقية الحساب.
            </p>
          </div>
        </div>

        {/* User Current Points Balance */}
        <div className="flex items-center gap-3 bg-black/40 border border-amber-500/30 px-4 py-2.5 rounded-2xl shadow-inner shrink-0">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-stone-400 block">رصيد نقاط حفظك الحالي:</span>
            <span className="text-base font-mono font-black text-amber-400">
              {userPoints.toLocaleString()} <span className="text-xs font-normal">نقطة مِنهـاج</span>
            </span>
          </div>
        </div>
      </div>

      {/* Tabs: Earn Points vs Redeem Perks */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-black/30 border border-stone-800 max-w-md">
        <button
          onClick={() => setActiveTab('earn')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold text-xs transition-all ${
            activeTab === 'earn'
              ? 'bg-amber-500 text-stone-950 shadow-md'
              : 'text-stone-400 hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>كسب نقاط الحفظ (٤ مستويات)</span>
        </button>
        <button
          onClick={() => setActiveTab('redeem')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold text-xs transition-all relative ${
            activeTab === 'redeem'
              ? 'bg-cyan-500 text-stone-950 shadow-md'
              : 'text-stone-400 hover:text-white'
          }`}
        >
          <Gift className="w-4 h-4" />
          <span>استبدال النقاط وفتح المميزات</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </button>
      </div>

      {successNotice && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/90 border border-emerald-700 text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 1: EARN HIFZ POINTS                                                  */}
      {/* ========================================================================= */}
      {activeTab === 'earn' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* 1. حفظ آيات */}
            <div
              className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 ${
                isDark ? 'bg-stone-900/90 border-stone-800' : 'bg-white border-stone-200'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs">
                    ١
                  </span>
                  <span className="text-[10px] font-mono text-amber-400 font-bold">
                    +{rates.pointsPerAyah} نقاط / آية
                  </span>
                </div>
                <h4 className="font-bold text-stone-100 text-sm">حفظ آيات جديدة</h4>
                <p className="text-[11px] text-stone-400">
                  {rates.pointsPerAyah} نقاط تودع فورياً في محفظتك لكل آية تحفظها وتثبتها.
                </p>

                {/* Stepper */}
                <div className="flex items-center justify-between bg-black/40 p-2 rounded-xl border border-stone-800 text-xs">
                  <span className="text-stone-400">عدد الآيات:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCustomAyahCount(Math.max(1, customAyahCount - 1))}
                      className="w-6 h-6 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold"
                    >
                      -
                    </button>
                    <span className="font-mono text-amber-400 font-bold">{customAyahCount}</span>
                    <button
                      onClick={() => setCustomAyahCount(customAyahCount + 1)}
                      className="w-6 h-6 rounded bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={() =>
                  handleClaim(
                    'ayah',
                    customAyahCount,
                    `حفظ ${customAyahCount} آيات من القرآن الكريم`
                  )
                }
                disabled={claimingType === 'ayah'}
                className="w-full py-2 bg-stone-800 hover:bg-amber-600 hover:text-stone-950 text-stone-200 font-bold text-xs rounded-xl transition-all shadow"
              >
                {claimingType === 'ayah' ? 'جاري الإيداع...' : `إضافة +${customAyahCount * rates.pointsPerAyah} نقطة`}
              </button>
            </div>

            {/* 2. حفظ سورة كاملة */}
            <div
              className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 ${
                isDark ? 'bg-stone-900/90 border-stone-800' : 'bg-white border-stone-200'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
                    ٢
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">
                    +{rates.pointsPerSurah} نقطة / سورة
                  </span>
                </div>
                <h4 className="font-bold text-stone-100 text-sm">حفظ سورة كاملة</h4>
                <p className="text-[11px] text-stone-400">
                  {rates.pointsPerSurah} نقطة مكافأة إتمام سورة متكاملة مع مراعاة التجويد وأحكام التلاوة.
                </p>
              </div>

              <button
                onClick={() =>
                  handleClaim('surah', 1, 'إتمام حفظ سورة كاملة من كتاب الله')
                }
                disabled={claimingType === 'surah'}
                className="w-full py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition-all shadow"
              >
                {claimingType === 'surah' ? 'جاري الإيداع...' : `حصد مكافأة السورة (+${rates.pointsPerSurah} نقطة)`}
              </button>
            </div>

            {/* 3. حفظ جزء كامل */}
            <div
              className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 ${
                isDark ? 'bg-stone-900/90 border-amber-500/30' : 'bg-amber-50 border-amber-200'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-7 h-7 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold text-xs">
                    ٣
                  </span>
                  <span className="text-[10px] font-mono text-amber-400 font-bold">
                    +{rates.pointsPerJuz.toLocaleString()} نقطة / جزء
                  </span>
                </div>
                <h4 className="font-bold text-amber-400 text-sm">إتمام حفظ جزء كامل</h4>
                <p className="text-[11px] text-stone-400">
                  {rates.pointsPerJuz.toLocaleString()} نقطة + وسام إتقان الجزء مع إمكانية استخراج شهادة رقمية.
                </p>
              </div>

              <button
                onClick={() =>
                  handleClaim('juz', 1, 'إتمام حفظ جزء كامل من القرآن الكريم')
                }
                disabled={claimingType === 'juz'}
                className="w-full py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl transition-all shadow"
              >
                {claimingType === 'juz' ? 'جاري الإيداع...' : `حصد مكافأة الجزء (+${rates.pointsPerJuz.toLocaleString()} نقطة)`}
              </button>
            </div>

            {/* 4. الختمة الكبرى */}
            <div
              className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 bg-gradient-to-br from-amber-500/20 via-stone-900 to-emerald-950/40 border-amber-400/50 shadow-lg`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Trophy className="w-5 h-5 text-amber-400 animate-bounce" />
                  <span className="text-[10px] font-mono text-amber-300 font-bold">
                    تاج الوقار
                  </span>
                </div>
                <h4 className="font-bold text-amber-300 text-sm">ختم القرآن كاملاً</h4>
                <p className="text-[11px] text-stone-300">
                  +{rates.pointsPerKhatmah.toLocaleString()} نقطة تفتح لك كافة مميزات منصة منهاج مدى الحياة مجاناً وتكريم شرفي.
                </p>
              </div>

              <button
                onClick={() =>
                  handleClaim(
                    'khatmah',
                    1,
                    'ختم كتاب الله كاملاً (30 جزءاً مباركاً)'
                  )
                }
                disabled={claimingType === 'khatmah'}
                className="w-full py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-stone-950 font-bold text-xs rounded-xl transition-all shadow-md"
              >
                {claimingType === 'khatmah' ? 'جاري الإيداع...' : `حصد نقاط الختمة (+${rates.pointsPerKhatmah.toLocaleString()} نقطة)`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: REDEEM POINTS STORE (سوق الميزات المستحقة بالنقاط)                 */}
      {/* ========================================================================= */}
      {activeTab === 'redeem' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-cyan-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>المميزات الحصرية المتاحة للفتح بنقاط الحفظ:</span>
            </h4>
            <span className="text-xs text-stone-400">
              اختر الميزة وانقر استبدال لاستخدامها فورياً
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {perks.map((perk) => {
              const canAfford = userPoints >= perk.pointsCost;
              const isUnlocked = perk.isUnlocked;

              return (
                <div
                  key={perk.id}
                  className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 transition-all ${
                    isUnlocked
                      ? 'bg-emerald-950/30 border-emerald-500/50 text-stone-200'
                      : canAfford
                      ? isDark
                        ? 'bg-stone-900/90 border-cyan-500/40 hover:border-cyan-400'
                        : 'bg-white border-cyan-300 shadow-sm'
                      : isDark
                      ? 'bg-stone-950/60 border-stone-800 opacity-75'
                      : 'bg-stone-50 border-stone-200 opacity-75'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                        {perk.badge}
                      </span>
                      <span className="text-xs font-mono font-bold text-amber-400">
                        {perk.pointsCost} نقطة
                      </span>
                    </div>

                    <h5 className="font-bold text-sm text-stone-100 flex items-center gap-1.5">
                      {perk.id.includes('wali') && <ShieldCheck className="w-4 h-4 text-emerald-400" />}
                      {perk.id.includes('gold') && <Crown className="w-4 h-4 text-amber-400" />}
                      {perk.id.includes('recitation') && <Mic className="w-4 h-4 text-cyan-400" />}
                      {perk.id.includes('certificate') && <Award className="w-4 h-4 text-amber-300" />}
                      {perk.id.includes('competition') && <Trophy className="w-4 h-4 text-amber-400" />}
                      {perk.id.includes('tajweed') && <Sparkles className="w-4 h-4 text-cyan-300" />}
                      <span>{perk.title}</span>
                    </h5>

                    <p className="text-[11px] text-stone-400 leading-relaxed">
                      {perk.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-stone-800/80">
                    {isUnlocked ? (
                      <button
                        disabled
                        className="w-full py-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>ميزة مفعلة بحسابك</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRedeemPerk(perk)}
                        disabled={redeemingPerkId === perk.id || !canAfford}
                        className={`w-full py-2 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 shadow ${
                          canAfford
                            ? 'bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white'
                            : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                        }`}
                      >
                        {redeemingPerkId === perk.id ? (
                          <span>جاري الفتح...</span>
                        ) : canAfford ? (
                          <>
                            <Unlock className="w-3.5 h-3.5" />
                            <span>استبدال وفتح الميزة ({perk.pointsCost} نقطة)</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5" />
                            <span>تحتاج {perk.pointsCost - userPoints} نقطة إضافية</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-stone-400 pt-3 border-t border-stone-800/60 gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>نقاط الحفظ شرعية وخالصة لوجه الله، وتُستخدم حصرياً لتيسير خدمات المنصة القرآنية والزواج الشرعي.</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-amber-400">
          <Sparkles className="w-3.5 h-3.5" />
          <span>إجمالي نقاطك: {userPoints}</span>
        </div>
      </div>
    </div>
  );
}
