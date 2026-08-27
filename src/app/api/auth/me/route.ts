import { NextResponse } from "next/server";
import { getCurrentAppUser } from "@/lib/auth";

// GET /api/auth/me — kembalikan role user yang sedang login.
// Dipakai oleh halaman /masuk untuk menentukan redirect setelah login.
export async function GET() {
  const user = await getCurrentAppUser();
  if (!user) return NextResponse.json({ error: "Belum login." }, { status: 401 });
  return NextResponse.json({ role: user.role, id: user.id });
}
