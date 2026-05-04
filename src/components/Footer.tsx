import { Heart, Mail, Phone, MapPin, Instagram, Twitter, ChevronRight, ExternalLink, Shield, Clock, Zap, Lock, BadgeCheck, Eye, FileText } from 'lucide-react';
import type { Page } from '../App';

const NAV = [
  { label: 'Ana Sayfa', page: 'home' as Page },
  { label: 'Hakkımızda', page: 'about' as Page },
  { label: 'Pilav Ismarla', page: 'donate' as Page },
  { label: 'Yardım İste', page: 'request' as Page },
  { label: 'Öğrenci Kaydı', page: 'student-register' as Page },
  { label: 'Yemek Al (QR)', page: 'student-qr' as Page },
];

const SECURITY = [
  'Günlük 2 porsiyon limit',
  'Haftalık 12 porsiyon limit',
  'Cihaz doğrulama',
  'Tek kullanımlık QR',
  'Belge onay sistemi',
  'Anti-suistimal koruması',
];

export default function Footer({ onNavigate }: { onNavigate: (p: Page) => void }) {
  return (
    <footer className="bg-ink-950 text-white" style={{ borderTop: '1px solid rgba(46,46,46,0.6)' }}>

      {/* ── Top CTA band ─────────────────────────────────────────── */}
      <div className="relative overflow-hidden" style={{ borderBottom: '1px solid rgba(46,46,46,0.5)' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 100% at 80% 50%, rgba(225,29,72,0.04), transparent)' }} />
        <div className="max-w-6xl mx-auto px-5 py-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <div className="section-tag mb-4">Harekete Geç</div>
            <h3 className="heading-display text-[clamp(2.5rem,5vw,3.5rem)] text-white mb-2 leading-[0.9]">
              BİR ÖĞRENCİ DOYUR.
            </h3>
            <p className="text-ink-600 text-sm">Pilav Üstü Aşk · Sosyal Yardımın Yeni Nesli</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('donate')}
              className="btn-red px-7 py-3.5 text-sm font-black heading-display tracking-wider"
            >
              <Heart size={13} className="fill-white" />
              PİLAV ISMARLA
            </button>
            <button
              onClick={() => onNavigate('student-register')}
              className="btn-outline px-7 py-3.5 text-sm font-semibold group"
            >
              Öğrenci Kaydı
              <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Main columns ─────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-5 py-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 mb-14">

          {/* Brand column */}
          <div className="col-span-2 lg:col-span-1">
            {/* Logo */}
            <button onClick={() => onNavigate('home')} className="flex items-center gap-3 mb-6 group">
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center shadow-glow-red-sm group-hover:shadow-glow-red transition-shadow duration-300">
                <span className="text-white font-black text-sm heading-display tracking-wider">AP</span>
              </div>
              <div>
                <div className="font-bold text-sm text-white">Askıda Pilav</div>
                <div className="text-red-500 text-[9px] font-black tracking-[0.22em] uppercase">Pilav Üstü Aşk</div>
              </div>
            </button>

            <p className="text-ink-600 text-sm leading-[1.8] mb-6">
              Yardım etmek isteyenlerle, sıcak yemeğe ihtiyaç duyan öğrencileri
              güvenli ve şeffaf şekilde buluşturan sosyal destek sistemi.
            </p>

            {/* Partnership card */}
            <div className="relative bg-ink-900 border border-ink-800/80 rounded-xl p-4 mb-6 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-600/35 to-transparent" />
              <div className="text-[9px] text-ink-700 font-black uppercase tracking-[0.25em] mb-1.5">Resmi İşbirliği</div>
              <div className="text-red-400 font-black text-sm tracking-wide mb-1">Pilav Üstü Aşk</div>
              <a
                href="https://pilavustuask.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-ink-700 hover:text-red-400 text-xs transition-colors group"
              >
                pilavustuask.com
                <ExternalLink size={10} className="group-hover:text-red-400 transition-colors" />
              </a>
            </div>

            {/* Social */}
            <div className="flex gap-2">
              {[Instagram, Twitter].map((Icon, i) => (
                <div
                  key={i}
                  className="w-9 h-9 bg-ink-900 hover:bg-red-600/15 border border-ink-800 hover:border-red-600/25 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer"
                >
                  <Icon size={14} className="text-ink-600 hover:text-red-400 transition-colors" />
                </div>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-[9px] font-black text-ink-600 uppercase tracking-[0.25em] mb-6">Platform</h4>
            <ul className="space-y-3.5">
              {NAV.map((item) => (
                <li key={item.label}>
                  <button
                    onClick={() => onNavigate(item.page)}
                    className="text-ink-600 hover:text-white text-sm transition-colors flex items-center gap-2 group"
                  >
                    <ChevronRight size={10} className="text-ink-800 group-hover:text-red-500 group-hover:translate-x-0.5 transition-all" />
                    {item.label}
                  </button>
                </li>
              ))}
              <li>
                <button
                  onClick={() => onNavigate('admin')}
                  className="text-ink-800 hover:text-ink-600 text-xs transition-colors flex items-center gap-2 group mt-3"
                >
                  <ChevronRight size={9} className="text-ink-900 group-hover:text-ink-700 transition-colors" />
                  Admin Girişi
                </button>
              </li>
            </ul>
          </div>

          {/* Security */}
          <div>
            <h4 className="text-[9px] font-black text-ink-600 uppercase tracking-[0.25em] mb-6">Güvenlik</h4>
            <ul className="space-y-3">
              {SECURITY.map((item, i) => {
                const icons = [Clock, Clock, Zap, Zap, Shield, Shield];
                const Icon = icons[i % icons.length];
                return (
                  <li key={item} className="flex items-center gap-2.5 text-ink-700 text-xs group">
                    <Icon size={10} className="text-red-700 flex-shrink-0 opacity-70" />
                    {item}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[9px] font-black text-ink-600 uppercase tracking-[0.25em] mb-6">İletişim</h4>
            <ul className="space-y-5">
              {[
                { Icon: Mail, label: 'E-posta', value: 'ankara@pilavustuask.com', href: 'mailto:ankara@pilavustuask.com' },
                { Icon: Phone, label: 'Telefon', value: '0510 222 56 96', href: 'tel:+905102225696' },
                { Icon: MapPin, label: 'Adres', value: 'Bahçelievler Mah. Azerbaycan Cad. 59/A Çankaya/Ankara', href: undefined },
              ].map(({ Icon, label, value, href }) => (
                <li key={label} className="flex items-start gap-3">
                  <div className="w-7 h-7 bg-ink-900 border border-ink-800/80 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon size={11} className="text-red-700" />
                  </div>
                  <div>
                    <div className="text-ink-700 text-[9px] uppercase tracking-[0.18em] mb-0.5">{label}</div>
                    {href ? (
                      <a href={href} className="text-ink-500 hover:text-red-400 text-xs transition-colors leading-relaxed">
                        {value}
                      </a>
                    ) : (
                      <span className="text-ink-500 text-xs leading-relaxed">{value}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Security cert strip ──────────────────────────────────── */}
        <div className="bg-ink-900/60 border border-ink-800/70 rounded-2xl px-6 py-4 mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-6">
            {[
              { icon: Lock, label: 'SSL Şifreli', sub: '256-bit TLS' },
              { icon: Shield, label: 'RLS Korumalı', sub: 'Row Level Security' },
              { icon: BadgeCheck, label: 'Kimlik Doğrulama', sub: 'Belge Onaylı Sistem' },
              { icon: Eye, label: 'Şeffaf Operasyon', sub: 'Halka Açık Raporlama' },
              { icon: FileText, label: 'Kayıtlı Kuruluş', sub: 'Resmi Sosyal Proje' },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-ink-800/80 border border-ink-700/60 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon size={13} className="text-red-600" />
                </div>
                <div>
                  <div className="text-white text-[11px] font-semibold leading-none mb-0.5">{label}</div>
                  <div className="text-ink-700 text-[9px] leading-none">{sub}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-1.5 bg-green-500/8 border border-green-500/20 rounded-lg px-3 py-2 flex-shrink-0">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full" style={{ animation: 'livePulse 2s ease-in-out infinite' }} />
            <span className="text-green-400 text-[10px] font-bold">Sistem Aktif</span>
          </div>
        </div>

        {/* ── Bottom bar ───────────────────────────────────────────── */}
        <div className="hr-red mb-8" />
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-ink-800 text-[11px]">
            <span>© 2022–2026 Askıda Pilav</span>
            <span className="w-px h-3 bg-ink-800" />
            <span>Ankara'nın Yerli ve Milli İlk Sosyal Yardım Projesi</span>
          </div>
          <div className="flex items-center gap-2 text-ink-800 text-[11px]">
            <Heart size={9} className="fill-red-700 text-red-700" />
            <span>Sosyal Yardımın Yeni Nesli</span>
            <span className="w-px h-3 bg-ink-800 mx-0.5" />
            <a
              href="https://pilavustuask.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-700 hover:text-red-500 font-semibold transition-colors"
            >
              Pilav Üstü Aşk
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
