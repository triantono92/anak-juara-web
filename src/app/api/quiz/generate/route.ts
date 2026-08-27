import { NextRequest, NextResponse } from "next/server";
import type { QuizQuestion } from "@/lib/types";
import { getCurrentAppUser } from "@/lib/auth";

// POST /api/quiz/generate
// Body: { imageBase64: string, mediaType?: string }
// Memanggil Anthropic API server-side (API key tidak pernah dikirim ke browser).
export async function POST(req: NextRequest) {
  // Harus login sebagai anak atau ortu — cegah penyalahgunaan Anthropic API berbayar.
  const user = await getCurrentAppUser();
  if (!user) {
    return NextResponse.json({ error: "Belum login." }, { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY belum diset di environment server." },
      { status: 500 },
    );
  }

  const { imageBase64, mediaType } = await req.json();
  if (!imageBase64) {
    return NextResponse.json({ error: "imageBase64 wajib diisi." }, { status: 400 });
  }

  // TODO (lihat spesifikasi §6): tambahkan rate limiting per family_id di sini
  // sebelum memanggil Anthropic API, supaya kuota/biaya terkendali.

  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1200,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType || "image/jpeg",
                data: imageBase64,
              },
            },
            {
              type: "text",
              text: 'Ini foto materi pelajaran anak SD. Buat 5 soal pilihan ganda bahasa Indonesia dari materi ini, tiap soal 4 opsi. Balas HANYA dengan JSON array tanpa teks atau markdown lain, format persis: [{"question":"...","options":["...","...","...","..."],"correctIndex":0}]',
            },
          ],
        },
      ],
    }),
  });

  if (!resp.ok) {
    const detail = await resp.text();
    return NextResponse.json(
      { error: "Gagal menghubungi Anthropic API.", detail },
      { status: 502 },
    );
  }

  const data = await resp.json();
  const text = (data.content || [])
    .filter((b: { type: string }) => b.type === "text")
    .map((b: { text: string }) => b.text)
    .join("");

  const clean = text.replace(/```json|```/g, "").trim();

  let quiz: QuizQuestion[];
  try {
    quiz = JSON.parse(clean);
  } catch {
    return NextResponse.json(
      { error: "Respons AI bukan JSON yang valid, coba lagi." },
      { status: 502 },
    );
  }

  if (!Array.isArray(quiz) || quiz.length === 0) {
    return NextResponse.json({ error: "Kuis kosong, coba foto materi lain." }, { status: 502 });
  }

  return NextResponse.json({ quiz });
}
