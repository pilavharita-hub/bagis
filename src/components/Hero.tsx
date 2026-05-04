import { useEffect, useRef, useState } from 'react';
import { ArrowDown, Heart, Users, MapPin, Play, ChevronRight } from 'lucide-react';
import type { Page } from '../App';

interface HeroProps {
  onNavigate: (page: Page) => void;
}

export default function Hero({ onNavigate }: HeroProps) {
  const [visible, setVisible] = useState(false);
  const [mealCount, setMealCount] = useState(12847);
  const tickerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    tickerRef.current = setInterval(() => {
      setMealCount((c) => c + Math.floor(Math.random() * 3));
    }, 4000);
    return () => {
      clearTimeout(t);
      if (tickerRef.current) clearInterval(tickerRef.current);
    };
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg"
          alt="Yemek dağıtımı"
          className="w-full h-full object-cover scale-105 transition-transform duration-[20s] ease-out"
          style={{ transform: visible ? 'scale(1)' : 'scale(1.08)' }}
        />
        {/* Multi-layer gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-warm-950/95 via-warm-900/80 to-warm-950/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-warm-950 via-transparent to-warm-950/30" />
        {/* Warm vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_50%,rgba(255,125,10,0.08)_0%,transparent_60%)]" />
      </div>

      {/* Decorative lines */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-brand-500/30 to-transparent ml-10 hidden lg:block" />
      <div className="absolute right-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent mr-10 hidden lg:block" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left column */}
          <div>
            {/* Partnership tag */}
            <div
              className={`inline-flex items-center gap-2.5 mb-8 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              style={{ transitionDelay: '100ms' }}
            >
              <div className="flex items-center gap-2 bg-white/8 backdrop-blur-md border border-white/15 text-white/80 text-xs font-medium px-4 py-2 rounded-full">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                <span>pilavustuask.com işbirliğiyle</span>
                <span className="w-px h-3 bg-white/20" />
                <span className="text-brand-300 font-semibold">Türkiye'nin #1 Dayanışma Platformu</span>
              </div>
            </div>

            {/* Heading */}
            <div
              className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
              style={{ transitionDelay: '200ms' }}
            >
              <h1 className="heading-display text-white mb-2">
                <span className="block text-5xl md:text-6xl lg:text-7xl">Bir Tabak</span>
                <span className="block text-5xl md:text-6xl lg:text-7xl mt-1">
                  <em className="not-italic text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-brand-400 to-orange-400">
                    Umut
                  </em>{' '}
                  <span className="text-white">Bırak</span>
                </span>
              </h1>
            </div>

            {/* Divider with year */}
            <div
              className={`flex items-center gap-4 my-7 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              style={{ transitionDelay: '300ms' }}
            >
              <div className="h-px flex-1 bg-gradient-to-r from-brand-500/50 to-transparent" />
              <span className="text-brand-400 text-xs font-bold tracking-[0.2em] uppercase">2019'dan beri</span>
              <div className="h-px w-8 bg-white/10" />
            </div>

            {/* Description */}
            <p
              className={`text-white/65 text-lg leading-relaxed max-w-lg mb-10 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              style={{ transitionDelay: '350ms' }}
            >
              Anadolu'nun köklü "askıda ekmek" geleneğini dijital çağa taşıdık.
              Bir öğün bağışla, bir sofrayı aydınlat. <strong className="text-white/90 font-semibold">47 şehirde</strong> aktifiz.
            </p>

            {/* CTA Buttons */}
            <div
              className={`flex flex-wrap gap-4 mb-14 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              style={{ transitionDelay: '450ms' }}
            >
              <button
                onClick={() => onNavigate('donate')}
                className="group flex items-center gap-3 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-white font-bold px-8 py-4 rounded-2xl shadow-glow-amber hover:shadow-glow-orange transition-all duration-300 hover:scale-[1.03] active:scale-[0.98] text-base"
              >
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Heart size={16} className="fill-white" />
                </div>
                <div className="text-left">
                  <div>Yemek Bağışla</div>
                  <div className="text-xs font-normal text-white/70">30₺ / porsiyon</div>
                </div>
                <ChevronRight size={18} className="ml-1 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => onNavigate('request')}
                className="group flex items-center gap-3 bg-white/8 backdrop-blur-sm border border-white/20 hover:bg-white/15 text-white font-semibold px-7 py-4 rounded-2xl transition-all duration-300 hover:scale-[1.03] text-base"
              >
                <Users size={18} className="text-white/70 group-hover:text-white transition-colors" />
                Yemek Talep Et
              </button>

              <button
                onClick={() => onNavigate('about')}
                className="group flex items-center gap-2 text-white/50 hover:text-white/80 font-medium text-sm transition-colors"
              >
                <div className="w-8 h-8 border border-white/20 rounded-full flex items-center justify-center group-hover:border-white/40 transition-colors">
                  <Play size={12} className="fill-white/60 ml-0.5" />
                </div>
                Hikayemizi İzle
              </button>
            </div>

            {/* Trust badges */}
            <div
              className={`flex items-center gap-6 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              style={{ transitionDelay: '550ms' }}
            >
              {[
                { label: 'Şeffaf', sub: 'Mali raporlama' },
                { label: 'Güvenli', sub: 'SSL korumalı' },
                { label: 'Hızlı', sub: '24-48 saat' },
              ].map((badge) => (
                <div key={badge.label} className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-brand-500/30 flex items-center justify-center">
                    <span className="text-brand-300 text-[10px] font-bold">✓</span>
                  </div>
                  <div>
                    <div className="text-white/80 text-xs font-semibold">{badge.label}</div>
                    <div className="text-white/35 text-[10px]">{badge.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right column: floating stats card */}
          <div
            className={`hidden lg:flex flex-col gap-4 transition-all duration-1000 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}
            style={{ transitionDelay: '500ms' }}
          >
            {/* Main stat card */}
            <div className="glass-card p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 to-transparent" />
              <div className="relative">
                <div className="text-white/50 text-xs font-bold tracking-widest uppercase mb-3">Canlı Sayaç</div>
                <div className="tabular-nums text-6xl font-black text-white mb-1 tracking-tight">
                  {mealCount.toLocaleString('tr-TR')}
                </div>
                <div className="text-brand-300 font-semibold text-lg mb-4">bağışlanan yemek</div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(100, (mealCount / 15000) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-white/35 mt-2">
                  <span>Aylık hedef</span>
                  <span>{Math.round((mealCount / 15000) * 100)}% tamamlandı</span>
                </div>
              </div>
            </div>

            {/* Mini stats row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: Users, value: '3.421', label: 'Bağışçı', color: 'text-brand-300' },
                { icon: MapPin, value: '47', label: 'Şehir', color: 'text-orange-300' },
                { icon: Heart, value: '87%', label: 'Verimlilik', color: 'text-red-300' },
              ].map((s) => (
                <div key={s.label} className="glass-card p-4 text-center">
                  <s.icon size={18} className={`${s.color} mx-auto mb-2`} />
                  <div className="text-white font-bold text-lg leading-none mb-0.5">{s.value}</div>
                  <div className="text-white/40 text-[11px]">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Latest donation ticker */}
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-white/50 text-xs font-semibold uppercase tracking-wider">Son Bağış</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-700 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">A</span>
                  </div>
                  <div>
                    <div className="text-white font-semibold text-sm">Ayşe K.</div>
                    <div className="text-white/40 text-xs">4 dakika önce</div>
                  </div>
                </div>
                <div className="bg-brand-500/20 border border-brand-400/30 text-brand-300 text-xs font-bold px-3 py-1.5 rounded-xl">
                  +5 porsiyon
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30 animate-bounce">
        <span className="text-[10px] tracking-widest uppercase font-medium">Keşfet</span>
        <ArrowDown size={18} />
      </div>
    </section>
  );
}
