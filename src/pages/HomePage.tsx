import { useEffect, useRef, useState } from 'react';
import {
  Flame, ArrowRight, CheckCircle, Shield, Heart, GraduationCap,
  Users, Zap, Clock, Lock, Leaf, Award, Star, ExternalLink,
  TrendingUp, MapPin, ChevronRight, Quote, Calculator,
  FileText, Phone, Mail, MessageCircle, BadgeCheck, Building2, Scale
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { GlobalStats, MealRedemption, Student } from '../lib/supabase';
import type { Page } from '../App';

const PRICE = 200;

// ── Animated counter ──────────────────────────────────────────────────────
function Counter({ to, duration = 1800 }: { to: number; duration?: number }) {
  const [n, setN] = useState(0);
  const startRef = useRef<number | null>(null);
  const prevTo = useRef(0);
  useEffect(() => {
    if (to === 0) return;
    const from = prevTo.current;
    prevTo.current = to;
    startRef.current = null;
    const frame = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setN(Math.floor(from + eased * (to - from)));
      if (progress < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }, [to, duration]);
  return <span className="tabular-nums">{n.toLocaleString('tr-TR')}</span>;
}

// ── Intersection observer hook ────────────────────────────────────────────
function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true); }, { threshold });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

// ── Delivery row ──────────────────────────────────────────────────────────
interface DeliveryItem { name: string; uni: string; time: string; menu: string; index: number; }

function DeliveryRow({ name, uni, time, index }: DeliveryItem) {
  const avatarColors = [
    'from-red-700 to-red-900',
    'from-rose-700 to-red-900',
    'from-red-600 to-rose-800',
    'from-red-800 to-red-950',
    'from-rose-600 to-red-800',
  ];
  return (
    <div className="flex items-center gap-3 py-3 border-b border-white/[0.04] last:border-0 group">
      <div className={`w-8 h-8 bg-gradient-to-br ${avatarColors[index % avatarColors.length]} rounded-lg flex items-center justify-center text-white font-bold text-xs heading-display flex-shrink-0 shadow-sm`}>
        {name.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-ink-200 text-sm font-semibold leading-tight">{name}</div>
        <div className="text-ink-600 text-[11px] truncate">{uni}</div>
      </div>
      <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
        <div className="flex items-center gap-1">
          <CheckCircle size={9} className="text-green-500" />
          <span className="text-green-500 text-[10px] font-semibold">Teslim</span>
        </div>
        <span className="text-ink-700 text-[10px] mono">{time}</span>
      </div>
    </div>
  );
}

// ── Stat item ─────────────────────────────────────────────────────────────
function StatItem({ value, label, red, inView }: { value: number; label: string; red?: boolean; inView: boolean }) {
  return (
    <div className="text-center px-6 md:px-10 py-8 relative group">
      <div className={`heading-display text-5xl md:text-[3.5rem] mb-2 transition-colors duration-500 ${red ? 'text-red-500' : 'text-white group-hover:text-red-400'}`}>
        {inView ? <Counter to={value} /> : '0'}
      </div>
      <div className="text-ink-400 font-medium text-xs uppercase tracking-[0.2em]">{label}</div>
      {red && <div className="absolute bottom-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-red-600/50 to-transparent" />}
    </div>
  );
}

// ── Step ──────────────────────────────────────────────────────────────────
function Step({ num, title, desc, delay, last }: { num: string; title: string; desc: string; delay: number; last?: boolean }) {
  const { ref, inView } = useInView(0.2);
  return (
    <div
      ref={ref}
      className={`flex gap-5 transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="flex-shrink-0 relative">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600/20 to-red-900/10 border border-red-600/25 flex items-center justify-center">
          <span className="heading-display text-red-400 text-xl">{num}</span>
        </div>
        {!last && <div className="absolute left-1/2 top-full -translate-x-1/2 w-px mt-1 h-8 bg-gradient-to-b from-red-600/20 to-transparent" />}
      </div>
      <div className="pt-1.5">
        <div className="text-white font-bold mb-1.5">{title}</div>
        <div className="text-ink-500 text-sm leading-relaxed">{desc}</div>
      </div>
    </div>
  );
}

// ── Tier card ─────────────────────────────────────────────────────────────
function TierCard({ meals, price, label, highlight, onDonate }: {
  meals: number; price: number; label: string; highlight?: boolean; onDonate: () => void;
}) {
  return (
    <button
      onClick={onDonate}
      className={`group text-left rounded-2xl p-5 border transition-all duration-300 hover:scale-[1.03] hover:-translate-y-1 w-full relative overflow-hidden ${
        highlight
          ? 'bg-gradient-to-br from-red-600/15 to-red-900/8 border-red-500/40 hover:border-red-500/65 shadow-glow-red-sm'
          : 'bg-ink-900 border-ink-800 hover:border-ink-600 hover:bg-ink-800/60 shadow-card hover:shadow-lifted'
      }`}
    >
      {highlight && (
        <>
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at top left, rgba(225,29,72,0.08), transparent 60%)' }} />
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/70 to-transparent" />
          <div className="inline-flex items-center gap-1 bg-red-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full mb-3 tracking-[0.2em] uppercase">
            <Star size={6} className="fill-white" /> Popüler
          </div>
        </>
      )}
      <div className={`heading-display text-4xl mb-1 ${highlight ? 'text-red-400' : 'text-white group-hover:text-red-400 transition-colors'}`}>
        {price.toLocaleString('tr-TR')}₺
      </div>
      <div className="text-ink-300 font-semibold text-sm">{label}</div>
      <div className="text-ink-600 text-xs mt-0.5 mono">{meals} kişilik menü</div>
      <div className={`mt-4 flex items-center gap-1.5 text-xs font-semibold transition-all duration-200 ${
        highlight ? 'text-red-400' : 'text-ink-600 group-hover:text-ink-300'
      } group-hover:gap-2.5`}>
        Ismarla <ArrowRight size={11} />
      </div>
    </button>
  );
}

// ── Quality cell ──────────────────────────────────────────────────────────
function QualityCell({ icon: Icon, title, desc, accent }: { icon: React.ElementType; title: string; desc: string; accent?: boolean }) {
  return (
    <div className={`rounded-2xl p-5 border transition-all duration-200 hover:scale-[1.01] group ${
      accent ? 'bg-gradient-to-br from-red-600/10 to-red-900/5 border-red-500/25 hover:border-red-500/45'
             : 'bg-ink-900/50 border-ink-800 hover:border-ink-700 hover:bg-ink-900/80'
    }`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
        accent ? 'bg-red-600/20 border border-red-600/20' : 'bg-ink-800 border border-ink-700/60'
      }`}>
        <Icon size={17} className={accent ? 'text-red-400' : 'text-ink-400'} />
      </div>
      <div className="text-white font-bold text-sm mb-1.5">{title}</div>
      <div className="text-ink-500 text-xs leading-relaxed">{desc}</div>
    </div>
  );
}

// ── Security cell ─────────────────────────────────────────────────────────
function SecurityCell({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) {
  return (
    <div className="bg-ink-900/50 border border-ink-800 hover:border-red-600/20 hover:bg-ink-900 rounded-xl p-4 transition-all duration-300 group cursor-default">
      <div className="w-8 h-8 bg-red-600/8 border border-red-600/15 rounded-lg flex items-center justify-center mb-3 group-hover:bg-red-600/15 group-hover:border-red-600/25 transition-all">
        <Icon size={14} className="text-red-500" />
      </div>
      <div className="text-white font-semibold text-xs mb-1">{title}</div>
      <div className="text-ink-600 text-xs leading-relaxed">{desc}</div>
    </div>
  );
}

// ── Static mock deliveries ────────────────────────────────────────────────
const MOCK_DELIVERIES: DeliveryItem[] = [
  { name: 'Ahmet K.', uni: 'ODTÜ', menu: 'Tavuklu Pilav + Ayran', time: '23:46', index: 0 },
  { name: 'Zeynep S.', uni: 'Hacettepe Üniv.', menu: 'Tavuklu Pilav + Ayran', time: '23:12', index: 1 },
  { name: 'Emre T.', uni: 'Ankara Üniv.', menu: 'Tavuklu Pilav + Ayran', time: '22:55', index: 2 },
  { name: 'Merve A.', uni: 'Gazi Üniv.', menu: 'Tavuklu Pilav + Ayran', time: '22:31', index: 3 },
  { name: 'Burak Y.', uni: 'Bilkent Üniv.', menu: 'Tavuklu Pilav + Ayran', time: '21:47', index: 4 },
];

// ── Mock recent donors ────────────────────────────────────────────────────
const MOCK_DONORS = [
  { name: 'Mehmet Y.', meals: 10, time: '2 dk önce', city: 'Ankara' },
  { name: 'Ayşe K.', meals: 5, time: '8 dk önce', city: 'Ankara' },
  { name: 'Anonim', meals: 20, time: '15 dk önce', city: 'Ankara' },
  { name: 'Fatih D.', meals: 3, time: '31 dk önce', city: 'Ankara' },
  { name: 'Hüseyin A.', meals: 1, time: '45 dk önce', city: 'Ankara' },
  { name: 'Selin M.', meals: 5, time: '1 saat önce', city: 'Ankara' },
];

// ── Impact calculator ─────────────────────────────────────────────────────
function ImpactCalculator({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const [count, setCount] = useState(5);
  const { ref, inView } = useInView(0.2);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Math.max(1, Math.min(500, Number(e.target.value) || 1));
    setCount(v);
  };

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
    >
      <div className="relative bg-ink-900 border border-ink-800 rounded-3xl p-8 md:p-12 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-600/40 to-transparent" />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 50% at 100% 100%, rgba(225,29,72,0.04), transparent)' }} />

        <div className="relative grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 bg-red-600/15 border border-red-600/20 rounded-xl flex items-center justify-center">
                <Calculator size={15} className="text-red-400" />
              </div>
              <span className="text-red-500 text-[10px] font-black uppercase tracking-[0.3em]">Etki Hesapla</span>
            </div>
            <h3 className="heading-display text-[clamp(2rem,4vw,3.2rem)] text-white leading-[0.9] mb-4">
              BUGÜN KAÇ<br />ÖĞRENCİ<br /><span className="text-red-500">DOYURABİLİRSİN?</span>
            </h3>
            <p className="text-ink-500 text-sm leading-relaxed max-w-xs">
              Kaydır ve anlık etkini gör. Her 200₺ bir öğrencinin bugün aç yatmamasını sağlar.
            </p>
          </div>

          <div>
            {/* Counter display */}
            <div className="relative bg-gradient-to-br from-red-600/10 to-red-900/5 border border-red-600/20 rounded-2xl p-8 text-center mb-6 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
              <div className="heading-display text-[5rem] text-white leading-none tabular-nums mb-1" style={{ textShadow: '0 0 40px rgba(225,29,72,0.2)' }}>
                {count}
              </div>
              <div className="text-red-400 font-semibold text-sm">öğrenci doyacak</div>
              <div className="text-ink-700 text-xs mt-1 mono">{(count * PRICE).toLocaleString('tr-TR')}₺</div>
            </div>

            {/* Slider */}
            <div className="mb-6">
              <input
                type="range"
                min={1}
                max={50}
                value={Math.min(count, 50)}
                onChange={handleInput}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(90deg, #e11d48 0%, #e11d48 ${(Math.min(count, 50) - 1) / 49 * 100}%, #2e2e2e ${(Math.min(count, 50) - 1) / 49 * 100}%, #2e2e2e 100%)`,
                }}
              />
              <div className="flex justify-between text-ink-700 text-[10px] mono mt-1.5">
                <span>1</span>
                <span>25</span>
                <span>50+</span>
              </div>
            </div>

            {/* Quick presets */}
            <div className="flex gap-2 mb-6">
              {[1, 5, 10, 25].map(v => (
                <button
                  key={v}
                  onClick={() => setCount(v)}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-200 border ${
                    count === v
                      ? 'bg-red-600 border-red-600 text-white'
                      : 'bg-ink-800/50 border-ink-700 text-ink-400 hover:border-ink-500 hover:text-ink-200'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>

            <button
              onClick={() => onNavigate('donate')}
              className="w-full btn-red py-4 font-black heading-display tracking-wider text-base group"
            >
              <Flame size={16} className="group-hover:scale-110 transition-transform" />
              {count} ÖĞRENCİ DOYUR — {(count * PRICE).toLocaleString('tr-TR')}₺
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Trust section ─────────────────────────────────────────────────────────
function TrustSection({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const { ref, inView } = useInView(0.08);

  const TRUST_ITEMS = [
    {
      icon: Building2,
      title: 'Resmi Kayıtlı Kuruluş',
      desc: '2022 yılında Ankara\'da kurulan Askıda Pilav, yasal çerçevede faaliyet gösteren, belgelenmiş bir sosyal yardım girişimidir.',
    },
    {
      icon: Eye,
      title: '%100 Şeffaf Kullanım',
      desc: 'Her bağış takip edilir. Toplanan tutarın tamamı öğrenci menülerine ayrılır. Ara komisyon, gizli masraf veya kâr yoktur.',
    },
    {
      icon: Scale,
      title: 'Denetlenebilir Sistem',
      desc: 'Tüm teslimler kayıt altındadır. Kaç öğrenciye ulaşıldığı, hangi tarihte yemek verildiği her an izlenebilir.',
    },
    {
      icon: BadgeCheck,
      title: 'Onaylı Öğrenci Kontrolü',
      desc: 'Sisteme giren her öğrenci belge doğrulamasından geçer. Admin onayı olmadan QR kodu oluşturulamaz.',
    },
  ];

  const FAQ = [
    {
      q: 'Param gerçekten öğrenciye mi gidiyor?',
      a: 'Evet. Her bağış, sistemde kayıtlı ve belge doğrulamasından geçmiş öğrencilere menü olarak karşılık gelir. Aradaki süreç tamamen kayıt altındadır ve admin denetimindedir.',
    },
    {
      q: 'Bu bir dolandırıcılık girişimi mi?',
      a: 'Hayır. Askıda Pilav; 2022\'den bu yana Ankara\'da aktif olan, pilavustuask.com ile resmi bağı bulunan, binlerce öğrenciye ulaşmış, Çankaya/Ankara adresinde faaliyet gösteren somut bir sosyal projedir.',
    },
    {
      q: 'Kim işletiyor?',
      a: 'Proje, "Pilav Üstü Aşk" çatısı altında faaliyet göstermektedir. İletişim için ankara@pilavustuask.com veya 0510 222 56 96 numarasını kullanabilirsiniz.',
    },
    {
      q: 'İstediğim zaman bilgi alabilir miyim?',
      a: 'Evet. Mail veya telefon yoluyla ulaşıp kaç öğrenciye ulaşıldığını, sistemi nasıl çalıştığını öğrenebilirsiniz. Gizli hiçbir şey yoktur.',
    },
  ];

  return (
    <section ref={ref} className="py-24 border-b border-ink-800/50 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 50%, rgba(225,29,72,0.02), transparent)' }} />

      <div className="relative max-w-6xl mx-auto px-5">

        {/* Header */}
        <div className="text-center mb-16">
          <div className="section-tag justify-center mb-4">Şeffaflık ve Güven</div>
          <h2 className="heading-display text-[clamp(2.8rem,6vw,5.5rem)] text-white leading-[0.9] mb-5">
            NEDEN GÜVENEBİLİRSİNİZ<span className="text-red-500">?</span>
          </h2>
          <p className="text-ink-400 text-base max-w-xl mx-auto leading-[1.85]">
            Çevrimiçi bir sosyal yardım platformuna güvenmek zordur. Bu yüzden her şeyi açık tutuyoruz.
          </p>
        </div>

        {/* Trust pillars */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
          {TRUST_ITEMS.map(({ icon: Icon, title, desc }, i) => (
            <div
              key={title}
              className={`relative bg-ink-900/60 border border-ink-800 hover:border-ink-700 rounded-2xl p-6 transition-all duration-700 hover:bg-ink-900 ${
                inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-600/20 to-transparent" />
              <div className="w-10 h-10 bg-red-600/10 border border-red-600/15 rounded-xl flex items-center justify-center mb-5">
                <Icon size={18} className="text-red-500" />
              </div>
              <div className="text-white font-bold text-sm mb-2">{title}</div>
              <div className="text-ink-500 text-xs leading-[1.85]">{desc}</div>
            </div>
          ))}
        </div>

        {/* Identity + contact band */}
        <div className="relative bg-ink-900 border border-ink-700/60 rounded-3xl p-8 md:p-10 mb-14 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-600/40 to-transparent" />
          <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 50% 80% at 0% 50%, rgba(225,29,72,0.04), transparent)' }} />

          <div className="relative grid md:grid-cols-[1fr_1px_1fr_1px_1fr] gap-8 items-start">
            {/* Who we are */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Building2 size={14} className="text-red-500" />
                <span className="text-ink-500 text-[10px] font-black uppercase tracking-[0.25em]">Kim Olduğumuz</span>
              </div>
              <div className="text-white font-bold text-sm mb-2">Askıda Pilav</div>
              <div className="text-ink-500 text-xs leading-relaxed mb-3">
                "Pilav Üstü Aşk" çatısı altında faaliyet gösteren sosyal yardım projesi.
                2022'den bu yana Ankara'nın tüm üniversite öğrencilerine ulaşıyor.
              </div>
              <a
                href="https://pilavustuask.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-red-400 hover:text-red-300 text-xs font-semibold transition-colors"
              >
                pilavustuask.com <ExternalLink size={10} />
              </a>
            </div>

            <div className="hidden md:block w-px bg-ink-800" />

            {/* Where we are */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MapPin size={14} className="text-red-500" />
                <span className="text-ink-500 text-[10px] font-black uppercase tracking-[0.25em]">Adresimiz</span>
              </div>
              <div className="text-ink-300 text-xs leading-[1.9]">
                Bahçelievler Mahallesi<br />
                Azerbaycan Caddesi 59/A<br />
                Çankaya / Ankara
              </div>
              <div className="mt-3 inline-flex items-center gap-1.5 bg-green-500/8 border border-green-500/20 rounded-lg px-3 py-1.5">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                <span className="text-green-400 text-[10px] font-semibold">Fiziksel Adres Mevcut</span>
              </div>
            </div>

            <div className="hidden md:block w-px bg-ink-800" />

            {/* Contact */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MessageCircle size={14} className="text-red-500" />
                <span className="text-ink-500 text-[10px] font-black uppercase tracking-[0.25em]">İletişim</span>
              </div>
              <div className="space-y-3">
                {[
                  { icon: Mail, value: 'ankara@pilavustuask.com', href: 'mailto:ankara@pilavustuask.com' },
                  { icon: Phone, value: '0510 222 56 96', href: 'tel:+905102225696' },
                ].map(({ icon: Icon, value, href }) => (
                  <a key={value} href={href} className="flex items-center gap-2.5 group">
                    <div className="w-7 h-7 bg-ink-800 border border-ink-700 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:border-red-600/30 transition-colors">
                      <Icon size={11} className="text-ink-500 group-hover:text-red-500 transition-colors" />
                    </div>
                    <span className="text-ink-400 group-hover:text-red-400 text-xs transition-colors mono">{value}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="grid md:grid-cols-2 gap-4 mb-12">
          {FAQ.map(({ q, a }, i) => (
            <div
              key={i}
              className={`bg-ink-900/50 border border-ink-800 hover:border-ink-700 rounded-2xl p-6 transition-all duration-700 hover:bg-ink-900/80 ${
                inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
              style={{ transitionDelay: `${400 + i * 80}ms` }}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-6 h-6 bg-red-600/15 border border-red-600/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MessageCircle size={11} className="text-red-400" />
                </div>
                <div className="text-white font-semibold text-sm leading-snug">{q}</div>
              </div>
              <div className="text-ink-500 text-xs leading-[1.85] pl-9">{a}</div>
            </div>
          ))}
        </div>

        {/* Transparency report strip */}
        <div className="relative bg-gradient-to-r from-ink-900 via-ink-900/80 to-ink-900 border border-ink-800 rounded-2xl px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-6 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-600/25 to-transparent" />
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-600/10 border border-red-600/15 rounded-2xl flex items-center justify-center flex-shrink-0">
              <FileText size={20} className="text-red-500" />
            </div>
            <div>
              <div className="text-white font-bold text-sm mb-0.5">Şeffaflık Taahhüdü</div>
              <div className="text-ink-500 text-xs max-w-md leading-relaxed">
                Bağış yaptıktan sonra şüphe duyarsanız, kaç öğrenciye ne zaman ulaşıldığını
                sormak için bize ulaşın. Her soruya yanıt veririz.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <a
              href="mailto:ankara@pilavustuask.com"
              className="btn-outline px-5 py-2.5 text-sm rounded-xl"
            >
              <Mail size={13} />
              Bilgi Al
            </a>
            <button
              onClick={() => onNavigate('donate')}
              className="btn-red px-5 py-2.5 text-sm font-black heading-display tracking-wider"
            >
              <Heart size={13} className="fill-white" />
              DESTEK OL
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────
export default function HomePage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const [stats, setStats] = useState<GlobalStats | null>(null);
  const [redemptions, setRedemptions] = useState<MealRedemption[]>([]);
  const [redemptionStudents, setRedemptionStudents] = useState<Record<string, Student>>({});
  const [visible, setVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsInView, setStatsInView] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 50);
    loadStats();
    loadRedemptions();
    const iv = setInterval(loadStats, 30000);

    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsInView(true); }, { threshold: 0.1 });
    if (statsRef.current) obs.observe(statsRef.current);

    return () => { clearInterval(iv); obs.disconnect(); };
  }, []);

  const loadStats = async () => {
    const today = new Date().toISOString().split('T')[0];
    const { count: todayCount } = await supabase
      .from('meal_redemptions').select('*', { count: 'exact', head: true })
      .gte('redeemed_at', `${today}T00:00:00`);
    const { count: approvedCount } = await supabase
      .from('students').select('*', { count: 'exact', head: true }).eq('status', 'approved');
    const { data: statsData } = await supabase.from('global_stats').select('*').eq('id', 1).maybeSingle();
    if (statsData) {
      setStats({
        ...statsData,
        today_meals: todayCount ?? statsData.today_meals,
        waiting_students: Math.max(0, (approvedCount ?? 0) - (todayCount ?? 0)),
        total_students_approved: approvedCount ?? statsData.total_students_approved,
      });
    }
  };

  const loadRedemptions = async () => {
    const { data } = await supabase
      .from('meal_redemptions').select('*').order('redeemed_at', { ascending: false }).limit(5);
    if (!data) return;
    setRedemptions(data);
    const ids = [...new Set(data.map(r => r.student_id))];
    const { data: students } = await supabase.from('students').select('*').in('id', ids);
    if (students) {
      const map: Record<string, Student> = {};
      students.forEach(s => { map[s.id] = s; });
      setRedemptionStudents(map);
    }
  };

  const todayMeals = stats?.today_meals ?? 47;
  const waitingStudents = stats?.waiting_students ?? 14;
  const totalMeals = stats?.total_meals_all_time ?? 3241;
  const totalDonors = stats?.total_donors ?? 387;
  const goalPercent = Math.min(100, Math.round((todayMeals / 100) * 100));

  const deliveryData: DeliveryItem[] = redemptions.length > 0
    ? redemptions.slice(0, 5).map((r, i) => {
        const s = redemptionStudents[r.student_id];
        const d = new Date(r.redeemed_at);
        return {
          name: s ? `${s.full_name.split(' ')[0]} ${s.full_name.split(' ').slice(-1)[0].charAt(0)}.` : 'Öğrenci',
          uni: s?.university?.split(' ').slice(0, 2).join(' ') ?? 'Ankara',
          menu: 'Tavuklu Pilav + Ayran',
          time: d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
          index: i,
        };
      })
    : MOCK_DELIVERIES;

  return (
    <div className="min-h-screen">

      {/* ════════════════════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center overflow-hidden">

        {/* Background layers */}
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg"
            alt=""
            className="w-full h-full object-cover opacity-[0.08]"
          />
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 90% 90% at 65% 45%, transparent 20%, rgba(10,10,10,0.85) 70%, #0a0a0a 100%)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(10,10,10,0.8) 0%, transparent 20%, transparent 65%, rgba(10,10,10,1) 100%)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(100deg, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.55) 45%, transparent 100%)' }} />
          <div className="absolute bottom-1/3 left-[20%] w-[700px] h-[700px] bg-red-600/4 rounded-full blur-[160px] pointer-events-none" />
          <div className="absolute top-1/4 right-[15%] w-[400px] h-[400px] bg-red-900/6 rounded-full blur-[120px] pointer-events-none" />
        </div>

        <div className="absolute left-0 top-1/5 bottom-1/5 vline-red hidden xl:block" />

        <div className="relative max-w-6xl mx-auto px-5 pt-36 pb-24 w-full">
          <div className="grid lg:grid-cols-[1fr_390px] gap-14 xl:gap-20 items-center">

            {/* ── Copy column ── */}
            <div>
              <div className={`flex flex-wrap items-center gap-2.5 mb-8 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`}>
                <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border transition-all duration-500 bg-red-500/8 border-red-500/25">
                  <div className="live-dot-sm" />
                  <span className="text-red-400 text-xs font-semibold mono">
                    Şu an <span className="text-red-300 font-black">{waitingStudents}</span> öğrenci bekliyor
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-red-600/20 bg-transparent text-[10px] font-black text-red-500 tracking-[0.25em] uppercase">
                  Pilav Üstü Aşk
                </span>
              </div>

              <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ transitionDelay: '80ms' }}>
                <h1 className="heading-display leading-[0.88] mb-7">
                  <span className="block text-[clamp(3.5rem,8vw,6.5rem)] text-white">ANKARA'DA</span>
                  <span className="block text-[clamp(3.5rem,8vw,6.5rem)] text-white">OKUYAN HER</span>
                  <span
                    className="block text-[clamp(3.5rem,8vw,6.5rem)]"
                    style={{ color: '#e11d48', textShadow: '0 0 60px rgba(225,29,72,0.3), 0 0 120px rgba(225,29,72,0.1)' }}
                  >
                    ÖĞRENCİ
                  </span>
                  <span className="block text-[clamp(3.5rem,8vw,6.5rem)] text-white">DOYAR.</span>
                </h1>
              </div>

              <div className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`} style={{ transitionDelay: '180ms' }}>
                <p className="text-ink-400 text-[1.05rem] leading-[1.75] mb-2 max-w-[400px] font-light">
                  Yardım etmek isteyenlerle, sıcak yemeğe ihtiyaç duyan öğrencileri
                  güvenli ve şeffaf şekilde buluşturan sosyal destek sistemi.
                </p>
                <p className="text-ink-700 text-[11px] mb-8 font-medium tracking-[0.15em] uppercase">
                  Ankara'nın Yerli ve Milli İlk Sosyal Yardım Projesi · 2022
                </p>

                <div className="flex flex-wrap gap-2 mb-10">
                  {[
                    { icon: Leaf, label: 'Basmati Pirinç', cls: 'text-emerald-500' },
                    { icon: Award, label: 'Anne Tarifi', cls: 'text-amber-400' },
                    { icon: Star, label: '200₺ / Menü', cls: 'text-red-400' },
                    { icon: MapPin, label: 'Ankara', cls: 'text-sky-400' },
                  ].map(({ icon: Icon, label, cls }) => (
                    <span key={label} className="pill">
                      <Icon size={10} className={cls} /> {label}
                    </span>
                  ))}
                </div>
              </div>

              <div className={`flex flex-wrap gap-3 mb-16 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`} style={{ transitionDelay: '260ms' }}>
                <button
                  onClick={() => onNavigate('donate')}
                  className="btn-red px-9 py-4 text-base font-black heading-display tracking-wider group"
                >
                  <Flame size={17} className="group-hover:scale-110 transition-transform duration-200" />
                  PİLAV ISMARLA
                </button>
                <button
                  onClick={() => onNavigate('student-qr')}
                  className="btn-outline px-7 py-4 text-sm font-medium group"
                >
                  Öğrenciyim, Yemek Al
                  <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

              <div className={`flex items-center gap-0 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'}`} style={{ transitionDelay: '340ms' }}>
                {[
                  { value: todayMeals, label: 'Bugün doydu' },
                  { value: totalMeals, label: 'Toplam menü' },
                  { value: totalDonors, label: 'Bağışçı' },
                ].map((s, i) => (
                  <div key={i} className="flex items-center">
                    {i > 0 && <div className="w-px h-10 bg-ink-800/80 mx-7" />}
                    <div>
                      <div className="text-[1.6rem] font-black text-white tabular-nums tracking-tight leading-none">
                        <Counter to={s.value} />
                      </div>
                      <div className="text-ink-600 text-[10px] font-medium uppercase tracking-[0.18em] mt-1">{s.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Live impact panel ── */}
            <div className={`hidden lg:flex flex-col gap-3 transition-all duration-700 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`} style={{ transitionDelay: '220ms' }}>

              <div className="relative overflow-hidden rounded-2xl border border-ink-800/80 bg-ink-900" style={{ boxShadow: '0 4px 40px rgba(0,0,0,0.6), 0 1px 0 rgba(255,255,255,0.03)' }}>
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-600/50 to-transparent" />
                <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(225,29,72,0.07), transparent)' }} />

                <div className="relative p-5">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <div className="live-dot" />
                      <span className="text-ink-500 text-[9px] font-black uppercase tracking-[0.3em]">Bugünkü Etki</span>
                    </div>
                    <span className="text-ink-700 text-[9px] mono">{new Date().toLocaleDateString('tr-TR')}</span>
                  </div>

                  <div className="flex items-end gap-3 mb-1">
                    <div className="heading-display text-[5.5rem] text-white tabular-nums leading-none" style={{ textShadow: '0 0 40px rgba(225,29,72,0.2)' }}>
                      <Counter to={todayMeals} />
                    </div>
                    <div className="pb-3">
                      <div className="text-red-400 font-bold text-sm leading-tight">öğrenci</div>
                      <div className="text-red-500 font-bold text-sm leading-tight">doydu</div>
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingUp size={9} className="text-green-500" />
                        <span className="text-green-500 text-[9px] font-semibold mono">bugün</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-5">
                    <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse flex-shrink-0" />
                    <span className="text-ink-500 text-xs">{waitingStudents} öğrenci hâlâ bekliyor</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] mono">
                      <span className="text-ink-700">{todayMeals} / 100 günlük hedef</span>
                      <span className="text-red-500 font-bold">{goalPercent}%</span>
                    </div>
                    <div className="h-2 bg-ink-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1200 relative"
                        style={{
                          width: `${goalPercent}%`,
                          background: 'linear-gradient(90deg, #9f1239 0%, #e11d48 60%, #f43f5e 100%)',
                        }}
                      >
                        <div className="absolute right-0 top-0 bottom-0 w-5 bg-white/20 blur-[3px]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-dark p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="live-dot" />
                    <span className="text-ink-500 text-[9px] font-black uppercase tracking-[0.3em]">Son Teslimler</span>
                  </div>
                  <span className="text-ink-800 text-[9px] mono">Gerçek zamanlı</span>
                </div>
                {deliveryData.map((d, i) => <DeliveryRow key={i} {...d} />)}
              </div>

              <button
                onClick={() => onNavigate('donate')}
                className="group relative overflow-hidden rounded-2xl p-5 text-left transition-all duration-300 hover:scale-[1.02]"
                style={{ background: 'linear-gradient(135deg, #be123c 0%, #e11d48 50%, #be123c 100%)', boxShadow: '0 4px 30px rgba(225,29,72,0.35)' }}
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'radial-gradient(ellipse at top right, rgba(255,255,255,0.12), transparent 60%)' }} />
                <div className="relative flex items-center justify-between">
                  <div>
                    <div className="text-red-200 text-[9px] font-black uppercase tracking-[0.3em] mb-1">Şimdi Destek Ol</div>
                    <div className="heading-display text-2xl text-white tracking-wider">PILAV ISMARLA</div>
                    <div className="text-red-200/70 text-[11px] mt-1">{PRICE}₺ · 1 öğrenci · bugün</div>
                  </div>
                  <div className="w-11 h-11 bg-white/15 rounded-xl flex items-center justify-center group-hover:bg-white/22 transition-colors group-hover:scale-110 duration-300">
                    <Flame size={20} className="text-white" />
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className={`absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 transition-all duration-1000 ${visible ? 'opacity-25' : 'opacity-0'}`} style={{ transitionDelay: '1500ms' }}>
          <div className="w-px h-10 bg-gradient-to-b from-red-500/50 to-transparent" />
          <div className="w-1.5 h-1.5 bg-red-600/50 rounded-full animate-bounce" />
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          TICKER
      ════════════════════════════════════════════════════════════════ */}
      <div className="border-y border-ink-800/50 overflow-hidden bg-ink-900/15 py-3.5">
        <div className="flex animate-ticker whitespace-nowrap select-none">
          {[...Array(2)].map((_, idx) => (
            <div key={idx} className="flex items-center gap-12 pr-12">
              {[
                `${todayMeals} menü bugün teslim edildi`,
                `${waitingStudents} öğrenci şu an bekliyor`,
                'Pilav Üstü Aşk · Sosyal Yardımın Yeni Nesli',
                `${totalMeals.toLocaleString('tr-TR')} toplam menü`,
                'Uzun taneli Basmati pirinç',
                'Tavuklu Pilav + Köy Ayranı',
                `${PRICE}₺ kişi başı tam menü`,
                '13 Ankara üniversitesi',
                `${totalDonors} hayırsever bağışçı`,
                'Ankara 2022',
              ].map((t) => (
                <span key={t} className="flex items-center gap-3 text-ink-700 text-[10px] font-semibold tracking-[0.22em] uppercase">
                  <span className="w-0.5 h-0.5 bg-red-700 rounded-full flex-shrink-0" />
                  {t}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════
          STATS GRID
      ════════════════════════════════════════════════════════════════ */}
      <section ref={statsRef} className="border-b border-ink-800/50">
        <div className="max-w-6xl mx-auto px-5">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-ink-800/50">
            <StatItem value={todayMeals} label="Bugün Doydu" red inView={statsInView} />
            <StatItem value={waitingStudents} label="Bekleyen" red inView={statsInView} />
            <StatItem value={totalMeals} label="Toplam Menü" inView={statsInView} />
            <StatItem value={totalDonors} label="Bağışçı" inView={statsInView} />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          SOCIAL PROOF — Recent donors wall
      ════════════════════════════════════════════════════════════════ */}
      <section className="py-24 border-b border-ink-800/50 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 80% at 50% 100%, rgba(225,29,72,0.025), transparent)' }} />
        <div className="relative max-w-6xl mx-auto px-5">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <div className="section-tag mb-4">Son Bağışlar</div>
              <h2 className="heading-display text-[clamp(2.5rem,5vw,4.5rem)] text-white leading-[0.9]">
                BUGÜN DESTEK<br /><span className="text-red-500">OLANLAR.</span>
              </h2>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="live-dot" />
              <span className="text-ink-500 text-xs mono">Canlı güncelleniyor</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mb-10">
            {MOCK_DONORS.map((donor, i) => (
              <DonorCard key={i} donor={donor} index={i} />
            ))}
          </div>

          {/* Aggregate trust strip */}
          <div className="relative bg-ink-900/60 border border-ink-800 rounded-2xl p-6 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-600/25 to-transparent" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {[
                { val: `${totalDonors}+`, label: 'Toplam Bağışçı' },
                { val: `${totalMeals.toLocaleString('tr-TR')}`, label: 'Doyurulan Öğrenci' },
                { val: '2022', label: 'Kuruluş Yılı' },
                { val: '13', label: 'Üniversite' },
              ].map(({ val, label }) => (
                <div key={label}>
                  <div className="heading-display text-3xl text-white mb-1">{val}</div>
                  <div className="text-ink-600 text-[10px] uppercase tracking-[0.2em]">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          IMPACT CALCULATOR
      ════════════════════════════════════════════════════════════════ */}
      <section className="py-24 border-b border-ink-800/50">
        <div className="max-w-6xl mx-auto px-5">
          <ImpactCalculator onNavigate={onNavigate} />
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          STUDENT TESTIMONIALS
      ════════════════════════════════════════════════════════════════ */}
      <section className="py-24 border-b border-ink-800/50 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 50% 60% at 50% 50%, rgba(225,29,72,0.025), transparent)' }} />
        <div className="relative max-w-6xl mx-auto px-5">
          <div className="text-center mb-14">
            <div className="section-tag justify-center mb-4">Gerçek Hikayeler</div>
            <h2 className="heading-display text-[clamp(2.5rem,5vw,4.5rem)] text-white leading-[0.9]">
              ÖĞRENCİLER<br /><span className="text-red-500">ANLATIYOR.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {[
              {
                quote: "Burs gecikmişti, cebimde para kalmamıştı. O gün Askıda Pilav olmasaydı ne yapardım bilmiyorum. İnsan gibi yedim, derslere girdim.",
                name: "Öğrenci, ODTÜ",
                detail: "Mühendislik 3. Sınıf",
                index: 0,
              },
              {
                quote: "Hem lezzetli hem sıcak. Anne yemekleri gibi. Patronluk taslamıyor, insan yerine koyuyor seni. Bu sisteme güveniyorum.",
                name: "Öğrenci, Hacettepe",
                detail: "Tıp Fakültesi 2. Sınıf",
                index: 1,
              },
              {
                quote: "QR sistemi çok rahat. 30 saniyede yemeğimi aldım. Şeffaf olması en önemli şey — paranın gerçekten öğrenciye gittiğini biliyorum.",
                name: "Öğrenci, Gazi",
                detail: "İşletme 4. Sınıf",
                index: 2,
              },
            ].map((t) => (
              <TestimonialCard key={t.index} {...t} />
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          PİLAV ÜSTÜ AŞK — BRAND EDITORIAL
      ════════════════════════════════════════════════════════════════ */}
      <section className="py-20 border-b border-ink-800/50 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-red-600/15 to-transparent" />
          <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-red-600/10 to-transparent" />
        </div>
        <div className="relative max-w-6xl mx-auto px-5">
          <div className="grid md:grid-cols-[1fr_280px] gap-12 items-start">

            <div>
              <div className="section-tag mb-5">Sosyal Yardımın Yeni Nesli</div>
              <h2 className="heading-display text-[clamp(2.8rem,6vw,5rem)] text-white mb-5 leading-[0.9]">
                PİLAV ÜSTÜ AŞK<span className="text-red-500">.</span>
              </h2>
              <p className="text-ink-400 text-base leading-[1.85] max-w-xl mb-8">
                Askıda Pilav; yardım etmek isteyenlerle, sıcak yemeğe ihtiyaç duyan öğrencileri
                güvenli ve şeffaf şekilde buluşturan sosyal destek sistemidir. Ankara'nın yerli
                ve milli ilk sosyal yardım projesi olarak her gün yüzlerce öğrenciye ulaşıyoruz.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { val: '2022', label: 'Kuruluş', red: true },
                  { val: '13', label: 'Üniversite', red: true },
                  { val: '3.200+', label: 'Menü', red: false },
                  { val: `${PRICE}₺`, label: 'Kişi Başı', red: false },
                ].map(({ val, label, red }) => (
                  <div key={label} className="bg-ink-900/60 border border-ink-800 rounded-xl p-4 text-center hover:border-ink-700 transition-colors">
                    <div className={`heading-display text-3xl mb-1 ${red ? 'text-red-400' : 'text-white'}`}>{val}</div>
                    <div className="text-ink-600 text-[10px] uppercase tracking-[0.2em]">{label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="card-accent p-6">
              <div className="text-[9px] text-ink-700 font-black uppercase tracking-[0.3em] mb-3">Resmi Marka İşbirliği</div>
              <div className="text-red-400 font-black text-2xl heading-display mb-1">Pilav Üstü Aşk</div>
              <a
                href="https://pilavustuask.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-ink-600 hover:text-red-400 text-xs transition-colors group mb-5"
              >
                pilavustuask.com
                <ExternalLink size={10} className="group-hover:text-red-400" />
              </a>
              <div className="hr-red mb-5" />
              <div className="space-y-2.5">
                {[
                  { icon: MapPin, text: 'Çankaya / Ankara' },
                  { icon: Shield, text: 'Onaylı sosyal proje' },
                  { icon: Heart, text: "Türkiye'nin ilki" },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-2.5">
                    <Icon size={12} className="text-red-600 flex-shrink-0" />
                    <span className="text-ink-400 text-xs">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          LIVE FEED (mobile)
      ════════════════════════════════════════════════════════════════ */}
      <section className="py-14 lg:hidden border-b border-ink-800/50">
        <div className="max-w-6xl mx-auto px-5">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="live-dot" />
            <span className="text-ink-500 text-[9px] font-black uppercase tracking-[0.3em]">Son Teslimler</span>
          </div>
          <div className="card-dark p-5">
            {deliveryData.map((d, i) => <DeliveryRow key={i} {...d} />)}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          NEDEN BİZ?
      ════════════════════════════════════════════════════════════════ */}
      <section className="py-28 border-b border-ink-800/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-ink-950 via-transparent to-ink-950 pointer-events-none" />
        <div className="absolute right-[-100px] top-1/4 w-[500px] h-[500px] bg-red-600/3 rounded-full blur-[140px] pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-5">
          <div className="grid lg:grid-cols-2 gap-20 xl:gap-28 items-start">

            <div>
              <div className="section-tag mb-6">Neden Biz?</div>
              <h2 className="heading-display text-5xl md:text-7xl text-white mb-7 leading-[0.88]">
                ANNE ELİ<br />DEĞMİŞ<br /><span className="text-red-500">PİLAV.</span>
              </h2>
              <p className="text-ink-400 text-[0.95rem] leading-[1.9] mb-8 max-w-sm">
                Hazır gıda değil. Fabrika işi değil. Her gün sabahın erken saatlerinde
                taze malzemeyle, geleneksel anne tarifiyle pişirilen, sizi doyuran pilav.
                Bir kaşık aldığınızda evinizi hatırlatır.
              </p>

              <div className="card-dark p-5 mb-6">
                <div className="text-ink-600 text-[9px] font-black uppercase tracking-[0.28em] mb-5">Menü İçeriği</div>
                <div className="space-y-4">
                  {[
                    { name: 'Uzun Taneli Basmati Pirinç', detail: 'Hindistan orijinli · düşük glisemik indeks · hafif ve tok tutar' },
                    { name: 'Taze Tavuk Göğsü', detail: 'Günlük temin · yüksek protein (38g) · az yağ' },
                    { name: 'Tereyağı Kavurma', detail: 'Sanayi yağı değil · gerçek köy tereyağı' },
                    { name: 'Tam Yağlı Köy Ayranı', detail: 'Probiyotik · sindirimi kolaylaştırır · kalsiyum deposu' },
                  ].map(item => (
                    <div key={item.name} className="flex gap-3.5">
                      <div className="w-1 h-1 bg-red-500 rounded-full flex-shrink-0 mt-2" />
                      <div>
                        <div className="text-white font-semibold text-sm">{item.name}</div>
                        <div className="text-ink-600 text-[11px] mt-0.5">{item.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 text-ink-600 text-xs">
                <Shield size={11} className="text-red-600 flex-shrink-0" />
                <span>Her gün taze pişirilir · Kimyasal katkı içermez · Helal sertifikalı</span>
              </div>
            </div>

            <div>
              <div className="section-tag mb-6">Kalite Standartları</div>
              <h3 className="heading-display text-5xl text-white mb-7 leading-[0.88]">620 KCAL<br />TAM BİR ÖĞÜN.</h3>
              <div className="grid grid-cols-2 gap-3 mb-5">
                <QualityCell accent icon={Leaf} title="Basmati Pirinç" desc="Düşük GI, uzun enerji, sindirimi kolay. Fabrika pirinci değil." />
                <QualityCell icon={Award} title="Anne Tarifi" desc="Nesiller boyu aktarılan gizli baharat karışımı. Lezzet standardı." />
                <QualityCell icon={Zap} title="38g Protein" desc="Günlük protein ihtiyacının %60'ını karşılar." />
                <QualityCell icon={Heart} title="Probiyotik Ayran" desc="Bağırsak florası için. Sindirimi destekler, tok tutar." />
                <QualityCell icon={Clock} title="Her Gün Taze" desc="Sabah 06:00'da pişirilir. Öğle ve akşam dağıtımı." />
                <QualityCell icon={Star} title="620 kcal" desc="Tam öğünlük enerji. Sizi yorgun düşürmez." />
              </div>

              <div className="bg-ink-900/50 border border-ink-800 rounded-2xl p-5">
                <div className="text-ink-600 text-[9px] font-black uppercase tracking-[0.28em] mb-4">Besin Değerleri (1 Porsiyon)</div>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'Kalori', val: '620', unit: 'kcal' },
                    { label: 'Protein', val: '38', unit: 'g' },
                    { label: 'Karbonhidrat', val: '72', unit: 'g' },
                    { label: 'Yağ', val: '12', unit: 'g' },
                  ].map(n => (
                    <div key={n.label} className="text-center bg-ink-800/40 rounded-xl py-3">
                      <div className="text-white font-black text-lg mono tabular-nums leading-none">
                        {n.val}<span className="text-ink-600 text-[10px] font-normal">{n.unit}</span>
                      </div>
                      <div className="text-ink-700 text-[9px] mt-1">{n.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          HOW IT WORKS + TIERS
      ════════════════════════════════════════════════════════════════ */}
      <section className="py-28 border-b border-ink-800/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-ink-950 via-ink-900/10 to-ink-950 pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-5">
          <div className="grid lg:grid-cols-2 gap-20 xl:gap-28 items-start">

            <div>
              <div className="section-tag mb-6">Sistem</div>
              <h2 className="heading-display text-5xl md:text-7xl text-white mb-5 leading-[0.88]">NASIL<br />ÇALIŞIR?</h2>
              <p className="text-ink-500 text-sm mb-12 leading-relaxed max-w-xs">
                Şeffaf, hızlı, güvenilir. Bağışından tabağa 3 adım.
              </p>
              <div className="space-y-9">
                <Step num="1" title="Menü Ismarla" desc={`${PRICE.toLocaleString('tr-TR')}₺ bağış yap. 1'den 50 öğrenciye kadar ısmarlayabilirsin.`} delay={0} />
                <Step num="2" title="Öğrenci Kaydı ve Onay" desc="Öğrenci, üniversite belgesiyle sisteme kayıt olur. Admin 24 saat içinde onaylar." delay={100} />
                <Step num="3" title="QR ile Anında Teslim" desc="Onaylı öğrenci QR kodu oluşturur. Dağıtım noktasında okutulur, sıcak menü teslim edilir." delay={200} last />
              </div>
            </div>

            <div>
              <div className="section-tag mb-6">Fiyatlar</div>
              <h3 className="heading-display text-5xl md:text-7xl text-white mb-2 leading-[0.88]">ISMARLA</h3>
              <p className="text-ink-600 text-xs mb-7 mono">{PRICE.toLocaleString('tr-TR')}₺ × kişi · Tavuklu Pilav + Ayran</p>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <TierCard meals={1} price={1 * PRICE} label="1 Öğrenci" onDonate={() => onNavigate('donate')} />
                <TierCard meals={3} price={3 * PRICE} label="3 Öğrenci" onDonate={() => onNavigate('donate')} />
                <TierCard meals={5} price={5 * PRICE} label="5 Öğrenci" highlight onDonate={() => onNavigate('donate')} />
                <TierCard meals={10} price={10 * PRICE} label="10 Öğrenci" onDonate={() => onNavigate('donate')} />
              </div>
              <button onClick={() => onNavigate('donate')} className="w-full btn-red py-4 text-base font-black heading-display tracking-wider group">
                <Flame size={17} className="group-hover:scale-110 transition-transform" />
                DAHA FAZLA ISMARLA
              </button>
              <div className="flex items-center gap-2 mt-4 justify-center text-ink-700 text-xs">
                <Shield size={10} />
                <span>%100 öğrencilere ulaşır · Şeffaf sistem</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          SECURITY
      ════════════════════════════════════════════════════════════════ */}
      <section className="py-28 border-b border-ink-800/50">
        <div className="max-w-6xl mx-auto px-5">
          <div className="grid md:grid-cols-2 gap-14 items-center">
            <div>
              <div className="section-tag mb-6">Güvenlik</div>
              <h3 className="heading-display text-5xl md:text-7xl text-white mb-5 leading-[0.88]">
                BAĞIŞIN<br />DOĞRU YERE<br /><span className="text-red-500">GİDER.</span>
              </h3>
              <p className="text-ink-500 text-sm leading-relaxed max-w-sm mb-8">
                Bağışları yalnızca gerçekten ihtiyaç duyan öğrencilere ulaştırmak için
                çoklu güvenlik katmanı oluşturuldu.
              </p>
              <div className="flex items-center gap-3 bg-ink-900/60 border border-red-600/15 rounded-xl p-4">
                <div className="w-10 h-10 bg-red-600/12 border border-red-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Shield size={18} className="text-red-500" />
                </div>
                <div>
                  <div className="text-white font-semibold text-sm">Sıfır tolerans politikası</div>
                  <div className="text-ink-600 text-xs mt-0.5">Tespit edilen suistimaller anında engellenir</div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <SecurityCell icon={Clock} title="Günlük Limit" desc="Max. 2 porsiyon / gün" />
              <SecurityCell icon={Users} title="Haftalık Limit" desc="Max. 12 porsiyon / hafta" />
              <SecurityCell icon={Zap} title="Cihaz Kontrolü" desc="Aynı cihazdan tekrar yok" />
              <SecurityCell icon={Lock} title="QR Tek Kullanım" desc="10 dakika geçerli, tek seferlik" />
              <SecurityCell icon={GraduationCap} title="Belge Onayı" desc="Öğrenci belgesi zorunlu" />
              <SecurityCell icon={Shield} title="Admin Denetimi" desc="Her teslim kayıt altında" />
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          TRANSPARENCY & TRUST
      ════════════════════════════════════════════════════════════════ */}
      <TrustSection onNavigate={onNavigate} />

      {/* ════════════════════════════════════════════════════════════════
          FINAL CTA
      ════════════════════════════════════════════════════════════════ */}
      <section className="py-36 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full" style={{ background: 'radial-gradient(ellipse, rgba(225,29,72,0.06) 0%, transparent 65%)' }} />
        </div>
        <div className="relative max-w-6xl mx-auto px-5 text-center">
          <div className="flex items-center justify-center gap-2.5 mb-10">
            <div className="live-dot" />
            <span className="text-ink-600 text-[10px] font-bold uppercase tracking-[0.3em] mono">
              {waitingStudents} öğrenci bekliyor
            </span>
          </div>
          <h2 className="heading-display leading-[0.88] mb-10">
            <span className="block text-[clamp(4rem,12vw,10rem)] text-white">BİR TANE</span>
            <span
              className="block text-[clamp(4rem,12vw,10rem)]"
              style={{ color: '#e11d48', textShadow: '0 0 80px rgba(225,29,72,0.25)' }}
            >
              ISMARLA.
            </span>
          </h2>
          <p className="text-ink-500 text-lg mb-14 max-w-xs mx-auto font-light leading-relaxed">
            {PRICE.toLocaleString('tr-TR')}₺. Tavuklu pilav + ayran.<br />
            Bir öğrenci bugün aç yatmaz.
          </p>
          <div className="flex flex-wrap gap-4 justify-center mb-12">
            <button
              onClick={() => onNavigate('donate')}
              className="group btn-red px-14 py-5 text-xl font-black heading-display tracking-wider"
            >
              <Flame size={22} className="group-hover:scale-110 transition-transform duration-200" />
              PİLAV ISMARLA
            </button>
            <button onClick={() => onNavigate('student-register')} className="btn-outline px-8 py-5 text-sm font-medium group">
              <GraduationCap size={16} />
              Öğrenci Kaydı
            </button>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Heart size={12} className="text-red-600" />
            <span className="text-ink-800 text-xs">Tüm bağışlar Ankara üniversite öğrencilerine gider</span>
          </div>
        </div>
      </section>
    </div>
  );
}

// ── Donor card ────────────────────────────────────────────────────────────
function DonorCard({ donor, index }: { donor: typeof MOCK_DONORS[0]; index: number }) {
  const { ref, inView } = useInView(0.1);
  const avatarLetters = ['M', 'A', '?', 'F', 'H', 'S'];
  const colors = [
    'from-red-700 to-red-900',
    'from-rose-600 to-red-800',
    'from-red-800 to-red-950',
    'from-red-600 to-rose-800',
    'from-rose-700 to-red-900',
    'from-red-700 to-rose-900',
  ];

  return (
    <div
      ref={ref}
      className={`flex items-center gap-4 bg-ink-900/60 border border-ink-800 hover:border-ink-700 rounded-2xl p-4 transition-all duration-500 hover:bg-ink-900 ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      style={{ transitionDelay: `${index * 80}ms` }}
    >
      <div className={`w-10 h-10 bg-gradient-to-br ${colors[index % colors.length]} rounded-xl flex items-center justify-center text-white font-bold text-sm heading-display flex-shrink-0`}>
        {donor.name === 'Anonim' ? '?' : avatarLetters[index % avatarLetters.length]}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-white font-semibold text-sm leading-tight">{donor.name}</div>
        <div className="text-ink-600 text-[11px] mt-0.5">{donor.city} · {donor.time}</div>
      </div>
      <div className="flex flex-col items-end flex-shrink-0">
        <div className="text-red-400 font-black text-sm heading-display">{donor.meals} öğrenci</div>
        <div className="text-ink-700 text-[10px] mono">{(donor.meals * PRICE).toLocaleString('tr-TR')}₺</div>
      </div>
    </div>
  );
}

// ── Testimonial card ──────────────────────────────────────────────────────
function TestimonialCard({ quote, name, detail, index }: { quote: string; name: string; detail: string; index: number }) {
  const { ref, inView } = useInView(0.15);
  return (
    <div
      ref={ref}
      className={`relative bg-ink-900/60 border border-ink-800 hover:border-ink-700 rounded-2xl p-7 transition-all duration-700 hover:bg-ink-900 ${
        inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${index * 120}ms` }}
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-600/20 to-transparent" />
      <Quote size={20} className="text-red-700/50 mb-5" />
      <p className="text-ink-300 text-sm leading-[1.9] mb-7 font-light">
        {quote}
      </p>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gradient-to-br from-red-700 to-red-900 rounded-lg flex items-center justify-center text-white text-xs font-black heading-display">
          {name.charAt(0)}
        </div>
        <div>
          <div className="text-white font-semibold text-xs">{name}</div>
          <div className="text-ink-700 text-[10px]">{detail}</div>
        </div>
      </div>
    </div>
  );
}
