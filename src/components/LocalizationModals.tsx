import React, { useState } from 'react';
import {
  Globe,
  MapPin,
  Check,
  X,
  Search,
  Trash2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import {
  SUPPORTED_LANGUAGES,
  SUPPORTED_COUNTRIES,
  TRANSLATIONS,
  SupportedLanguage,
  CountryConfig,
  getTranslation,
} from '../data/translations';

// =========================================================================
// 1. Language Selection Modal
// =========================================================================
interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLanguage: SupportedLanguage;
  onSelectLanguage: (lang: SupportedLanguage) => void;
  theme: 'dark' | 'light';
}

export function LanguageModal({
  isOpen,
  onClose,
  selectedLanguage,
  onSelectLanguage,
  theme,
}: LanguageModalProps) {
  if (!isOpen) return null;
  const isDark = theme === 'dark';
  const t = (key: string) => getTranslation(selectedLanguage, key);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 ${
          isDark ? 'bg-stone-900 border-stone-800 text-stone-100' : 'bg-white border-stone-200 text-stone-900'
        }`}
      >
        {/* Header */}
        <div
          className={`p-4 border-b flex items-center justify-between ${
            isDark ? 'bg-stone-950 border-stone-800' : 'bg-stone-50 border-stone-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-500" />
            <div>
              <h3 className="font-bold text-sm">{t('selectLanguage')}</h3>
              <p className={`text-[11px] ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                اختر لغة العرض المفضلة لمنصة منهاج
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              isDark ? 'bg-stone-800 text-stone-400 hover:text-white' : 'bg-stone-200 text-stone-600 hover:text-stone-900'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Language List */}
        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = selectedLanguage === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => {
                  onSelectLanguage(lang.code);
                  onClose();
                }}
                className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all ${
                  isSelected
                    ? isDark
                      ? 'bg-emerald-950/60 border-emerald-600 text-emerald-300'
                      : 'bg-emerald-50 border-emerald-500 text-emerald-900'
                    : isDark
                    ? 'bg-stone-950/60 border-stone-800 hover:border-stone-700 hover:bg-stone-850 text-stone-200'
                    : 'bg-stone-50 border-stone-200 hover:border-stone-300 hover:bg-stone-100 text-stone-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{lang.flag}</span>
                  <div className="text-right">
                    <div className="font-bold text-sm flex items-center gap-2">
                      <span>{lang.nativeName}</span>
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                          isDark ? 'bg-stone-800 text-stone-400' : 'bg-stone-200 text-stone-600'
                        }`}
                      >
                        {lang.code.toUpperCase()}
                      </span>
                    </div>
                    <span className={`text-[11px] ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                      {lang.name}
                    </span>
                  </div>
                </div>

                {isSelected ? (
                  <div className="w-6 h-6 rounded-full bg-emerald-500 text-stone-950 flex items-center justify-center">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                ) : (
                  <span className={`text-xs font-mono ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
                    {lang.dir.toUpperCase()}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer Note */}
        <div
          className={`p-3 border-t text-center text-[11px] ${
            isDark ? 'bg-stone-950/70 border-stone-800 text-stone-400' : 'bg-stone-50 border-stone-200 text-stone-500'
          }`}
        >
          <span>تتضمن الترجمة كامل الواجهات ونظام الدفع وباقات العفة وإرشادات التحويل الدولي.</span>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 2. Country Selection Modal
// =========================================================================
interface CountryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCountry: string;
  onSelectCountry: (countryCode: string) => void;
  theme: 'dark' | 'light';
  language: SupportedLanguage;
}

export function CountryModal({
  isOpen,
  onClose,
  selectedCountry,
  onSelectCountry,
  theme,
  language,
}: CountryModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  if (!isOpen) return null;

  const isDark = theme === 'dark';
  const t = (key: string) => getTranslation(language, key);

  const filteredCountries = SUPPORTED_COUNTRIES.filter((country) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      country.nameAr.toLowerCase().includes(term) ||
      country.nameEn.toLowerCase().includes(term) ||
      country.code.toLowerCase().includes(term) ||
      country.currency.toLowerCase().includes(term) ||
      country.phoneCode.includes(term)
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 ${
          isDark ? 'bg-stone-900 border-stone-800 text-stone-100' : 'bg-white border-stone-200 text-stone-900'
        }`}
      >
        {/* Header */}
        <div
          className={`p-4 border-b flex items-center justify-between ${
            isDark ? 'bg-stone-950 border-stone-800' : 'bg-stone-50 border-stone-200'
          }`}
        >
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="font-bold text-sm">{t('selectCountry')}</h3>
              <p className={`text-[11px] ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                تخصيص العملة وطرق السداد ورقم الاتصال بحسب دولتك
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              isDark ? 'bg-stone-800 text-stone-400 hover:text-white' : 'bg-stone-200 text-stone-600 hover:text-stone-900'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search Field */}
        <div className={`p-3 border-b ${isDark ? 'bg-stone-950/40 border-stone-800' : 'bg-stone-50/70 border-stone-200'}`}>
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute right-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث باسم الدولة أو العملة أو الرمز..."
              className={`w-full pr-9 pl-3 py-2 text-xs rounded-xl border focus:outline-none transition-colors ${
                isDark
                  ? 'bg-stone-900 border-stone-700 text-stone-200 focus:border-amber-500'
                  : 'bg-white border-stone-300 text-stone-800 focus:border-amber-600'
              }`}
            />
          </div>
        </div>

        {/* Countries Grid/List */}
        <div className="p-3 max-h-[55vh] overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-2">
          {filteredCountries.map((country) => {
            const isSelected = selectedCountry === country.code;
            return (
              <button
                key={country.code}
                onClick={() => {
                  onSelectCountry(country.code);
                  onClose();
                }}
                className={`p-2.5 rounded-xl border flex items-center justify-between text-right transition-all ${
                  isSelected
                    ? isDark
                      ? 'bg-amber-950/60 border-amber-600 text-amber-300 shadow-sm'
                      : 'bg-amber-50 border-amber-500 text-amber-950 shadow-sm'
                    : isDark
                    ? 'bg-stone-950/60 border-stone-800 hover:border-stone-700 hover:bg-stone-850 text-stone-200'
                    : 'bg-stone-50 border-stone-200 hover:border-stone-300 hover:bg-stone-100 text-stone-800'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-2xl shrink-0">{country.flag}</span>
                  <div className="min-w-0">
                    <div className="font-bold text-xs truncate">
                      {language === 'ar' ? country.nameAr : country.nameEn}
                    </div>
                    <div className="text-[10px] text-stone-400 flex items-center gap-1 font-mono mt-0.5">
                      <span className="text-amber-400 font-bold">{country.currency}</span>
                      <span>•</span>
                      <span>{country.phoneCode}</span>
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div
          className={`p-3 border-t text-center text-[11px] ${
            isDark ? 'bg-stone-950/70 border-stone-800 text-stone-400' : 'bg-stone-50 border-stone-200 text-stone-500'
          }`}
        >
          <span>يدعم التطبيق التحويل المصرفي الدولي عبر SWIFT/IBAN لجميع المقيمين في هذه الدول ومختلف أنحاء العالم.</span>
        </div>
      </div>
    </div>
  );
}

// =========================================================================
// 3. Clear Demo Data Confirmation Modal
// =========================================================================
interface ClearDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isClearing: boolean;
  theme: 'dark' | 'light';
}

export function ClearDemoModal({
  isOpen,
  onClose,
  onConfirm,
  isClearing,
  theme,
}: ClearDemoModalProps) {
  if (!isOpen) return null;
  const isDark = theme === 'dark';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className={`w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 ${
          isDark ? 'bg-stone-900 border-rose-900/50 text-stone-100' : 'bg-white border-rose-300 text-stone-900'
        }`}
      >
        <div
          className={`p-4 border-b flex items-center justify-between ${
            isDark ? 'bg-rose-950/40 border-rose-900/50' : 'bg-rose-50 border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2 text-rose-500 font-bold text-sm">
            <Trash2 className="w-5 h-5 text-rose-500" />
            <span>مسح وتنظيف البيانات التجريبية</span>
          </div>
          <button
            onClick={onClose}
            disabled={isClearing}
            className={`w-7 h-7 rounded-full flex items-center justify-center ${
              isDark ? 'bg-stone-800 text-stone-400 hover:text-white' : 'bg-stone-200 text-stone-600'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-3.5 text-xs">
          <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-800/40 flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <p className="text-stone-300 leading-relaxed">
              هذا الإجراء مخصص لمدير النظام لتنظيف قاعدة البيانات من الاختبارات السابقة وإعادتها لحالتها الابتدائية النظيفة.
            </p>
          </div>

          <div className="space-y-2">
            <span className="font-bold text-stone-300 block">ما الذي سيتم تنظيفه؟</span>
            <ul className="space-y-1.5 text-stone-400 text-[11px] list-disc list-inside">
              <li>حذف سجل المخالفات الأمنية ومحاولات الالتفاف التجريبية.</li>
              <li>إعادة تعيين طلبات السحب المالي إلى الحالة الأولية.</li>
              <li>مسح وتصفير مطالبات حوافز الحفظ الذاتي المسجلة تجريبياً.</li>
              <li>إعادة ضبط رصيد محفظة المستخدم للاختبار إلى 150 نقطة و 25 ج.م.</li>
              <li>إعادة ضبط استمارات الزواج التجريبية الزائدة مع الإبقاء على الحسابات المعتمدة.</li>
            </ul>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              disabled={isClearing}
              onClick={onConfirm}
              className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              {isClearing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جاري التنظيف...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>تأكيد مسح البيانات التجريبية</span>
                </>
              )}
            </button>
            <button
              type="button"
              disabled={isClearing}
              onClick={onClose}
              className={`px-4 py-2.5 rounded-xl font-bold border transition-colors ${
                isDark
                  ? 'bg-stone-800 border-stone-700 text-stone-300 hover:bg-stone-700'
                  : 'bg-stone-100 border-stone-200 text-stone-700 hover:bg-stone-200'
              }`}
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
