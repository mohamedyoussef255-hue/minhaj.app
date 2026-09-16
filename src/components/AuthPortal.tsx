import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  User,
  Lock,
  Phone,
  BookOpen,
  Heart,
  CheckCircle2,
  Info,
  X,
  Sparkles,
  ArrowRight,
  UserCheck,
  FileCheck,
  Building,
  GraduationCap
} from 'lucide-react';
import type { User as UserType, Wallet } from '../types';

interface AuthPortalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserType | null;
  onLoginSuccess: (user: UserType, wallet?: Wallet) => void;
  initialGender?: 'male' | 'female';
}

export const AuthPortal: React.FC<AuthPortalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLoginSuccess,
  initialGender = 'male',
}) => {
  const [selectedGender, setSelectedGender] = useState<'male' | 'female'>(initialGender);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Login Form State
  const [phoneOrId, setPhoneOrId] = useState('');
  const [password, setPassword] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // Register Form State
  const [regFullName, setRegFullName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAge, setRegAge] = useState<number>(26);
  const [regMaritalStatus, setRegMaritalStatus] = useState<string>('single');
  const [regCity, setRegCity] = useState('القاهرة');
  const [regJob, setRegJob] = useState('');
  const [regHifz, setRegHifz] = useState('حافظ لـ 10 أجزاء');
  const [regWaliPhone, setRegWaliPhone] = useState('');
  const [regBio, setRegBio] = useState('');
  const [agreedToCharter, setAgreedToCharter] = useState(false);

  // Demo users loaded from backend
  const [demoUsers, setDemoUsers] = useState<{ males: any[]; females: any[] }>({ males: [], females: [] });

  useEffect(() => {
    setSelectedGender(initialGender);
  }, [initialGender]);

  useEffect(() => {
    fetch('/api/auth/demo-users')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setDemoUsers({ males: data.males, females: data.females });
        }
      })
      .catch((err) => console.warn('Demo users fetch error:', err));
  }, []);

  if (!isOpen) return null;

  const handleLogin = async (overrideId?: string, overrideGender?: 'male' | 'female') => {
    setLoginLoading(true);
    setAuthError(null);
    setAuthSuccess(null);

    const genderToUse = overrideGender || selectedGender;
    const identifierToUse = overrideId || phoneOrId;

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneOrId: identifierToUse,
          gender: genderToUse,
          password: password || '123456',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'تعذر تسجيل الدخول');
      }

      setAuthSuccess(data.message);
      setTimeout(() => {
        onLoginSuccess(data.user, data.wallet);
        onClose();
      }, 700);
    } catch (err: any) {
      setAuthError(err.message || 'حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToCharter) {
      setAuthError('يجب الموافقة على ميثاق العفة والضوابط الشرعية للتسجيل.');
      return;
    }
    if (!regFullName.trim() || !regPhone.trim()) {
      setAuthError('يرجى كتابة الاسم ورقم الهاتف بالكامل.');
      return;
    }
    if (selectedGender === 'female' && !regWaliPhone.trim()) {
      setAuthError('اشتراط شرعي: يرجى إدخال رقم هاتف ولي الأمر (الوالد/الأخ/الوكيل) للأخوات.');
      return;
    }

    setLoginLoading(true);
    setAuthError(null);
    setAuthSuccess(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: regFullName,
          phoneNumber: regPhone,
          gender: selectedGender,
          age: regAge,
          maritalStatus: regMaritalStatus,
          city: regCity,
          job: regJob || (selectedGender === 'male' ? 'مهندس اتصالات' : 'معلمة لغة عربية'),
          hifzPortion: regHifz,
          waliPhone: regWaliPhone,
          bio: regBio,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'تعذر إنشاء الحساب');
      }

      setAuthSuccess(data.message);
      setTimeout(() => {
        onLoginSuccess(data.user, data.wallet);
        onClose();
      }, 900);
    } catch (err: any) {
      setAuthError(err.message || 'حدث خطأ أثناء إنشاء الحساب');
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <div
      id="auth-portal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
      dir="rtl"
    >
      <div
        id="auth-portal-modal"
        className="w-full max-w-2xl bg-stone-900 border border-stone-800 rounded-3xl shadow-2xl overflow-hidden my-auto text-stone-100 flex flex-col max-h-[92vh]"
      >
        {/* Modal Header with Portals */}
        <div className="bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 p-5 border-b border-stone-800 relative">
          <button
            id="auth-close-btn"
            onClick={onClose}
            className="absolute top-4 left-4 p-2 text-stone-400 hover:text-white rounded-full bg-stone-800/60 hover:bg-stone-800 transition-colors"
            title="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-700/30 border border-emerald-600/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>بوابة الدخول والتسجيل الشرعي</span>
                <span className="text-[11px] bg-emerald-950 text-emerald-300 border border-emerald-800/40 px-2 py-0.5 rounded-full font-normal">
                  منصة منهاج
                </span>
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">
                نظام التحفيظ القرآني والزواج الشرعي بنظام العفة التام والفصل بين الجنسين
              </p>
            </div>
          </div>

          {/* Gender Portals Selector (Men vs Women) */}
          <div className="grid grid-cols-2 gap-2 mt-5 p-1.5 bg-stone-950/90 rounded-2xl border border-stone-800/80">
            <button
              id="portal-male-tab"
              onClick={() => {
                setSelectedGender('male');
                setAuthError(null);
              }}
              className={`flex items-center justify-center gap-2.5 py-3 px-3 rounded-xl font-medium text-xs sm:text-sm transition-all ${
                selectedGender === 'male'
                  ? 'bg-gradient-to-r from-emerald-800 to-emerald-700 text-white shadow-lg shadow-emerald-950/50 border border-emerald-600/40'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/50'
              }`}
            >
              <span className="text-base">👨</span>
              <div className="text-right">
                <div className="font-bold">بوابة الرجال</div>
                <div className="text-[10px] opacity-80">راغبو الزواج الشرعي والتحفيظ</div>
              </div>
            </button>

            <button
              id="portal-female-tab"
              onClick={() => {
                setSelectedGender('female');
                setAuthError(null);
              }}
              className={`flex items-center justify-center gap-2.5 py-3 px-3 rounded-xl font-medium text-xs sm:text-sm transition-all ${
                selectedGender === 'female'
                  ? 'bg-gradient-to-r from-emerald-800 to-emerald-700 text-white shadow-lg shadow-emerald-950/50 border border-emerald-600/40'
                  : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/50'
              }`}
            >
              <span className="text-base">🧕</span>
              <div className="text-right">
                <div className="font-bold">بوابة النساء وأولياء الأمور</div>
                <div className="text-[10px] opacity-80">راغبات الزواج والتحفيظ</div>
              </div>
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-sm">
          
          {/* Clarification & Sharia Note on Terminology */}
          <div className="bg-amber-950/30 border border-amber-800/40 rounded-2xl p-3.5 text-amber-200/90 text-xs leading-relaxed flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-amber-300 text-xs mb-1 flex items-center gap-1.5">
                <span>تنبيه لغوي وشرعي أصيل حول مسمى (الراغب في الزواج) و(الخاطب)</span>
              </div>
              <p className="text-[11px] text-amber-200/80">
                في الشريعة الإسلامية، لا تُسمى المرأة <strong>«مخطوبة»</strong> إلا إذا تقدم رجل لخطبتها رسمياً ورضيت به ووافق ولي أمرها، ويحرم خطبتها حينئذٍ لقول النبي ﷺ: <em>«لا يخطب أحدكم على خطبة أخيه»</em>. لذا فإن جميع المشتركين في منصة منهاج هم <strong>«راغبون في الزواج الشرعي»</strong> و<strong>«راغبات في الزواج الشرعي»</strong> بعفة وستر تحت إشراف أولياء الأمور قبل مرحلة الخطبة الرسمية.
              </p>
            </div>
          </div>

          {/* Subtabs: Login vs Register */}
          <div className="flex border-b border-stone-800">
            <button
              id="subtab-login"
              onClick={() => {
                setAuthMode('login');
                setAuthError(null);
                setAuthSuccess(null);
              }}
              className={`pb-2.5 px-4 font-semibold text-xs sm:text-sm border-b-2 transition-all ${
                authMode === 'login'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              تسجيل الدخول إلى {selectedGender === 'male' ? 'حساب الأخ' : 'حساب الأخت / الولي'}
            </button>
            <button
              id="subtab-register"
              onClick={() => {
                setAuthMode('register');
                setAuthError(null);
                setAuthSuccess(null);
              }}
              className={`pb-2.5 px-4 font-semibold text-xs sm:text-sm border-b-2 transition-all ${
                authMode === 'register'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              إنشاء حساب جديد ({selectedGender === 'male' ? 'رجل راغب في الزواج' : 'امرأة راغبة في الزواج'})
            </button>
          </div>

          {/* Alerts */}
          {authError && (
            <div className="p-3 bg-rose-950/60 border border-rose-800/60 rounded-xl text-rose-300 text-xs flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{authError}</span>
            </div>
          )}

          {authSuccess && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-800/60 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{authSuccess}</span>
            </div>
          )}

          {/* MODE 1: LOGIN */}
          {authMode === 'login' && (
            <div className="space-y-4">
              {/* Quick Demo Access Bar */}
              <div className="bg-stone-950/60 border border-stone-800/80 rounded-2xl p-3.5 space-y-2.5">
                <div className="text-xs text-stone-400 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-stone-300 font-medium">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>دخول سريع بحساب تجريبي موثق ({selectedGender === 'male' ? 'رجال' : 'نساء'}):</span>
                  </span>
                  <span className="text-[10px] text-stone-500">للتجربة الفورية</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedGender === 'male' ? (
                    <>
                      <button
                        type="button"
                        id="demo-login-male-1"
                        onClick={() => handleLogin('usr-male-1', 'male')}
                        className="text-right p-2.5 rounded-xl bg-stone-900 hover:bg-stone-800/80 border border-emerald-900/40 hover:border-emerald-600/50 transition-all flex items-center justify-between group"
                      >
                        <div>
                          <div className="font-semibold text-xs text-white group-hover:text-emerald-300">
                            د. عبد الرحمن الشافعي
                          </div>
                          <div className="text-[10px] text-stone-400">
                            طبيب بشري • حافظ للقرآن • باقة فضية
                          </div>
                        </div>
                        <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-1 rounded-md border border-emerald-800/40">
                          دخول 👨
                        </span>
                      </button>

                      <button
                        type="button"
                        id="demo-login-male-2"
                        onClick={() => handleLogin('usr-m-2', 'male')}
                        className="text-right p-2.5 rounded-xl bg-stone-900 hover:bg-stone-800/80 border border-stone-800 hover:border-emerald-600/50 transition-all flex items-center justify-between group"
                      >
                        <div>
                          <div className="font-semibold text-xs text-white group-hover:text-emerald-300">
                            م. أحمد التميمي
                          </div>
                          <div className="text-[10px] text-stone-400">
                            رجل أعمال • راغب بالتعدد الشرعي • باقة ذهبية
                          </div>
                        </div>
                        <span className="text-[10px] bg-stone-800 text-stone-300 px-2 py-1 rounded-md">
                          دخول 👨
                        </span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        id="demo-login-female-1"
                        onClick={() => handleLogin('usr-female-1', 'female')}
                        className="text-right p-2.5 rounded-xl bg-stone-900 hover:bg-stone-800/80 border border-emerald-900/40 hover:border-emerald-600/50 transition-all flex items-center justify-between group"
                      >
                        <div>
                          <div className="font-semibold text-xs text-white group-hover:text-emerald-300">
                            أ. خديجة الأنصاري
                          </div>
                          <div className="text-[10px] text-stone-400">
                            مهندسة برمجيات • حافظة لـ 15 جزءاً • عزباء
                          </div>
                        </div>
                        <span className="text-[10px] bg-emerald-950 text-emerald-400 px-2 py-1 rounded-md border border-emerald-800/40">
                          دخول 🧕
                        </span>
                      </button>

                      <button
                        type="button"
                        id="demo-login-female-2"
                        onClick={() => handleLogin('usr-f-2', 'female')}
                        className="text-right p-2.5 rounded-xl bg-stone-900 hover:bg-stone-800/80 border border-stone-800 hover:border-emerald-600/50 transition-all flex items-center justify-between group"
                      >
                        <div>
                          <div className="font-semibold text-xs text-white group-hover:text-emerald-300">
                            أ. سارة القرشي (بإشراف والدها)
                          </div>
                          <div className="text-[10px] text-stone-400">
                            طبيبة صيدلانية • خمار سابغ • باقة ذهبية
                          </div>
                        </div>
                        <span className="text-[10px] bg-stone-800 text-stone-300 px-2 py-1 rounded-md">
                          دخول 🧕
                        </span>
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Standard Login Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleLogin();
                }}
                className="space-y-3.5"
              >
                <div>
                  <label className="block text-xs text-stone-300 mb-1 font-medium">
                    رقم الهاتف المحمول المسجل
                  </label>
                  <div className="relative">
                    <input
                      id="login-phone-input"
                      type="text"
                      dir="ltr"
                      value={phoneOrId}
                      onChange={(e) => setPhoneOrId(e.target.value)}
                      placeholder="+201011112222"
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2.5 pl-9 text-xs text-stone-200 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                    <Phone className="w-4 h-4 text-stone-500 absolute left-3 top-3 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-stone-300 mb-1 font-medium">
                    كلمة المرور أو رمز التحقق
                  </label>
                  <div className="relative">
                    <input
                      id="login-password-input"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2.5 pl-9 text-xs text-stone-200 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                    <Lock className="w-4 h-4 text-stone-500 absolute left-3 top-3 pointer-events-none" />
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[11px] text-stone-400">
                    <span>كلمة المرور الافتراضية للحسابات التجريبية: 123456</span>
                  </div>
                </div>

                <button
                  type="submit"
                  id="login-submit-btn"
                  disabled={loginLoading}
                  className="w-full mt-2 py-3 bg-emerald-700 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-xl font-medium text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 transition-all"
                >
                  {loginLoading ? (
                    <span>جاري التحقق وتفعيل جدار العفة...</span>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4" />
                      <span>
                        تسجيل الدخول لبوابة {selectedGender === 'male' ? 'الرجال (راغبو الزواج)' : 'النساء (راغبات الزواج)'}
                      </span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* MODE 2: REGISTER */}
          {authMode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-stone-300 mb-1 font-medium">
                    الاسم الكامل (الرباعي أو الثلاثي)
                  </label>
                  <input
                    id="reg-fullname-input"
                    type="text"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder={selectedGender === 'male' ? 'مثال: عبد الله محمد عمر' : 'مثال: مريم أحمد الأنصاري'}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-stone-300 mb-1 font-medium">
                    رقم الهاتف المحمول (للتواصل والتحقق)
                  </label>
                  <input
                    id="reg-phone-input"
                    type="tel"
                    dir="ltr"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="+2010..."
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-emerald-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-stone-300 mb-1 font-medium">
                    العمر (سنة)
                  </label>
                  <input
                    id="reg-age-input"
                    type="number"
                    min={18}
                    max={75}
                    value={regAge}
                    onChange={(e) => setRegAge(Number(e.target.value))}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-emerald-500 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs text-stone-300 mb-1 font-medium">
                    الحالة الاجتماعية الحالية
                  </label>
                  <select
                    id="reg-marital-status-select"
                    value={regMaritalStatus}
                    onChange={(e) => setRegMaritalStatus(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="single">{selectedGender === 'male' ? 'أعزب (لم يسبق له الزواج)' : 'عزباء (لم يسبق لها الزواج)'}</option>
                    <option value="divorced">{selectedGender === 'male' ? 'مطلق' : 'مطلقة'}</option>
                    <option value="widowed">{selectedGender === 'male' ? 'أرمل' : 'أرملة'}</option>
                    {selectedGender === 'male' && <option value="polygamy">متزوج وراغب في التعدد الشرعي</option>}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-stone-300 mb-1 font-medium">
                    المدينة / الدولة
                  </label>
                  <input
                    id="reg-city-input"
                    type="text"
                    value={regCity}
                    onChange={(e) => setRegCity(e.target.value)}
                    placeholder="القاهرة / الجيزة / الإسكندرية / الرياض"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-stone-300 mb-1 font-medium">
                    الوظيفة أو التخصص العلمي
                  </label>
                  <input
                    id="reg-job-input"
                    type="text"
                    value={regJob}
                    onChange={(e) => setRegJob(e.target.value)}
                    placeholder="مثال: مهندس برمجيات، معلم، أخصائي"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-stone-300 mb-1 font-medium">
                  مقدار حفظ القرآن الكريم وأحكام التجويد
                </label>
                <input
                  id="reg-hifz-input"
                  type="text"
                  value={regHifz}
                  onChange={(e) => setRegHifz(e.target.value)}
                  placeholder="مثال: حافظ لكتاب الله كاملاً، أو حافظ لـ 15 جزءاً برواية حفص"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Sister's Wali Contact Field */}
              {selectedGender === 'female' && (
                <div className="p-3 bg-stone-950 border border-emerald-800/40 rounded-xl space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>بيانات ولي الأمر الشرعي (الأب / الأخ / الوكيل)</span>
                  </div>
                  <p className="text-[11px] text-stone-400">
                    لحفظ الحرمات، لا يتم كشف وسيلة الاتصال إلا لراغب الزواج الجاد بعد دفع العربون وموافقتكم المسبقة.
                  </p>
                  <input
                    id="reg-wali-phone-input"
                    type="tel"
                    dir="ltr"
                    value={regWaliPhone}
                    onChange={(e) => setRegWaliPhone(e.target.value)}
                    placeholder="رقم هاتف الولي: +2010... (الوالد)"
                    className="w-full bg-stone-900 border border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-200 focus:outline-none focus:border-emerald-500 font-mono"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-xs text-stone-300 mb-1 font-medium">
                  النبذة والمواصفات الشرعية المطلوبة في شريك الحياة
                </label>
                <textarea
                  id="reg-bio-textarea"
                  rows={2}
                  value={regBio}
                  onChange={(e) => setRegBio(e.target.value)}
                  placeholder="أكتب بإيجاز عن التزامك بالصلاة، الحجاب/اللحية، وتطلعاتك لبناء بيت مسلم..."
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs text-stone-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Sharia Charter Agreement */}
              <div className="flex items-start gap-2.5 pt-1">
                <input
                  id="reg-charter-checkbox"
                  type="checkbox"
                  checked={agreedToCharter}
                  onChange={(e) => setAgreedToCharter(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-stone-700 text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer"
                />
                <label htmlFor="reg-charter-checkbox" className="text-xs text-stone-300 leading-relaxed cursor-pointer">
                  أقرّ وأتعهد أمام الله بصدق جميع البيانات، والالتزام بضوابط العفة الشرعية، وعدم تبادل أرقام التواصل أو اللقاءات إلا بإذن الولي وموافقة إدارة منهاج.
                </label>
              </div>

              <button
                type="submit"
                id="reg-submit-btn"
                disabled={loginLoading}
                className="w-full py-3 bg-gradient-to-r from-emerald-700 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 disabled:opacity-50 text-white rounded-xl font-medium text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950 transition-all"
              >
                {loginLoading ? (
                  <span>جاري إنشاء الحساب وإعداد المحفظة...</span>
                ) : (
                  <>
                    <FileCheck className="w-4 h-4" />
                    <span>
                      إتمام التسجيل كـ {selectedGender === 'male' ? 'رجل راغب في الزواج' : 'امرأة راغبة في الزواج'} (+200 نقطة ترحيبية)
                    </span>
                  </>
                )}
              </button>
            </form>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-stone-950 border-t border-stone-800 flex items-center justify-between text-[11px] text-stone-400">
          <span className="flex items-center gap-1.5 text-stone-400">
            <Lock className="w-3.5 h-3.5 text-emerald-500" />
            <span>بياناتك محمية بتشفير عالي وضوابط شرعية مشددة</span>
          </span>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-200 underline text-[11px]"
          >
            المتابعة كزائر مستكشف
          </button>
        </div>
      </div>
    </div>
  );
};
