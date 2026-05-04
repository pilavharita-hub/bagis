import { useState } from 'react';
import { Utensils, CheckCircle, AlertCircle, Shield, Users, MapPin, Lock, Heart, Phone, Mail, ArrowRight, Eye } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Page } from '../App';

interface RequestPageProps {
  onNavigate: (page: Page) => void;
}

const CITIES = [
  'Adana', 'Adıyaman', 'Ankara', 'Antalya', 'Bursa', 'Diyarbakır', 'Elazığ', 'Erzurum',
  'Eskişehir', 'Gaziantep', 'Hatay', 'İstanbul', 'İzmir', 'Kayseri', 'Kocaeli', 'Konya',
  'Malatya', 'Mardin', 'Mersin', 'Muş', 'Samsun', 'Şanlıurfa', 'Trabzon', 'Van', 'Diğer',
];

const TRUST_ITEMS = [
  { icon: Lock, text: 'Veriler şifreli saklanır' },
  { icon: Eye, text: 'Kimseyle paylaşılmaz' },
  { icon: Shield, text: 'Yargısız yardım' },
];

export default function RequestPage({ onNavigate }: RequestPageProps) {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [mealCount, setMealCount] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !city) { setError('Lütfen adınızı ve şehrinizi belirtin.'); return; }
    setError('');
    setLoading(true);
    const { error: dbError } = await supabase.from('meal_requests').insert({
      requester_name: name.trim(),
      city,
      meal_count: mealCount,
      status: 'pending',
    });
    setLoading(false);
    if (dbError) setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    else setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-ink-950 flex items-center justify-center px-5 pt-24">
        <div className="max-w-md w-full">
          <div className="relative bg-ink-900 border border-ink-800 rounded-2xl p-10 text-center overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(34,197,94,0.5), transparent)' }} />
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(34,197,94,0.05), transparent)' }} />
            <div className="relative">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-lg">
                  <CheckCircle size={36} className="text-white" />
                </div>
                <div className="absolute inset-0 rounded-full border-2 border-green-500/30 animate-ping" />
              </div>
              <div className="section-tag mb-3 justify-center text-green-500">Talep Alındı</div>
              <h2 className="heading-display text-white text-4xl mb-3">YANINIZDAYİZ</h2>
              <p className="text-ink-400 mb-8 leading-relaxed text-sm">
                Talebiniz ekibimize iletildi. <span className="text-white font-semibold">24-48 saat</span> içinde
                sizi arayarak detayları konuşacağız.
              </p>

              <div className="bg-ink-950/60 border border-ink-800/60 rounded-xl p-5 mb-8 text-left space-y-3">
                {[
                  { label: 'İsim', value: name },
                  { label: 'Şehir', value: city },
                  { label: 'Kişi Sayısı', value: `${mealCount} kişi` },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-ink-600">{label}</span>
                    <span className="font-semibold text-white">{value}</span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => onNavigate('home')}
                  className="btn-red w-full py-3.5 text-sm font-black heading-display tracking-wider"
                >
                  <Heart size={14} className="fill-white" />
                  ANA SAYFAYA DÖN
                </button>
                <a href="mailto:ankara@pilavustuask.com" className="text-ink-500 hover:text-red-400 text-xs transition-colors">
                  Sorularınız için: ankara@pilavustuask.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-950 pt-24">

      {/* ── Sticky header ───────────────────────────────────────── */}
      <div className="sticky top-[88px] z-20 bg-ink-950/95 backdrop-blur-xl border-b border-ink-800/50">
        <div className="max-w-2xl mx-auto px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-center">
              <Utensils size={13} className="text-red-500" />
            </div>
            <span className="text-white font-semibold text-sm">Yemek Talebi</span>
          </div>
          <div className="flex items-center gap-1.5 bg-green-500/8 border border-green-500/20 rounded-lg px-2.5 py-1">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full live-dot-sm" />
            <span className="text-green-400 text-[10px] font-bold">Aktif</span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-12">

        {/* ── Page header ─────────────────────────────────────────── */}
        <div className="mb-10">
          <div className="section-tag mb-5">
            <div className="w-1.5 h-1.5 bg-red-500 rounded-full" />
            Ücretsiz & Gizli
          </div>
          <h1 className="heading-display text-white text-[clamp(3rem,8vw,5rem)] leading-[0.88] mb-5">
            SICAK BİR<br />
            <span className="text-red-500">YEMEK</span><br />
            HAKKINIZDIR
          </h1>
          <p className="text-ink-400 text-base leading-relaxed max-w-md">
            Talep etmekten çekinmeyin. Bu dayanışma sizin için var.
            Yardım istemek güçtür — biz bunu biliyoruz.
          </p>
        </div>

        {/* ── Privacy banner ──────────────────────────────────────── */}
        <div className="relative bg-ink-900 border border-ink-800 rounded-2xl p-5 mb-8 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(225,29,72,0.35), transparent)' }} />
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Lock size={16} className="text-red-500" />
            </div>
            <div className="flex-1">
              <div className="text-white font-semibold text-sm mb-2">Gizliliğiniz Tamamen Korunur</div>
              <p className="text-ink-500 text-xs leading-relaxed mb-3">
                Verileriniz yalnızca yemek ulaştırma amacıyla kullanılır.
                Sadece ad ve şehir bilginiz yeterli.
              </p>
              <div className="flex flex-wrap gap-4">
                {TRUST_ITEMS.map(({ icon: Icon, text }) => (
                  <div key={text} className="flex items-center gap-1.5">
                    <Icon size={10} className="text-green-500 flex-shrink-0" />
                    <span className="text-ink-500 text-[10px]">{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Form ────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="bg-ink-900 border border-ink-800 rounded-2xl p-7 space-y-6">

            {/* Name */}
            <div>
              <label className="block text-ink-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2.5">
                Adınız *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Sadece adınız yeterli (örn: Fatma)"
                className="input-dark"
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-ink-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2.5 flex items-center gap-1.5">
                <MapPin size={10} />
                Şehriniz *
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="input-dark appearance-none cursor-pointer"
              >
                <option value="">Şehrinizi seçin</option>
                {CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Meal count */}
            <div>
              <label className="block text-ink-400 text-[10px] font-black uppercase tracking-[0.2em] mb-3 flex items-center gap-1.5">
                <Users size={10} />
                Kaç Kişilik?
              </label>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {[1, 2, 3, 4].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setMealCount(n)}
                    className={`py-3.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                      mealCount === n
                        ? 'bg-red-500/15 border border-red-500/40 text-red-400'
                        : 'bg-ink-800/60 border border-ink-700/60 text-ink-400 hover:bg-ink-800 hover:text-ink-300'
                    }`}
                  >
                    {n} kişi
                  </button>
                ))}
              </div>
              {mealCount > 4 && (
                <div className="bg-ink-800/50 border border-ink-700/50 rounded-xl px-4 py-3 text-sm text-ink-400">
                  {mealCount} kişi seçildi
                </div>
              )}
              {mealCount <= 4 && (
                <button
                  type="button"
                  onClick={() => setMealCount(5)}
                  className="text-xs text-red-600 hover:text-red-400 font-semibold transition-colors flex items-center gap-1"
                >
                  Daha fazla kişi seç
                  <ArrowRight size={10} />
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/25 rounded-xl p-4 text-red-400 text-sm">
              <AlertCircle size={15} className="flex-shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-red w-full py-4 text-base font-black heading-display tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Utensils size={17} />
            )}
            {loading ? 'GÖNDERİLİYOR...' : 'TALEBİ GÖNDER'}
          </button>

          <p className="text-center text-xs text-ink-600">
            Talebiniz 24-48 saat içinde yanıtlanır · Randevu için sizi arayacağız
          </p>
        </form>

        {/* ── Support visual ──────────────────────────────────────── */}
        <div className="mt-12 relative overflow-hidden rounded-2xl">
          <img
            src="https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800"
            alt="Sıcak yemek"
            className="w-full h-44 object-cover"
          />
          <div className="absolute inset-0 flex items-center px-8" style={{ background: 'linear-gradient(to right, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.75) 55%, transparent 100%)' }}>
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Heart size={12} className="fill-red-500 text-red-500" />
                <span className="text-red-400 text-[10px] font-black uppercase tracking-[0.2em]">pilavustuask.com işbirliğiyle</span>
              </div>
              <p className="text-white font-bold text-sm max-w-xs mb-1">
                Her talep değerli. Yardım istemek güçtür.
              </p>
              <div className="flex items-center gap-1.5">
                <Shield size={10} className="text-ink-500" />
                <span className="text-ink-500 text-xs">Tamamen gizli · Yargısız · Hızlı</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── FAQ ─────────────────────────────────────────────────── */}
        <div className="mt-8 space-y-3">
          <h4 className="text-ink-600 text-[10px] font-black uppercase tracking-[0.2em] mb-4">Sık Sorulan Sorular</h4>
          {[
            { q: 'Kim yararlanabilir?', a: 'Maddi güçlük çeken, beslenme ihtiyacı olan herkes bu hizmetten yararlanabilir. Herhangi bir belge gerekmez.' },
            { q: 'Ne zaman ulaşır?', a: 'Onaylanan talepler genellikle 24-48 saat içinde karşılanır. Sizi telefon ile arayacağız.' },
            { q: 'Birden fazla kez talep edebilir miyim?', a: 'Evet, ihtiyacınız devam ettiği sürece her zaman talep gönderebilirsiniz.' },
          ].map((faq) => (
            <div key={faq.q} className="bg-ink-900/50 border border-ink-800/60 rounded-xl p-4 hover:border-ink-700 transition-colors">
              <div className="text-ink-300 text-sm font-semibold mb-1">{faq.q}</div>
              <div className="text-ink-600 text-xs leading-relaxed">{faq.a}</div>
            </div>
          ))}
        </div>

        {/* ── Contact footer ──────────────────────────────────────── */}
        <div className="mt-8 bg-ink-900 border border-ink-800 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
          <div className="text-ink-500 text-xs">Yardım veya sorularınız için:</div>
          <div className="flex flex-wrap gap-4">
            <a href="mailto:ankara@pilavustuask.com" className="flex items-center gap-1.5 text-red-400 hover:text-red-300 text-xs font-semibold transition-colors">
              <Mail size={12} />
              ankara@pilavustuask.com
            </a>
            <a href="tel:+905102225696" className="flex items-center gap-1.5 text-ink-400 hover:text-white text-xs font-semibold transition-colors">
              <Phone size={12} />
              0510 222 56 96
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
