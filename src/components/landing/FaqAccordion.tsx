"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "Apakah anak perlu akun sendiri?",
    a: "Ya, tapi ortu yang membuatkannya lewat Master Anggota (email + password). Anak tidak perlu HP atau email pribadi — cukup diberi tahu kredensialnya oleh orang tua.",
  },
  {
    q: "Bagaimana kalau anak menandai misi padahal belum dikerjakan?",
    a: "Setiap misi bisa diberi tanda wajib bukti foto. Misi seperti itu tidak langsung menambah bintang — masuk dulu ke antrean persetujuan orang tua.",
  },
  {
    q: "Bisa dipakai untuk beberapa anak sekaligus?",
    a: "Bisa. Satu akun orang tua menaungi banyak anak, dan setiap misi bisa diarahkan hanya ke anak tertentu. Laporan tetap terpisah per anak.",
  },
  {
    q: "Apakah Ayah dan Bunda bisa punya akses masing-masing?",
    a: "Ya. Ada tiga peran: Ayah, Bunda, dan Wali. Wali hanya bisa menyetujui bukti misi, tidak bisa mengubah master misi, hadiah, atau anggota.",
  },
  {
    q: "Hadiahnya harus barang?",
    a: "Tidak. Sebagian besar keluarga memakai hadiah pengalaman seperti main sepeda ke taman atau nonton film bersama. Katalog hadiah sepenuhnya Anda tentukan.",
  },
  {
    q: "Bagaimana dengan data anak saya?",
    a: "Data hanya dipakai untuk menampilkan laporan keluarga Anda, tidak dibagikan ke pihak ketiga, dan bisa dihapus permanen kapan pun dari pengaturan akun.",
  },
];

export function FaqAccordion() {
  const [open, setOpen] = useState<number>(0);

  return (
    <div className="space-y-3">
      {FAQS.map((faq, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl overflow-hidden"
          style={{ border: "2px solid #E1EAF2" }}
        >
          <button
            onClick={() => setOpen(open === i ? -1 : i)}
            className="w-full flex items-center justify-between px-5 py-4 text-left"
          >
            <span
              className="font-bold text-sm pr-4"
              style={{ color: "#17395B", fontFamily: "var(--font-body)" }}
            >
              {faq.q}
            </span>
            <span
              className="flex-shrink-0 transition-transform duration-200"
              style={{
                color: "#3EA8DE",
                transform: open === i ? "rotate(45deg)" : "rotate(0deg)",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 5v14M5 12h14"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </button>
          {open === i && (
            <div className="px-5 pb-5">
              <p className="text-sm leading-relaxed" style={{ color: "#6B87A3" }}>
                {faq.a}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
