import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  Send,
  Users,
  MessageCircle,
  ShieldCheck,
  Radio,
  BookOpen,
  Award,
} from 'lucide-react';
import { HalqaRoomData } from '../../types';

interface WhatsAppInviteModalProps {
  room: HalqaRoomData;
  isOpen: boolean;
  onClose: () => void;
  isDark?: boolean;
  onRewardPoints?: (points: number, message: string) => void;
}

export function WhatsAppInviteModal({
  room,
  isOpen,
  onClose,
  isDark = true,
  onRewardPoints,
}: WhatsAppInviteModalProps) {
  const [phoneInput, setPhoneInput] = useState<string>('');
  const [phonesList, setPhonesList] = useState<string[]>([]);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [sentFeedback, setSentFeedback] = useState<string | null>(null);

  if (!isOpen) return null;

  // Generate invitation link and message
  const roomUrl = `${window.location.origin}/?tab=halaqat&roomId=${room.id}`;
  const defaultInviteMessage = `السلام عليكم ورحمة الله وبركاته،
يسرنا دعوتكم الكريمة لحضور مجلس مدارسة وتدبر قرآني مبارك:
📖 الحلقة: "${room.title}"
🎙️ المشرف: فضيلة ${room.sheikhHost.name} (${room.sheikhHost.title})
📜 السورة المقررة: سورة ${room.surahName} (الآيات ${room.ayahStart} إلى ${room.ayahEnd})
🎥 نظام الجلسة: اجتماع مسموع ومرئي عالي الدقة وتوثيق بالذكاء الاصطناعي
⏰ الموعد: ${room.scheduledTime || 'مباشر الآن'}

للانضمام المباشر عبر منصة منهاج:
${roomUrl}

نسأل الله أن يجعلنا وإياكم من أهل القرآن الذين هم أهل الله وخاصته.`;

  const [customMessage, setCustomMessage] = useState<string>(defaultInviteMessage);

  // Add Phone
  const handleAddPhone = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = phoneInput.trim();
    if (clean && !phonesList.includes(clean)) {
      setPhonesList([...phonesList, clean]);
      setPhoneInput('');
    }
  };

  const handleRemovePhone = (index: number) => {
    setPhonesList(phonesList.filter((_, i) => i !== index));
  };

  // Copy to Clipboard
  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(customMessage);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    } catch (err) {
      console.warn('Copy failed:', err);
    }
  };

  // Dispatch WhatsApp Invitation
  const handleSendViaWhatsApp = async () => {
    setIsSending(true);
    try {
      // 1. Notify backend API
      await fetch('/api/v1/halaqat/whatsapp-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomId: room.id,
          memberPhones: phonesList,
          customMessage,
        }),
      });

      // 2. Open WhatsApp Web or Mobile app
      const encodedMsg = encodeURIComponent(customMessage);
      let waUrl = `https://api.whatsapp.com/send?text=${encodedMsg}`;

      if (phonesList.length === 1) {
        const singlePhone = phonesList[0].replace(/\D/g, '');
        waUrl = `https://api.whatsapp.com/send?phone=${singlePhone}&text=${encodedMsg}`;
      }

      window.open(waUrl, '_blank');

      setSentFeedback(`تم إعداد وإرسال الدعوة عبر الواتساب بنجاح!`);
      if (onRewardPoints) {
        onRewardPoints(10, 'دعوة أعضاء وإخوان لحلقات مدارسة القرآن الكريم');
      }
      setTimeout(() => {
        setSentFeedback(null);
        onClose();
      }, 2500);
    } catch (err) {
      console.warn('Could not dispatch whatsapp invite:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className={`w-full max-w-lg rounded-3xl border p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto ${
        isDark ? 'bg-slate-900 border-emerald-800/40 text-slate-100' : 'bg-white border-emerald-200 text-slate-800'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold">إرسال دعوات الانضمام عبر الواتساب</h3>
              <p className="text-[11px] text-slate-400">دعوة الأعضاء المطلوب انضمامهم للمجلس القرآني</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-200">
            ✕
          </button>
        </div>

        {sentFeedback && (
          <div className="p-3 rounded-2xl bg-emerald-900/90 text-emerald-100 border border-emerald-500/40 text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-300" />
            <span>{sentFeedback}</span>
          </div>
        )}

        {/* Room Details Card */}
        <div className="p-3 rounded-2xl bg-slate-800/50 border border-slate-800 space-y-1.5 text-xs text-slate-300">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-100">{room.title}</span>
            <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {room.categoryLabel}
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>المشرف: {room.sheikhHost.name}</span>
            <span>سورة {room.surahName} ({room.ayahStart}-{room.ayahEnd})</span>
          </div>
        </div>

        {/* Phone Numbers of Members to Invite */}
        <div className="space-y-1.5 text-xs">
          <label className="block font-semibold text-slate-300">
            أرقام هواتف الأعضاء المطلوب انضمامهم (واتساب):
          </label>
          <div className="flex items-center gap-2">
            <input
              type="tel"
              placeholder="مثال: +966500000000 أو 01000000000"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddPhone();
                }
              }}
              className="flex-1 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-100 focus:outline-none focus:border-emerald-500 text-xs"
            />
            <button
              type="button"
              onClick={() => handleAddPhone()}
              className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-semibold transition-colors"
            >
              إضافة
            </button>
          </div>

          {phonesList.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {phonesList.map((phone, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-700/40 text-emerald-300 text-[11px] flex items-center gap-1.5"
                >
                  <span>{phone}</span>
                  <button
                    onClick={() => handleRemovePhone(idx)}
                    className="text-emerald-400 hover:text-red-400 text-xs font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Custom Message Preview */}
        <div className="space-y-1 text-xs">
          <div className="flex items-center justify-between">
            <label className="font-semibold text-slate-300">نص رسالة الدعوة في الواتساب:</label>
            <button
              type="button"
              onClick={handleCopyMessage}
              className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 text-[11px]"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{isCopied ? 'تم نسخ الرسالة' : 'نسخ الرسالة'}</span>
            </button>
          </div>
          <textarea
            rows={5}
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-emerald-500 text-xs leading-relaxed resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
          >
            إغلاق
          </button>
          <button
            type="button"
            onClick={handleSendViaWhatsApp}
            disabled={isSending}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg transition-all flex items-center gap-2"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSending ? 'جاري الفتح...' : 'إرسال الدعوة عبر الواتساب'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
