import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const BCRYPT_ROUNDS = 10;
const JWT_SECRET =
  process.env.JWT_SECRET ||
  process.env.SESSION_SECRET ||
  'pawty-super-secret-jwt-key-2026-production-ready';

/**
 * Kiểm tra xem chuỗi có phải là bản băm bcrypt hợp lệ hay không ($2a$, $2b$, $2y$)
 */
export function isBcryptHash(str?: string | null): boolean {
  if (!str || typeof str !== 'string') return false;
  return /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/.test(str);
}

/**
 * Băm mật khẩu bằng bcrypt rounds 10
 */
export async function hashPassword(plainText: string): Promise<string> {
  if (!plainText || !plainText.trim()) {
    throw new Error('Mật khẩu không được để trống.');
  }
  return bcrypt.hash(plainText.trim(), BCRYPT_ROUNDS);
}

/**
 * Xác thực mật khẩu:
 * - Từ chối mật khẩu sai, rỗng, khoảng trắng hoặc NULL
 * - Nếu là bản băm bcrypt -> xác minh qua bcrypt.compare
 * - Nếu là mật khẩu văn bản cũ -> xác minh trực tiếp, nếu đúng thì tự động băm và gọi callback onUpgrade để lưu vào DB (tránh băm lại bản băm)
 */
export async function verifyAndUpgradePassword(
  plainText?: string | null,
  storedPassword?: string | null,
  onUpgrade?: (newHash: string) => Promise<void>
): Promise<boolean> {
  const cleanInput = (plainText || '').trim();
  if (!cleanInput) return false;
  if (!storedPassword || !storedPassword.trim()) return false;

  if (isBcryptHash(storedPassword)) {
    return bcrypt.compare(cleanInput, storedPassword);
  }

  // Mật khẩu văn bản cũ
  if (storedPassword === cleanInput) {
    if (onUpgrade) {
      try {
        const upgradedHash = await hashPassword(cleanInput);
        await onUpgrade(upgradedHash);
      } catch (err) {
        console.warn('[AuthCrypto] Lỗi khi nâng cấp mật khẩu sang bản băm bcrypt:', err);
      }
    }
    return true;
  }

  return false;
}

interface TokenPayload {
  userId: string;
  phone?: string;
  iat: number;
  exp: number;
}

function base64UrlEncode(str: string): string {
  return Buffer.from(str, 'utf8')
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
}

/**
 * Tạo token phiên làm việc có chữ ký HMAC-SHA256 (JWT tiêu chuẩn) có thời hạn 30 ngày
 */
export function generateSessionToken(userId: string, phone?: string): string {
  const header = base64UrlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const nowSec = Math.floor(Date.now() / 1000);
  const payload: TokenPayload = {
    userId,
    phone,
    iat: nowSec,
    exp: nowSec + 30 * 24 * 60 * 60, // 30 ngày
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${encodedPayload}`)
    .digest('base64url');

  return `${header}.${encodedPayload}.${signature}`;
}

/**
 * Xác minh tính hợp lệ và chữ ký của token phiên làm việc
 */
export function verifySessionToken(token?: string | null): TokenPayload | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.trim().split('.');
  if (parts.length !== 3) return null;

  const [header, payload, signature] = parts;
  const expectedSig = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${payload}`)
    .digest('base64url');

  try {
    const sigBuf = Buffer.from(signature);
    const expectedBuf = Buffer.from(expectedSig);
    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return null;
    }
  } catch {
    return null;
  }

  try {
    const parsedPayload: TokenPayload = JSON.parse(base64UrlDecode(payload));
    const nowSec = Math.floor(Date.now() / 1000);
    if (parsedPayload.exp && nowSec > parsedPayload.exp) {
      return null; // Token hết hạn
    }
    if (!parsedPayload.userId) {
      return null;
    }
    return parsedPayload;
  } catch {
    return null;
  }
}

/**
 * Trích xuất User ID từ header Authorization: Bearer <token>
 */
export function extractAuthUserId(authHeader?: string | string[]): string | null {
  if (!authHeader || typeof authHeader !== 'string') return null;
  const parts = authHeader.trim().split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') return null;
  const payload = verifySessionToken(parts[1]);
  return payload ? payload.userId : null;
}

/**
 * Whitelist sanitizer cho User profile: loại bỏ triệt để password và hash
 */
export function sanitizeUserOutput<T extends Record<string, any>>(user: T | null | undefined): any {
  if (!user || typeof user !== 'object') return user;
  const { password, ...safeUser } = user;
  return safeUser;
}

/**
 * Đệ quy loại bỏ bất kỳ khóa nào có tên 'password' trong toàn bộ JSON response
 */
export function deepSanitizePasswords(val: any): any {
  if (val === null || val === undefined) return val;
  if (Array.isArray(val)) {
    return val.map(deepSanitizePasswords);
  }
  if (typeof val === 'object' && !(val instanceof Date)) {
    const clean: Record<string, any> = {};
    for (const [k, v] of Object.entries(val)) {
      if (k.toLowerCase() === 'password') {
        continue; // Loại bỏ hoàn toàn trường password
      }
      clean[k] = deepSanitizePasswords(v);
    }
    return clean;
  }
  return val;
}

