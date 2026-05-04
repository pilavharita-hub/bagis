import { useEffect, useState, useRef } from 'react';
import { Heart, Users, MapPin, Utensils, TrendingUp, Award, ArrowUpRight } from 'lucide-react';
import { supabase, StatsCounter } from '../lib/supabase';

function useCountUp(end: number, duration: number = 2400, started: boolean = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!started || end === 0) return;
    const startTime = Date.now();
    const frame = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }, [end, duration, started]);
  return count;
}

function useInView(threshold = 0.2) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function StatCard({ icon: Icon, value, label, sub, accent, delay }: {
  icon: typeof Heart;
  value: number;
  label: string;
  sub: string;
  accent: string;
  delay: number;
}) {
  const { ref, visible } = useInView(0.3);
  const count = useCountUp(value, 2400, visible);

  return (
    <div
      ref={ref}
      className={`group relative bg-white rounded-3xl p-8 border border-warm-100 shadow-soft hover:shadow-medium transition-all duration-700 overflow-hidden cursor-default ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
      style={{ transitionDelay: `${delay}ms`, transitionProperty: 'all' }}
    >
      {/* Accent glow */}
      <div className={`absolute -top-6 -right-6 w-28 h-28 rounded-full blur-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 ${accent}`} />

      {/* Top row */}
      <div className="flex items-start justify-between mb-6">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${accent} bg-opacity-10`}>
          <Icon size={22} className={`${accent.replace('bg-', 'text-')}`} />
        </div>
        <ArrowUpRight size={16} className="text-warm-300 group-hover:text-warm-500 transition-colors" />
      </div>

      {/* Value */}
      <div className="tabular-nums text-4xl font-black text-warm-900 leading-none mb-2">
        {count.toLocaleString('tr-TR')}
      </div>
      <div className="font-semibold text-warm-800 text-sm mb-1">{label}</div>
      <div className="text-warm-400 text-xs">{sub}</div>

      {/* Bottom progress bar */}
      <div className={`mt-5 h-1 rounded-full ${accent} bg-opacity-10 overflow-hidden`}>
        <div
          className={`h-full rounded-full ${accent} transition-all duration-1500`}
          style={{ width: visible ? '75%' : '0%', transitionDelay: `${delay + 400}ms` }}
        />
      </div>
    </div>
  );
}

export default function StatsSection() {
  const [stats, setStats] = useState<StatsCounter | null>(null);
  const { ref: sectionRef, visible: sectionVisible } = useInView(0.1);

  useEffect(() => {
    supabase
      .from('stats_counter')
      .select('*')
      .eq('id', 1)
      .maybeSingle()
      .then(({ data }) => { if (data) setStats(data); });
  }, []);

  const data = stats || {
    total_meals_donated: 12847,
    total_meals_distributed: 11293,
    total_donors: 3421,
    total_cities: 47,
  };

  return (
    <section ref={sectionRef} className="py-28 bg-warm-50 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.015]" style={{
        backgroundImage: 'radial-gradient(circle, #78716c 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }} />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10">

        {/* Section header */}
        <div className={`flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 transition-all duration-700 ${sectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div>
            <div className="section-label text-brand-600 bg-brand-100 px-4 py-2 rounded-full mb-4">
              <TrendingUp size={12} />
              Gerçek Zamanlı Etki
            </div>
            <h2 className="heading-display text-warm-900 text-4xl md:text-5xl">
              Sayılarla
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-brand-700">Dayanışma</span>
            </h2>
          </div>
          <p className="text-warm-500 max-w-xs text-sm leading-relaxed">
            Her rakam, bir hayatın dokunulduğunun, bir sofranın kurulduğunun kanıtı.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <StatCard icon={Utensils} value={data.total_meals_donated} label="Bağışlanan Yemek" sub="Toplam porsiyon sayısı" accent="bg-brand-500" delay={0} />
          <StatCard icon={Heart} value={data.total_meals_distributed} label="Dağıtılan Yemek" sub="İhtiyaç sahiplerine ulaşan" accent="bg-orange-500" delay={80} />
          <StatCard icon={Users} value={data.total_donors} label="Bağışçı" sub="Platforma katılan hayırsever" accent="bg-red-500" delay={160} />
          <StatCard icon={MapPin} value={data.total_cities} label="Şehir" sub="Aktif dağıtım noktası" accent="bg-rose-500" delay={240} />
        </div>

        {/* Award banner */}
        <div
          className={`relative overflow-hidden rounded-3xl transition-all duration-700 ${sectionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          style={{ transitionDelay: '400ms' }}
        >
          <div className="bg-warm-950 p-8 md:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(255,125,10,0.12)_0%,transparent_60%)]" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-brand-600/5 rounded-full blur-3xl translate-x-32 -translate-y-32" />
            <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-gradient-to-br from-brand-500/20 to-brand-600/30 border border-brand-500/30 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Award size={30} className="text-brand-400" />
                </div>
                <div>
                  <div className="text-xs text-warm-500 font-semibold tracking-widest uppercase mb-1">2024 Yılın Ödülü</div>
                  <div className="text-white font-bold text-xl mb-1">En İyi Sosyal Girişim</div>
                  <div className="text-warm-400 text-sm">Türkiye Sivil Toplum Kuruluşları Derneği</div>
                </div>
              </div>

              <div className="flex gap-8">
                <div className="text-center">
                  <div className="tabular-nums text-4xl font-black text-brand-400 leading-none">87%</div>
                  <div className="text-warm-500 text-xs mt-1">Bağışların yemeğe<br />gidiş oranı</div>
                </div>
                <div className="w-px bg-warm-800" />
                <div className="text-center">
                  <div className="tabular-nums text-4xl font-black text-white leading-none">4.8</div>
                  <div className="text-warm-500 text-xs mt-1">Ortalama<br />kullanıcı puanı</div>
                </div>
                <div className="w-px bg-warm-800" />
                <div className="text-center">
                  <div className="tabular-nums text-4xl font-black text-white leading-none">500+</div>
                  <div className="text-warm-500 text-xs mt-1">Aktif<br />gönüllü</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
