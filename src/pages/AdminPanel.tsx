import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Shield, LogOut, Users, QrCode, CheckCircle, XCircle, Clock,
  Search, Eye, X, Camera, ScanLine, RefreshCw, AlertCircle,
  GraduationCap, TrendingUp, Calendar, ChevronRight, Loader,
  Heart, DollarSign, BarChart2, Activity, ArrowUp, ArrowDown,
  Zap, MapPin, Award, Filter, Download
} from 'lucide-react';
import { supabase } from '../lib/supabase';

type AdminTab = 'dashboard' | 'students' | 'donations' | 'scanner';

interface StudentData {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  university: string;
  department: string;
  student_number: string;
  status: 'pending' | 'approved' | 'rejected';
  document_url?: string;
  rejection_reason?: string;
  daily_limit: number;
  weekly_limit: number;
  total_meals_received: number;
  created_at: string;
}

interface DonationRow {
  id: string;
  donor_name: string;
  donor_email: string;
  meal_count: number;
  amount: number;
  message: string;
  status: string;
  created_at: string;
}

interface DayStats {
  date: string;
  qr_count: number;
  donation_amount: number;
  donation_count: number;
}

// ── Sparkline bar chart ────────────────────────────────────────────────────
function SparkBars({ data, color = '#e11d48' }: { data: number[]; color?: string }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-0.5 h-12">
      {data.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm transition-all duration-500"
          style={{
            height: `${Math.max(4, (v / max) * 100)}%`,
            background: i === data.length - 1 ? color : `${color}55`,
          }}
        />
      ))}
    </div>
  );
}

// ── Mini stat card ─────────────────────────────────────────────────────────
function StatCard({
  label, value, sub, icon: Icon, trend, trendLabel, sparkData, color = 'red'
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
  sparkData?: number[];
  color?: 'red' | 'green' | 'amber' | 'sky' | 'ink';
}) {
  const colors = {
    red: { text: 'text-red-400', bg: 'bg-red-500/8', border: 'border-red-500/15', icon: 'text-red-500', spark: '#e11d48' },
    green: { text: 'text-green-400', bg: 'bg-green-500/6', border: 'border-green-500/15', icon: 'text-green-500', spark: '#22c55e' },
    amber: { text: 'text-amber-400', bg: 'bg-amber-500/6', border: 'border-amber-500/15', icon: 'text-amber-500', spark: '#f59e0b' },
    sky: { text: 'text-sky-400', bg: 'bg-sky-500/6', border: 'border-sky-500/15', icon: 'text-sky-500', spark: '#0ea5e9' },
    ink: { text: 'text-ink-200', bg: 'bg-ink-800/40', border: 'border-ink-700', icon: 'text-ink-400', spark: '#606060' },
  };
  const c = colors[color];
  return (
    <div className={`relative rounded-2xl p-5 border overflow-hidden ${c.border} ${c.bg} transition-all duration-300 hover:scale-[1.01]`}>
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${c.spark}40, transparent)` }} />
      <div className="flex items-start justify-between mb-4">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${c.border}`} style={{ background: `${c.spark}12` }}>
          <Icon size={16} className={c.icon} />
        </div>
        {trend && trendLabel && (
          <div className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full ${
            trend === 'up' ? 'bg-green-500/12 text-green-400' :
            trend === 'down' ? 'bg-red-500/10 text-red-400' :
            'bg-ink-800 text-ink-500'
          }`}>
            {trend === 'up' ? <ArrowUp size={9} /> : trend === 'down' ? <ArrowDown size={9} /> : null}
            {trendLabel}
          </div>
        )}
      </div>
      <div className={`heading-display text-4xl ${c.text} tabular-nums leading-none mb-1`}>{value}</div>
      <div className="text-ink-500 text-xs mb-1">{label}</div>
      {sub && <div className="text-ink-700 text-[10px] mono">{sub}</div>}
      {sparkData && sparkData.length > 1 && (
        <div className="mt-4">
          <SparkBars data={sparkData} color={c.spark} />
        </div>
      )}
    </div>
  );
}

// ── QR Scanner ─────────────────────────────────────────────────────────────
function QRScanner({ onScan }: { onScan: (token: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [manualToken, setManualToken] = useState('');
  const [cameraError, setCameraError] = useState('');
  const [scanning, setScanning] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    setCameraError('');
    setScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch {
      setCameraError('Kamera erişimi reddedildi. Manuel giriş kullanın.');
      setScanning(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setScanning(false);
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  return (
    <div className="space-y-4">
      <div className="card-dark overflow-hidden">
        <div className="px-5 py-4 border-b border-ink-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera size={15} className="text-red-400" />
            <span className="text-white font-semibold text-sm">Kamera ile Tara</span>
          </div>
          {!scanning ? (
            <button onClick={startCamera} className="btn-red px-3 py-1.5 text-xs font-bold rounded-lg">
              Kamerayı Aç
            </button>
          ) : (
            <button onClick={stopCamera} className="flex items-center gap-1.5 bg-ink-800 hover:bg-ink-700 text-ink-300 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors">
              <X size={12} /> Kapat
            </button>
          )}
        </div>
        <div className="relative bg-black aspect-video flex items-center justify-center">
          {scanning ? (
            <>
              <video ref={videoRef} className="w-full h-full object-cover" muted playsInline />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 border-2 border-red-500 rounded-2xl relative">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-red-500 rounded-tl-lg" />
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-red-500 rounded-tr-lg" />
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-red-500 rounded-bl-lg" />
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-red-500 rounded-br-lg" />
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500/60 animate-pulse -translate-y-1/2" />
                </div>
              </div>
              <div className="absolute bottom-4 left-0 right-0 text-center">
                <span className="bg-black/60 text-white text-xs px-3 py-1 rounded-full">QR kodu çerçeveye getirin</span>
              </div>
            </>
          ) : (
            <div className="text-center p-8">
              <ScanLine size={40} className="text-ink-700 mx-auto mb-3" />
              <p className="text-ink-600 text-sm">Kamera kapalı</p>
              {cameraError && <p className="text-red-400 text-xs mt-2">{cameraError}</p>}
            </div>
          )}
        </div>
      </div>

      <div className="card-dark p-5">
        <div className="flex items-center gap-2 mb-3">
          <QrCode size={14} className="text-ink-500" />
          <span className="text-ink-400 text-sm font-semibold">Manuel Token Girişi</span>
        </div>
        <div className="flex gap-3">
          <input
            type="text"
            value={manualToken}
            onChange={(e) => setManualToken(e.target.value.trim().toUpperCase())}
            onKeyDown={(e) => { if (e.key === 'Enter' && manualToken) { onScan(manualToken); setManualToken(''); } }}
            placeholder="AP-XXXXXXXX-... token girin"
            className="flex-1 bg-ink-800/60 border border-ink-700 focus:border-red-600 text-white placeholder:text-ink-700 rounded-xl px-4 py-3 text-sm mono outline-none transition-colors"
          />
          <button
            onClick={() => { if (manualToken) { onScan(manualToken); setManualToken(''); } }}
            disabled={!manualToken}
            className="btn-red px-5 py-3 text-sm font-bold rounded-xl disabled:opacity-40"
          >
            Onayla
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Student modal ──────────────────────────────────────────────────────────
function StudentModal({ student, onClose, onApprove, onReject }: {
  student: StudentData;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string, reason: string) => void;
}) {
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-ink-900 border border-ink-700 rounded-2xl p-7 w-full max-w-md shadow-deep" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="heading-display text-2xl text-white">ÖĞRENCİ DETAYI</h3>
          <button onClick={onClose} className="w-8 h-8 bg-ink-800 hover:bg-ink-700 rounded-xl flex items-center justify-center text-ink-400 transition-colors">
            <X size={15} />
          </button>
        </div>

        <div className="flex items-center gap-4 mb-5 pb-5 border-b border-ink-800">
          <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-red-800 rounded-xl flex items-center justify-center text-white font-black text-xl heading-display shadow-glow-red-sm">
            {student.full_name.charAt(0)}
          </div>
          <div>
            <div className="font-bold text-white">{student.full_name}</div>
            <div className="text-ink-400 text-sm">{student.email}</div>
            <div className="text-ink-600 text-xs mono">{student.phone}</div>
          </div>
        </div>

        <div className="space-y-2.5 mb-6 text-sm">
          {[
            { label: 'Üniversite', value: student.university },
            { label: 'Bölüm', value: student.department },
            { label: 'Öğrenci No', value: student.student_number },
            { label: 'Günlük Limit', value: `${student.daily_limit} porsiyon` },
            { label: 'Haftalık Limit', value: `${student.weekly_limit} porsiyon` },
            { label: 'Toplam Alan', value: `${student.total_meals_received} porsiyon` },
            { label: 'Başvuru', value: new Date(student.created_at).toLocaleDateString('tr-TR') },
          ].map((row) => (
            <div key={row.label} className="flex justify-between items-center bg-ink-800/30 rounded-lg px-3 py-2">
              <span className="text-ink-500 text-xs">{row.label}</span>
              <span className="text-white font-medium text-xs mono">{row.value}</span>
            </div>
          ))}
          {student.document_url && (
            <div className="flex justify-between items-center bg-ink-800/30 rounded-lg px-3 py-2">
              <span className="text-ink-500 text-xs">Belge</span>
              <span className="text-red-400 text-xs font-medium mono truncate max-w-[180px]">{student.document_url}</span>
            </div>
          )}
        </div>

        {student.status === 'pending' && (
          <div className="space-y-3">
            {showRejectInput ? (
              <div>
                <input
                  type="text"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Red nedeni (isteğe bağlı)"
                  className="w-full bg-ink-800/60 border border-ink-700 focus:border-red-600 text-white placeholder:text-ink-700 rounded-xl px-4 py-3 text-sm outline-none transition-colors mb-3"
                />
                <div className="flex gap-2">
                  <button onClick={() => { onReject(student.id, rejectionReason); onClose(); }} className="flex-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 font-bold py-2.5 rounded-xl text-sm transition-colors">Reddet</button>
                  <button onClick={() => setShowRejectInput(false)} className="flex-1 btn-outline py-2.5 text-sm rounded-xl">İptal</button>
                </div>
              </div>
            ) : (
              <div className="flex gap-3">
                <button onClick={() => { onApprove(student.id); onClose(); }} className="flex-1 bg-green-500/15 hover:bg-green-500/25 border border-green-500/40 text-green-400 font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                  <CheckCircle size={14} /> Onayla
                </button>
                <button onClick={() => setShowRejectInput(true)} className="flex-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                  <XCircle size={14} /> Reddet
                </button>
              </div>
            )}
          </div>
        )}

        {student.status === 'approved' && (
          <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/25 rounded-xl p-3">
            <CheckCircle size={14} className="text-green-400" />
            <span className="text-green-400 text-sm font-semibold">Onaylı öğrenci</span>
          </div>
        )}
        {student.status === 'rejected' && (
          <div className="bg-red-500/10 border border-red-500/25 rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <XCircle size={14} className="text-red-400" />
              <span className="text-red-400 text-sm font-semibold">Reddedildi</span>
            </div>
            {student.rejection_reason && <p className="text-ink-500 text-xs">{student.rejection_reason}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Horizontal bar ─────────────────────────────────────────────────────────
function HBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="group">
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-ink-400 text-xs truncate pr-2">{label}</span>
        <span className="text-white text-xs font-bold mono flex-shrink-0">{value}</span>
      </div>
      <div className="h-1.5 bg-ink-800 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

// ── Day activity row ───────────────────────────────────────────────────────
function DayRow({ stat, maxQr, maxAmount }: { stat: DayStats; maxQr: number; maxAmount: number }) {
  const date = new Date(stat.date);
  const isToday = stat.date === new Date().toISOString().split('T')[0];
  return (
    <div className={`grid grid-cols-[100px_1fr_1fr] gap-4 items-center py-3 border-b border-ink-800/50 last:border-0 ${isToday ? 'bg-red-500/3' : ''}`}>
      <div>
        <div className={`text-xs font-semibold ${isToday ? 'text-red-400' : 'text-ink-300'}`}>
          {isToday ? 'Bugün' : date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
        </div>
        <div className="text-ink-700 text-[10px] mono">{date.toLocaleDateString('tr-TR', { weekday: 'short' })}</div>
      </div>
      <div>
        <div className="flex justify-between mb-1">
          <span className="text-ink-600 text-[10px]">QR</span>
          <span className="text-green-400 text-[10px] font-bold mono">{stat.qr_count}</span>
        </div>
        <div className="h-1 bg-ink-800 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-green-500" style={{ width: `${maxQr > 0 ? (stat.qr_count / maxQr) * 100 : 0}%`, transition: 'width 0.7s' }} />
        </div>
      </div>
      <div>
        <div className="flex justify-between mb-1">
          <span className="text-ink-600 text-[10px]">Bağış</span>
          <span className="text-red-400 text-[10px] font-bold mono">{(stat.donation_amount / 1000).toFixed(1)}K₺</span>
        </div>
        <div className="h-1 bg-ink-800 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-red-500" style={{ width: `${maxAmount > 0 ? (stat.donation_amount / maxAmount) * 100 : 0}%`, transition: 'width 0.7s' }} />
        </div>
      </div>
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────
export default function AdminPanel() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [tab, setTab] = useState<AdminTab>('dashboard');

  const [students, setStudents] = useState<StudentData[]>([]);
  const [donations, setDonations] = useState<DonationRow[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [donationSearch, setDonationSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
  const [dataLoading, setDataLoading] = useState(false);
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string; student?: StudentData } | null>(null);
  const [scanLoading, setScanLoading] = useState(false);

  // Stats
  const [todayQR, setTodayQR] = useState(0);
  const [todayDonationAmount, setTodayDonationAmount] = useState(0);
  const [todayDonationCount, setTodayDonationCount] = useState(0);
  const [totalApproved, setTotalApproved] = useState(0);
  const [totalPending, setTotalPending] = useState(0);
  const [totalDonationAmount, setTotalDonationAmount] = useState(0);
  const [totalDonationCount, setTotalDonationCount] = useState(0);
  const [totalMeals, setTotalMeals] = useState(0);
  const [weeklyStats, setWeeklyStats] = useState<DayStats[]>([]);
  const [uniStats, setUniStats] = useState<{ university: string; count: number }[]>([]);
  const [recentActivity, setRecentActivity] = useState<{ type: 'qr' | 'donation' | 'register'; label: string; time: string; sub?: string }[]>([]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    const { data } = await supabase
      .from('admin_users')
      .select('id')
      .eq('username', username)
      .eq('password', password)
      .maybeSingle();
    setLoginLoading(false);
    if (data) {
      setLoggedIn(true);
      loadAll();
    } else {
      setLoginError('Kullanıcı adı veya şifre hatalı.');
    }
  };

  const loadAll = useCallback(async () => {
    setDataLoading(true);
    await Promise.all([loadStudents(), loadStats(), loadDonations(), loadWeeklyStats(), loadActivity()]);
    setDataLoading(false);
  }, []);

  const loadStudents = async () => {
    const { data } = await supabase.from('students').select('*').order('created_at', { ascending: false });
    if (data) setStudents(data as StudentData[]);
  };

  const loadDonations = async () => {
    const { data } = await supabase.from('donations').select('*').order('created_at', { ascending: false }).limit(200);
    if (data) setDonations(data as DonationRow[]);
  };

  const loadStats = async () => {
    const today = new Date().toISOString().split('T')[0];
    const [approvedRes, pendingRes, todayQRRes, todayDonRes, allDonRes, allMealsRes] = await Promise.all([
      supabase.from('students').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
      supabase.from('students').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('qr_tokens').select('id', { count: 'exact', head: true }).eq('status', 'used').gte('used_at', `${today}T00:00:00`),
      supabase.from('donations').select('amount, meal_count').eq('status', 'confirmed').gte('created_at', `${today}T00:00:00`),
      supabase.from('donations').select('amount, meal_count').eq('status', 'confirmed'),
      supabase.from('global_stats').select('total_meals_all_time, total_donors').eq('id', 1).maybeSingle(),
    ]);

    setTotalApproved(approvedRes.count ?? 0);
    setTotalPending(pendingRes.count ?? 0);
    setTodayQR(todayQRRes.count ?? 0);

    const todayDons = todayDonRes.data ?? [];
    setTodayDonationAmount(todayDons.reduce((s, d) => s + (d.amount ?? 0), 0));
    setTodayDonationCount(todayDons.length);

    const allDons = allDonRes.data ?? [];
    setTotalDonationAmount(allDons.reduce((s, d) => s + (d.amount ?? 0), 0));
    setTotalDonationCount(allDons.length);
    setTotalMeals(allMealsRes.data?.total_meals_all_time ?? 0);

    // University breakdown
    const { data: stuData } = await supabase.from('students').select('university').eq('status', 'approved');
    if (stuData) {
      const map: Record<string, number> = {};
      stuData.forEach(s => { map[s.university] = (map[s.university] ?? 0) + 1; });
      const sorted = Object.entries(map).map(([university, count]) => ({ university, count })).sort((a, b) => b.count - a.count).slice(0, 6);
      setUniStats(sorted);
    }
  };

  const loadWeeklyStats = async () => {
    const days: DayStats[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const [qrRes, donRes] = await Promise.all([
        supabase.from('qr_tokens').select('id', { count: 'exact', head: true }).eq('status', 'used').gte('used_at', `${dateStr}T00:00:00`).lt('used_at', `${dateStr}T23:59:59`),
        supabase.from('donations').select('amount, meal_count').eq('status', 'confirmed').gte('created_at', `${dateStr}T00:00:00`).lt('created_at', `${dateStr}T23:59:59`),
      ]);
      const donData = donRes.data ?? [];
      days.push({
        date: dateStr,
        qr_count: qrRes.count ?? 0,
        donation_amount: donData.reduce((s, d) => s + (d.amount ?? 0), 0),
        donation_count: donData.length,
      });
    }
    setWeeklyStats(days);
  };

  const loadActivity = async () => {
    const [qrRes, donRes, stuRes] = await Promise.all([
      supabase.from('qr_tokens').select('used_at, student_id').eq('status', 'used').order('used_at', { ascending: false }).limit(5),
      supabase.from('donations').select('donor_name, amount, created_at').order('created_at', { ascending: false }).limit(5),
      supabase.from('students').select('full_name, created_at').order('created_at', { ascending: false }).limit(5),
    ]);

    const events: typeof recentActivity = [];

    (qrRes.data ?? []).forEach(r => {
      events.push({ type: 'qr', label: 'QR Okutuldu', time: new Date(r.used_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }), sub: new Date(r.used_at).toLocaleDateString('tr-TR') });
    });
    (donRes.data ?? []).forEach(d => {
      events.push({ type: 'donation', label: d.donor_name ?? 'Anonim', time: new Date(d.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }), sub: `${(d.amount ?? 0).toLocaleString('tr-TR')}₺` });
    });
    (stuRes.data ?? []).forEach(s => {
      events.push({ type: 'register', label: s.full_name, time: new Date(s.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }), sub: 'Kayıt' });
    });

    events.sort((a, b) => a.time < b.time ? 1 : -1);
    setRecentActivity(events.slice(0, 10));
  };

  const approveStudent = async (id: string) => {
    await supabase.from('students').update({ status: 'approved', approved_at: new Date().toISOString(), approved_by: username }).eq('id', id);
    setStudents((prev) => prev.map((s) => s.id === id ? { ...s, status: 'approved' as const } : s));
    setTotalApproved((n) => n + 1);
    setTotalPending((n) => Math.max(0, n - 1));
  };

  const rejectStudent = async (id: string, reason: string) => {
    await supabase.from('students').update({ status: 'rejected', rejection_reason: reason }).eq('id', id);
    setStudents((prev) => prev.map((s) => s.id === id ? { ...s, status: 'rejected' as const } : s));
    setTotalPending((n) => Math.max(0, n - 1));
  };

  const handleScan = async (token: string) => {
    setScanResult(null);
    setScanLoading(true);

    const { data: qrData } = await supabase
      .from('qr_tokens').select('*, students(*)').eq('token', token).maybeSingle();

    if (!qrData) {
      setScanResult({ success: false, message: 'QR kodu geçersiz veya bulunamadı.' });
      setScanLoading(false);
      return;
    }
    if (qrData.status === 'used') {
      setScanResult({ success: false, message: `Bu QR kodu zaten kullanıldı. (${new Date(qrData.used_at).toLocaleString('tr-TR')})` });
      setScanLoading(false);
      return;
    }
    if (qrData.status === 'expired' || new Date(qrData.expires_at) < new Date()) {
      await supabase.from('qr_tokens').update({ status: 'expired' }).eq('id', qrData.id);
      setScanResult({ success: false, message: 'QR kodunun süresi dolmuş. Öğrenci yeni kod oluştursun.' });
      setScanLoading(false);
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const { data: dailyData } = await supabase
      .from('student_daily_meals').select('meals_received').eq('student_id', qrData.student_id).eq('meal_date', today).maybeSingle();

    const student = qrData.students as StudentData;
    const dailyLimit = student?.daily_limit ?? 2;

    if ((dailyData?.meals_received ?? 0) >= dailyLimit) {
      setScanResult({ success: false, message: `Bu öğrenci bugünkü ${dailyLimit} porsiyon limitine ulaştı.` });
      setScanLoading(false);
      return;
    }

    await supabase.from('qr_tokens').update({ status: 'used', used_at: new Date().toISOString(), used_by_admin: username }).eq('id', qrData.id);

    if (dailyData) {
      await supabase.from('student_daily_meals').update({ meals_received: dailyData.meals_received + 1 }).eq('student_id', qrData.student_id).eq('meal_date', today);
    } else {
      await supabase.from('student_daily_meals').insert({ student_id: qrData.student_id, meal_date: today, meals_received: 1 });
    }

    await supabase.from('students').update({ total_meals_received: (student?.total_meals_received ?? 0) + 1 }).eq('id', qrData.student_id);

    setTodayQR((n) => n + 1);
    setScanResult({ success: true, message: 'Yemek başarıyla verildi!', student });
    setScanLoading(false);
  };

  const filteredStudents = students.filter((s) => {
    const matchSearch = !search || s.full_name.toLowerCase().includes(search.toLowerCase()) || s.email.toLowerCase().includes(search.toLowerCase()) || s.student_number.includes(search);
    const matchStatus = filterStatus === 'all' || s.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const filteredDonations = donations.filter((d) =>
    !donationSearch || d.donor_name?.toLowerCase().includes(donationSearch.toLowerCase()) || d.donor_email?.toLowerCase().includes(donationSearch.toLowerCase())
  );

  const statusCounts = {
    all: students.length,
    pending: students.filter((s) => s.status === 'pending').length,
    approved: students.filter((s) => s.status === 'approved').length,
    rejected: students.filter((s) => s.status === 'rejected').length,
  };

  const maxUni = Math.max(...uniStats.map(u => u.count), 1);
  const sparkQR = weeklyStats.map(d => d.qr_count);
  const sparkDon = weeklyStats.map(d => d.donation_amount);
  const maxQr = Math.max(...weeklyStats.map(d => d.qr_count), 1);
  const maxAmount = Math.max(...weeklyStats.map(d => d.donation_amount), 1);

  // ── Login screen ─────────────────────────────────────────────────────────
  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-ink-950 flex items-center justify-center px-5">
        <div className="w-full max-w-md">
          <div className="relative bg-ink-900 border border-ink-800 rounded-3xl p-10 overflow-hidden" style={{ boxShadow: '0 40px 100px rgba(0,0,0,0.8)' }}>
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-600/50 to-transparent" />
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(225,29,72,0.06), transparent)' }} />

            <div className="relative text-center mb-10">
              <div className="w-16 h-16 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-glow-red">
                <Shield size={26} className="text-white" />
              </div>
              <div className="section-tag justify-center mb-3">Güvenli Erişim</div>
              <h1 className="heading-display text-5xl text-white mb-2">ADMİN PANELİ</h1>
              <p className="text-ink-600 text-sm">Askıda Pilav · Ankara Öğrenci Sistemi</p>
            </div>

            <form onSubmit={handleLogin} className="relative space-y-4">
              <div>
                <label className="block text-ink-600 text-[9px] font-black uppercase tracking-[0.28em] mb-2.5">Kullanıcı Adı</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  className="w-full bg-ink-800/60 border border-ink-700 focus:border-red-600 text-white placeholder:text-ink-700 rounded-xl px-4 py-3.5 text-sm outline-none transition-colors mono"
                />
              </div>
              <div>
                <label className="block text-ink-600 text-[9px] font-black uppercase tracking-[0.28em] mb-2.5">Şifre</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-ink-800/60 border border-ink-700 focus:border-red-600 text-white placeholder:text-ink-700 rounded-xl px-4 py-3.5 text-sm outline-none transition-colors"
                />
              </div>
              {loginError && (
                <div className="flex items-center gap-2.5 text-red-400 text-sm bg-red-500/8 border border-red-500/20 rounded-xl p-3.5">
                  <AlertCircle size={14} className="flex-shrink-0" /> {loginError}
                </div>
              )}
              <button
                type="submit"
                disabled={loginLoading}
                className="w-full btn-red py-4 font-black heading-display tracking-wider text-base disabled:opacity-40 mt-2"
              >
                {loginLoading ? <Loader size={16} className="animate-spin" /> : <Shield size={16} />}
                {loginLoading ? 'GİRİŞ YAPILIYOR...' : 'GİRİŞ YAP'}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // ── Admin layout ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-ink-950">

      {/* Top bar */}
      <div className="fixed top-0 left-0 right-0 z-30 bg-ink-950/98 backdrop-blur-2xl border-b border-ink-800/60">
        <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between">

          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-800 rounded-lg flex items-center justify-center shadow-glow-red-sm">
              <Shield size={14} className="text-white" />
            </div>
            <div>
              <div className="text-white font-black text-sm heading-display tracking-wide leading-none">ASKIDA PİLAV</div>
              <div className="text-red-600 text-[8px] font-black tracking-[0.2em] uppercase leading-none mt-0.5">Admin · {username}</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="hidden md:flex items-center bg-ink-900/80 border border-ink-800/60 rounded-xl p-1 gap-0.5">
            {([
              { id: 'dashboard', label: 'Dashboard', icon: BarChart2 },
              { id: 'students', label: 'Öğrenciler', icon: Users },
              { id: 'donations', label: 'Bağışlar', icon: Heart },
              { id: 'scanner', label: 'QR Tarayıcı', icon: QrCode },
            ] as const).map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  tab === t.id
                    ? 'bg-red-600 text-white shadow-glow-red-sm'
                    : 'text-ink-500 hover:text-white hover:bg-ink-800/60'
                }`}
              >
                <t.icon size={13} />
                {t.label}
                {t.id === 'students' && statusCounts.pending > 0 && (
                  <span className="w-4 h-4 bg-amber-500 rounded-full text-white text-[9px] font-black flex items-center justify-center ml-0.5">
                    {statusCounts.pending}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {/* Live indicator */}
            <div className="hidden md:flex items-center gap-2 bg-green-500/8 border border-green-500/15 rounded-lg px-3 py-1.5">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-400 text-[10px] font-semibold">Canlı</span>
            </div>
            <button
              onClick={() => setLoggedIn(false)}
              className="flex items-center gap-1.5 text-ink-600 hover:text-white text-xs font-medium transition-colors px-3 py-1.5 hover:bg-ink-800 rounded-lg"
            >
              <LogOut size={13} />
              Çıkış
            </button>
          </div>
        </div>

        {/* Mobile tabs */}
        <div className="md:hidden flex border-t border-ink-800/50">
          {([
            { id: 'dashboard', label: 'Panel', icon: BarChart2 },
            { id: 'students', label: 'Öğrenciler', icon: Users },
            { id: 'donations', label: 'Bağışlar', icon: Heart },
            { id: 'scanner', label: 'QR', icon: QrCode },
          ] as const).map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold transition-colors ${tab === t.id ? 'text-red-400' : 'text-ink-600'}`}>
              <t.icon size={16} />
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 pt-20 pb-14">

        {/* ════ DASHBOARD ════ */}
        {tab === 'dashboard' && (
          <div className="space-y-6">

            {/* Header */}
            <div className="flex items-center justify-between pt-2">
              <div>
                <div className="section-tag mb-2">Genel Bakış</div>
                <h2 className="heading-display text-4xl md:text-5xl text-white">KONTROL PANELİ</h2>
                <p className="text-ink-600 text-xs mt-1 mono">{new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <button
                onClick={loadAll}
                disabled={dataLoading}
                className="flex items-center gap-2 bg-ink-900 hover:bg-ink-800 border border-ink-700 text-ink-300 text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
              >
                <RefreshCw size={13} className={dataLoading ? 'animate-spin' : ''} />
                Yenile
              </button>
            </div>

            {/* Today KPIs */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                <span className="text-ink-600 text-[10px] font-black uppercase tracking-[0.25em]">Bugün</span>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard
                  label="QR Okutuldu"
                  value={todayQR}
                  sub={`${new Date().toLocaleDateString('tr-TR')} tarihi`}
                  icon={QrCode}
                  color="green"
                  trend="up"
                  trendLabel="bugün"
                  sparkData={sparkQR}
                />
                <StatCard
                  label="Bağış Geldi"
                  value={`${(todayDonationAmount / 1000).toFixed(1)}K₺`}
                  sub={`${todayDonationCount} bağışçı · ortalama ${todayDonationCount > 0 ? Math.round(todayDonationAmount / todayDonationCount).toLocaleString('tr-TR') : 0}₺`}
                  icon={DollarSign}
                  color="red"
                  trend="up"
                  trendLabel={`${todayDonationCount} bağış`}
                  sparkData={sparkDon}
                />
                <StatCard
                  label="Onay Bekleyen"
                  value={statusCounts.pending}
                  sub="İnceleme gerekiyor"
                  icon={Clock}
                  color="amber"
                  trend={statusCounts.pending > 0 ? 'neutral' : 'up'}
                  trendLabel={statusCounts.pending > 0 ? 'bekliyor' : 'temiz'}
                />
              </div>
            </div>

            {/* All-time KPIs */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-ink-700 text-[10px] font-black uppercase tracking-[0.25em]">Tüm Zamanlar</span>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Toplam Menü" value={totalMeals.toLocaleString('tr-TR')} icon={Award} color="ink" />
                <StatCard label="Onaylı Öğrenci" value={totalApproved} icon={GraduationCap} color="sky" />
                <StatCard label="Toplam Bağış" value={`${(totalDonationAmount / 1000).toFixed(0)}K₺`} sub={`${totalDonationCount} bağışçı`} icon={Heart} color="red" />
                <StatCard label="Toplam Kayıt" value={statusCounts.all} icon={Users} color="ink" />
              </div>
            </div>

            {/* Charts row */}
            <div className="grid lg:grid-cols-[1fr_360px] gap-5">

              {/* 7-day chart */}
              <div className="bg-ink-900 border border-ink-800 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-ink-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Activity size={15} className="text-red-400" />
                    <span className="text-white font-semibold text-sm">Son 7 Gün Aktivitesi</span>
                  </div>
                  <div className="flex items-center gap-4 text-[10px]">
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-green-500" /><span className="text-ink-500">QR Okutma</span></div>
                    <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-red-500" /><span className="text-ink-500">Bağış (₺)</span></div>
                  </div>
                </div>
                <div className="p-6">
                  {weeklyStats.length > 0 ? (
                    <div className="space-y-0">
                      {weeklyStats.map((stat) => (
                        <DayRow key={stat.date} stat={stat} maxQr={maxQr} maxAmount={maxAmount} />
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-32 text-ink-700">
                      <Loader size={20} className="animate-spin" />
                    </div>
                  )}
                </div>
              </div>

              {/* Side panels */}
              <div className="flex flex-col gap-4">

                {/* University breakdown */}
                <div className="bg-ink-900 border border-ink-800 rounded-2xl overflow-hidden flex-1">
                  <div className="px-5 py-4 border-b border-ink-800 flex items-center gap-2">
                    <MapPin size={14} className="text-red-400" />
                    <span className="text-white font-semibold text-sm">Üniversite Dağılımı</span>
                  </div>
                  <div className="p-5 space-y-3.5">
                    {uniStats.length > 0 ? uniStats.map((u) => (
                      <HBar key={u.university} label={u.university.replace('Üniversitesi', 'Üniv.').replace('Universitesi', 'Üniv.')} value={u.count} max={maxUni} color="#e11d48" />
                    )) : (
                      <div className="text-ink-700 text-xs text-center py-4">Veri yükleniyor...</div>
                    )}
                  </div>
                </div>

                {/* Recent activity */}
                <div className="bg-ink-900 border border-ink-800 rounded-2xl overflow-hidden">
                  <div className="px-5 py-4 border-b border-ink-800 flex items-center gap-2">
                    <Zap size={14} className="text-amber-400" />
                    <span className="text-white font-semibold text-sm">Son Aktiviteler</span>
                  </div>
                  <div className="divide-y divide-ink-800/50">
                    {recentActivity.slice(0, 6).map((a, i) => (
                      <div key={i} className="px-5 py-3 flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          a.type === 'qr' ? 'bg-green-500/12 border border-green-500/20' :
                          a.type === 'donation' ? 'bg-red-500/12 border border-red-500/20' :
                          'bg-sky-500/12 border border-sky-500/20'
                        }`}>
                          {a.type === 'qr' ? <QrCode size={11} className="text-green-400" /> :
                           a.type === 'donation' ? <Heart size={11} className="text-red-400 fill-red-400" /> :
                           <GraduationCap size={11} className="text-sky-400" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-ink-200 text-xs font-medium truncate">{a.label}</div>
                          {a.sub && <div className="text-ink-600 text-[10px]">{a.sub}</div>}
                        </div>
                        <div className="text-ink-700 text-[10px] mono flex-shrink-0">{a.time}</div>
                      </div>
                    ))}
                    {recentActivity.length === 0 && (
                      <div className="px-5 py-6 text-center text-ink-700 text-xs">Henüz aktivite yok</div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Pending students alert */}
            {statusCounts.pending > 0 && (
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl overflow-hidden">
                <div className="px-6 py-4 border-b border-amber-500/15 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Clock size={15} className="text-amber-400" />
                    <span className="font-semibold text-white text-sm">Onay Bekleyen Başvurular</span>
                    <span className="bg-amber-500 text-white text-xs font-black px-2.5 py-0.5 rounded-full">{statusCounts.pending}</span>
                  </div>
                  <button onClick={() => setTab('students')} className="text-amber-400 hover:text-amber-300 text-xs font-semibold transition-colors flex items-center gap-1">
                    Tümünü Gör <ChevronRight size={11} />
                  </button>
                </div>
                <div className="divide-y divide-amber-500/8">
                  {students.filter((s) => s.status === 'pending').slice(0, 4).map((s) => (
                    <div key={s.id} className="px-6 py-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-amber-500/15 border border-amber-500/20 rounded-xl flex items-center justify-center text-amber-400 font-bold heading-display text-sm">
                          {s.full_name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-white font-medium text-sm">{s.full_name}</div>
                          <div className="text-ink-500 text-xs">{s.university} · {new Date(s.created_at).toLocaleDateString('tr-TR')}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { approveStudent(s.id); }}
                          className="flex items-center gap-1.5 bg-green-500/15 hover:bg-green-500/25 border border-green-500/30 text-green-400 text-xs font-semibold px-3 py-2 rounded-xl transition-all"
                        >
                          <CheckCircle size={11} /> Onayla
                        </button>
                        <button
                          onClick={() => setSelectedStudent(s)}
                          className="flex items-center gap-1.5 bg-ink-800 hover:bg-ink-700 border border-ink-700 text-ink-400 hover:text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all"
                        >
                          <Eye size={11} /> Detay
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════ STUDENTS ════ */}
        {tab === 'students' && (
          <div>
            <div className="flex items-center justify-between mb-6 pt-2">
              <div>
                <div className="section-tag mb-2">Öğrenci Yönetimi</div>
                <h2 className="heading-display text-4xl text-white">KAYITLI ÖĞRENCİLER</h2>
              </div>
              <button onClick={loadStudents} disabled={dataLoading} className="flex items-center gap-2 bg-ink-900 hover:bg-ink-800 border border-ink-700 text-ink-300 text-sm font-medium px-4 py-2.5 rounded-xl transition-colors">
                <RefreshCw size={13} className={dataLoading ? 'animate-spin' : ''} />
                Yenile
              </button>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              {[
                { key: 'all', label: 'Toplam', count: statusCounts.all, color: 'text-ink-300', bg: 'bg-ink-800/40', border: 'border-ink-700' },
                { key: 'pending', label: 'Bekleyen', count: statusCounts.pending, color: 'text-amber-400', bg: 'bg-amber-500/6', border: 'border-amber-500/15' },
                { key: 'approved', label: 'Onaylı', count: statusCounts.approved, color: 'text-green-400', bg: 'bg-green-500/6', border: 'border-green-500/15' },
                { key: 'rejected', label: 'Reddedildi', count: statusCounts.rejected, color: 'text-red-400', bg: 'bg-red-500/6', border: 'border-red-500/15' },
              ].map((s) => (
                <button
                  key={s.key}
                  onClick={() => setFilterStatus(s.key)}
                  className={`rounded-xl p-4 border text-center transition-all ${s.bg} ${s.border} ${filterStatus === s.key ? 'ring-1 ring-red-500/40' : 'hover:opacity-80'}`}
                >
                  <div className={`heading-display text-3xl ${s.color} tabular-nums`}>{s.count}</div>
                  <div className="text-ink-600 text-[10px] mt-1">{s.label}</div>
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-600" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Ad, e-posta veya öğrenci no..."
                  className="w-full bg-ink-900/80 border border-ink-800 focus:border-red-600 text-white placeholder:text-ink-700 rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition-colors"
                />
              </div>
              <div className="flex items-center gap-2 text-ink-600 text-xs">
                <Filter size={11} />
                <span>{filteredStudents.length} sonuç</span>
              </div>
            </div>

            {dataLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader size={24} className="animate-spin text-red-600" />
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-20 text-ink-600">
                <GraduationCap size={36} className="mx-auto mb-3 opacity-40" />
                <p>Öğrenci bulunamadı.</p>
              </div>
            ) : (
              <div className="bg-ink-900 border border-ink-800 rounded-2xl overflow-hidden">
                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-0 px-5 py-3 border-b border-ink-800 text-[10px] font-black text-ink-700 uppercase tracking-[0.2em]">
                  <span>Öğrenci</span>
                  <span className="hidden sm:block text-center px-4">Menü</span>
                  <span className="text-center px-4">Durum</span>
                  <span className="text-right">İşlem</span>
                </div>
                <div className="divide-y divide-ink-800/40">
                  {filteredStudents.map((s) => (
                    <div key={s.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-0 items-center px-5 py-4 hover:bg-ink-800/30 transition-colors cursor-pointer group" onClick={() => setSelectedStudent(s)}>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 bg-red-600/15 border border-red-600/15 rounded-xl flex items-center justify-center text-red-400 font-bold heading-display text-sm flex-shrink-0">
                          {s.full_name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-white font-semibold text-sm truncate">{s.full_name}</div>
                          <div className="text-ink-600 text-xs truncate">{s.email} · {s.university?.split(' ').slice(0, 2).join(' ')}</div>
                        </div>
                      </div>
                      <div className="hidden sm:flex justify-center px-4">
                        <span className="text-ink-300 text-sm font-bold mono tabular-nums">{s.total_meals_received}</span>
                      </div>
                      <div className="flex justify-center px-4">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                          s.status === 'approved' ? 'bg-green-500/15 text-green-400' :
                          s.status === 'pending' ? 'bg-amber-500/15 text-amber-400' :
                          'bg-red-500/15 text-red-400'
                        }`}>
                          {s.status === 'approved' ? 'Onaylı' : s.status === 'pending' ? 'Bekliyor' : 'Reddedildi'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 justify-end">
                        {s.status === 'pending' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); approveStudent(s.id); }}
                            className="flex items-center gap-1 bg-green-500/12 hover:bg-green-500/22 border border-green-500/25 text-green-400 text-[10px] font-bold px-2.5 py-1.5 rounded-lg transition-all"
                          >
                            <CheckCircle size={10} /> Onayla
                          </button>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); setSelectedStudent(s); }}
                          className="w-8 h-8 bg-ink-800/60 group-hover:bg-ink-700 border border-ink-700 rounded-xl flex items-center justify-center text-ink-500 group-hover:text-white transition-all"
                        >
                          <Eye size={12} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════ DONATIONS ════ */}
        {tab === 'donations' && (
          <div>
            <div className="flex items-center justify-between mb-6 pt-2">
              <div>
                <div className="section-tag mb-2">Bağış Yönetimi</div>
                <h2 className="heading-display text-4xl text-white">BAĞIŞLAR</h2>
              </div>
              <button onClick={loadDonations} disabled={dataLoading} className="flex items-center gap-2 bg-ink-900 hover:bg-ink-800 border border-ink-700 text-ink-300 text-sm font-medium px-4 py-2.5 rounded-xl transition-colors">
                <RefreshCw size={13} className={dataLoading ? 'animate-spin' : ''} />
                Yenile
              </button>
            </div>

            {/* KPI strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Bugün Gelen', value: `${todayDonationAmount.toLocaleString('tr-TR')}₺`, sub: `${todayDonationCount} bağışçı`, icon: Calendar, color: 'green' as const },
                { label: 'Toplam Bağış', value: `${(totalDonationAmount / 1000).toFixed(0)}K₺`, sub: `${totalDonationCount} bağışçı`, icon: DollarSign, color: 'red' as const },
                { label: 'Ort. Bağış', value: `${totalDonationCount > 0 ? Math.round(totalDonationAmount / totalDonationCount).toLocaleString('tr-TR') : 0}₺`, sub: 'kişi başı', icon: TrendingUp, color: 'sky' as const },
                { label: 'Toplam Menü', value: totalMeals.toLocaleString('tr-TR'), sub: 'doyurulan öğrenci', icon: Award, color: 'ink' as const },
              ].map((k) => (
                <StatCard key={k.label} {...k} />
              ))}
            </div>

            <div className="relative mb-5">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-600" />
              <input
                type="text"
                value={donationSearch}
                onChange={(e) => setDonationSearch(e.target.value)}
                placeholder="Bağışçı adı veya e-posta..."
                className="w-full bg-ink-900/80 border border-ink-800 focus:border-red-600 text-white placeholder:text-ink-700 rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition-colors"
              />
            </div>

            {dataLoading ? (
              <div className="flex items-center justify-center py-20"><Loader size={24} className="animate-spin text-red-600" /></div>
            ) : filteredDonations.length === 0 ? (
              <div className="text-center py-20 text-ink-600">
                <Heart size={36} className="mx-auto mb-3 opacity-40" />
                <p>Bağış bulunamadı.</p>
              </div>
            ) : (
              <div className="bg-ink-900 border border-ink-800 rounded-2xl overflow-hidden">
                <div className="grid grid-cols-[1fr_auto_auto_auto] gap-0 px-5 py-3 border-b border-ink-800 text-[10px] font-black text-ink-700 uppercase tracking-[0.2em]">
                  <span>Bağışçı</span>
                  <span className="hidden sm:block text-center px-4">Menü</span>
                  <span className="text-center px-4">Tutar</span>
                  <span className="text-right">Tarih</span>
                </div>
                <div className="divide-y divide-ink-800/40">
                  {filteredDonations.map((d) => (
                    <div key={d.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-0 items-center px-5 py-4 hover:bg-ink-800/30 transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 bg-red-600/12 border border-red-600/15 rounded-xl flex items-center justify-center text-red-500 font-bold heading-display text-sm flex-shrink-0">
                          {(d.donor_name ?? '?').charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <div className="text-white font-semibold text-sm truncate">{d.donor_name ?? 'Anonim'}</div>
                          <div className="text-ink-600 text-xs truncate">{d.donor_email}</div>
                          {d.message && <div className="text-ink-700 text-[10px] truncate italic">"{d.message}"</div>}
                        </div>
                      </div>
                      <div className="hidden sm:flex justify-center px-4">
                        <span className="text-ink-300 text-sm font-bold mono">{d.meal_count}</span>
                      </div>
                      <div className="flex justify-center px-4">
                        <span className="text-red-400 font-black text-sm heading-display tabular-nums">{(d.amount ?? 0).toLocaleString('tr-TR')}₺</span>
                      </div>
                      <div className="text-ink-600 text-[10px] mono text-right">
                        {new Date(d.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}<br />
                        <span className="text-ink-800">{new Date(d.created_at).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="px-5 py-3.5 border-t border-ink-800 flex items-center justify-between bg-ink-950/50">
                  <span className="text-ink-700 text-xs">{filteredDonations.length} bağış gösteriliyor</span>
                  <button className="flex items-center gap-1.5 text-ink-600 hover:text-ink-300 text-xs transition-colors">
                    <Download size={11} /> Dışa Aktar
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ════ SCANNER ════ */}
        {tab === 'scanner' && (
          <div className="max-w-xl mx-auto">
            <div className="mb-8 pt-2">
              <div className="section-tag mb-2">QR Okuyucu</div>
              <h2 className="heading-display text-4xl text-white mb-1">QR TARAYICI</h2>
              <p className="text-ink-500 text-sm">Öğrencinin QR kodunu okutarak yemek verin.</p>
            </div>

            {/* Today counter pill */}
            <div className="flex items-center gap-3 bg-green-500/6 border border-green-500/15 rounded-xl px-5 py-3.5 mb-5">
              <div className="w-8 h-8 bg-green-500/15 border border-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <QrCode size={14} className="text-green-400" />
              </div>
              <div>
                <div className="text-green-400 font-black text-lg heading-display tabular-nums leading-none">{todayQR}</div>
                <div className="text-ink-600 text-[10px]">bugün okutuldu</div>
              </div>
              <div className="flex-1" />
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            </div>

            {scanLoading && (
              <div className="bg-ink-900 border border-ink-800 rounded-2xl p-8 text-center mb-5">
                <Loader size={28} className="animate-spin text-red-600 mx-auto mb-3" />
                <p className="text-ink-400 text-sm">Doğrulanıyor...</p>
              </div>
            )}

            {scanResult && !scanLoading && (
              <div className={`relative rounded-2xl p-6 mb-5 border overflow-hidden ${scanResult.success ? 'bg-green-500/6 border-green-500/20' : 'bg-red-500/6 border-red-500/20'}`}>
                <div className={`absolute top-0 left-0 right-0 h-px ${scanResult.success ? 'bg-gradient-to-r from-transparent via-green-500/40 to-transparent' : 'bg-gradient-to-r from-transparent via-red-500/40 to-transparent'}`} />
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${scanResult.success ? 'bg-green-500/15 border border-green-500/25' : 'bg-red-500/10 border border-red-500/20'}`}>
                    {scanResult.success
                      ? <CheckCircle size={26} className="text-green-400" />
                      : <XCircle size={26} className="text-red-400" />}
                  </div>
                  <div className="flex-1">
                    <div className={`heading-display text-2xl mb-1 ${scanResult.success ? 'text-green-400' : 'text-red-400'}`}>
                      {scanResult.success ? 'BAŞARILI!' : 'BAŞARISIZ'}
                    </div>
                    <p className={`text-sm leading-relaxed ${scanResult.success ? 'text-green-300/80' : 'text-red-300/80'}`}>{scanResult.message}</p>
                    {scanResult.student && (
                      <div className="mt-3.5 bg-black/20 border border-white/5 rounded-xl p-3.5">
                        <div className="text-white font-bold text-sm">{scanResult.student.full_name}</div>
                        <div className="text-ink-400 text-xs mono mt-0.5">{scanResult.student.university} · #{scanResult.student.student_number}</div>
                        <div className="flex items-center gap-3 mt-2 text-[10px]">
                          <span className="text-ink-600">Toplam: <span className="text-ink-300 font-bold">{(scanResult.student.total_meals_received ?? 0) + 1} menü</span></span>
                          <span className="text-ink-700">·</span>
                          <span className="text-green-500 font-semibold">Teslim Edildi</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <button onClick={() => setScanResult(null)} className="mt-4 text-ink-600 hover:text-ink-300 text-xs transition-colors">
                  Yeni tarama yap →
                </button>
              </div>
            )}

            {!scanResult && !scanLoading && <QRScanner onScan={handleScan} />}
          </div>
        )}
      </div>

      {selectedStudent && (
        <StudentModal
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
          onApprove={approveStudent}
          onReject={rejectStudent}
        />
      )}
    </div>
  );
}
