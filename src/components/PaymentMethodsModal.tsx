import React, { useState } from 'react';
import {
  CreditCard,
  Smartphone,
  Building2,
  Copy,
  Check,
  X,
  ShieldCheck,
  Send,
  Sparkles,
  HelpCircle,
  ExternalLink,
  Globe,
  FileCheck,
} from 'lucide-react';
import { PaymentMethodsConfig } from '../types';
import { SupportedLanguage, TRANSLATIONS } from '../data/translations';

interface PaymentMethodsModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentMethods?: PaymentMethodsConfig;
  theme: 'dark' | 'light';
  purpose?: string; // e.g. 'اشتراك باقة العفة الملكية' or 'عربون التوافق الشرعي' or 'شحن المحفظة'
  targetAmount?: number;
  language?: SupportedLanguage;
}

export function PaymentMethodsModal({
  isOpen,
  onClose,
  paymentMethods,
  theme,
  purpose = 'سداد الاشتراكات وتوثيق العضوية',
  targetAmount,
  language = 'ar',
}: PaymentMethodsModalProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'instapay' | 'wallets' | 'bank' | 'stcpay'>('bank');
  const [bankTransferType, setBankTransferType] = useState<'international' | 'local'>('international');

  if (!isOpen) return null;

  const isDark = theme === 'dark';
  const t = (key: string) => TRANSLATIONS[language]?.[key] || TRANSLATIONS.ar[key] || key;

  const defaultMethods: PaymentMethodsConfig = paymentMethods || {
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
    paymentInstructions: 'يرجى تحويل المبلغ المطلوب عبر انستاباي أو المحفظة الإلكترونية أو التحويل البنكي الدولي ثم إرسال صورة إشعار التحويل لاعتماده الفوري.',
    whatsappConfirmationPhone: '+201011112222',
  };

  const methods = paymentMethods || defaultMethods;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const whatsappMessage = encodeURIComponent(
    `السلام عليكم ورحمة الله وبركاته، قمت بتحويل مبلغ سداد (${purpose}${targetAmount ? ` بقيمة ${targetAmount} ج.م/ر.س` : ''}) إلى حساب منصة منهاج، ومرفق صورة إيصال التحويل للاعتماد الفوري.`
  );

  return (
    <div
      id="payment-methods-modal"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div
        className={`w-full max-w-xl rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-150 ${
          isDark ? 'bg-stone-900 border-amber-500/30 text-stone-100' : 'bg-white border-amber-200 text-stone-900'
        }`}
      >
        {/* Header */}
        <div
          className={`p-5 border-b relative ${
            isDark
              ? 'bg-gradient-to-r from-stone-950 via-amber-950/20 to-stone-950 border-stone-800'
              : 'bg-gradient-to-r from-amber-50 via-stone-50 to-amber-50 border-amber-100'
          }`}
        >
          <button
            onClick={onClose}
            className="absolute top-5 left-5 w-8 h-8 rounded-full bg-stone-800/60 hover:bg-stone-700 text-stone-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shrink-0">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-amber-500">
                  {t('payment_methods_title')}
                </h3>
              </div>
              <p className="text-xs text-stone-400 mt-0.5">
                {purpose} {targetAmount ? `• ${targetAmount}` : ''}
              </p>
            </div>
          </div>

          {/* Tab Selector */}
          <div className="grid grid-cols-4 gap-1.5 mt-4 p-1 rounded-2xl bg-stone-950/60 border border-stone-800/80 text-xs">
            <button
              onClick={() => setActiveTab('bank')}
              className={`py-2 px-1 sm:px-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1 text-[11px] sm:text-xs ${
                activeTab === 'bank'
                  ? 'bg-amber-500 text-stone-950 shadow-md'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>{t('bank_tab')}</span>
            </button>
            <button
              onClick={() => setActiveTab('instapay')}
              className={`py-2 px-1 sm:px-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1 text-[11px] sm:text-xs ${
                activeTab === 'instapay'
                  ? 'bg-amber-500 text-stone-950 shadow-md'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{t('instapay_tab')}</span>
            </button>
            <button
              onClick={() => setActiveTab('wallets')}
              className={`py-2 px-1 sm:px-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1 text-[11px] sm:text-xs ${
                activeTab === 'wallets'
                  ? 'bg-amber-500 text-stone-950 shadow-md'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{t('wallets_tab')}</span>
            </button>
            <button
              onClick={() => setActiveTab('stcpay')}
              className={`py-2 px-1 sm:px-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1 text-[11px] sm:text-xs ${
                activeTab === 'stcpay'
                  ? 'bg-amber-500 text-stone-950 shadow-md'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{t('stcpay_tab')}</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">

          {/* TAB 1: INSTAPAY */}
          {activeTab === 'instapay' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-stone-950/80 border-amber-500/20' : 'bg-amber-50/50 border-amber-200'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="font-bold text-amber-400 text-sm">بيانات التحويل المباشر عبر انستاباي (InstaPay):</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    لحظي 24/7 دون عمولة
                  </span>
                </div>

                {/* IPA Address */}
                <div className="space-y-1.5">
                  <span className="text-[11px] text-stone-400">عنوان الدفع اللحظي (IPA Handle):</span>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-stone-900 border border-stone-800 font-mono">
                    <span className="text-amber-300 font-bold text-sm tracking-wide">{methods.instapay.ipa}</span>
                    <button
                      onClick={() => handleCopy(methods.instapay.ipa, 'ipa')}
                      className="px-3 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1 font-sans transition-colors"
                    >
                      {copiedKey === 'ipa' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'ipa' ? 'تم النسخ' : 'نسخ IPA'}</span>
                    </button>
                  </div>
                </div>

                {/* InstaPay Phone */}
                <div className="space-y-1.5 mt-3">
                  <span className="text-[11px] text-stone-400">رقم الهاتف المرتبط بحساب انستاباي:</span>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-stone-900 border border-stone-800 font-mono">
                    <span className="text-stone-100 font-bold text-sm">{methods.instapay.phone}</span>
                    <button
                      onClick={() => handleCopy(methods.instapay.phone, 'instapay-phone')}
                      className="px-3 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center gap-1 font-sans transition-colors"
                    >
                      {copiedKey === 'instapay-phone' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'instapay-phone' ? 'تم النسخ' : 'نسخ الرقم'}</span>
                    </button>
                  </div>
                </div>

                {/* Account Name */}
                <div className="mt-3 pt-3 border-t border-stone-800/60 flex items-center justify-between text-[11px] text-stone-400">
                  <span>اسم المستفيد المسجل:</span>
                  <strong className="text-stone-200">{methods.instapay.accountName}</strong>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: WALLETS */}
          {activeTab === 'wallets' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-stone-950/80 border-stone-800' : 'bg-stone-50 border-stone-200'}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-stone-200 text-sm">المحافظ الإلكترونية (فودافون كاش / أورنج / اتصالات / وي):</span>
                  <span className="text-[10px] text-stone-400">تحويل كاش فوري</span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] text-stone-400">رقم المحفظة المعتمد للتحويل:</span>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-stone-900 border border-stone-800 font-mono">
                    <span className="text-emerald-400 font-bold text-sm tracking-wider">{methods.vodafoneCash.phone}</span>
                    <button
                      onClick={() => handleCopy(methods.vodafoneCash.phone, 'wallet-phone')}
                      className="px-3 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-sans transition-colors"
                    >
                      {copiedKey === 'wallet-phone' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'wallet-phone' ? 'تم النسخ' : 'نسخ رقم المحفظة'}</span>
                    </button>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-stone-800/60 flex items-center justify-between text-[11px] text-stone-400">
                  <span>اسم الحساب المسجل:</span>
                  <strong className="text-stone-200">{methods.vodafoneCash.accountName}</strong>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BANK ACCOUNT */}
          {activeTab === 'bank' && (
            <div className="space-y-3.5 animate-in fade-in duration-200">
              {/* International vs Local Sub-Toggle */}
              <div className="flex rounded-xl p-1 bg-stone-950 border border-stone-800 text-xs gap-1">
                <button
                  type="button"
                  onClick={() => setBankTransferType('international')}
                  className={`flex-1 py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                    bankTransferType === 'international'
                      ? 'bg-gradient-to-r from-blue-700 to-indigo-700 text-white shadow-md'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>{t('international_transfer')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBankTransferType('local')}
                  className={`flex-1 py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
                    bankTransferType === 'local'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-stone-400 hover:text-stone-200'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{t('local_transfer')}</span>
                </button>
              </div>

              {/* International Wire Card */}
              {bankTransferType === 'international' && (
                <div className={`p-4 rounded-2xl border ${isDark ? 'bg-stone-950/90 border-blue-900/40' : 'bg-blue-50/50 border-blue-200'} space-y-3`}>
                  <div className="flex items-center justify-between border-b border-stone-800/80 pb-2.5">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-blue-400" />
                      <span className="font-bold text-stone-100 text-sm">بيانات التحويل الدولي من خارج الدولة (International Wire):</span>
                    </div>
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[10px] border border-blue-500/30">
                      SWIFT / IBAN Direct
                    </span>
                  </div>

                  {/* Accepted Currencies Banner */}
                  <div className="p-2.5 rounded-xl bg-stone-900 border border-stone-800 flex flex-wrap items-center gap-1.5 text-[11px]">
                    <span className="text-stone-400 font-medium">العملات المقبولة للتحويل الدولي:</span>
                    {(methods.bankAccount.acceptedCurrencies || ['USD', 'EUR', 'SAR', 'AED', 'GBP', 'EGP', 'KWD']).map((cur) => (
                      <span key={cur} className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 font-mono text-[10px] border border-amber-500/20">
                        {cur}
                      </span>
                    ))}
                  </div>

                  {/* IBAN */}
                  <div>
                    <span className="text-[10px] text-stone-400 block mb-1">رقم الآيبان الدولي الموحد (IBAN):</span>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-900 border border-stone-800 font-mono text-xs">
                      <span className="text-amber-300 font-bold tracking-wider truncate max-w-[280px]">
                        {methods.bankAccount.iban}
                      </span>
                      <button
                        onClick={() => handleCopy(methods.bankAccount.iban, 'iban-int')}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 flex items-center gap-1 font-sans"
                      >
                        {copiedKey === 'iban-int' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === 'iban-int' ? 'تم النسخ' : 'نسخ الآيبان'}</span>
                      </button>
                    </div>
                  </div>

                  {/* SWIFT / BIC */}
                  <div>
                    <span className="text-[10px] text-stone-400 block mb-1">كود السويفت الدولي للبنوك المراسلة (SWIFT / BIC):</span>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-900 border border-stone-800 font-mono text-xs">
                      <span className="text-blue-300 font-bold tracking-wider">
                        {methods.bankAccount.swiftCode}
                      </span>
                      <button
                        onClick={() => handleCopy(methods.bankAccount.swiftCode, 'swift-int')}
                        className="px-2.5 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/30 flex items-center gap-1 font-sans"
                      >
                        {copiedKey === 'swift-int' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === 'swift-int' ? 'تم النسخ' : 'نسخ السويفت'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Bank & Branch Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1 border-t border-stone-800/60">
                    <div className="p-2 rounded-lg bg-stone-900/70 border border-stone-800/60">
                      <span className="text-stone-400 block text-[10px]">اسم المصرف والفرع:</span>
                      <strong className="text-stone-200">{methods.bankAccount.bankName} - {methods.bankAccount.branchName || 'فرع المعاملات الدولية'}</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-stone-900/70 border border-stone-800/60">
                      <span className="text-stone-400 block text-[10px]">اسم المستفيد المعتمد:</span>
                      <strong className="text-stone-200">{methods.bankAccount.accountHolder}</strong>
                    </div>
                  </div>

                  {/* Intermediary Bank */}
                  {methods.bankAccount.intermediaryBank && (
                    <div className="text-[10px] text-stone-400 pt-1">
                      <span>البنك الوسيط (Intermediary Bank): </span>
                      <span className="font-mono text-stone-300">{methods.bankAccount.intermediaryBank}</span>
                    </div>
                  )}

                  {/* Instructions for International Remitters */}
                  <div className="p-2.5 rounded-xl bg-blue-950/30 border border-blue-800/50 space-y-1 text-[11px]">
                    <div className="flex items-center gap-1.5 text-blue-300 font-bold">
                      <FileCheck className="w-3.5 h-3.5" />
                      <span>{t('international_notes_title')}</span>
                    </div>
                    <p className="text-stone-400 leading-relaxed">
                      {methods.bankAccount.instructionsForInternational || t('international_notes_desc')}
                    </p>
                  </div>
                </div>
              )}

              {/* Local Bank Wire Card */}
              {bankTransferType === 'local' && (
                <div className={`p-4 rounded-2xl border ${isDark ? 'bg-stone-950/80 border-stone-800' : 'bg-stone-50 border-stone-200'} space-y-3`}>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-stone-200 text-sm">التحويل البنكي المحلي (Local Bank Transfer):</span>
                    <span className="text-[10px] text-stone-400">{methods.bankAccount.bankName}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-stone-400 block mb-1">رقم الحساب البنكي:</span>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-900 border border-stone-800 font-mono">
                      <span className="text-stone-200 font-bold">{methods.bankAccount.accountNumber}</span>
                      <button
                        onClick={() => handleCopy(methods.bankAccount.accountNumber, 'bank-acc')}
                        className="px-2.5 py-1 rounded-lg bg-stone-800 text-stone-300 hover:text-white flex items-center gap-1 font-sans"
                      >
                        {copiedKey === 'bank-acc' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>نسخ</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-stone-400 block mb-1">رقم الآيبان (IBAN):</span>
                    <div className="flex items-center justify-between p-2.5 rounded-xl bg-stone-900 border border-stone-800 font-mono text-[11px]">
                      <span className="text-amber-300 truncate max-w-[260px]">{methods.bankAccount.iban}</span>
                      <button
                        onClick={() => handleCopy(methods.bankAccount.iban, 'iban')}
                        className="px-2.5 py-1 rounded-lg bg-stone-800 text-stone-300 hover:text-white flex items-center gap-1 font-sans"
                      >
                        {copiedKey === 'iban' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>نسخ</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-stone-400 pt-2 border-t border-stone-800/60">
                    <span>اسم المستفيد: <strong className="text-stone-200">{methods.bankAccount.accountHolder}</strong></span>
                    <span>الفرع: <strong className="text-stone-200">{methods.bankAccount.branchName || 'الفرع الرئيسي'}</strong></span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: STC PAY */}
          {activeTab === 'stcpay' && (
            <div className="space-y-3 animate-in fade-in duration-200">
              <div className={`p-4 rounded-2xl border ${isDark ? 'bg-stone-950/80 border-stone-800' : 'bg-stone-50 border-stone-200'}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-stone-200 text-sm">محفظة STC Pay (المملكة العربية السعودية والخليج):</span>
                  <span className="text-[10px] text-stone-400">سداد بالريال السعودي</span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] text-stone-400">رقم التحويل المعتمد:</span>
                  <div className="flex items-center justify-between p-3 rounded-xl bg-stone-900 border border-stone-800 font-mono">
                    <span className="text-purple-400 font-bold text-sm tracking-wider">{methods.stcPay.phone}</span>
                    <button
                      onClick={() => handleCopy(methods.stcPay.phone, 'stcpay-phone')}
                      className="px-3 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center gap-1 font-sans transition-colors"
                    >
                      {copiedKey === 'stcpay-phone' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'stcpay-phone' ? 'تم النسخ' : 'نسخ الرقم'}</span>
                    </button>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-stone-800/60 flex items-center justify-between text-[11px] text-stone-400">
                  <span>اسم الحساب المسجل:</span>
                  <strong className="text-stone-200">{methods.stcPay.accountName}</strong>
                </div>
              </div>
            </div>
          )}

          {/* Instructions Box */}
          <div className={`p-4 rounded-2xl border space-y-2 ${isDark ? 'bg-stone-950 border-stone-800' : 'bg-amber-50/70 border-amber-200'}`}>
            <div className="flex items-center gap-2 font-bold text-amber-500">
              <HelpCircle className="w-4 h-4" />
              <span>خطوات تأكيد وتفعيل الاشتراك فور التحويل:</span>
            </div>
            <p className="text-[11px] text-stone-400 leading-relaxed">
              {methods.paymentInstructions}
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-stone-800/60">
              <span className="text-[11px] text-stone-400">
                إرسال إيصال السداد عبر واتساب التأكيد: <strong className="text-stone-200 font-mono">{methods.whatsappConfirmationPhone}</strong>
              </span>
              <a
                href={`https://wa.me/${methods.whatsappConfirmationPhone.replace(/\+/g, '')}?text=${whatsappMessage}`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 transition-colors shadow"
              >
                <Send className="w-3.5 h-3.5" />
                <span>إرسال الإيصال عبر واتساب</span>
              </a>
            </div>
          </div>

          {/* Guarantee */}
          <div className="flex items-center gap-2 text-[11px] text-stone-400 px-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              كافة التحويلات موثقة ومحمية، وتُخصّص نسبة من العائدات لدعم حلقات القرآن ومكافآت الحفظ الذاتي.
            </span>
          </div>

        </div>

        {/* Footer */}
        <div
          className={`p-4 border-t flex items-center justify-between text-xs ${
            isDark ? 'bg-stone-950 border-stone-800 text-stone-400' : 'bg-white border-stone-200 text-stone-600'
          }`}
        >
          <span>تتم مراجعة وتفعيل الاشتراكات والعربونات في غضون 5 إلى 15 دقيقة.</span>
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
