import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export type Student = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  university: string;
  student_number: string;
  department: string;
  document_url: string;
  status: 'pending' | 'approved' | 'rejected';
  approved_at: string | null;
  approved_by: string;
  rejection_reason: string;
  daily_limit: number;
  weekly_limit: number;
  total_meals_received: number;
  created_at: string;
};

export type QRToken = {
  id: string;
  student_id: string;
  token: string;
  status: 'active' | 'used' | 'expired';
  expires_at: string;
  used_at: string | null;
  used_by_admin: string;
  meal_count: number;
  device_fingerprint: string;
  ip_address: string;
  created_at: string;
};

export type Donation = {
  id: string;
  donor_name: string;
  donor_email: string;
  message: string;
  meal_count: number;
  amount: number;
  status: string;
  is_recurring: boolean;
  created_at: string;
};

export type MealRedemption = {
  id: string;
  student_id: string;
  qr_token_id: string | null;
  admin_username: string;
  meal_count: number;
  note: string;
  redeemed_at: string;
};

export type GlobalStats = {
  id: number;
  today_meals: number;
  today_date: string;
  total_meals_all_time: number;
  total_donors: number;
  total_students_approved: number;
  waiting_students: number;
  updated_at: string;
};

// Device fingerprint: basit tarayıcı parmak izi
export function getDeviceFingerprint(): string {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('fp', 2, 2);
  }
  const parts = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    canvas.toDataURL(),
  ];
  let hash = 0;
  const str = parts.join('|');
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}
