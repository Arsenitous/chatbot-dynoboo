/** Hash password menggunakan Web Crypto API (tersedia di semua environment) */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  const hashed = await hashPassword(plain);
  return hashed === hash;
}
