import React, { useState } from 'react';
import {
  Crown,
  Check,
  Sparkles,
  ShieldCheck,
  Star,
  Zap,
  PhoneCall,
  Clock,
  Award,
  ChevronLeft,
  X,
  Lock,
} from 'lucide-react';
import { MarriagePackage } from '../types';
import { CreditCard } from 'lucide-react';

interface MarriagePackagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  packages: MarriagePackage[];
  currentUserProfileCode?: string;
  onSubscribePackage: (pkg: MarriagePackage) => Promise<void>;
  onOpenPaymentMethods?: (purpose?: string, amount?: number) => void;
  theme: 'dark' | 'light';
  userGender: 'male' | 'female';
}

export function MarriagePackagesModal({
  isOpen,
  onClose,
  packages,
  currentUserProfileCode,
  onSubscribePackage,
  onOpenPaymentMethods,
  theme,
  userGender,
}: MarriagePackagesModalProps) {
  const [subscribingId, setSubscribingId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const isDark = theme === 'dark';

  const handleSubscribe = async (pkg: MarriagePackage) => {
    setSubscribingId(pkg.id);
    setSuccessMessage(null);
    try {
      await onSubscribePackage(pkg);
      setSuccessMessage(`تم الاشتراك في ${pkg.name} بنجاح وتحديث صلاحيات الظهور والاستمارة!`);
    } catch (e) {
      console.error(e);
    } finally {
      setSubscribingId(null);
    }
  };

  return (
    <div
      id="marriage-packages-modal"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      dir="rtl"
    >
      <div
        className={`w-full max-w-4xl max-h-[92vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 ${
          isDark
            ? 'bg-stone-900 border-amber-500/40 text-stone-100'
            : 'bg-stone-50 border-amber-500/30 text-stone-900'
        }`}
      >
        {/* Header */}
        <div
          className={`p-4 sm:p-5 border-b flex items-center justify-between ${
            isDark ? 'bg-stone-950/90 border-stone-800' : 'bg-white border-stone-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-stone-950 shadow-md">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-amber-500 flex items-center gap-2">
                <span>باقات الزواج والعفة والظهور الملكي</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 font-mono">
                  باقات التميز والثبات
                </span>
              </h2>
              <p className={`text-xs ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                باقات مخصصة {userGender === 'male' ? 'للراغبين في الزواج' : 'للراغبات في الزواج وأولياء الأمور'} لرفع معدلات التوافق وثبات الإعلان
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors ${
              isDark ? 'bg-stone-800 text-stone-300 hover:text-white' : 'bg-stone-200 text-stone-700 hover:bg-stone-300'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Success Banner */}
        {successMessage && (
          <div className="p-3 bg-emerald-950/80 border-b border-emerald-800 text-emerald-300 text-xs flex items-center gap-2 font-bold justify-center">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Modal Body: Packages Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* Highlight for the Highest Tier (باقة العفة الملكية - ثبات شهر كامل) */}
          {packages.filter((p) => p.isHighestTier).map((royalPkg) => (
            <div
              key={royalPkg.id}
              id={`package-card-${royalPkg.id}`}
              className={`rounded-3xl p-5 sm:p-6 border-2 relative overflow-hidden shadow-2xl transition-all ${
                isDark
                  ? 'bg-gradient-to-b from-amber-950/30 via-stone-900 to-stone-900 border-amber-500 shadow-amber-500/10'
                  : 'bg-gradient-to-b from-amber-50 via-white to-white border-amber-500 shadow-amber-200/50'
              }`}
            >
              {/* Top Banner Ribbon */}
              <div className="absolute top-0 left-0 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 px-4 py-1 rounded-br-2xl text-[11px] font-black flex items-center gap-1.5 shadow-md">
                <Crown className="w-3.5 h-3.5" />
                <span>الباقة الأعلى سعراً وتميزاً (ثبات لمدة شهر كامل)</span>
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">👑</span>
                    <h3 className="text-xl font-black text-amber-500">
                      {royalPkg.name}
                    </h3>
                  </div>
                  <p className={`text-xs mt-1.5 max-w-xl leading-relaxed ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>
                    {royalPkg.description}
                  </p>
                </div>

                <div className="text-left md:text-right shrink-0">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black text-amber-500 font-mono">
                      {royalPkg.price}
                    </span>
                    <span className={`text-xs font-bold ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                      {royalPkg.currency}
                    </span>
                  </div>
                  <span className="text-[11px] text-emerald-500 font-bold block mt-0.5">
                    مدة الاشتراك: {royalPkg.durationDays} يوماً (شهر كامل مثبت)
                  </span>
                </div>
              </div>

              {/* Features List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-5 pt-4 border-t border-amber-500/30 text-xs">
                {royalPkg.features.map((feat, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3 h-3 font-bold" />
                    </div>
                    <span className={isDark ? 'text-stone-200' : 'text-stone-800'}>{feat}</span>
                  </div>
                ))}
              </div>

              {/* Action Button for Royal Package */}
              <button
                id={`subscribe-btn-${royalPkg.id}`}
                onClick={() => handleSubscribe(royalPkg)}
                disabled={subscribingId === royalPkg.id}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-black text-sm shadow-xl transition-all active:scale-98 flex items-center justify-center gap-2"
              >
                <Crown className="w-4 h-4" />
                <span>
                  {subscribingId === royalPkg.id
                    ? 'جاري تفعيل الباقة الملكية...'
                    : 'الاشتراك في باقة العفة الملكية (تثبيت في الصدارة 30 يوماً)'}
                </span>
              </button>
            </div>
          ))}

          {/* Standard Tiers: Silver, Gold, Platinum */}
          <div className="space-y-2">
            <h4 className={`text-xs font-bold uppercase tracking-wider ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
              الباقات العادية والمتوسطة (سيلفر، جولد، بلاتينيوم)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {packages.filter((p) => !p.isHighestTier).map((pkg) => {
                const isPlatinum = pkg.tier === 'platinum';
                const isGold = pkg.tier === 'gold';
                const isSilver = pkg.tier === 'silver';

                return (
                  <div
                    key={pkg.id}
                    id={`package-card-${pkg.id}`}
                    className={`rounded-2xl p-5 border flex flex-col justify-between transition-all shadow-md ${
                      isDark
                        ? isPlatinum
                          ? 'bg-stone-900 border-purple-800/50 hover:border-purple-600'
                          : isGold
                          ? 'bg-stone-900 border-amber-800/50 hover:border-amber-600'
                          : 'bg-stone-900 border-stone-800 hover:border-stone-700'
                        : isPlatinum
                        ? 'bg-white border-purple-200 hover:border-purple-400'
                        : isGold
                        ? 'bg-white border-amber-200 hover:border-amber-400'
                        : 'bg-white border-stone-200 hover:border-stone-400'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${
                          isPlatinum
                            ? 'bg-purple-950/60 text-purple-300 border-purple-800/40'
                            : isGold
                            ? 'bg-amber-950/60 text-amber-300 border-amber-800/40'
                            : 'bg-stone-800 text-stone-300 border-stone-700'
                        }`}>
                          {pkg.badge}
                        </span>
                        <span className="text-xs text-stone-400 font-mono">
                          {pkg.durationDays} يوم
                        </span>
                      </div>

                      <h4 className={`text-base font-bold ${isDark ? 'text-stone-100' : 'text-stone-900'}`}>
                        {pkg.name}
                      </h4>

                      <div className="my-3 flex items-baseline gap-1">
                        <span className={`text-2xl font-black font-mono ${
                          isPlatinum ? 'text-purple-400' : isGold ? 'text-amber-400' : 'text-stone-300'
                        }`}>
                          {pkg.price}
                        </span>
                        <span className="text-xs text-stone-400">{pkg.currency}</span>
                      </div>

                      <p className={`text-[11px] mb-4 leading-relaxed ${isDark ? 'text-stone-400' : 'text-stone-600'}`}>
                        {pkg.description}
                      </p>

                      <div className="space-y-2 border-t pt-3 border-stone-800/50 text-[11px]">
                        {pkg.features.map((feat, idx) => (
                          <div key={idx} className="flex items-start gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span className={isDark ? 'text-stone-300' : 'text-stone-700'}>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-5 space-y-2">
                      <button
                        id={`subscribe-btn-${pkg.id}`}
                        onClick={() => handleSubscribe(pkg)}
                        disabled={subscribingId === pkg.id}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all shadow ${
                          isPlatinum
                            ? 'bg-purple-700 hover:bg-purple-600 text-white'
                            : isGold
                            ? 'bg-amber-600 hover:bg-amber-500 text-white'
                            : 'bg-stone-800 hover:bg-stone-700 text-stone-200'
                        }`}
                      >
                        {subscribingId === pkg.id ? 'جاري الاشتراك...' : `اختيار ${pkg.badge}`}
                      </button>

                      {onOpenPaymentMethods && (
                        <button
                          type="button"
                          onClick={() => onOpenPaymentMethods(`اشتراك ${pkg.name}`, pkg.price)}
                          className="w-full py-1.5 rounded-lg text-[11px] text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 flex items-center justify-center gap-1.5 transition-colors border border-amber-500/20"
                        >
                          <CreditCard className="w-3 h-3" />
                          <span>سداد عبر InstaPay / المحفظة</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sharia Guarantee Note */}
          <div className={`p-4 rounded-2xl border text-xs flex items-start gap-3 ${
            isDark ? 'bg-stone-950/80 border-emerald-900/40 text-stone-300' : 'bg-emerald-50 border-emerald-200 text-emerald-950'
          }`}>
            <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-emerald-500">
                ضمان الجدية والأمانة الشرعية
              </span>
              <p className="text-[11px] leading-relaxed">
                عائدات الباقات تُوجّه لتطوير خدمات التحفيظ المجانية ومكافأة المحفظين المعتمدين وصيانة النظام الآمن للتعارف الشرعي دون اختلاط أو تداول أرقام هواتف غير منضبط.
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div
          className={`p-4 border-t flex items-center justify-between text-xs ${
            isDark ? 'bg-stone-950 border-stone-800 text-stone-400' : 'bg-white border-stone-200 text-stone-600'
          }`}
        >
          <span>يمكن تعديل أسعار الباقات وصلاحياتها بالكامل من لوحة تحكم مدير النظام.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
