import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  BookMarked,
  Library,
  UploadCloud,
  FileText,
  Download,
  Copy,
  Check,
  Search,
  Filter,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Plus,
  Trash2,
  Sparkles,
  Info,
  X,
  FileCode,
  Tag,
  Calendar,
  Layers,
  Award,
} from 'lucide-react';
import {
  IslamicReference,
  ReferenceCategory,
  ReferenceExcerpt,
  INITIAL_ISLAMIC_REFERENCES,
} from '../types';
import { SupportedLanguage } from '../data/translations';

interface IslamicReferencesLibraryProps {
  theme: 'dark' | 'light';
  language: SupportedLanguage;
  isAdminLoggedIn?: boolean;
}

export function IslamicReferencesLibrary({
  theme,
  language,
  isAdminLoggedIn = false,
}: IslamicReferencesLibraryProps) {
  const isDark = theme === 'dark';
  const isAr = language === 'ar' || language === 'ur';

  // References state
  const [references, setReferences] = useState<IslamicReference[]>(INITIAL_ISLAMIC_REFERENCES);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ReferenceCategory | 'all'>('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeReadingRef, setActiveReadingRef] = useState<IslamicReference | null>(null);
  const [copiedCitationId, setCopiedCitationId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // New reference form state
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newInvestigator, setNewInvestigator] = useState('');
  const [newCategory, setNewCategory] = useState<ReferenceCategory>('fiqh_marriage');
  const [newPublisher, setNewPublisher] = useState('');
  const [newEdition, setNewEdition] = useState('');
  const [newYearHijri, setNewYearHijri] = useState('');
  const [newYearGregorian, setNewYearGregorian] = useState('');
  const [newVolumes, setNewVolumes] = useState(1);
  const [newPages, setNewPages] = useState('');
  const [newIsbn, setNewIsbn] = useState('');
  const [newSummary, setNewSummary] = useState('');
  const [newAppUsageScope, setNewAppUsageScope] = useState('');
  const [newCitationFormat, setNewCitationFormat] = useState('');
  
  // Attached e-book file state
  const [uploadedEbookName, setUploadedEbookName] = useState<string | null>(null);
  const [uploadedEbookSize, setUploadedEbookSize] = useState<string | null>(null);
  const [uploadedEbookFormat, setUploadedEbookFormat] = useState<'pdf' | 'epub' | 'txt' | 'doc'>('pdf');
  const [uploadedEbookDataUrl, setUploadedEbookDataUrl] = useState<string | null>(null);

  // New chapter excerpt builder state
  const [excerptsList, setExcerptsList] = useState<ReferenceExcerpt[]>([
    {
      chapterTitle: '',
      page: 1,
      volume: 1,
      textExcerpt: '',
      rulingOrBenefit: '',
    },
  ]);

  // Load references from server API with fallback to initial references
  useEffect(() => {
    fetchReferences();
  }, []);

  const fetchReferences = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/references');
      if (res.ok) {
        const data = await res.json();
        if (data.references && Array.isArray(data.references) && data.references.length > 0) {
          setReferences(data.references);
        }
      }
    } catch (err) {
      console.warn('Could not fetch references from server, using local initial references:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCopyCitation = (ref: IslamicReference) => {
    const textToCopy = ref.citationFormat || `${ref.author}. ${ref.title}. ${ref.publisher}, ${ref.edition}.`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedCitationId(ref.id);
    showToast(isAr ? 'تم نسخ صيغة التوثيق والاستشهاد بنجاح' : 'Citation copied to clipboard');
    setTimeout(() => setCopiedCitationId(null), 2500);
  };

  // Handle file selection for electronic book
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedEbookName(file.name);
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(2);
    setUploadedEbookSize(`${sizeInMb} MB`);

    const extension = file.name.split('.').pop()?.toLowerCase();
    if (extension === 'pdf') setUploadedEbookFormat('pdf');
    else if (extension === 'epub') setUploadedEbookFormat('epub');
    else if (extension === 'txt') setUploadedEbookFormat('txt');
    else setUploadedEbookFormat('doc');

    const reader = new FileReader();
    reader.onload = () => {
      setUploadedEbookDataUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAddExcerptRow = () => {
    setExcerptsList([
      ...excerptsList,
      {
        chapterTitle: '',
        page: 1,
        volume: 1,
        textExcerpt: '',
        rulingOrBenefit: '',
      },
    ]);
  };

  const handleRemoveExcerptRow = (index: number) => {
    setExcerptsList(excerptsList.filter((_, i) => i !== index));
  };

  const handleExcerptChange = (index: number, field: keyof ReferenceExcerpt, value: any) => {
    const updated = [...excerptsList];
    updated[index] = { ...updated[index], [field]: value };
    setExcerptsList(updated);
  };

  // Submit new reference
  const handleAddReferenceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAuthor.trim()) {
      showToast(isAr ? 'يرجى إدخال عنوان المرجع واسم المؤلف' : 'Please provide book title and author', 'error');
      return;
    }

    const payload = {
      title: newTitle.trim(),
      author: newAuthor.trim(),
      investigatorOrEditor: newInvestigator.trim() || undefined,
      category: newCategory,
      categoryLabelAr:
        newCategory === 'tafseer'
          ? 'التفسير وعلوم القرآن'
          : newCategory === 'hadith'
          ? 'الحديث الشريف والسنة'
          : newCategory === 'fiqh_marriage'
          ? 'فقه الأسرة والنكاح'
          : newCategory === 'quran_tajweed'
          ? 'علوم التلاوة والتجويد'
          : 'الفقه والمعاملات',
      categoryLabelEn:
        newCategory === 'tafseer'
          ? 'Quran Exegesis (Tafseer)'
          : newCategory === 'hadith'
          ? 'Hadith & Sunnah'
          : newCategory === 'fiqh_marriage'
          ? 'Family & Marriage Fiqh'
          : newCategory === 'quran_tajweed'
          ? 'Tajweed & Quran Recitation'
          : 'Jurisprudence & Governance',
      publisher: newPublisher.trim() || 'دار نشر معتمدة',
      edition: newEdition.trim() || 'الطبعة الأولى',
      publicationYearHijri: newYearHijri.trim() || undefined,
      publicationYearGregorian: newYearGregorian.trim() || undefined,
      volumesCount: Number(newVolumes) || 1,
      totalPages: Number(newPages) || undefined,
      isbnOrId: newIsbn.trim() || undefined,
      summary: newSummary.trim() || 'مرجع إسلامي موثق معتمد في استقاء الأحكام لمنصة منهاج.',
      summaryEn: 'Verified Islamic reference used by Minhaj platform for canonical guidance.',
      appUsageScope:
        newAppUsageScope.trim() ||
        'يستند عليه التطبيق في استقاء الأحكام والضوابط الشرعية وتوثيق الفتاوى المعتمدة.',
      appUsageScopeEn: 'Consulted by Minhaj platform for authenticated rulings and citations.',
      citationFormat:
        newCitationFormat.trim() ||
        `${newAuthor}. ${newTitle}. ${newPublisher ? newPublisher + '، ' : ''}${newEdition || ''}.`,
      sampleChaptersOrExcerpt: excerptsList.filter((ex) => ex.chapterTitle.trim() || ex.textExcerpt.trim()),
      ebookFile: uploadedEbookName
        ? {
            fileName: uploadedEbookName,
            fileSize: uploadedEbookSize || '1.0 MB',
            fileFormat: uploadedEbookFormat,
            fileDataUrl: uploadedEbookDataUrl || undefined,
            uploadedAt: new Date().toISOString().split('T')[0],
            uploadedBy: isAr ? 'باحث معتمد / إدارة منهاج' : 'Verified Contributor / Admin',
          }
        : undefined,
    };

    try {
      const res = await fetch('/api/references', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setReferences([data.reference, ...references]);
        showToast(isAr ? 'تم رفع وإضافة المرجع الموثق بنجاح!' : 'Reference uploaded successfully!');
        setIsAddModalOpen(false);
        // Reset form
        setNewTitle('');
        setNewAuthor('');
        setNewInvestigator('');
        setNewPublisher('');
        setNewEdition('');
        setNewYearHijri('');
        setNewYearGregorian('');
        setNewSummary('');
        setNewAppUsageScope('');
        setNewCitationFormat('');
        setUploadedEbookName(null);
        setUploadedEbookDataUrl(null);
        setExcerptsList([{ chapterTitle: '', page: 1, volume: 1, textExcerpt: '', rulingOrBenefit: '' }]);
      } else {
        const err = await res.json();
        showToast(err.error || 'حدث خطأ أثناء حفظ المرجع', 'error');
      }
    } catch (error) {
      // Offline fallback
      const localRef: IslamicReference = {
        id: `ref-local-${Date.now()}`,
        ...payload,
        verificationStatus: 'verified_authentic',
        verificationBadgeAr: 'مرجع معتمد وموثق',
        verificationBadgeEn: 'Verified Source',
        addedAt: new Date().toISOString(),
        isOfficialCurated: false,
      };
      setReferences([localRef, ...references]);
      showToast(isAr ? 'تم حفظ المرجع محلياً بنجاح' : 'Reference added locally', 'success');
      setIsAddModalOpen(false);
    }
  };

  const handleDeleteReference = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(isAr ? 'هل أنت متأكد من رغبتك في حذف هذا المرجع؟' : 'Are you sure you want to delete this reference?')) {
      return;
    }

    try {
      await fetch(`/api/references/${id}`, { method: 'DELETE' });
    } catch (e) {
      // ignore
    }
    setReferences(references.filter((r) => r.id !== id));
    showToast(isAr ? 'تم حذف المرجع بنجاح' : 'Reference deleted');
  };

  // Filter references based on category and search query
  const filteredReferences = references.filter((ref) => {
    const matchesCat = selectedCategory === 'all' || ref.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    if (!q) return matchesCat;

    const matchesSearch =
      ref.title.toLowerCase().includes(q) ||
      ref.author.toLowerCase().includes(q) ||
      (ref.investigatorOrEditor && ref.investigatorOrEditor.toLowerCase().includes(q)) ||
      (ref.publisher && ref.publisher.toLowerCase().includes(q)) ||
      ref.summary.toLowerCase().includes(q) ||
      ref.appUsageScope.toLowerCase().includes(q);

    return matchesCat && matchesSearch;
  });

  const categories: { id: ReferenceCategory | 'all'; labelAr: string; labelEn: string }[] = [
    { id: 'all', labelAr: 'كافة المراجع والمصادر', labelEn: 'All References' },
    { id: 'tafseer', labelAr: 'التفسير وعلوم القرآن', labelEn: 'Tafseer & Quran' },
    { id: 'hadith', labelAr: 'الحديث والسنة النبوية', labelEn: 'Hadith & Sunnah' },
    { id: 'fiqh_marriage', labelAr: 'فقه الأسرة والنكاح والعفة', labelEn: 'Family & Marriage' },
    { id: 'quran_tajweed', labelAr: 'أحكام التجويد والتلاوة', labelEn: 'Tajweed Rules' },
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl border shadow-xl flex items-center gap-2 text-sm font-medium transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-950/95 border-emerald-500 text-emerald-200'
              : 'bg-red-950/95 border-red-500 text-red-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Hero Banner with Sharia Citation Statement */}
      <div
        className={`p-6 sm:p-8 rounded-3xl border relative overflow-hidden transition-all shadow-md ${
          isDark
            ? 'bg-gradient-to-br from-[#081a24] via-[#0b2533] to-[#081a24] border-[#164e63]'
            : 'bg-gradient-to-br from-[#f0fdf4] via-[#ffffff] to-[#ecfdf5] border-emerald-200'
        }`}
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border bg-emerald-500/10 border-emerald-500/30 text-emerald-500">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>
                {isAr ? 'منهج التوثيق العلمي والاستدلال الشرعي' : 'Canonical Islamic References & Citations'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-quran tracking-wide">
              {isAr ? 'المكتبة والمراجع الموثوقة لمنهاج' : 'Trusted Islamic References & E-Library'}
            </h1>
            <p className={`text-xs sm:text-sm leading-relaxed ${isDark ? 'text-stone-300' : 'text-stone-600'}`}>
              {isAr
                ? 'كافة ضوابط المنصة، أحكام العفة والتوافق الشرعي، اشتراط إذن الولي، نظام العربون (Escrow)، وتقييمات تلاوة وتجويد القرآن الكريم، مستقاة نصاً من أمهات كتب التفسير، دواوين السنة الصحيحة، وموسوعات الفقه المعتمدة مع توثيق المصدر بالأبواب وأرقام الصفحات.'
                : 'Every sharia rule, modesty filter, guardian protocol, and escrow model within Minhaj is strictly derived and cross-referenced from authoritative Islamic classical texts with precise volume, chapter, and page citations.'}
            </p>
          </div>

          {/* Action: Add / Upload E-Book Reference Button */}
          <div className="shrink-0 flex flex-col sm:flex-row items-center gap-3">
            <button
              id="open-upload-reference-modal-btn"
              onClick={() => setIsAddModalOpen(true)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 transition-all cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{isAr ? 'إضافة / رفع مرجع وكتاب إلكتروني' : 'Upload & Add Reference / E-Book'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div
        className={`p-4 rounded-2xl border flex flex-col md:flex-row items-center justify-between gap-4 ${
          isDark ? 'bg-[#081a24] border-[#164e63]' : 'bg-white border-stone-200 shadow-sm'
        }`}
      >
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : isDark
                    ? 'bg-[#0b212c] text-stone-300 hover:bg-[#103040] hover:text-white border border-[#164e63]/50'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {isAr ? cat.labelAr : cat.labelEn}
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isAr ? 'بحث في المراجع والمؤلفين...' : 'Search titles, authors...'}
            className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs border outline-none transition-all ${
              isDark
                ? 'bg-[#071923] border-[#164e63] text-stone-200 placeholder-stone-500 focus:border-emerald-500'
                : 'bg-stone-50 border-stone-200 text-stone-800 placeholder-stone-400 focus:border-emerald-500'
            }`}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Grid of References */}
      {filteredReferences.length === 0 ? (
        <div
          className={`p-12 text-center rounded-2xl border ${
            isDark ? 'bg-[#081a24] border-[#164e63] text-stone-400' : 'bg-white border-stone-200 text-stone-500'
          }`}
        >
          <BookMarked className="w-12 h-12 mx-auto mb-3 opacity-40 text-emerald-500" />
          <h3 className="text-base font-bold mb-1">{isAr ? 'لم يتم العثور على مراجع تطابق بحثك' : 'No matching references found'}</h3>
          <p className="text-xs">{isAr ? 'جرب البحث بكلمات أخرى أو تصفح كافة الأقسام' : 'Try searching with different terms or select All'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {filteredReferences.map((ref) => {
            const isOfficial = ref.isOfficialCurated;
            const hasEbook = Boolean(ref.ebookFile);

            return (
              <div
                key={ref.id}
                className={`p-5 sm:p-6 rounded-2xl border transition-all flex flex-col justify-between relative group ${
                  isDark
                    ? 'bg-[#091e2b] border-[#164e63] hover:border-emerald-500/60 shadow-sm'
                    : 'bg-white border-stone-200 hover:border-emerald-400 shadow-sm'
                }`}
              >
                <div className="space-y-3.5">
                  {/* Category & Badges Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
                        {isAr ? ref.categoryLabelAr : ref.categoryLabelEn}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-medium border flex items-center gap-1 ${
                          isOfficial
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                        }`}
                      >
                        <ShieldCheck className="w-3 h-3" />
                        <span>{isAr ? ref.verificationBadgeAr : ref.verificationBadgeEn}</span>
                      </span>
                    </div>

                    {/* Delete button (if user added) */}
                    {!isOfficial && (
                      <button
                        onClick={(e) => handleDeleteReference(ref.id, e)}
                        className="text-stone-400 hover:text-red-400 p-1 transition-colors"
                        title={isAr ? 'حذف هذا المرجع' : 'Delete reference'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Title & Author */}
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-stone-100 font-quran leading-snug">
                      {ref.title}
                    </h3>
                    <p className={`text-xs mt-1 font-medium ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                      {ref.author}
                    </p>
                    {ref.investigatorOrEditor && (
                      <p className={`text-[11px] ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
                        {isAr ? `تحقيق / عناية: ${ref.investigatorOrEditor}` : `Editor / Verifier: ${ref.investigatorOrEditor}`}
                      </p>
                    )}
                  </div>

                  {/* Scope of Citation in Minhaj */}
                  <div
                    className={`p-3 rounded-xl border text-xs leading-relaxed ${
                      isDark ? 'bg-[#06151e] border-[#164e63]/60 text-stone-300' : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 font-bold mb-1 text-emerald-400">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{isAr ? 'نطاق الاستشهاد به في منهاج:' : 'How Minhaj cites this reference:'}</span>
                    </div>
                    <p className="text-[11px] sm:text-xs">
                      {isAr ? ref.appUsageScope : ref.appUsageScopeEn || ref.appUsageScope}
                    </p>
                  </div>

                  {/* Metadata Chips (Publisher, Edition, Volumes, Pages) */}
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-stone-400 font-mono">
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-stone-400" />
                      <span>{ref.publisher}</span>
                    </span>
                    <span>•</span>
                    <span>{ref.edition}</span>
                    {ref.volumesCount && ref.volumesCount > 1 && (
                      <>
                        <span>•</span>
                        <span>{isAr ? `${ref.volumesCount} مجلدات` : `${ref.volumesCount} Vols`}</span>
                      </>
                    )}
                    {ref.isbnOrId && (
                      <>
                        <span>•</span>
                        <span className="text-[10px]">{ref.isbnOrId}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="mt-5 pt-3 border-t border-stone-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {/* View Details & Excerpts Button */}
                    <button
                      onClick={() => setActiveReadingRef(ref)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                        isDark
                          ? 'bg-[#0f2c3d] hover:bg-[#143a50] text-emerald-300 border border-[#164e63]'
                          : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{isAr ? 'استعراض الأبواب والأدلة' : 'Read Chapters & Excerpts'}</span>
                    </button>

                    {/* Copy Academic Citation */}
                    <button
                      onClick={() => handleCopyCitation(ref)}
                      className={`p-1.5 rounded-xl border text-xs font-medium transition-all cursor-pointer ${
                        copiedCitationId === ref.id
                          ? 'bg-emerald-600 text-white border-emerald-500'
                          : isDark
                          ? 'bg-[#071923] border-[#164e63] text-stone-300 hover:text-white'
                          : 'bg-stone-100 border-stone-200 text-stone-700 hover:bg-stone-200'
                      }`}
                      title={isAr ? 'نسخ التوثيق العلمي المعتمد' : 'Copy formal citation'}
                    >
                      {copiedCitationId === ref.id ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Download / View Attached E-Book */}
                  {hasEbook && (
                    <a
                      href={ref.ebookFile?.fileDataUrl || ref.ebookFile?.downloadUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={ref.ebookFile?.fileName}
                      className="inline-flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 font-bold"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline font-mono text-[10px]">{ref.ebookFile?.fileSize}</span>
                      <span>{isAr ? 'الكتاب الإلكتروني' : 'E-Book'}</span>
                      <Download className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📖 MODAL: Chapter & Excerpt Reader (استعراض أبواب ونصوص المرجع)           */}
      {/* ========================================================================= */}
      {activeReadingRef && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`w-full max-w-2xl max-h-[90vh] rounded-3xl border shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150 ${
              isDark ? 'bg-[#081a24] border-[#164e63] text-stone-100' : 'bg-white border-stone-200 text-stone-900'
            }`}
          >
            {/* Modal Header */}
            <div
              className={`p-5 border-b flex items-start justify-between gap-4 ${
                isDark ? 'bg-[#09212f] border-[#164e63]' : 'bg-stone-50 border-stone-200'
              }`}
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    {isAr ? activeReadingRef.categoryLabelAr : activeReadingRef.categoryLabelEn}
                  </span>
                  <span className="text-xs text-stone-400 font-mono">
                    {activeReadingRef.publisher} • {activeReadingRef.edition}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold font-quran">{activeReadingRef.title}</h2>
                <p className="text-xs text-amber-400 font-medium">{activeReadingRef.author}</p>
              </div>

              <button
                onClick={() => setActiveReadingRef(null)}
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                  isDark ? 'bg-stone-800 text-stone-400 hover:text-white' : 'bg-stone-200 text-stone-600 hover:text-stone-900'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-sm">
              {/* Reference Summary */}
              <div
                className={`p-4 rounded-2xl border text-xs leading-relaxed ${
                  isDark ? 'bg-[#06151e] border-[#164e63]/70 text-stone-300' : 'bg-stone-50 border-stone-200 text-stone-700'
                }`}
              >
                <h4 className="font-bold text-amber-400 mb-1 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" />
                  <span>{isAr ? 'عن المرجع وأهميته العلمية:' : 'About the Reference:'}</span>
                </h4>
                <p>{isAr ? activeReadingRef.summary : activeReadingRef.summaryEn || activeReadingRef.summary}</p>
              </div>

              {/* Verified Excerpts & Chapters */}
              <div className="space-y-4">
                <h4 className="font-bold text-sm text-emerald-400 flex items-center gap-2">
                  <BookMarked className="w-4 h-4" />
                  <span>{isAr ? 'الأبواب والنصوص المستدل بها في المنصة:' : 'Cited Chapters & Legal Evidence:'}</span>
                </h4>

                {activeReadingRef.sampleChaptersOrExcerpt.map((excerpt, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-2xl border space-y-3 ${
                      isDark ? 'bg-[#091f2c] border-[#164e63]' : 'bg-white border-stone-200 shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between border-b pb-2 border-stone-800/60">
                      <span className="font-bold text-xs text-cyan-400 font-quran">{excerpt.chapterTitle}</span>
                      <span className="text-[11px] font-mono text-amber-400">
                        {excerpt.volume ? (isAr ? `مجلد ${excerpt.volume}، ص ${excerpt.page}` : `Vol ${excerpt.volume}, p. ${excerpt.page}`) : (isAr ? `ص ${excerpt.page}` : `p. ${excerpt.page}`)}
                      </span>
                    </div>

                    {/* Original Text Excerpt */}
                    <div className="p-3 rounded-xl bg-black/20 border border-white/5 font-quran text-xs sm:text-sm leading-loose text-stone-200">
                      «{excerpt.textExcerpt}»
                    </div>

                    {/* Legal Ruling / Application Benefit */}
                    <div className="text-xs text-emerald-400 flex items-start gap-1.5">
                      <span className="font-bold shrink-0">{isAr ? 'وجه الاستدلال والتطبيق:' : 'Ruling / Application:'}</span>
                      <span className="text-stone-300">{excerpt.rulingOrBenefit}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Citation Box */}
              <div
                className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
                  isDark ? 'bg-[#06151e] border-[#164e63]' : 'bg-stone-50 border-stone-200'
                }`}
              >
                <div>
                  <div className="text-[10px] text-stone-400 font-bold mb-0.5">
                    {isAr ? 'صيغة التوثيق الأكاديمي المعتمدة:' : 'Approved Academic Citation Format:'}
                  </div>
                  <div className="text-xs font-mono text-stone-300 select-all">{activeReadingRef.citationFormat}</div>
                </div>
                <button
                  onClick={() => handleCopyCitation(activeReadingRef)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{isAr ? 'نسخ' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              className={`p-4 border-t flex items-center justify-between ${
                isDark ? 'bg-[#09212f] border-[#164e63]' : 'bg-stone-50 border-stone-200'
              }`}
            >
              {activeReadingRef.ebookFile ? (
                <a
                  href={activeReadingRef.ebookFile.fileDataUrl || activeReadingRef.ebookFile.downloadUrl || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={activeReadingRef.ebookFile.fileName}
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isAr ? 'تحميل الكتاب الإلكتروني كاملاً' : 'Download Full E-Book'}</span>
                  <span className="text-[10px] opacity-80">({activeReadingRef.ebookFile.fileSize})</span>
                </a>
              ) : (
                <span className="text-xs text-stone-400">
                  {isAr ? 'المرجع مستند للمطبوعة الورقية المعتمدة' : 'Referenced to authorized print edition'}
                </span>
              )}

              <button
                onClick={() => setActiveReadingRef(null)}
                className={`px-4 py-2 rounded-xl text-xs font-bold ${
                  isDark ? 'bg-stone-800 text-stone-300 hover:text-white' : 'bg-stone-200 text-stone-800'
                }`}
              >
                {isAr ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 📤 MODAL: Upload & Add Islamic Reference (رفع وإضافة كتاب ومرجع جديد)      */}
      {/* ========================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className={`w-full max-w-2xl max-h-[90vh] rounded-3xl border shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150 ${
              isDark ? 'bg-[#081a24] border-[#164e63] text-stone-100' : 'bg-white border-stone-200 text-stone-900'
            }`}
          >
            {/* Header */}
            <div
              className={`p-5 border-b flex items-center justify-between ${
                isDark ? 'bg-[#09212f] border-[#164e63]' : 'bg-stone-50 border-stone-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-emerald-500" />
                <div>
                  <h3 className="font-bold text-base font-quran">
                    {isAr ? 'إضافة ورفع مرجع أو كتاب إلكتروني موثق' : 'Upload & Add Islamic Reference / E-Book'}
                  </h3>
                  <p className="text-[11px] text-stone-400">
                    {isAr
                      ? 'توثيق مصادر الاستدلال العلمي والفقهي التي يستعين بها تطبيق منهاج'
                      : 'Add verified scholarly sources & citations for Minhaj application'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAddModalOpen(false)}
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isDark ? 'bg-stone-800 text-stone-400 hover:text-white' : 'bg-stone-200 text-stone-600 hover:text-stone-900'
                }`}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form Form */}
            <form onSubmit={handleAddReferenceSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Title */}
                <div>
                  <label className="block font-bold mb-1 text-stone-300">
                    {isAr ? 'عنوان الكتاب / المرجع *' : 'Book / Reference Title *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder={isAr ? 'مثال: فتح الباري شرح صحيح البخاري' : 'e.g. Fath al-Bari'}
                    className={`w-full p-2.5 rounded-xl border outline-none ${
                      isDark ? 'bg-[#06151e] border-[#164e63] text-stone-100' : 'bg-stone-50 border-stone-200'
                    }`}
                  />
                </div>

                {/* Author */}
                <div>
                  <label className="block font-bold mb-1 text-stone-300">
                    {isAr ? 'اسم المؤلف والعلَم *' : 'Author / Scholar *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                    placeholder={isAr ? 'مثال: الحافظ ابن حجر العسقلاني (ت 852 هـ)' : 'e.g. Ibn Hajar al-Asqalani'}
                    className={`w-full p-2.5 rounded-xl border outline-none ${
                      isDark ? 'bg-[#06151e] border-[#164e63] text-stone-100' : 'bg-stone-50 border-stone-200'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Category */}
                <div>
                  <label className="block font-bold mb-1 text-stone-300">
                    {isAr ? 'التصنيف العلمي *' : 'Category *'}
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as ReferenceCategory)}
                    className={`w-full p-2.5 rounded-xl border outline-none ${
                      isDark ? 'bg-[#06151e] border-[#164e63] text-stone-100' : 'bg-stone-50 border-stone-200'
                    }`}
                  >
                    <option value="fiqh_marriage">{isAr ? 'فقه الأسرة والنكاح' : 'Family & Marriage Fiqh'}</option>
                    <option value="tafseer">{isAr ? 'التفسير وعلوم القرآن' : 'Quran Exegesis (Tafseer)'}</option>
                    <option value="hadith">{isAr ? 'الحديث الشريف والسنة' : 'Hadith & Sunnah'}</option>
                    <option value="quran_tajweed">{isAr ? 'علوم التلاوة والتجويد' : 'Tajweed & Recitation'}</option>
                    <option value="sharia_governance">{isAr ? 'المعاملات والرقابة الشرعية' : 'Governance & Transactions'}</option>
                  </select>
                </div>

                {/* Investigator / Editor */}
                <div>
                  <label className="block font-bold mb-1 text-stone-300">
                    {isAr ? 'المحقق / المراجع (اختياري)' : 'Editor / Investigator'}
                  </label>
                  <input
                    type="text"
                    value={newInvestigator}
                    onChange={(e) => setNewInvestigator(e.target.value)}
                    placeholder={isAr ? 'اسم المحقق العلمي' : 'Editor name'}
                    className={`w-full p-2.5 rounded-xl border outline-none ${
                      isDark ? 'bg-[#06151e] border-[#164e63] text-stone-100' : 'bg-stone-50 border-stone-200'
                    }`}
                  />
                </div>

                {/* Publisher & Edition */}
                <div>
                  <label className="block font-bold mb-1 text-stone-300">
                    {isAr ? 'دار النشر والطبعة' : 'Publisher & Edition'}
                  </label>
                  <input
                    type="text"
                    value={newPublisher}
                    onChange={(e) => setNewPublisher(e.target.value)}
                    placeholder={isAr ? 'دار المعرفة - ط1' : 'Publisher - Ed. 1'}
                    className={`w-full p-2.5 rounded-xl border outline-none ${
                      isDark ? 'bg-[#06151e] border-[#164e63] text-stone-100' : 'bg-stone-50 border-stone-200'
                    }`}
                  />
                </div>
              </div>

              {/* Electronic Book File Upload Box (رفع الكتاب الإلكتروني) */}
              <div
                className={`p-4 rounded-2xl border-2 border-dashed transition-all ${
                  isDark ? 'bg-[#06151e] border-[#164e63] hover:border-emerald-500' : 'bg-emerald-50/50 border-emerald-300'
                }`}
              >
                <div className="flex flex-col items-center justify-center text-center space-y-2">
                  <FileText className="w-8 h-8 text-emerald-400" />
                  <div>
                    <span className="font-bold text-xs sm:text-sm">
                      {isAr ? 'رفع الكتاب الإلكتروني (PDF / EPUB / TXT)' : 'Upload E-Book File (PDF / EPUB / TXT)'}
                    </span>
                    <p className="text-[11px] text-stone-400">
                      {isAr
                        ? 'اختر ملف الكتاب الإلكتروني لتمكين المستفيدين من تصفحه أو تحميله'
                        : 'Select digital book for users to read or download'}
                    </p>
                  </div>

                  <label className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer transition-all flex items-center gap-1.5">
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>{isAr ? 'اختيار ملف الكتاب الإلكتروني' : 'Browse E-Book File'}</span>
                    <input
                      type="file"
                      accept=".pdf,.epub,.txt,.doc,.docx"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>

                  {uploadedEbookName && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-emerald-400 font-mono bg-emerald-950/60 px-3 py-1 rounded-lg border border-emerald-700/50">
                      <Check className="w-3.5 h-3.5" />
                      <span>{uploadedEbookName}</span>
                      <span>({uploadedEbookSize})</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Scope of Citation in Minhaj */}
              <div>
                <label className="block font-bold mb-1 text-stone-300">
                  {isAr
                    ? 'نطاق ومجالات استقاء تطبيق منهاج لمعلوماته من هذا المرجع *'
                    : 'How Minhaj cites & derives rulings from this reference *'}
                </label>
                <textarea
                  rows={2}
                  required
                  value={newAppUsageScope}
                  onChange={(e) => setNewAppUsageScope(e.target.value)}
                  placeholder={
                    isAr
                      ? 'مثال: يُستقى منه فقه الكفاءة في النكاح، وضوابط عدم إفشاء بيانات المخطوبة إلا لمتقدم واحد معتمد...'
                      : 'e.g. Cited for modesty guidelines, guardian consent, and Quran recitation rules...'
                  }
                  className={`w-full p-2.5 rounded-xl border outline-none ${
                    isDark ? 'bg-[#06151e] border-[#164e63] text-stone-100' : 'bg-stone-50 border-stone-200'
                  }`}
                />
              </div>

              {/* Summary */}
              <div>
                <label className="block font-bold mb-1 text-stone-300">
                  {isAr ? 'نبذة وموجز عن الكتاب ومحتواه' : 'Brief Summary of the Book'}
                </label>
                <textarea
                  rows={2}
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  placeholder={isAr ? 'ملخص عام عن الكتاب وقيمته العلمية...' : 'General overview of the book...'}
                  className={`w-full p-2.5 rounded-xl border outline-none ${
                    isDark ? 'bg-[#06151e] border-[#164e63] text-stone-100' : 'bg-stone-50 border-stone-200'
                  }`}
                />
              </div>

              {/* Sample Chapters / Excerpts Section */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <BookMarked className="w-4 h-4" />
                    <span>{isAr ? 'أبواب ونصوص مستدل بها من الكتاب (اختياري)' : 'Cited Chapters & Excerpts'}</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddExcerptRow}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>{isAr ? 'إضافة باب / استشهاد' : 'Add Chapter'}</span>
                  </button>
                </div>

                {excerptsList.map((excerpt, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border space-y-2 relative ${
                      isDark ? 'bg-[#06151e] border-[#164e63]' : 'bg-stone-50 border-stone-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        placeholder={isAr ? 'عنوان الباب أو الفصل' : 'Chapter Title'}
                        value={excerpt.chapterTitle}
                        onChange={(e) => handleExcerptChange(idx, 'chapterTitle', e.target.value)}
                        className={`flex-1 p-2 rounded-lg border text-xs outline-none ${
                          isDark ? 'bg-[#081a24] border-[#164e63] text-stone-100' : 'bg-white border-stone-200'
                        }`}
                      />
                      <input
                        type="number"
                        placeholder={isAr ? 'المجلد' : 'Vol'}
                        value={excerpt.volume || ''}
                        onChange={(e) => handleExcerptChange(idx, 'volume', Number(e.target.value))}
                        className={`w-16 p-2 rounded-lg border text-xs outline-none ${
                          isDark ? 'bg-[#081a24] border-[#164e63] text-stone-100' : 'bg-white border-stone-200'
                        }`}
                      />
                      <input
                        type="number"
                        placeholder={isAr ? 'الصفحة' : 'Page'}
                        value={excerpt.page || ''}
                        onChange={(e) => handleExcerptChange(idx, 'page', Number(e.target.value))}
                        className={`w-16 p-2 rounded-lg border text-xs outline-none ${
                          isDark ? 'bg-[#081a24] border-[#164e63] text-stone-100' : 'bg-white border-stone-200'
                        }`}
                      />
                      {excerptsList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveExcerptRow(idx)}
                          className="text-stone-400 hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <textarea
                      rows={2}
                      placeholder={isAr ? 'نص العبارة أو الحديث أو الحكم المستدل به...' : 'Exact text excerpt from the book...'}
                      value={excerpt.textExcerpt}
                      onChange={(e) => handleExcerptChange(idx, 'textExcerpt', e.target.value)}
                      className={`w-full p-2 rounded-lg border text-xs outline-none font-quran ${
                        isDark ? 'bg-[#081a24] border-[#164e63] text-stone-100' : 'bg-white border-stone-200'
                      }`}
                    />

                    <input
                      type="text"
                      placeholder={isAr ? 'وجه الاستدلال والتطبيق في منهاج...' : 'How this ruling is applied in Minhaj...'}
                      value={excerpt.rulingOrBenefit}
                      onChange={(e) => handleExcerptChange(idx, 'rulingOrBenefit', e.target.value)}
                      className={`w-full p-2 rounded-lg border text-xs outline-none ${
                        isDark ? 'bg-[#081a24] border-[#164e63] text-stone-100' : 'bg-white border-stone-200'
                      }`}
                    />
                  </div>
                ))}
              </div>

              {/* Submit Buttons */}
              <div
                className={`pt-4 border-t flex items-center justify-end gap-3 ${
                  isDark ? 'border-[#164e63]' : 'border-stone-200'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold ${
                    isDark ? 'bg-stone-800 text-stone-300 hover:text-white' : 'bg-stone-200 text-stone-800'
                  }`}
                >
                  {isAr ? 'إلغاء' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-900/30 transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{isAr ? 'اعتماد وحفظ المرجع في النظام' : 'Save & Authorize Reference'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
