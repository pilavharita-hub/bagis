import { useEffect, useState, useRef } from 'react';
import { Heart, Clock, Zap, TrendingUp } from 'lucide-react';
import { supabase, Donation } from '../lib/supabase';

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Az önce';
  if (mins < 60) return `${mins}dk önce`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}s önce`;
  return `${Math.floor(hours / 24)}g önce`;
}

const fallbackDonations = [
  { id: '1', donor_name: 'Ayşe K.', meal_count: 5, message: 'Herkese bol afiyet...', created_at: new Date(Date.now() - 4 * 60000).toISOString(), status: 'confirmed', donor_email: '', amount: 150 },
  { id: '2', donor_name: 'Mehmet Y.', meal_count: 10, message: 'Güzel bir proje!', created_at: new Date(Date.now() - 22 * 60000).toISOString(), status: 'confirmed', donor_email: '', amount: 300 },
  { id: '3', donor_name: 'Fatma S.', meal_count: 3, message: 'Hayırlı olsun', created_at: new Date(Date.now() - 65 * 60000).toISOString(), status: 'confirmed', donor_email: '', amount: 90 },
  { id: '4', donor_name: 'Ali R.', meal_count: 20, message: 'Ailem adına bağış', created_at: new Date(Date.now() - 2 * 3600000).toISOString(), status: 'confirmed', donor_email: '', amount: 600 },
  { id: '5', donor_name: 'Zeynep T.', meal_count: 7, message: 'Hayırlı olsun', created_at: new Date(Date.now() - 5 * 3600000).toISOString(), status: 'confirmed', donor_email: '', amount: 210 },
  { id: '6', donor_name: 'Can M.', meal_count: 15, message: '', created_at: new Date(Date.now() - 7 * 3600000).toISOString(), status: 'confirmed', donor_email: '', amount: 450 },
];

const avatarColors = [
  'from-brand-400 to-brand-700',
  'from-orange-400 to-orange-700',
  'from-red-400 to-red-700',
  'from-rose-400 to-rose-700',
  'from-amber-400 to-amber-700',
  'from-yellow-400 to-orange-500',
];

function useInView(threshold = 0.15) {
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

export default function RecentDonations() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const { ref, visible } = useInView(0.1);

  useEffect(() => {
    supabase
      .from('donations')
      .select('*')
      .in('status', ['confirmed', 'distributed'])
      .order('created_at', { ascending: false })
      .limit(6)
      .then(({ data }) => {
        if (data && data.length > 0) setDonations(data);
        else setDonations(fallbackDonations as Donation[]);
      });
  }, []);

  const displayDonations = donations.length > 0 ? donations : fallbackDonations as Donation[];

  return (
    <section ref={ref} className="py-28 bg-warm-950 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-900/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-brand-800/15 rounded-full blur-3xl" />

      {/* Ticker at top */}
      <div className="border-y border-warm-800 overflow-hidden mb-20 py-3">
        <div className="flex animate-ticker whitespace-nowrap">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-8 pr-8">
              {[
                '12.847 yemek bağışlandı',
                '47 şehirde aktif',
                '3.421 hayırsever',
                '500+ gönüllü',
                'pilavustuask.com işbirliğiyle',
                '2024 yılının en iyi sosyal girişimi',
                '87% verimlilik oranı',
              ].map((text) => (
                <span key={text} className="flex items-center gap-3 text-warm-500 text-xs font-medium tracking-wider uppercase">
                  <span className="w-1 h-1 bg-brand-500 rounded-full flex-shrink-0" />
                  {text}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10">
        <div className="grid lg:grid-cols-5 gap-12">

          {/* Left 3 cols: donations feed */}
          <div className="lg:col-span-3">
            <div className={`flex items-end justify-between mb-10 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div>
                <div className="section-label text-warm-500 bg-warm-900 px-4 py-2 rounded-full mb-4">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  Canlı Bağış Akışı
                </div>
                <h2 className="heading-display text-white text-3xl md:text-4xl">
                  Son Bağışlar
                </h2>
              </div>
              <button className="text-warm-500 hover:text-brand-400 text-xs font-semibold transition-colors flex items-center gap-1">
                <Zap size={12} />
                Canlı
              </button>
            </div>

            <div className="space-y-3">
              {displayDonations.map((donation, i) => (
                <div
                  key={donation.id}
                  className={`group flex items-center gap-4 bg-warm-900/60 hover:bg-warm-900 border border-warm-800 hover:border-brand-800 rounded-2xl p-4 transition-all duration-400 cursor-default ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                  style={{ transitionDelay: `${100 + i * 60}ms` }}
                >
                  {/* Avatar */}
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${avatarColors[i % avatarColors.length]} flex items-center justify-center flex-shrink-0 text-white font-bold text-sm shadow-md`}>
                    {donation.donor_name.charAt(0)}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-semibold text-white text-sm">{donation.donor_name}</span>
                      {i === 0 && (
                        <span className="bg-green-500/20 text-green-400 text-[10px] font-bold px-2 py-0.5 rounded-full">YENİ</span>
                      )}
                    </div>
                    {donation.message ? (
                      <p className="text-warm-500 text-xs truncate">"{donation.message}"</p>
                    ) : (
                      <p className="text-warm-600 text-xs italic">Mesajsız bağış</p>
                    )}
                  </div>

                  {/* Meal count + time */}
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <div className="flex items-center gap-1.5 bg-brand-500/15 border border-brand-500/25 text-brand-400 text-xs font-bold px-3 py-1.5 rounded-xl">
                      <Heart size={10} className="fill-brand-400" />
                      {donation.meal_count} porsiyon
                    </div>
                    <div className="flex items-center gap-1 text-warm-600 text-[10px]">
                      <Clock size={9} />
                      {timeAgo(donation.created_at)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right 2 cols: pricing + impact */}
          <div className="lg:col-span-2 flex flex-col gap-5">
            <div
              className={`transition-all duration-700 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
              style={{ transitionDelay: '200ms' }}
            >
              <div className="section-label text-warm-500 bg-warm-900 px-4 py-2 rounded-full mb-4">
                <TrendingUp size={12} />
                Bağış Rehberi
              </div>
              <h3 className="heading-display text-white text-2xl mb-2">
                Ne Kadar Bağışlasam?
              </h3>
              <p className="text-warm-500 text-sm leading-relaxed mb-6">
                Her miktar değerli. Tek bir tabak bile bir gün boyunca birinin hayatını değiştirir.
              </p>
            </div>

            {/* Pricing cards */}
            {[
              { amount: 30, label: '1 Kişi', desc: 'Bir bireyi doyurur', popular: false },
              { amount: 150, label: '5 Kişi', desc: 'Küçük bir aile', popular: true },
              { amount: 600, label: '20 Kişi', desc: 'Bir mahalle sofrasına katkı', popular: false },
              { amount: 1500, label: '50 Kişi', desc: 'Tam bir mahalle sofrası', popular: false },
            ].map((tier, i) => (
              <div
                key={tier.amount}
                className={`group relative rounded-2xl p-5 border cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                  tier.popular
                    ? 'bg-brand-500/10 border-brand-500/40 hover:bg-brand-500/15'
                    : 'bg-warm-900/60 border-warm-800 hover:border-warm-700 hover:bg-warm-900'
                } ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ transitionDelay: `${300 + i * 60}ms` }}
              >
                {tier.popular && (
                  <span className="absolute -top-2.5 left-4 bg-brand-500 text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-wider uppercase">
                    En Popüler
                  </span>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <div className={`text-xl font-black tabular-nums leading-none mb-1 ${tier.popular ? 'text-brand-300' : 'text-white'}`}>
                      {tier.amount.toLocaleString('tr-TR')}₺
                    </div>
                    <div className="text-warm-400 text-xs">{tier.label} — {tier.desc}</div>
                  </div>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                    tier.popular ? 'bg-brand-500/20 group-hover:bg-brand-500' : 'bg-warm-800 group-hover:bg-warm-700'
                  }`}>
                    <Heart size={14} className={`${tier.popular ? 'text-brand-400 group-hover:text-white fill-brand-400 group-hover:fill-white' : 'text-warm-500 group-hover:text-warm-300'} transition-colors`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
