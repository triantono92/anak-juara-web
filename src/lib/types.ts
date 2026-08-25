// Domain types mirroring `supabase/schema.sql`.
// `Database` is a minimal hand-written type map (not generated via the
// Supabase CLI). Once the project is linked, prefer regenerating this with
// `supabase gen types typescript` and replacing this file.

export type Role = "ortu" | "anak";
export type VerifyType = "foto" | "rekam" | "kuis";
export type SubmissionStatus = "pending" | "approved" | "rejected" | "auto_done";
export type RewardCategory = "Uang" | "Privilege" | "Barang";

export interface Family {
  id: string;
  name: string;
  created_at: string;
}

export interface AppUser {
  id: string;
  family_id: string;
  name: string;
  role: Role;
  username: string;
  auth_method: "password" | "pin";
  avatar_color: string;
  class_info: string | null;
  stars: number;
  created_at: string;
}

export interface Mission {
  id: string;
  family_id: string;
  name: string;
  icon: string;
  verify_type: VerifyType;
  days: number[]; // 0=Senin..6=Minggu
  assigned_to: string[]; // user_id[]
  stars: number;
  deadline_time: string; // "HH:MM"
  active: boolean;
  created_at: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface Submission {
  id: string;
  mission_id: string;
  child_id: string;
  date: string; // YYYY-MM-DD
  verify_type: VerifyType;
  status: SubmissionStatus;
  photo_url: string | null;
  audio_url: string | null;
  quiz_json: QuizQuestion[] | null;
  score: number | null;
  answers_correct: boolean[] | null;
  stars_awarded: number;
  reviewed_by: string | null;
  timestamp: string;
}

export interface Reward {
  id: string;
  family_id: string;
  name: string;
  icon: string;
  category: RewardCategory;
  stars_cost: number;
  rupiah_amount: number | null;
  assigned_to: "all" | string;
  active: boolean;
}

export interface Redemption {
  id: string;
  child_id: string;
  reward_id: string;
  reward_name: string;
  stars_spent: number;
  timestamp: string;
}

// Bare-bones Database type so `@supabase/ssr` generics have something to
// check against. Extend with `Row`/`Insert`/`Update` per table as the app
// grows, or swap this out entirely for a CLI-generated types file.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Database = any;
