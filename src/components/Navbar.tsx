import { useState, useEffect } from 'react';
import { Menu, X, QrCode, GraduationCap, Flame, Shield, CheckCircle } from 'lucide-react';
import type { Page } from '../App';

const NAV_LINKS = [
  { label: 'Ana Sayfa', p: 'home' as Page },
  { label: 'Hakkımızda', p: 'about' as Page },
  { label: 'Pilav Ismarla', p: 'donate' as Page },
];

const NAV_ACTIONS = [
  { label: 'Yemek Al', p: 'student-qr' as Page, icon: QrCode },
  { label: 'Kayıt Ol', p: 'student-register' as Page, icon: GraduationCap },
];

export default function Navbar({ page, onNavigate }: { page: Page; onNavigate: (p: Page) => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    fn();
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  useEffect(() => { setOpen(false); }, [page]);

  return (
    <>
      {/* ── Trust strip ──────────────────────────────────────────── */}
      <div className="fixed top-0 left-0 right-0 z-[51] bg-red-700 py-1.5 overflow-hidden">
        <div className="max-w-6xl mx-auto px-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-5 overflow-hidden">
            {[
              { icon: Shield, text: 'Resmi Kayıtlı Sosyal Proje' },
              { icon: CheckCircle, text: '%100 Şeffaf Sistem' },
              { icon: CheckCircle, text: 'Ankara 2022 Kuruluş' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 flex-shrink-0">
                <Icon size={10} className="text-red-200 flex-shrink-0" />
                <span className="text-red-100 text-[10px] font-semibold tracking-wide">{text}</span>
              </div>
            ))}
          </div>
          <a
            href="https://pilavustuask.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-red-200 hover:text-white text-[10px] font-bold tracking-wide flex-shrink-0 transition-colors hidden sm:block"
          >
            pilavustuask.com →
          </a>
        </div>
      </div>

      {/* ── Main navbar ─────────────────────────────────────────── */}
      <nav
        className={`fixed top-7 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-ink-950/97 backdrop-blur-2xl border-b border-ink-800/60 shadow-deep'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-5 flex items-center justify-between h-16">

          {/* Logo */}
          <button onClick={() => onNavigate('home')} className="flex items-center gap-2.5 group">
            <div className="relative w-9 h-9 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center shadow-glow-red-sm group-hover:shadow-glow-red transition-shadow duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative text-white font-black text-[11px] heading-display tracking-wider">AP</span>
            </div>
            <div className="leading-none">
              <div className="font-bold text-sm text-white tracking-tight">Askıda Pilav</div>
              <div className="text-red-500 text-[9px] font-black tracking-[0.2em] uppercase">Pilav Üstü Aşk</div>
            </div>
          </button>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((item) => (
              <button
                key={item.p}
                onClick={() => onNavigate(item.p)}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  page === item.p ? 'text-white' : 'text-ink-400 hover:text-white hover:bg-ink-800/50'
                }`}
              >
                {page === item.p && <span className="absolute inset-0 bg-ink-800/60 rounded-lg" />}
                <span className="relative">{item.label}</span>
              </button>
            ))}
            <div className="w-px h-4 bg-ink-800 mx-1" />
            {NAV_ACTIONS.map(({ label, p, icon: Icon }) => (
              <button
                key={p}
                onClick={() => onNavigate(p)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  page === p ? 'text-red-400 bg-red-500/10' : 'text-ink-400 hover:text-white hover:bg-ink-800/50'
                }`}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            {/* Verified badge */}
            <div className="flex items-center gap-1.5 bg-green-500/8 border border-green-500/20 rounded-lg px-3 py-1.5">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              <span className="text-green-400 text-[10px] font-semibold">Doğrulanmış</span>
            </div>
            <button
              onClick={() => onNavigate('donate')}
              className="btn-red px-5 py-2.5 text-sm font-black heading-display tracking-wider"
            >
              <Flame size={13} />
              PİLAV ISMARLA
            </button>
          </div>

          {/* Mobile toggle */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden w-9 h-9 flex items-center justify-center text-ink-400 hover:text-white hover:bg-ink-800/50 rounded-lg transition-all"
          >
            <div className={`transition-all duration-200 ${open ? 'rotate-90 scale-90' : ''}`}>
              {open ? <X size={19} /> : <Menu size={19} />}
            </div>
          </button>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="bg-ink-950/98 backdrop-blur-2xl border-t border-ink-800/60 px-5 py-3 space-y-1">
            {([
              ...NAV_LINKS,
              { label: 'Yemek Al (QR)', p: 'student-qr' as Page },
              { label: 'Öğrenci Kaydı', p: 'student-register' as Page },
              { label: 'Yardım İste', p: 'request' as Page },
            ]).map((item) => (
              <button
                key={item.p}
                onClick={() => onNavigate(item.p)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150 ${
                  page === item.p
                    ? 'bg-red-500/10 text-red-400 border border-red-500/15'
                    : 'text-ink-300 hover:bg-ink-800/60 hover:text-white border border-transparent'
                }`}
              >
                {item.label}
              </button>
            ))}
            {/* Mobile trust badges */}
            <div className="flex items-center gap-3 px-4 py-2">
              <div className="flex items-center gap-1.5">
                <Shield size={11} className="text-red-500" />
                <span className="text-ink-500 text-[10px]">Resmi Kayıtlı</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle size={11} className="text-green-500" />
                <span className="text-ink-500 text-[10px]">Şeffaf Sistem</span>
              </div>
            </div>
            <div className="pt-2 pb-1">
              <button onClick={() => onNavigate('donate')} className="w-full btn-red py-3 text-sm font-black heading-display tracking-wider">
                <Flame size={14} /> PİLAV ISMARLA
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
