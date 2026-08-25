import { createHmac, createHash, timingSafeEqual } from "crypto";

export const CHILD_SESSION_COOKIE = "aj_child_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 hari

interface ChildSessionPayload {
  childId: string;
  familyId: string;
  exp: number; // unix seconds
}

function secret() {
  const s = process.env.CHILD_SESSION_SECRET;
  if (!s) throw new Error("CHILD_SESSION_SECRET belum diset di environment.");
  return s;
}

function base64url(input: Buffer | string) {
  return Buffer.from(input).toString("base64url");
}

// Token sederhana ala JWT tanpa dependency tambahan: base64url(payload).base64url(hmac).
// Cukup untuk sesi PIN anak; TIDAK menggantikan Supabase Auth (dipakai khusus role 'anak').
export function signChildSession(childId: string, familyId: string): string {
  const payload: ChildSessionPayload = {
    childId,
    familyId,
    exp: Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS,
  };
  const payloadB64 = base64url(JSON.stringify(payload));
  const sig = createHmac("sha256", secret()).update(payloadB64).digest();
  return `${payloadB64}.${base64url(sig)}`;
}

export function verifyChildSession(token: string | undefined | null): ChildSessionPayload | null {
  if (!token) return null;
  const [payloadB64, sigB64] = token.split(".");
  if (!payloadB64 || !sigB64) return null;

  const expectedSig = createHmac("sha256", secret()).update(payloadB64).digest();
  const givenSig = Buffer.from(sigB64, "base64url");
  if (expectedSig.length !== givenSig.length || !timingSafeEqual(expectedSig, givenSig)) {
    return null;
  }

  try {
    const payload: ChildSessionPayload = JSON.parse(Buffer.from(payloadB64, "base64url").toString());
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function hashPin(pin: string): string {
  return createHash("sha256").update(pin).digest("hex");
}

export const CHILD_SESSION_MAX_AGE = MAX_AGE_SECONDS;
