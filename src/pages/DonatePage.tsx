import { useState } from 'react';
import {
  Flame, ArrowLeft, CheckCircle, Minus, Plus, AlertCircle, Shield,
  ChevronRight, Star, Heart, Users, TrendingUp, Leaf, Award, Lock, MapPin, Quote,
  BadgeCheck, Building2, Phone, Mail, Eye
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Page } from '../App';

const RECENT_DONORS = [
  { name: 'Mehmet Y.', meals: 10, time: '2 dk' },
  { name: 'Ayşe K.', meals: 5, time: '8 dk' },
  { name: 'Anonim', meals: 20, time: '15 dk' },
  { name: 'Fatih D.', meals: 3, time: '31 dk' },
];

const PRICE = 200;

const TIERS = [
  { meals: 1,  label: '1 Öğrenci',  sub: 'Bir öğrenci bugün doyar',   highlight: false },
  { meals: 3,  label: '3 Öğrenci',  sub: 'Küçük bir grup',             highlight: false },
  { meals: 5,  label: '5 Öğrenci',  sub: 'En çok tercih edilen',       highlight: true  },
  { meals: 10, label: '10 Öğrenci', sub: 'Büyük fark yaratır',         highlight: false },
  { meals: 20, label: '20 Öğrenci', sub: 'Ciddi destek',               highlight: false },
  { meals: 50, label: '50 Öğrenci', sub: 'Gerçek kahraman',            highlight: false },
];

export default function DonatePage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [mealCount, setMealCount] = useState(5);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const amount = mealCount * PRICE;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) { setError('Ad ve e-posta zorunlu.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Geçerli bir e-posta girin.'); return; }
    setError('');
    setLoading(true);

    const { error: dbError } = await supabase.from('donations').insert({
      donor_name: anonymous ? 'Anonim' : name.trim(),
      donor_email: email.trim(),
      message: message.trim(),
      meal_count: mealCount,
      amount,
      status: 'confirmed',
    });

    const { data: stats } = await supabase
      .from('global_stats').select('total_donors, total_meals_all_time').eq('id', 1).maybeSingle();
    if (stats) {
      await supabase.from('global_stats').update({
        total_donors: stats.total_donors + 1,
        total_meals_all_time: stats.total_meals_all_time + mealCount,
      }).eq('id', 1);
    }

    setLoading(false);
    if (dbError) setError('Hata oluştu. Tekrar deneyin.');
    else setSuccess(true);
  };

  // ── Success ───────────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-ink-950 flex items-center justify-center px-5 pt-16">
        <div className="max-w-lg w-full">
          <div className="relative overflow-hidden rounded-3xl border border-ink-800" style={{ background: 'linear-gradient(160deg, #111 0%, #0a0a0a 100%)', boxShadow: '0 30px 80px rgba(0,0,0,0.7)' }}>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-600/60 to-transparent" />
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(225,29,72,0.07), transparent)' }} />

            <div className="relative p-10 text-center">
              {/* Animated icon */}
              <div className="relative inline-flex mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-red-600 to-red-800 rounded-full flex items-center justify-center shadow-glow-red">
                  <CheckCircle size={40} className="text-white" />
                </div>
                <div className="absolute -inset-3 rounded-full border border-red-600/20 animate-ping" style={{ animationDuration: '2s', animationIterationCount: '3' }} />
              </div>

              <div className="section-tag justify-center mb-4">Bağış Alındı</div>
              <h2 className="heading-display text-7xl text-white mb-3 leading-[0.88]">TEŞEKKÜRLER</h2>
              <p className="text-ink-500 text-sm mb-10 leading-relaxed max-w-xs mx-auto">
                Bağışın sisteme kaydedildi. En kısa sürede öğrencilere ulaştırılacak.
              </p>

              {/* Impact stat */}
              <div className="relative bg-red-600/8 border border-red-600/20 rounded-2xl p-6 mb-6 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
                <div className="text-red-500 text-[9px] font-black uppercase tracking-[0.3em] mb-2">Bugün Etkilenecek</div>
                <div className="heading-display text-8xl text-white tabular-nums leading-none mb-1">{mealCount}</div>
                <div className="text-red-400 font-semibold text-sm">öğrenci doyacak</div>
              </div>

              {/* Receipt */}
              <div className="bg-ink-800/30 border border-ink-700/40 rounded-xl overflow-hidden mb-8">
                {[
                  { label: 'Bağışçı', value: anonymous ? 'Anonim' : name },
                  { label: 'Menü', value: `${mealCount} × Tavuklu Pilav + Ayran` },
                ].map(row => (
                  <div key={row.label} className="flex justify-between items-center px-5 py-3.5 border-b border-ink-700/30 last:border-0">
                    <span className="text-ink-600 text-sm">{row.label}</span>
                    <span className="text-ink-200 text-sm font-semibold">{row.value}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center px-5 py-4 bg-red-600/6">
                  <span className="text-ink-500 text-sm">Toplam</span>
                  <span className="heading-display text-3xl text-red-400 tabular-nums">{amount.toLocaleString('tr-TR')}₺</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => { setSuccess(false); setStep(1); setName(''); setEmail(''); setMessage(''); setMealCount(5); }}
                  className="btn-outline py-3.5 text-sm font-semibold"
                >
                  Tekrar Ismarla
                </button>
                <button onClick={() => onNavigate('home')} className="btn-red py-3.5 text-sm font-bold">
                  Ana Sayfa
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-950 pt-24">

      {/* ── Progress header ──────────────────────────────────────────── */}
      <div className="sticky top-[88px] z-30 bg-ink-950/97 backdrop-blur-2xl border-b border-ink-800/50">
        <div className="max-w-5xl mx-auto px-5 py-4 flex items-center justify-between">
          <button
            onClick={() => step === 2 ? setStep(1) : onNavigate('home')}
            className="flex items-center gap-2 text-ink-500 hover:text-white text-sm font-medium transition-colors group"
          >
            <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            {step === 2 ? 'Geri' : 'Ana Sayfa'}
          </button>

          {/* Step indicators */}
          <div className="flex items-center gap-2">
            {[{ label: 'Miktar Seç' }, { label: 'Bilgileri Gir' }].map((item, i) => {
              const s = i + 1;
              const active = s === step;
              const done = s < step;
              return (
                <div key={s} className="flex items-center gap-2">
                  <div className={`flex items-center gap-2 transition-all duration-300 ${active ? '' : done ? 'opacity-60' : 'opacity-35'}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      active ? 'bg-red-600 text-white shadow-glow-red-sm' :
                      done ? 'bg-red-600/25 text-red-400' : 'bg-ink-800 text-ink-600'
                    }`}>
                      {done ? <CheckCircle size={13} /> : s}
                    </div>
                    <span className={`text-xs font-medium hidden sm:block ${active ? 'text-white' : 'text-ink-700'}`}>{item.label}</span>
                  </div>
                  {s < 2 && <div className={`w-8 h-px transition-colors duration-300 ${step > s ? 'bg-red-600/40' : 'bg-ink-800'}`} />}
                </div>
              );
            })}
          </div>

          <div className="heading-display text-2xl text-red-400 tabular-nums">{amount.toLocaleString('tr-TR')}₺</div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-5 py-14">
        <div className="grid lg:grid-cols-[1fr_300px] gap-12 items-start">

          {/* ── Main ─────────────────────────────────────────────────── */}
          <div>

            {/* ════ STEP 1 ════ */}
            {step === 1 && (
              <div>
                <div className="mb-12">
                  <div className="section-tag mb-5">Pilav Ismarla</div>
                  <h1 className="heading-display text-5xl md:text-[4.5rem] text-white leading-[0.88] mb-5">
                    KAÇ ÖĞRENCİ<br /><span className="text-red-500">DOYURUYORSUN?</span>
                  </h1>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-ink-400 text-base">Her</span>
                    <span className="text-white font-bold text-base mono bg-ink-800/60 border border-ink-700 px-2.5 py-0.5 rounded-lg">200₺</span>
                    <span className="text-ink-400 text-base">= 1 öğrenciye tam menü.</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap mt-3">
                    {[
                      { icon: Leaf, label: 'Basmati Pirinç', cls: 'text-emerald-500' },
                      { label: 'Tavuklu Pilav', cls: '' },
                      { label: 'Köy Ayranı', cls: '' },
                    ].map(({ icon: Icon, label, cls }: { icon?: React.ElementType; label: string; cls: string }) => (
                      <span key={label} className="pill text-[11px]">
                        {Icon && <Icon size={9} className={cls} />} {label}
                      </span>
                    ))}
                    <span className="text-ink-700 text-xs mono">· 620 kcal · 38g protein</span>
                  </div>
                </div>

                {/* Tier grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
                  {TIERS.map((tier) => {
                    const selected = mealCount === tier.meals;
                    return (
                      <button
                        key={tier.meals}
                        onClick={() => setMealCount(tier.meals)}
                        className={`relative group p-5 rounded-2xl border text-left transition-all duration-250 hover:scale-[1.02] hover:-translate-y-0.5 overflow-hidden ${
                          selected
                            ? 'bg-gradient-to-br from-red-600/14 to-red-900/6 border-red-500/50 shadow-glow-red-sm'
                            : 'bg-ink-900 border-ink-800 hover:border-ink-600 hover:bg-ink-800/60 shadow-card'
                        }`}
                      >
                        {tier.highlight && (
                          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/70 to-transparent" />
                        )}
                        {tier.highlight && !selected && (
                          <div className="absolute top-3 right-3">
                            <div className="flex items-center gap-0.5 bg-red-600/15 border border-red-600/20 text-red-400 text-[8px] font-black px-1.5 py-0.5 rounded-full tracking-wider">
                              <Star size={6} className="fill-red-400" /> Popüler
                            </div>
                          </div>
                        )}
                        {selected && (
                          <div className="absolute top-3 right-3 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center shadow-glow-red-sm">
                            <CheckCircle size={11} className="text-white" />
                          </div>
                        )}
                        {selected && (
                          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at top left, rgba(225,29,72,0.06), transparent 55%)' }} />
                        )}

                        <div className={`heading-display text-[2.2rem] mb-1.5 transition-colors ${selected ? 'text-red-400' : 'text-white group-hover:text-red-400'}`}>
                          {(tier.meals * PRICE).toLocaleString('tr-TR')}₺
                        </div>
                        <div className="text-white font-semibold text-sm">{tier.label}</div>
                        <div className="text-ink-600 text-xs mt-0.5 leading-snug">{tier.sub}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Custom counter */}
                <div className="card-dark p-6 mb-8">
                  <div className="text-ink-600 text-[9px] font-black uppercase tracking-[0.3em] mb-5">Özel Miktar</div>
                  <div className="flex items-center justify-center gap-8">
                    <button
                      onClick={() => setMealCount(Math.max(1, mealCount - 1))}
                      className="w-12 h-12 bg-ink-800 hover:bg-ink-700 border border-ink-700 hover:border-ink-500 rounded-xl flex items-center justify-center text-white transition-all duration-150 active:scale-90 active:bg-ink-900"
                    >
                      <Minus size={16} />
                    </button>
                    <div className="text-center min-w-[100px]">
                      <div className="heading-display text-7xl text-white tabular-nums leading-none">{mealCount}</div>
                      <div className="text-ink-600 text-xs mt-1.5">öğrenci</div>
                    </div>
                    <button
                      onClick={() => setMealCount(mealCount + 1)}
                      className="w-12 h-12 bg-ink-800 hover:bg-ink-700 border border-ink-700 hover:border-ink-500 rounded-xl flex items-center justify-center text-white transition-all duration-150 active:scale-90 active:bg-ink-900"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>

                {/* Total */}
                <div className="relative bg-ink-900 border border-ink-700/60 rounded-2xl p-6 mb-6 overflow-hidden" style={{ boxShadow: '0 4px 30px rgba(0,0,0,0.4)' }}>
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-600/25 to-transparent" />
                  <div className="flex items-center justify-between gap-6">
                    <div>
                      <div className="text-ink-700 text-[9px] uppercase tracking-[0.25em] mb-2">Toplam Tutar</div>
                      <div className="heading-display text-6xl text-red-400 tabular-nums leading-none">{amount.toLocaleString('tr-TR')}₺</div>
                      <div className="text-ink-700 text-xs mt-2 mono">{mealCount} × {PRICE.toLocaleString('tr-TR')}₺</div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-white font-bold text-xl leading-tight">{mealCount} öğrenci</div>
                      <div className="text-ink-500 text-sm mt-0.5">bugün doyacak</div>
                      <div className="flex items-center gap-1 justify-end mt-2">
                        <MapPin size={10} className="text-ink-700" />
                        <span className="text-ink-700 text-[10px]">Ankara</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="w-full btn-red font-black heading-display tracking-wider group"
                  style={{ paddingTop: '1.1rem', paddingBottom: '1.1rem', fontSize: '1.1rem' }}
                >
                  <Flame size={19} className="group-hover:scale-110 transition-transform" />
                  DEVAM ET — {amount.toLocaleString('tr-TR')}₺
                  <ChevronRight size={17} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            )}

            {/* ════ STEP 2 ════ */}
            {step === 2 && (
              <form onSubmit={handleSubmit}>
                <div className="mb-12">
                  <div className="section-tag mb-5">Son Adım</div>
                  <h1 className="heading-display text-5xl md:text-[4.5rem] text-white leading-[0.88] mb-4">
                    BİLGİLERİNİ<br />GİR
                  </h1>
                  <p className="text-ink-600 text-sm">Makbuz e-posta adresine gönderilir.</p>
                </div>

                {/* Summary */}
                <div className="relative bg-ink-900 border border-ink-700/60 rounded-2xl p-5 mb-8 overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-600/25 to-transparent" />
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center shadow-glow-red-sm flex-shrink-0">
                        <Flame size={17} className="text-white" />
                      </div>
                      <div>
                        <div className="text-white font-bold text-base leading-tight">{mealCount} öğrenci menüsü</div>
                        <div className="text-ink-600 text-xs mt-0.5">Tavuklu Pilav + Köy Ayranı · Ankara</div>
                      </div>
                    </div>
                    <div className="heading-display text-3xl text-red-400 tabular-nums flex-shrink-0">{amount.toLocaleString('tr-TR')}₺</div>
                  </div>
                </div>

                {/* Fields */}
                <div className="space-y-5 mb-5">
                  <div>
                    <label className="block text-ink-600 text-[9px] font-black uppercase tracking-[0.25em] mb-2.5">Ad Soyad *</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Adınız ve soyadınız"
                      disabled={anonymous}
                      className="input-dark disabled:opacity-35"
                    />
                  </div>
                  <div>
                    <label className="block text-ink-600 text-[9px] font-black uppercase tracking-[0.25em] mb-2.5">E-posta *</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ornek@mail.com"
                      className="input-dark mono"
                    />
                  </div>
                  <div>
                    <label className="block text-ink-600 text-[9px] font-black uppercase tracking-[0.25em] mb-2.5">
                      Mesaj <span className="text-ink-800 normal-case font-normal tracking-normal text-[10px]">(isteğe bağlı)</span>
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Öğrencilere bir şey söylemek ister misin?"
                      rows={3}
                      className="input-dark resize-none"
                    />
                  </div>
                </div>

                {/* Anonymous toggle */}
                <button
                  type="button"
                  onClick={() => setAnonymous(!anonymous)}
                  className="flex items-center gap-3.5 w-full bg-ink-900/50 border border-ink-800 hover:border-ink-700 rounded-xl p-4 mb-5 text-left transition-all duration-200"
                >
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
                    anonymous ? 'bg-red-600 border-red-600 shadow-glow-red-sm' : 'border-ink-600'
                  }`}>
                    {anonymous && <CheckCircle size={11} className="text-white" />}
                  </div>
                  <div>
                    <div className="text-ink-200 text-sm font-semibold">Anonim Bağış</div>
                    <div className="text-ink-700 text-xs">İsmin gizli kalır</div>
                  </div>
                </button>

                {error && (
                  <div className="flex items-center gap-3 bg-red-500/8 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm mb-5">
                    <AlertCircle size={14} className="flex-shrink-0" /> {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-red disabled:opacity-50 disabled:cursor-not-allowed group"
                  style={{ paddingTop: '1.1rem', paddingBottom: '1.1rem' }}
                >
                  {loading
                    ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <Heart size={17} className="fill-white group-hover:scale-110 transition-transform" />
                  }
                  <span className="font-black heading-display tracking-wider text-xl">
                    {loading ? 'İŞLENİYOR...' : `${amount.toLocaleString('tr-TR')}₺ BAĞIŞ YAP`}
                  </span>
                </button>

                <div className="flex flex-col gap-2 mt-5">
                  <div className="flex items-center justify-center gap-2 text-ink-700 text-xs">
                    <Shield size={10} className="text-green-600 flex-shrink-0" />
                    <span>Güvenli · %100 öğrencilere gider · Şeffaf sistem</span>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-ink-800 text-[10px]">
                    <BadgeCheck size={9} className="text-green-700 flex-shrink-0" />
                    <span>Sorularınız için: ankara@pilavustuask.com · 0510 222 56 96</span>
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* ── Sidebar ───────────────────────────────────────────────── */}
          <div className="hidden lg:flex flex-col gap-4 sticky top-44">

            {/* Impact */}
            <div className="card-accent p-6">
              <div className="section-tag mb-5">Bağışınızın Etkisi</div>

              <div className="relative bg-gradient-to-br from-red-600/12 to-red-900/5 border border-red-600/20 rounded-xl p-5 mb-5 text-center overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/40 to-transparent" />
                <div className="heading-display text-8xl text-white tabular-nums leading-none mb-1">{mealCount}</div>
                <div className="text-red-400 font-semibold text-sm">öğrenci doyacak</div>
                <div className="text-ink-600 text-xs mt-0.5">Ankara'da, bugün</div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: Leaf, label: 'Basmati', detail: 'Düşük GI' },
                  { icon: Award, label: 'Anne Tarifi', detail: 'Geleneksel' },
                  { icon: Users, label: '13 Üniv.', detail: 'Ankara' },
                  { icon: TrendingUp, label: '3.200+', detail: 'Teslim edildi' },
                ].map(({ icon: Icon, label, detail }) => (
                  <div key={label} className="bg-ink-800/40 border border-ink-800/60 rounded-xl p-3">
                    <Icon size={13} className="text-red-500 mb-2" />
                    <div className="text-white text-xs font-semibold leading-tight">{label}</div>
                    <div className="text-ink-600 text-[10px] mt-0.5">{detail}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Food photo */}
            <div className="rounded-2xl overflow-hidden relative" style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}>
              <img
                src="https://images.pexels.com/photos/723198/pexels-photo-723198.jpeg"
                alt="Tavuklu Pilav"
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950/95 via-ink-950/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="text-white font-bold text-sm mb-2">Tavuklu Pilav + Ayran</div>
                <div className="flex items-center gap-3">
                  {[['38g', 'Protein'], ['620', 'kcal'], ['72g', 'Karb']].map(([val, unit]) => (
                    <div key={unit} className="bg-ink-900/80 border border-ink-700/50 rounded-lg px-2.5 py-1 text-center">
                      <span className="text-white font-black text-xs mono">{val}</span>
                      <span className="text-ink-600 text-[9px] ml-0.5">{unit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Verified identity */}
            <div className="relative bg-ink-900/50 border border-green-500/20 rounded-2xl p-5 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-green-500/30 to-transparent" />
              <div className="flex items-center gap-2 mb-4">
                <BadgeCheck size={14} className="text-green-400" />
                <span className="text-green-400 text-[10px] font-black uppercase tracking-[0.2em]">Doğrulanmış Proje</span>
              </div>
              <div className="space-y-3 mb-4">
                {[
                  { icon: Building2, text: 'Resmi kayıtlı sosyal proje · 2022' },
                  { icon: Shield, text: '%100 şeffaf kullanım taahhüdü' },
                  { icon: Eye, text: 'Her teslim kayıt altında, denetlenebilir' },
                  { icon: Lock, text: 'Belge onaylı öğrencilere ulaşır' },
                  { icon: CheckCircle, text: 'Fiziksel adres: Çankaya / Ankara' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2.5">
                    <Icon size={11} className="text-green-500 flex-shrink-0" />
                    <span className="text-ink-400 text-xs leading-snug">{text}</span>
                  </div>
                ))}
              </div>
              <div className="bg-ink-800/50 rounded-xl p-3 space-y-1.5">
                <a href="mailto:ankara@pilavustuask.com" className="flex items-center gap-2 text-ink-600 hover:text-red-400 text-[10px] transition-colors mono">
                  <Mail size={9} className="flex-shrink-0" /> ankara@pilavustuask.com
                </a>
                <a href="tel:+905102225696" className="flex items-center gap-2 text-ink-600 hover:text-red-400 text-[10px] transition-colors mono">
                  <Phone size={9} className="flex-shrink-0" /> 0510 222 56 96
                </a>
              </div>
            </div>

            {/* Recent donors */}
            <div className="bg-ink-900/40 border border-ink-800/60 rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-600/20 to-transparent" />
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                <span className="text-ink-600 text-[9px] font-black uppercase tracking-[0.25em]">Son Bağışlar</span>
              </div>
              <div className="space-y-3 mb-4">
                {RECENT_DONORS.map((d, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-7 h-7 bg-gradient-to-br from-red-700 to-red-900 rounded-lg flex items-center justify-center text-white text-[10px] font-black heading-display flex-shrink-0">
                      {d.name === 'Anonim' ? '?' : d.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-ink-300 text-xs font-semibold leading-tight truncate">{d.name}</div>
                      <div className="text-ink-700 text-[10px]">{d.time} önce</div>
                    </div>
                    <div className="text-red-400 text-xs font-black heading-display flex-shrink-0">{d.meals} kişi</div>
                  </div>
                ))}
              </div>
              <div className="bg-ink-800/40 rounded-xl px-3 py-2.5 flex items-start gap-2">
                <Quote size={10} className="text-red-700/60 flex-shrink-0 mt-0.5" />
                <p className="text-ink-600 text-[10px] leading-relaxed italic">
                  "Bir tabak sıcak yemek, bir öğrencinin tüm gününü değiştirir."
                </p>
              </div>
            </div>

            {/* Contact */}
            <div className="text-center py-1">
              <p className="text-ink-800 text-[10px] mb-1">Soru için</p>
              <a href="mailto:ankara@pilavustuask.com" className="text-ink-700 hover:text-red-400 text-xs transition-colors mono">
                ankara@pilavustuask.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
