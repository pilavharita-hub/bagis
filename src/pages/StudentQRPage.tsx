import { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, QrCode, Mail, RefreshCw, CheckCircle, Clock,
  XCircle, AlertCircle, GraduationCap, Shield, Flame, Phone,
  BadgeCheck, Lock, ChevronRight
} from 'lucide-react';
import QRCode from 'qrcode';
import { supabase, getDeviceFingerprint } from '../lib/supabase';
import type { Page } from '../App';

interface StudentData {
  id: string;
  full_name: string;
  email: string;
  university: string;
  department: string;
  student_number: string;
  status: 'pending' | 'approved' | 'rejected';
  daily_limit: number;
  weekly_limit: number;
  total_meals_received: number;
  rejection_reason?: string;
  created_at: string;
}

export default function StudentQRPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const [emailInput, setEmailInput] = useState('');
  const [student, setStudent] = useState<StudentData | null>(null);
  const [activeToken, setActiveToken] = useState<{ id: string; token: string; expires_at: string; status: string } | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [error, setError] = useState('');
  const [dailyMealsToday, setDailyMealsToday] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearTimer = () => { if (timerRef.current) clearInterval(timerRef.current); };
  useEffect(() => () => clearTimer(), []);

  const startTimer = (expiresAt: string) => {
    clearTimer();
    const tick = () => {
      const remaining = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearTimer();
        setActiveToken((t) => t ? { ...t, status: 'expired' } : t);
      }
    };
    tick();
    timerRef.current = setInterval(tick, 1000);
  };

  const generateQR = async (token: string) => {
    const url = await QRCode.toDataURL(token, {
      width: 300, margin: 2,
      color: { dark: '#0a0a0a', light: '#ffffff' },
      errorCorrectionLevel: 'H',
    });
    setQrDataUrl(url);
  };

  const fetchDailyMeals = async (studentId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('student_daily_meals').select('meals_received')
      .eq('student_id', studentId).eq('meal_date', today).maybeSingle();
    setDailyMealsToday(data?.meals_received ?? 0);
    return data?.meals_received ?? 0;
  };

  const lookupStudent = async () => {
    if (!emailInput.trim()) { setError('E-posta adresinizi girin.'); return; }
    setError('');
    setLookupLoading(true);
    setStudent(null);
    setActiveToken(null);
    setQrDataUrl('');
    clearTimer();

    const { data, error: dbError } = await supabase
      .from('students').select('*').eq('email', emailInput.trim().toLowerCase()).maybeSingle();

    setLookupLoading(false);
    if (dbError || !data) { setError('Bu e-posta ile kayıtlı öğrenci bulunamadı.'); return; }

    setStudent(data as StudentData);
    if (data.status === 'approved') {
      await fetchDailyMeals(data.id);
      const { data: existingToken } = await supabase
        .from('qr_tokens').select('*')
        .eq('student_id', data.id).eq('status', 'active')
        .gt('expires_at', new Date().toISOString()).maybeSingle();
      if (existingToken) {
        setActiveToken(existingToken);
        await generateQR(existingToken.token);
        startTimer(existingToken.expires_at);
      }
    }
  };

  const createNewQR = async () => {
    if (!student || student.status !== 'approved') return;
    setError('');
    setLoading(true);

    const dailyCount = await fetchDailyMeals(student.id);
    const dailyLimit = student.daily_limit ?? 2;
    if (dailyCount >= dailyLimit) {
      setError(`Günlük ${dailyLimit} porsiyon limitine ulaştın. Yarın tekrar gelebilirsin.`);
      setLoading(false);
      return;
    }

    const fingerprint = getDeviceFingerprint();
    const today = new Date().toISOString().split('T')[0];
    const { data: fpCheck } = await supabase
      .from('qr_tokens').select('student_id')
      .eq('device_fingerprint', fingerprint).eq('status', 'used')
      .gte('used_at', `${today}T00:00:00`).neq('student_id', student.id).maybeSingle();

    if (fpCheck) {
      setError('Bu cihazdan bugün başka bir öğrenci için QR kullanılmış. Suistimal tespit edildi.');
      setLoading(false);
      return;
    }

    await supabase.from('qr_tokens').update({ status: 'expired' })
      .eq('student_id', student.id).eq('status', 'active');

    const token = `AP-${student.id.slice(0, 8).toUpperCase()}-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const { data, error: dbError } = await supabase.from('qr_tokens').insert({
      student_id: student.id, token, expires_at: expiresAt,
      status: 'active', meal_count: 1, device_fingerprint: fingerprint,
    }).select().single();

    setLoading(false);
    if (dbError || !data) { setError('QR oluşturulamadı. Tekrar deneyin.'); return; }

    setActiveToken(data);
    await generateQR(token);
    startTimer(expiresAt);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const dailyLimit = student?.daily_limit ?? 2;
  const alreadyUsedToday = dailyMealsToday >= dailyLimit;
  const timerPct = Math.min(100, (timeLeft / 600) * 100);

  return (
    <div className="min-h-screen bg-ink-950 pt-24">

      {/* Sticky header */}
      <div className="sticky top-[88px] z-30 bg-ink-950/97 backdrop-blur-2xl border-b border-ink-800/60">
        <div className="max-w-lg mx-auto px-5 py-4 flex items-center justify-between">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-2 text-ink-500 hover:text-white text-sm group transition-colors"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            Ana Sayfa
          </button>
          <div className="flex items-center gap-2">
            <div className="live-dot-sm" />
            <span className="text-ink-500 text-[9px] font-black uppercase tracking-[0.3em]">Yemek Al · QR</span>
          </div>
          <div className="w-16" />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 py-12">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 bg-red-600/15 border border-red-600/20 rounded-xl flex items-center justify-center">
              <QrCode size={15} className="text-red-400" />
            </div>
            <span className="text-red-500 text-[10px] font-black uppercase tracking-[0.3em]">Anlık QR Sistemi</span>
          </div>
          <h1 className="heading-display text-[clamp(2.5rem,6vw,4rem)] text-white leading-[0.88] mb-3">
            QR KOD AL
          </h1>
          <p className="text-ink-500 text-sm">E-postanı gir, kodunu al, dağıtım noktasında okut.</p>
        </div>

        {/* Email lookup */}
        {!student && (
          <>
            <div className="relative bg-ink-900 border border-ink-800 rounded-2xl p-6 mb-4 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-600/20 to-transparent" />
              <label className="block text-ink-600 text-[9px] font-black uppercase tracking-[0.28em] mb-3">
                Kayıtlı E-postan
              </label>
              <div className="flex gap-3">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && lookupStudent()}
                  placeholder="ornek@edu.tr"
                  className="flex-1 bg-ink-800/60 border border-ink-700 focus:border-red-600 text-white placeholder:text-ink-700 rounded-xl px-4 py-3.5 text-sm outline-none transition-colors mono"
                />
                <button
                  onClick={lookupStudent}
                  disabled={lookupLoading}
                  className="btn-red px-5 py-3 font-black heading-display tracking-wider text-sm rounded-xl disabled:opacity-40"
                >
                  {lookupLoading
                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : 'Sorgula'
                  }
                </button>
              </div>
            </div>

            {/* Not registered CTA */}
            <div className="bg-ink-900/50 border border-ink-800/60 rounded-xl p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-ink-800 border border-ink-700 rounded-xl flex items-center justify-center flex-shrink-0">
                  <GraduationCap size={16} className="text-ink-500" />
                </div>
                <div>
                  <div className="text-ink-300 text-sm font-semibold">Henüz kayıt olmadın mı?</div>
                  <div className="text-ink-600 text-xs">Ücretsiz, ~3 dakika sürer</div>
                </div>
              </div>
              <button
                onClick={() => onNavigate('student-register')}
                className="flex items-center gap-1.5 text-red-400 hover:text-red-300 text-sm font-semibold transition-colors flex-shrink-0"
              >
                Kayıt Ol <ChevronRight size={13} />
              </button>
            </div>
          </>
        )}

        {error && (
          <div className="flex items-center gap-3 bg-red-500/8 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm mb-5">
            <AlertCircle size={14} className="flex-shrink-0" /> {error}
          </div>
        )}

        {student && (
          <div className="space-y-4">

            {/* Student identity card */}
            <div className="relative bg-ink-900 border border-ink-800 rounded-2xl p-5 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-600/20 to-transparent" />
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center text-white font-black text-xl heading-display shadow-glow-red-sm flex-shrink-0">
                  {student.full_name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-white text-base truncate">{student.full_name}</div>
                  <div className="text-ink-500 text-xs truncate">{student.university}</div>
                  <div className="text-ink-700 text-[10px] mono">{student.department} · #{student.student_number}</div>
                </div>
                <button
                  onClick={() => { setStudent(null); setActiveToken(null); setQrDataUrl(''); setEmailInput(''); clearTimer(); }}
                  className="text-ink-700 hover:text-ink-400 text-xs transition-colors flex-shrink-0 px-2 py-1 rounded-lg hover:bg-ink-800"
                >
                  Değiştir
                </button>
              </div>

              {/* Status badge */}
              {student.status === 'approved' && (
                <div className="flex items-center justify-between bg-green-500/8 border border-green-500/20 rounded-xl p-3">
                  <div className="flex items-center gap-2.5">
                    <BadgeCheck size={15} className="text-green-400 flex-shrink-0" />
                    <div>
                      <div className="text-green-400 font-bold text-sm">Onaylı Öğrenci</div>
                      <div className="text-ink-600 text-xs">Bugün {dailyMealsToday}/{dailyLimit} porsiyon kullandın</div>
                    </div>
                  </div>
                  <div className="text-green-500 text-xs font-black mono">{dailyLimit - dailyMealsToday} kalan</div>
                </div>
              )}
              {student.status === 'pending' && (
                <div className="flex items-start gap-3 bg-amber-500/8 border border-amber-500/20 rounded-xl p-4">
                  <Clock size={15} className="text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-amber-400 font-bold text-sm mb-0.5">Onay Bekleniyor</div>
                    <div className="text-ink-500 text-xs leading-relaxed">
                      Belgeniz inceleniyor. Genellikle 24 saat içinde sonuçlanır.
                      Onaylandıktan sonra bu sayfadan QR alabilirsiniz.
                    </div>
                    <a href="mailto:ankara@pilavustuask.com" className="inline-flex items-center gap-1.5 text-amber-600 hover:text-amber-400 text-xs mt-2 transition-colors">
                      <Mail size={10} /> Soru için: ankara@pilavustuask.com
                    </a>
                  </div>
                </div>
              )}
              {student.status === 'rejected' && (
                <div className="bg-red-500/8 border border-red-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle size={14} className="text-red-400" />
                    <span className="text-red-400 font-bold text-sm">Başvuru Reddedildi</span>
                  </div>
                  <p className="text-ink-500 text-xs leading-relaxed mb-3">
                    {student.rejection_reason || 'Belge doğrulama başarısız. Detay için iletişime geçin.'}
                  </p>
                  <a href="mailto:ankara@pilavustuask.com" className="inline-flex items-center gap-1.5 text-red-500 hover:text-red-400 text-xs transition-colors">
                    <Mail size={10} /> ankara@pilavustuask.com
                  </a>
                </div>
              )}
            </div>

            {/* QR section for approved */}
            {student.status === 'approved' && (
              <>
                {alreadyUsedToday ? (
                  <div className="relative bg-ink-900 border border-green-500/20 rounded-2xl p-10 text-center overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500/30 to-transparent" />
                    <div className="w-18 h-18 bg-green-500/12 border border-green-500/25 rounded-full flex items-center justify-center mx-auto mb-5" style={{ width: 72, height: 72 }}>
                      <CheckCircle size={32} className="text-green-400" />
                    </div>
                    <h3 className="heading-display text-3xl text-white mb-2">BUGÜN DOYURULDUN</h3>
                    <p className="text-ink-500 text-sm mb-1">Günlük {dailyLimit} porsiyon hakkın doldu.</p>
                    <p className="text-ink-700 text-xs">Yarın yeniden yemek alabilirsin.</p>
                  </div>

                ) : !activeToken || activeToken.status !== 'active' ? (
                  <div className="relative bg-ink-900 border border-ink-800 rounded-2xl p-8 text-center overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-600/25 to-transparent" />
                    <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(225,29,72,0.04), transparent)' }} />

                    <div className="relative">
                      <div className="w-16 h-16 bg-red-600/12 border border-red-600/20 rounded-2xl flex items-center justify-center mx-auto mb-5">
                        <QrCode size={28} className="text-red-400" />
                      </div>
                      <h3 className="heading-display text-3xl text-white mb-2">YEMEK ALMAYA HAZIR MISIN?</h3>
                      <p className="text-ink-500 text-sm mb-1">Butona bas, QR kodun oluşsun.</p>
                      <p className="text-amber-500 text-xs font-semibold mb-8 mono">10 dakika geçerli · tek kullanımlık</p>

                      <div className="flex items-center justify-center gap-5 text-xs text-ink-700 mb-8">
                        <div className="flex items-center gap-1.5">
                          <Shield size={10} /> Cihaz doğrulama
                        </div>
                        <div className="w-px h-3 bg-ink-800" />
                        <div className="flex items-center gap-1.5">
                          <Lock size={10} /> Şifreli token
                        </div>
                        <div className="w-px h-3 bg-ink-800" />
                        <div className="flex items-center gap-1.5">
                          <Flame size={10} /> Anti-suistimal
                        </div>
                      </div>

                      <button
                        onClick={createNewQR}
                        disabled={loading}
                        className="w-full btn-red py-4 text-base font-black heading-display tracking-wider disabled:opacity-40 group"
                      >
                        {loading
                          ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          : <QrCode size={20} className="group-hover:scale-110 transition-transform" />
                        }
                        {loading ? 'OLUŞTURULUYOR...' : 'QR KOD OLUŞTUR'}
                      </button>
                    </div>
                  </div>

                ) : (
                  /* Active QR display */
                  <div className="bg-white rounded-2xl overflow-hidden shadow-deep">
                    {/* QR header */}
                    <div className="bg-ink-950 px-6 pt-6 pb-4 text-center border-b border-gray-100">
                      <div className="text-ink-300 text-[9px] font-black uppercase tracking-[0.35em] mb-1">ASKIDA PİLAV · ANKARA</div>
                      <div className="text-ink-500 text-[10px]">Dağıtım noktasında okutun · Tek kullanım</div>
                    </div>

                    <div className="p-6 text-center">
                      {qrDataUrl && (
                        <div className="relative inline-block mb-5">
                          <img src={qrDataUrl} alt="QR Kod" className="w-64 h-64 mx-auto rounded-xl" />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md border border-gray-100">
                              <span className="text-red-600 font-black text-xs heading-display">AP</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="text-ink-900 font-bold text-base mb-0.5">{student.full_name}</div>
                      <div className="text-gray-400 text-xs mb-1">{student.university}</div>
                      <div className="text-gray-500 text-[10px] mono mb-5">#{student.student_number}</div>

                      {/* Timer with circular progress feel */}
                      <div className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full text-sm font-bold mb-5 ${
                        timeLeft > 300 ? 'bg-green-100 text-green-700' :
                        timeLeft > 60 ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700 animate-pulse'
                      }`}>
                        <Clock size={14} />
                        <span className="mono tabular-nums">{formatTime(timeLeft)}</span>
                        <span className="font-normal text-xs">kaldı</span>
                      </div>

                      {/* Timer bar */}
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden mb-5 mx-4">
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{
                            width: `${timerPct}%`,
                            background: timeLeft > 300 ? '#22c55e' : timeLeft > 60 ? '#f59e0b' : '#ef4444'
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-center gap-4 text-gray-400 text-[10px] mb-5">
                        <span className="mono">1 porsiyon</span>
                        <span>·</span>
                        <span>Günlük {dailyLimit} hak</span>
                        <span>·</span>
                        <span>{dailyLimit - dailyMealsToday} kalan</span>
                      </div>

                      <button
                        onClick={createNewQR}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 text-gray-400 hover:text-gray-600 text-xs font-medium transition-colors mx-auto"
                      >
                        <RefreshCw size={11} />
                        Kodu Yenile
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Trust strip at bottom */}
        {!student && (
          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              { icon: Shield, text: 'Güvenli sistem' },
              { icon: BadgeCheck, text: 'Doğrulanmış' },
              { icon: Lock, text: 'Gizli veriler' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="bg-ink-900/40 border border-ink-800/60 rounded-xl p-3 text-center">
                <Icon size={14} className="text-ink-600 mx-auto mb-1.5" />
                <div className="text-ink-700 text-[10px] font-medium">{text}</div>
              </div>
            ))}
          </div>
        )}

        {/* Contact */}
        <div className="mt-8 text-center">
          <p className="text-ink-800 text-xs mb-2">Sorun mu var?</p>
          <div className="flex items-center justify-center gap-5">
            <a href="mailto:ankara@pilavustuask.com" className="flex items-center gap-1.5 text-ink-700 hover:text-red-400 text-xs transition-colors">
              <Mail size={10} /> ankara@pilavustuask.com
            </a>
            <a href="tel:+905102225696" className="flex items-center gap-1.5 text-ink-700 hover:text-red-400 text-xs transition-colors">
              <Phone size={10} /> 0510 222 56 96
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
