import { useEffect, useRef, useState } from 'react';
import { Heart, Target, Globe, Users, ChefHat, Truck, Phone, ExternalLink, Award, TrendingUp, ArrowRight, Quote, Shield, BadgeCheck, Eye, Mail, MapPin, CheckCircle } from 'lucide-react';
import type { Page } from '../App';

interface AboutPageProps {
  onNavigate: (page: Page) => void;
}

function useInView(threshold = 0.12) {
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

const VALUES = [
  { icon: Heart, title: 'Dayanışma', desc: 'Toplumsal dayanışma geleneğimizi yaşatıyor, paylaşmanın gücüne inanıyoruz.', color: 'from-red-600 to-red-800' },
  { icon: Target, title: 'Şeffaflık', desc: 'Tüm mali hareketlerimizi kamuoyuyla paylaşır, hesap verebilir bir yapı sürdürürüz.', color: 'from-amber-600 to-orange-700' },
  { icon: Globe, title: 'Erişilebilirlik', desc: "Türkiye'nin her şehrinde, her ihtiyaç sahibine ulaşmayı hedefliyoruz.", color: 'from-sky-600 to-blue-700' },
  { icon: Users, title: 'Topluluk', desc: 'Gönüllüler, bağışçılar ve ihtiyaç sahipleri birlikte güçlü bir topluluk oluşturur.', color: 'from-emerald-600 to-green-700' },
];

const TEAM = [
  { name: 'Zeynep Aydın', role: 'Kurucu & Genel Direktör', img: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { name: 'Murat Kaya', role: 'Operasyon Direktörü', img: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { name: 'Elif Demir', role: 'Gönüllü Koordinatörü', img: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { name: 'Can Yılmaz', role: 'Teknoloji Direktörü', img: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=400' },
];

const MILESTONES = [
  { year: '2019', event: "İstanbul'da 3 gönüllüyle kurulduk.", icon: Heart },
  { year: '2020', event: 'Pandemi sürecinde 50.000 aileye ulaştık.', icon: Users },
  { year: '2021', event: '10 şehire büyüdük, 200+ gönüllüye ulaştık.', icon: TrendingUp },
  { year: '2022', event: 'pilavustuask.com ile resmi işbirliği başladı.', icon: Award },
  { year: '2023', event: '30 şehir, 2.000+ bağışçı, 500+ gönüllü.', icon: Globe },
  { year: '2024', event: '47 şehir. 12.000+ yemek bağışı. Büyüyoruz.', icon: CheckCircle },
];

const TRUST_PILLARS = [
  { icon: Shield, label: 'Resmi Kayıtlı', sub: 'Sosyal proje tescili mevcut' },
  { icon: Eye, label: 'Şeffaf Finans', sub: 'Açık mali raporlama' },
  { icon: BadgeCheck, label: 'Onaylı Kimlikler', sub: 'Tüm üyeler doğrulanmış' },
  { icon: Mail, label: 'Ulaşılabilir Ekip', sub: 'Gerçek kişiler, gerçek iletişim' },
];

export default function AboutPage({ onNavigate }: AboutPageProps) {
  const [heroVisible, setHeroVisible] = useState(false);
  const { ref: missionRef, visible: missionVisible } = useInView();
  const { ref: valuesRef, visible: valuesVisible } = useInView();
  const { ref: timelineRef, visible: timelineVisible } = useInView();
  const { ref: teamRef, visible: teamVisible } = useInView();
  const { ref: trustRef, visible: trustVisible } = useInView();

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-ink-950">

      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="relative min-h-[72vh] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.pexels.com/photos/6995249/pexels-photo-6995249.jpeg?auto=compress&cs=tinysrgb&w=1400"
            alt="Dayanışma"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(10,10,10,0.5) 0%, rgba(10,10,10,0.45) 40%, rgba(10,10,10,1) 100%)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(10,10,10,0.7) 0%, transparent 65%)' }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-5 pb-20 pt-36 w-full">
          <div className={`transition-all duration-1000 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="section-tag mb-5">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
              Hakkımızda
            </div>
            <h1 className="heading-display text-white text-[clamp(3.5rem,8vw,7rem)] leading-[0.88] mb-6">
              TÜRKİYE'NİN<br />
              <span className="text-red-500">DAYANIŞMA</span><br />
              SOFRASI
            </h1>
            <p className="text-ink-400 text-lg max-w-lg leading-relaxed mb-8">
              2019'dan bu yana 47 şehirde, 12.000+ yemekle binlerce insanın yanında oluyoruz.
            </p>
            <a
              href="https://pilavustuask.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-red-400 hover:text-red-300 text-sm font-semibold transition-colors"
            >
              pilavustuask.com resmi ortağımız
              <ExternalLink size={13} />
            </a>
          </div>
        </div>
      </section>

      {/* ── Stats strip ─────────────────────────────────────────── */}
      <div className="border-y border-ink-800/60 bg-ink-900/40">
        <div className="max-w-6xl mx-auto px-5">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-ink-800/40">
            {[
              { value: '2019', label: 'Kuruluş Yılı' },
              { value: '47', label: 'Şehir' },
              { value: '500+', label: 'Gönüllü' },
              { value: '12K+', label: 'Yemek Bağışı' },
            ].map((stat) => (
              <div key={stat.label} className="px-8 py-8 text-center">
                <div className="heading-display text-[2.5rem] text-white mb-1">{stat.value}</div>
                <div className="text-ink-600 text-[10px] uppercase tracking-[0.2em] font-bold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Mission ─────────────────────────────────────────────── */}
      <section ref={missionRef} className="py-28">
        <div className="max-w-6xl mx-auto px-5">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className={`transition-all duration-700 ${missionVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
              <div className="section-tag mb-5">
                <TrendingUp size={10} />
                Misyonumuz
              </div>
              <h2 className="heading-display text-white text-[clamp(2.8rem,5vw,4.5rem)] leading-[0.9] mb-8">
                BİR GELENEK,<br />
                <span className="text-red-500">DİJİTAL ÇAĞDA</span>
              </h2>
              <p className="text-ink-400 text-lg leading-relaxed mb-5">
                Anadolu'nun köklü "askıda ekmek" geleneğinden ilham alarak, gücü olanın
                ihtiyacı olanla buluştuğu bir platform inşa ettik.
              </p>
              <p className="text-ink-500 leading-relaxed mb-10">
                Yalnızca açlıkla değil, yalnızlıkla da savaşıyoruz. Sıcak bir yemek,
                bazen bir insanın gününü — hatta hayatını — değiştirebilir.
              </p>

              <div className="bg-ink-900 border border-ink-800 rounded-2xl p-5 flex items-start gap-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(225,29,72,0.4), transparent)' }} />
                <div className="w-10 h-10 bg-red-500/10 border border-red-500/25 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Award size={18} className="text-red-500" />
                </div>
                <div>
                  <div className="text-white font-semibold text-sm mb-1">pilavustuask.com Resmi Ortağı</div>
                  <p className="text-ink-500 text-xs leading-relaxed">
                    Türkiye'nin lider gıda dayanışma ağı ile resmi işbirliği yaparak dağıtım kapasitemizi iki katına çıkardık.
                  </p>
                  <a
                    href="https://pilavustuask.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-red-500 hover:text-red-400 text-xs font-semibold mt-2.5 transition-colors"
                  >
                    pilavustuask.com <ExternalLink size={10} />
                  </a>
                </div>
              </div>
            </div>

            <div
              className={`relative transition-all duration-700 ${missionVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
              style={{ transitionDelay: '150ms' }}
            >
              <div className="relative rounded-2xl overflow-hidden h-[500px]">
                <img
                  src="https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Gönüllüler"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(10,10,10,0.85) 0%, transparent 50%)' }} />
                <div className="absolute bottom-5 left-5 right-5">
                  <div className="bg-ink-950/80 backdrop-blur-xl border border-ink-700/50 rounded-xl p-5">
                    <Quote size={15} className="text-red-500 mb-2" />
                    <p className="text-white text-sm font-medium leading-relaxed">
                      "Bu platform sayesinde Ankara'da 500'den fazla aileye ulaştık."
                    </p>
                    <div className="flex items-center gap-2 mt-3">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
                        <span className="text-white text-xs font-black">Z</span>
                      </div>
                      <span className="text-ink-500 text-xs">Zeynep A. — Ankara Gönüllü Koordinatörü</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ──────────────────────────────────────────────── */}
      <section ref={valuesRef} className="py-24 border-t border-ink-800/50">
        <div className="max-w-6xl mx-auto px-5">
          <div className={`text-center mb-16 transition-all duration-700 ${valuesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="section-tag mb-4 justify-center">Değerlerimiz</div>
            <h2 className="heading-display text-white text-[clamp(2.5rem,5vw,4rem)]">NEYE İNANIYORUZ</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map((v, i) => (
              <div
                key={v.title}
                className={`group card-dark-hover p-7 transition-all duration-500 ${valuesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${v.color} rounded-2xl flex items-center justify-center mb-5 shadow-md`}>
                  <v.icon size={22} className="text-white" />
                </div>
                <h3 className="font-bold text-white text-base mb-2">{v.title}</h3>
                <p className="text-ink-500 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust pillars ───────────────────────────────────────── */}
      <section ref={trustRef} className="py-24 border-t border-ink-800/50">
        <div className="max-w-6xl mx-auto px-5">
          <div className={`text-center mb-14 transition-all duration-700 ${trustVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="section-tag mb-4 justify-center">Güvenilirlik</div>
            <h2 className="heading-display text-white text-[clamp(2.5rem,5vw,4rem)]">NEDEN GÜVENİLİRİZ</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            {TRUST_PILLARS.map(({ icon: Icon, label, sub }, i) => (
              <div
                key={label}
                className={`card-accent p-6 transition-all duration-500 ${trustVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
                style={{ transitionDelay: `${i * 70}ms` }}
              >
                <div className="w-10 h-10 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center mb-4">
                  <Icon size={18} className="text-red-500" />
                </div>
                <div className="text-white font-bold text-sm mb-1">{label}</div>
                <div className="text-ink-600 text-xs leading-relaxed">{sub}</div>
              </div>
            ))}
          </div>

          {/* Identity band */}
          <div className="bg-ink-900 border border-ink-800 rounded-2xl p-6 grid md:grid-cols-3 gap-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(225,29,72,0.4), transparent)' }} />
            <div>
              <div className="text-[9px] text-ink-600 font-black uppercase tracking-[0.25em] mb-2">Kuruluş</div>
              <div className="text-white font-semibold text-sm">Askıda Pilav / Pilav Üstü Aşk</div>
              <div className="text-ink-500 text-xs mt-1">Ankara merkezli sosyal yardım projesi</div>
            </div>
            <div>
              <div className="text-[9px] text-ink-600 font-black uppercase tracking-[0.25em] mb-2 flex items-center gap-1.5"><MapPin size={9} />Fiziksel Adres</div>
              <div className="text-white font-semibold text-sm">Bahçelievler Mah. Azerbaycan Cad. 59/A</div>
              <div className="text-ink-500 text-xs mt-1">Çankaya / Ankara</div>
            </div>
            <div>
              <div className="text-[9px] text-ink-600 font-black uppercase tracking-[0.25em] mb-2">İletişim</div>
              <a href="mailto:ankara@pilavustuask.com" className="text-red-400 hover:text-red-300 text-sm font-semibold transition-colors block">ankara@pilavustuask.com</a>
              <a href="tel:+905102225696" className="text-ink-400 hover:text-white text-xs mt-1 transition-colors block">0510 222 56 96</a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Timeline ────────────────────────────────────────────── */}
      <section ref={timelineRef} className="py-24 border-t border-ink-800/50">
        <div className="max-w-3xl mx-auto px-5">
          <div className={`text-center mb-16 transition-all duration-700 ${timelineVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="section-tag mb-4 justify-center">Tarihimiz</div>
            <h2 className="heading-display text-white text-[clamp(2.5rem,5vw,4rem)]">NASIL BÜYÜDÜK</h2>
          </div>

          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-px" style={{ background: 'linear-gradient(180deg, rgba(225,29,72,0.5), rgba(46,46,46,0.3), transparent)' }} />
            <div className="space-y-5">
              {MILESTONES.map((m, i) => (
                <div
                  key={m.year}
                  className={`flex gap-8 items-start group transition-all duration-700 ${timelineVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'}`}
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
                  <div className="relative flex-shrink-0">
                    <div className="w-16 h-16 bg-ink-900 border-2 border-ink-800 group-hover:border-red-600 rounded-2xl flex items-center justify-center transition-colors duration-300">
                      <span className="text-red-500 font-black text-[11px] mono">{m.year}</span>
                    </div>
                  </div>
                  <div className="flex-1 bg-ink-900/50 group-hover:bg-ink-900 border border-ink-800/60 group-hover:border-ink-700 rounded-2xl p-5 transition-all duration-300">
                    <div className="flex items-center gap-2.5">
                      <m.icon size={13} className="text-red-600 flex-shrink-0" />
                      <p className="text-ink-300 text-sm leading-relaxed">{m.event}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Operations ──────────────────────────────────────────── */}
      <section className="py-24 border-t border-ink-800/50">
        <div className="max-w-6xl mx-auto px-5">
          <div className="text-center mb-16">
            <div className="section-tag mb-4 justify-center">Operasyon</div>
            <h2 className="heading-display text-white text-[clamp(2.5rem,5vw,4rem)]">NASIL ÇALIŞIYORUZ</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: ChefHat, title: 'Mutfak Ortaklıkları', desc: 'Türkiye genelinde 120+ sertifikalı mutfak ortağı ile çalışıyoruz. Tüm yemekler hijyen standartlarına uygun hazırlanıyor.', stat: '120+', statLabel: 'Mutfak' },
              { icon: Truck, title: 'Dağıtım Ağı', desc: "500'den fazla gönüllü, her gün çeşitli mahallelerde yemek dağıtımı yapıyor. Soğuk zincir kurallarına uyuyoruz.", stat: '500+', statLabel: 'Gönüllü' },
              { icon: Phone, title: 'Destek Hattı', desc: 'Yardıma ihtiyaç duyanlar için 7/24 destek hattımız mevcut. Sosyal hizmetler uzmanlarımız hazır bekliyor.', stat: '7/24', statLabel: 'Destek' },
            ].map((item) => (
              <div key={item.title} className="card-accent p-8 group hover:border-ink-700 transition-all duration-300">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center">
                    <item.icon size={22} className="text-red-500" />
                  </div>
                  <div className="text-right">
                    <div className="heading-display text-3xl text-white">{item.stat}</div>
                    <div className="text-ink-600 text-[10px] uppercase tracking-wider">{item.statLabel}</div>
                  </div>
                </div>
                <h3 className="font-bold text-white text-base mb-3">{item.title}</h3>
                <p className="text-ink-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ────────────────────────────────────────────────── */}
      <section ref={teamRef} className="py-24 border-t border-ink-800/50">
        <div className="max-w-6xl mx-auto px-5">
          <div className={`text-center mb-16 transition-all duration-700 ${teamVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="section-tag mb-4 justify-center">Ekip</div>
            <h2 className="heading-display text-white text-[clamp(2.5rem,5vw,4rem)]">ARKAMIZDAKİ İNSANLAR</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {TEAM.map((member, i) => (
              <div
                key={member.name}
                className={`group text-center transition-all duration-700 ${teamVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="relative w-24 h-24 mx-auto mb-4 rounded-2xl overflow-hidden ring-2 ring-ink-800 group-hover:ring-red-600 transition-all duration-300 group-hover:-translate-y-1.5">
                  <img src={member.img} alt={member.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h4 className="font-bold text-white text-sm">{member.name}</h4>
                <p className="text-ink-600 text-xs mt-0.5">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────────── */}
      <section className="border-t border-ink-800/50 py-20">
        <div className="max-w-6xl mx-auto px-5">
          <div className="relative bg-ink-900 border border-ink-800 rounded-2xl p-10 md:p-14 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(225,29,72,0.45), transparent)' }} />
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 50% 80% at 0% 50%, rgba(225,29,72,0.04), transparent)' }} />
            <div className="relative">
              <div className="section-tag mb-4">Harekete Geç</div>
              <h2 className="heading-display text-white text-[clamp(2.2rem,5vw,3.5rem)] leading-[0.9] mb-4">
                DAYANIŞMANİN<br />PARÇASI OL
              </h2>
              <p className="text-ink-400 max-w-md text-sm leading-relaxed">
                Bağış yaparak, gönüllü olarak ya da destek talebiyle — her şekilde bu hareketin bir parçası olabilirsin.
              </p>
            </div>
            <div className="relative flex flex-wrap gap-3 flex-shrink-0">
              <button
                onClick={() => onNavigate('donate')}
                className="btn-red px-7 py-3.5 text-sm font-black heading-display tracking-wider"
              >
                <Heart size={14} className="fill-white" />
                PİLAV ISMARLA
              </button>
              <button
                onClick={() => onNavigate('request')}
                className="btn-outline px-7 py-3.5 text-sm font-semibold group"
              >
                Yardım İste
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
