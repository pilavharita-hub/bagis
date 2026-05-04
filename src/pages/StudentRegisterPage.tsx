import { useState } from 'react';
import {
  ArrowLeft, GraduationCap, Upload, CheckCircle, AlertCircle,
  ChevronRight, FileText, Shield, Lock, Eye, BadgeCheck, Phone, Mail
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Page } from '../App';

const UNIVERSITIES = [
  'Ankara Üniversitesi',
  'Hacettepe Üniversitesi',
  'Orta Doğu Teknik Üniversitesi (ODTÜ)',
  'Gazi Üniversitesi',
  'Bilkent Üniversitesi',
  'Atılım Üniversitesi',
  'Başkent Üniversitesi',
  'Çankaya Üniversitesi',
  'TED Üniversitesi',
  'Ankara Yıldırım Beyazıt Üniversitesi',
  'Ankara Sosyal Bilimler Üniversitesi',
  'Ankara Hacı Bayram Veli Üniversitesi',
  'Türk Hava Kurumu Üniversitesi',
];

type Step = 1 | 2 | 3;

const STEP_META = [
  { num: 1, label: 'Kişisel Bilgiler', sub: 'Ad, e-posta, telefon' },
  { num: 2, label: 'Üniversite', sub: 'Okul ve bölüm bilgisi' },
  { num: 3, label: 'Belge Yükle', sub: 'Öğrenci belgesi' },
];

export default function StudentRegisterPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [university, setUniversity] = useState('');
  const [studentNumber, setStudentNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  const validate = (s: Step) => {
    setError('');
    if (s === 1) {
      if (!fullName.trim()) { setError('Ad soyad zorunlu.'); return false; }
      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Geçerli bir e-posta girin.'); return false; }
      if (!phone.trim()) { setError('Telefon numarası zorunlu.'); return false; }
    }
    if (s === 2) {
      if (!university) { setError('Üniversite seçin.'); return false; }
      if (!studentNumber.trim()) { setError('Öğrenci numarası zorunlu.'); return false; }
      if (!department.trim()) { setError('Bölüm bilgisi zorunlu.'); return false; }
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!documentFile) { setError('Öğrenci belgesi zorunlu.'); return; }
    setError('');
    setLoading(true);
    try {
      const { data: existing } = await supabase
        .from('students').select('id, status').eq('email', email.trim().toLowerCase()).maybeSingle();
      if (existing) {
        const msgs: Record<string, string> = {
          pending: 'Bu e-posta ile zaten bir başvuru var — onay bekleniyor.',
          approved: 'Bu e-posta zaten kayıtlı. QR almak için "Yemek Al" sayfasına git.',
          rejected: 'Önceki başvurun reddedildi. Farklı e-posta ile tekrar dene.',
        };
        setError(msgs[existing.status] ?? 'Bu e-posta zaten kullanılıyor.');
        setLoading(false);
        return;
      }

      let documentUrl = documentFile.name;
      const fileName = `${Date.now()}_${studentNumber}.${documentFile.name.split('.').pop()}`;
      const { error: uploadErr } = await supabase.storage.from('student-documents').upload(fileName, documentFile);
      if (!uploadErr) documentUrl = fileName;

      const { error: dbError } = await supabase.from('students').insert({
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        university,
        student_number: studentNumber.trim(),
        department: department.trim(),
        document_url: documentUrl,
        status: 'pending',
      });

      if (dbError) throw dbError;
      setRegisteredEmail(email);
      setSuccess(true);
    } catch {
      setError('Kayıt sırasında hata oluştu. Tekrar deneyin.');
    }
    setLoading(false);
  };

  const nextStep = () => {
    if (!validate(step)) return;
    setStep((step + 1) as Step);
  };

  // ── Success ───────────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-ink-950 flex items-center justify-center px-5 pt-24">
        <div className="max-w-lg w-full">
          <div className="relative bg-ink-900 border border-ink-800 rounded-3xl p-10 text-center overflow-hidden" style={{ boxShadow: '0 30px 80px rgba(0,0,0,0.7)' }}>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent" />
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(34,197,94,0.05), transparent)' }} />

            <div className="relative">
              <div className="relative inline-flex mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-700 rounded-full flex items-center justify-center shadow-lg">
                  <CheckCircle size={36} className="text-white" />
                </div>
                <div className="absolute -inset-2 rounded-full border border-green-500/20 animate-ping" style={{ animationDuration: '2s', animationIterationCount: '3' }} />
              </div>

              <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-full px-4 py-1.5 mb-5">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                <span className="text-green-400 text-[10px] font-black uppercase tracking-[0.25em]">Başvuru Alındı</span>
              </div>

              <h2 className="heading-display text-5xl text-white mb-3 leading-[0.9]">HAYIRLI OLSUN</h2>
              <p className="text-ink-400 text-sm leading-relaxed mb-2 max-w-xs mx-auto">
                Belgeniz incelemeye alındı. Onaylandıktan sonra
              </p>
              <p className="text-white font-semibold text-sm mb-8 mono">{registeredEmail}</p>

              <div className="bg-ink-800/40 border border-ink-700/60 rounded-2xl p-5 mb-8 text-left">
                <div className="text-ink-600 text-[9px] font-black uppercase tracking-[0.25em] mb-4">Sonraki Adımlar</div>
                <div className="space-y-3">
                  {[
                    { step: '1', text: 'Belgeniz 24 saat içinde incelenir', sub: 'Admin tarafından manuel onay' },
                    { step: '2', text: 'E-posta ile bildirim alırsınız', sub: 'Onay veya ret bildirimi' },
                    { step: '3', text: 'QR kodunuzu oluşturun', sub: 'Günlük 2, haftalık 12 porsiyon hakkınız' },
                  ].map(({ step: s, text, sub }) => (
                    <div key={s} className="flex items-start gap-3">
                      <div className="w-7 h-7 bg-red-600/15 border border-red-600/20 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-red-400 font-black text-xs heading-display">{s}</span>
                      </div>
                      <div>
                        <div className="text-ink-200 text-sm font-semibold">{text}</div>
                        <div className="text-ink-600 text-xs">{sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-5">
                <button onClick={() => onNavigate('student-qr')} className="btn-red py-3.5 text-sm font-black heading-display tracking-wider">
                  <CheckCircle size={14} /> Durum Sorgula
                </button>
                <button onClick={() => onNavigate('home')} className="btn-outline py-3.5 text-sm font-medium">
                  Ana Sayfa
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-ink-700 text-xs">
                <Mail size={10} />
                <span>Soru için: ankara@pilavustuask.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-950 pt-24">

      {/* ── Sticky progress bar ─────────────────────────────────────────── */}
      <div className="sticky top-[88px] z-30 bg-ink-950/97 backdrop-blur-2xl border-b border-ink-800/60">
        <div className="max-w-2xl mx-auto px-5 py-4 flex items-center justify-between">
          <button
            onClick={() => step > 1 ? setStep((step - 1) as Step) : onNavigate('home')}
            className="flex items-center gap-2 text-ink-500 hover:text-white text-sm group transition-colors"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            {step > 1 ? 'Geri' : 'Ana Sayfa'}
          </button>

          <div className="flex items-center gap-1.5">
            {STEP_META.map((s, i) => (
              <div key={s.num} className="flex items-center gap-1.5">
                <div className={`flex items-center gap-2 transition-all duration-300 ${s.num === step ? '' : s.num < step ? 'opacity-70' : 'opacity-30'}`}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black transition-all duration-300 ${
                    s.num === step ? 'bg-red-600 text-white shadow-glow-red-sm' :
                    s.num < step ? 'bg-green-600 text-white' :
                    'bg-ink-800 text-ink-600'
                  }`}>
                    {s.num < step ? <CheckCircle size={13} /> : s.num}
                  </div>
                  <span className={`text-xs font-medium hidden sm:block ${s.num === step ? 'text-white' : 'text-ink-700'}`}>{s.label}</span>
                </div>
                {i < STEP_META.length - 1 && (
                  <div className={`w-6 h-px transition-colors duration-300 ${step > s.num ? 'bg-green-600/60' : 'bg-ink-800'}`} />
                )}
              </div>
            ))}
          </div>

          <div className="text-ink-600 text-[10px] mono">{step} / 3</div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-12">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 bg-red-600/15 border border-red-600/20 rounded-xl flex items-center justify-center">
              <GraduationCap size={15} className="text-red-400" />
            </div>
            <span className="text-red-500 text-[10px] font-black uppercase tracking-[0.3em]">
              {STEP_META[step - 1].sub}
            </span>
          </div>
          <h1 className="heading-display text-[clamp(2.5rem,6vw,4rem)] text-white leading-[0.88] mb-3">
            {step === 1 && <>KİŞİSEL<br />BİLGİLER</>}
            {step === 2 && <>ÜNİVERSİTE<br />BİLGİLERİ</>}
            {step === 3 && <>BELGE<br />YÜKLE</>}
          </h1>
          <p className="text-ink-500 text-sm">
            {step === 1 && "Ankara'daki üniversite öğrencilerine özel — ücretsiz ve gizli."}
            {step === 2 && '13 Ankara üniversitesinden birinde okuyor olman gerekiyor.'}
            {step === 3 && 'Belgen onaylandıktan sonra her gün yemek alabilirsin.'}
          </p>
        </div>

        {/* Form card */}
        <div className="relative bg-ink-900 border border-ink-800 rounded-2xl p-7 mb-5 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-600/20 to-transparent" />

          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-5">
              {[
                { label: 'Ad Soyad', val: fullName, set: setFullName, type: 'text', ph: 'Adınız ve soyadınız', required: true },
                { label: 'E-posta', val: email, set: setEmail, type: 'email', ph: 'ornek@edu.tr', required: true },
                { label: 'Telefon', val: phone, set: setPhone, type: 'tel', ph: '05XX XXX XX XX', required: true },
              ].map((f) => (
                <div key={f.label}>
                  <label className="block text-ink-600 text-[9px] font-black uppercase tracking-[0.28em] mb-2.5">
                    {f.label} {f.required && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type={f.type}
                    value={f.val}
                    onChange={(e) => f.set(e.target.value)}
                    placeholder={f.ph}
                    className="input-dark"
                  />
                </div>
              ))}

              {/* Privacy note */}
              <div className="flex items-start gap-3 bg-ink-800/40 border border-ink-700/50 rounded-xl p-4">
                <Lock size={13} className="text-ink-600 flex-shrink-0 mt-0.5" />
                <p className="text-ink-600 text-xs leading-relaxed">
                  Bilgileriniz yalnızca doğrulama amacıyla kullanılır ve üçüncü taraflarla paylaşılmaz.
                </p>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className="block text-ink-600 text-[9px] font-black uppercase tracking-[0.28em] mb-2.5">
                  Üniversite <span className="text-red-500">*</span>
                </label>
                <select
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  className="w-full bg-ink-800/50 border border-ink-700 focus:border-red-600 text-white rounded-xl px-4 py-3.5 text-sm outline-none transition-all duration-200 appearance-none cursor-pointer"
                >
                  <option value="" className="bg-ink-900">Üniversite seçin</option>
                  {UNIVERSITIES.map((u) => (
                    <option key={u} value={u} className="bg-ink-900">{u}</option>
                  ))}
                </select>
              </div>
              {[
                { label: 'Öğrenci Numarası', val: studentNumber, set: setStudentNumber, ph: 'Öğrenci numaranız' },
                { label: 'Bölüm', val: department, set: setDepartment, ph: 'Örn: Bilgisayar Mühendisliği' },
              ].map((f) => (
                <div key={f.label}>
                  <label className="block text-ink-600 text-[9px] font-black uppercase tracking-[0.28em] mb-2.5">
                    {f.label} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={f.val}
                    onChange={(e) => f.set(e.target.value)}
                    placeholder={f.ph}
                    className="input-dark mono"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div>
              <label className="block text-ink-600 text-[9px] font-black uppercase tracking-[0.28em] mb-2.5">
                Öğrenci Belgesi <span className="text-red-500">*</span>
              </label>
              <p className="text-ink-600 text-xs mb-5 leading-relaxed">
                Üniversitenizden alınan geçerli öğrenci belgesi. PDF, JPG veya PNG formatında. Maksimum 5MB.
              </p>

              <label className="block cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    if (f.size > 5 * 1024 * 1024) { setError("Dosya 5MB'dan küçük olmalı."); return; }
                    setDocumentFile(f);
                    setError('');
                  }}
                  className="hidden"
                />
                <div className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 ${
                  documentFile
                    ? 'border-green-500/40 bg-green-500/4'
                    : 'border-ink-700 hover:border-ink-600 hover:bg-ink-800/30'
                }`}>
                  {documentFile ? (
                    <>
                      <div className="w-14 h-14 bg-green-500/15 border border-green-500/25 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <FileText size={24} className="text-green-400" />
                      </div>
                      <p className="text-white font-bold text-sm mb-1">{documentFile.name}</p>
                      <p className="text-green-400 text-xs font-semibold">Yüklendi — Hazır</p>
                    </>
                  ) : (
                    <>
                      <div className="w-14 h-14 bg-ink-800 border border-ink-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Upload size={24} className="text-ink-500" />
                      </div>
                      <p className="text-ink-300 font-semibold text-sm mb-1">Dosya seçmek için tıklayın</p>
                      <p className="text-ink-600 text-xs">PDF · JPG · PNG · Maks. 5MB</p>
                    </>
                  )}
                </div>
              </label>

              <div className="mt-5 bg-red-500/5 border border-red-500/15 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Eye size={12} className="text-red-500" />
                  <span className="text-red-400 text-xs font-bold">Neden belge istiyoruz?</span>
                </div>
                <p className="text-ink-500 text-xs leading-relaxed">
                  Sistemi gerçekten ihtiyaç sahibi öğrenciler kullansın diye. Belgeniz admin tarafından incelenir,
                  sonra silinir. Üçüncü şahıslarla paylaşılmaz.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 bg-red-500/8 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm mb-5">
            <AlertCircle size={14} className="flex-shrink-0" /> {error}
          </div>
        )}

        {/* CTA */}
        {step < 3 ? (
          <button
            onClick={nextStep}
            className="w-full btn-red py-4 text-base font-black heading-display tracking-wider group"
          >
            DEVAM ET
            <ChevronRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={loading || !documentFile}
            className="w-full btn-red py-4 text-base font-black heading-display tracking-wider disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading
              ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <GraduationCap size={18} />}
            {loading ? 'KAYDEDİLİYOR...' : 'BAŞVURU GÖNDER'}
          </button>
        )}

        {/* Trust strip */}
        <div className="flex items-center justify-center gap-4 mt-5">
          <div className="flex items-center gap-1.5 text-ink-700 text-[10px]">
            <Shield size={9} className="text-green-700" /> Güvenli kayıt
          </div>
          <div className="w-px h-3 bg-ink-800" />
          <div className="flex items-center gap-1.5 text-ink-700 text-[10px]">
            <Lock size={9} className="text-green-700" /> Veriler şifreli
          </div>
          <div className="w-px h-3 bg-ink-800" />
          <div className="flex items-center gap-1.5 text-ink-700 text-[10px]">
            <BadgeCheck size={9} className="text-green-700" /> Ücretsiz
          </div>
        </div>

        <p className="text-center text-xs text-ink-700 mt-5">
          Zaten kayıtlısın?{' '}
          <button
            onClick={() => onNavigate('student-qr')}
            className="text-red-500 hover:text-red-400 font-semibold transition-colors"
          >
            QR Kodunu Al →
          </button>
        </p>

        {/* Contact */}
        <div className="mt-8 bg-ink-900/40 border border-ink-800/60 rounded-xl p-4 text-center">
          <p className="text-ink-700 text-xs mb-2">Yardım için</p>
          <div className="flex items-center justify-center gap-5">
            <a href="mailto:ankara@pilavustuask.com" className="flex items-center gap-1.5 text-ink-600 hover:text-red-400 text-xs transition-colors">
              <Mail size={10} /> ankara@pilavustuask.com
            </a>
            <a href="tel:+905102225696" className="flex items-center gap-1.5 text-ink-600 hover:text-red-400 text-xs transition-colors">
              <Phone size={10} /> 0510 222 56 96
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
