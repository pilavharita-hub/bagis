import { useEffect, useRef, useState } from 'react';
import { CreditCard, ChefHat, Truck, Smile, ArrowRight, ShieldCheck, BarChart3 } from 'lucide-react';
import type { Page } from '../App';

interface HowItWorksProps {
  onNavigate: (page: Page) => void;
}

const steps = [
  {
    number: '01',
    icon: CreditCard,
    title: 'Bağış Yap',
    description: 'Dilediğin kadar porsiyon seç. Güvenli ödeme altyapısıyla dakikalar içinde tamamla.',
    tag: '30₺ / porsiyon',
  },
  {
    number: '02',
    icon: ChefHat,
    title: 'Yemek Hazırlanır',
    description: 'Sertifikalı mutfak ortaklarımız hijyen standartlarına uygun, besleyici yemekler hazırlar.',
    tag: '120+ mutfak ortağı',
  },
  {
    number: '03',
    icon: Truck,
    title: 'Dağıtım Yapılır',
    description: 'Gönüllü ekiplerimiz yemekleri şehirde en hızlı rotayla ihtiyaç sahiplerine ulaştırır.',
    tag: '500+ gönüllü',
  },
  {
    number: '04',
    icon: Smile,
    title: 'Etki Ölçülür',
    description: 'Her bağışın yarattığı etkiyi anlık olarak takip et. Şeffaf raporlamayı kaçırma.',
    tag: 'Anlık rapor',
  },
];

const guarantees = [
  { icon: ShieldCheck, title: 'Güvenli Ödeme', desc: '256-bit SSL şifreleme ile korunan ödeme altyapısı.' },
  { icon: BarChart3, title: 'Şeffaf Raporlama', desc: 'Her kuruşun nereye harcandığını görüntüle.' },
  { icon: ChefHat, title: 'Sertifikalı Mutfaklar', desc: 'Tüm ortaklar gıda güvenliği denetiminden geçirilir.' },
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

export default function HowItWorks({ onNavigate }: HowItWorksProps) {
  const { ref, visible } = useInView(0.1);

  return (
    <section ref={ref} className="py-28 bg-white relative overflow-hidden">
      {/* Right decorative blob */}
      <div className="absolute right-0 top-1/3 w-96 h-96 bg-brand-50 rounded-full blur-3xl opacity-60 translate-x-48" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-10">

        {/* Header */}
        <div className={`max-w-2xl mb-20 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="section-label text-warm-500 bg-warm-100 px-4 py-2 rounded-full mb-5">
            Süreç
          </div>
          <h2 className="heading-display text-warm-900 text-4xl md:text-5xl mb-5">
            4 Adımda
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-brand-700">
              Sofra Kuruyoruz
            </span>
          </h2>
          <p className="text-warm-500 text-lg leading-relaxed">
            Bağıştan tabağa geçen her adım titizlikle yönetilir.
            Sistem şeffaf, operasyon hızlı, etki gerçek.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24">
          {steps.map((step, i) => (
            <div
              key={step.number}
              className={`relative transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              {/* Connector */}
              {i < steps.length - 1 && (
                <div className="hidden lg:flex absolute top-8 left-full w-6 items-center justify-center z-10 -translate-x-3">
                  <ArrowRight size={14} className="text-warm-200" />
                </div>
              )}

              <div className="group h-full bg-warm-50 hover:bg-white border border-warm-100 hover:border-brand-100 hover:shadow-medium rounded-3xl p-7 transition-all duration-400 cursor-default">
                {/* Number + icon */}
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-brand-400 to-brand-700 rounded-2xl flex items-center justify-center shadow-md group-hover:shadow-glow-amber transition-all duration-300">
                    <step.icon size={20} className="text-white" />
                  </div>
                  <span className="text-4xl font-black text-warm-100 group-hover:text-warm-200 transition-colors leading-none tabular-nums">
                    {step.number}
                  </span>
                </div>

                <h3 className="font-bold text-warm-900 text-lg mb-2">{step.title}</h3>
                <p className="text-warm-500 text-sm leading-relaxed mb-5">{step.description}</p>

                <div className="inline-flex items-center gap-1.5 bg-brand-50 border border-brand-100 text-brand-600 text-xs font-semibold px-3 py-1.5 rounded-full">
                  <div className="w-1.5 h-1.5 bg-brand-500 rounded-full" />
                  {step.tag}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom two-column feature */}
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          {/* Image */}
          <div
            className={`relative rounded-3xl overflow-hidden h-96 transition-all duration-700 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}
            style={{ transitionDelay: '300ms' }}
          >
            <img
              src="https://images.pexels.com/photos/5765/pexels-photo-5765.jpeg"
              alt="Yemek dağıtımı"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-warm-950/70 via-transparent to-transparent" />

            {/* Floating badge */}
            <div className="absolute top-6 left-6 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-5 py-3.5 text-white">
              <div className="text-xs text-white/60 mb-0.5 font-medium">pilavustuask.com</div>
              <div className="font-bold text-sm">Resmi İşbirliği Ortağı</div>
            </div>

            {/* Bottom overlay */}
            <div className="absolute bottom-6 left-6 right-6">
              <blockquote className="bg-white/10 backdrop-blur-xl border border-white/15 rounded-2xl p-5">
                <p className="text-white text-sm font-medium leading-relaxed mb-3">
                  "Bu platform sayesinde Ankara'da 500'den fazla aileye sıcak yemek ulaştırdık."
                </p>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-brand-500 rounded-full" />
                  <span className="text-white/60 text-xs">Zeynep A. — Ankara Gönüllü Koordinatörü</span>
                </div>
              </blockquote>
            </div>
          </div>

          {/* Right: guarantees */}
          <div
            className={`transition-all duration-700 ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
            style={{ transitionDelay: '400ms' }}
          >
            <h3 className="heading-display text-warm-900 text-3xl md:text-4xl mb-3">
              Güvenle Bağış
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-brand-700">Yapabilirsin</span>
            </h3>
            <p className="text-warm-500 leading-relaxed mb-10">
              pilavustuask.com işbirliğiyle geliştirilen altyapımız,
              bağışından tabağa kadar tüm süreci denetim altında tutar.
            </p>

            <div className="space-y-5 mb-10">
              {guarantees.map((g) => (
                <div key={g.title} className="flex items-start gap-4 group">
                  <div className="w-11 h-11 bg-brand-50 border border-brand-100 group-hover:bg-brand-500 group-hover:border-brand-500 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300">
                    <g.icon size={18} className="text-brand-500 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <div className="font-semibold text-warm-800 mb-0.5">{g.title}</div>
                    <div className="text-warm-500 text-sm leading-relaxed">{g.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => onNavigate('donate')}
                className="flex items-center gap-2 bg-warm-900 hover:bg-warm-800 text-white font-semibold px-6 py-3.5 rounded-2xl transition-all duration-300 hover:scale-[1.02] text-sm"
              >
                Bağış Yap
                <ArrowRight size={16} />
              </button>
              <button
                onClick={() => onNavigate('about')}
                className="flex items-center gap-2 border border-warm-200 text-warm-600 hover:text-warm-900 hover:border-warm-400 font-semibold px-6 py-3.5 rounded-2xl transition-all duration-300 text-sm"
              >
                Daha Fazla Bilgi
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
