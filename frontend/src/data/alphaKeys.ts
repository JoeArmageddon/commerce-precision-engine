// Alpha Access Keys System
// One master key for unlimited access
// Regular ALPHA keys: 20 upload limit per user

export const MASTER_KEY = 'MASTER-KEY-2024-UNLIMITED' as const;

export const ALPHA_KEYS = [
  'ALPHA-01-K9M2-P8LQ',
  'ALPHA-02-X4N7-J3RT',
  'ALPHA-03-H2W5-V9YD',
  'ALPHA-04-B6K1-M4PC',
  'ALPHA-05-Q9F3-Z8XA',
  'ALPHA-06-L5S7-E2VN',
  'ALPHA-07-G8H4-T1BM',
  'ALPHA-08-U3J9-C6WK',
  'ALPHA-09-D2L8-R5YP',
  'ALPHA-10-A7N4-F9ZQ',
  'ALPHA-11-P1K6-H3XM',
  'ALPHA-12-Y4V9-W2LC',
  'ALPHA-13-S8B3-J7NR',
  'ALPHA-14-E5G1-T6YD',
  'ALPHA-15-M9Q2-K4PA',
  'ALPHA-16-C3H8-X5VZ',
  'ALPHA-17-W6F4-B9LS',
  'ALPHA-18-R2T7-N1JG',
  'ALPHA-19-Z8M5-D3YQ',
  'ALPHA-20-K4P9-C6HX',
  'ALPHA-21-V1L3-W7RA',
  'ALPHA-22-Y9S2-E8NB',
  'ALPHA-23-F6X4-G1TK',
  'ALPHA-24-H3Z7-Q5MC',
  'ALPHA-25-B8J1-P9VD',
  'ALPHA-26-L2R6-K3YF',
  'ALPHA-27-N9W4-A7SQ',
  'ALPHA-28-T5H8-Z2LP',
  'ALPHA-29-D1G3-X6NM',
  'ALPHA-30-U7C9-B4JK',
  'ALPHA-31-E2V5-R8WQ',
  'ALPHA-32-M6L1-Y9TF',
  'ALPHA-33-Q3P7-H2ZX',
  'ALPHA-34-S9A4-K5ND',
  'ALPHA-35-J8E2-C7VM',
  'ALPHA-36-G1Y6-W3RQ',
  'ALPHA-37-X4B9-L8SP',
  'ALPHA-38-Z7T2-F1HA',
  'ALPHA-39-C5N3-J9KD',
  'ALPHA-40-W8M6-U4YG',
  'ALPHA-41-A3Q7-P2RV',
  'ALPHA-42-R9L1-E5ZC',
  'ALPHA-43-H2S8-T6JB',
  'ALPHA-44-V4X9-N3WK',
  'ALPHA-45-K7D1-G8MQ',
  'ALPHA-46-Y5P2-B4LF',
  'ALPHA-47-F9H3-X7NA',
  'ALPHA-48-N6T4-Z1CS',
  'ALPHA-49-L8J5-V9YR',
  'ALPHA-50-P3E7-W2DK',
] as const;

// Storage key for tracking used alpha keys
const USED_KEYS_STORAGE = 'alpha_used_keys';
const USER_STORAGE = 'alpha_current_user';

interface UsedKeyInfo {
  key: string;
  usedAt: string;
  userId: string;
}

interface UserData {
  userId: string;
  key: string;
  isMaster: boolean;
  uploadCount: number;
  maxUploads: number;
  createdAt: string;
}

const MAX_UPLOADS_REGULAR = 20;
const MAX_UPLOADS_MASTER = Infinity;

export function isMasterKey(key: string): boolean {
  return key.trim().toUpperCase() === MASTER_KEY;
}

export function isValidAlphaKey(key: string): boolean {
  const normalized = key.trim().toUpperCase();
  return normalized === MASTER_KEY || ALPHA_KEYS.includes(normalized as any);
}

export function getUsedAlphaKeys(): UsedKeyInfo[] {
  const stored = localStorage.getItem(USED_KEYS_STORAGE);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [];
    }
  }
  return [];
}

export function isAlphaKeyUsed(key: string): boolean {
  const normalized = key.trim().toUpperCase();
  const usedKeys = getUsedAlphaKeys();
  return usedKeys.some(u => u.key === normalized);
}

export function markAlphaKeyAsUsed(key: string, userId: string): void {
  const normalized = key.trim().toUpperCase();
  const usedKeys = getUsedAlphaKeys();
  
  if (!usedKeys.some(u => u.key === normalized)) {
    usedKeys.push({
      key: normalized,
      usedAt: new Date().toISOString(),
      userId,
    });
    localStorage.setItem(USED_KEYS_STORAGE, JSON.stringify(usedKeys));
  }
}

export function createUserData(key: string, userId: string): UserData {
  const isMaster = isMasterKey(key);
  const userData: UserData = {
    userId,
    key: key.trim().toUpperCase(),
    isMaster,
    uploadCount: 0,
    maxUploads: isMaster ? MAX_UPLOADS_MASTER : MAX_UPLOADS_REGULAR,
    createdAt: new Date().toISOString(),
  };
  localStorage.setItem(USER_STORAGE, JSON.stringify(userData));
  return userData;
}

export function getCurrentUser(): UserData | null {
  const stored = localStorage.getItem(USER_STORAGE);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
}

export function incrementUploadCount(): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  
  if (user.isMaster) return true;
  
  if (user.uploadCount >= user.maxUploads) {
    return false;
  }
  
  user.uploadCount += 1;
  localStorage.setItem(USER_STORAGE, JSON.stringify(user));
  return true;
}

export function getUploadsRemaining(): number {
  const user = getCurrentUser();
  if (!user) return 0;
  if (user.isMaster) return Infinity;
  return Math.max(0, user.maxUploads - user.uploadCount);
}

export function getRemainingKeysCount(): number {
  const usedKeys = getUsedAlphaKeys();
  return ALPHA_KEYS.length - usedKeys.length;
}

export function validateAndUseAlphaKey(key: string, userId: string): { 
  valid: boolean; 
  error?: string;
  isMaster?: boolean;
} {
  const normalized = key.trim().toUpperCase();
  
  if (!isValidAlphaKey(normalized)) {
    return { 
      valid: false, 
      error: 'Invalid alpha key. Please check and try again.' 
    };
  }
  
  if (isAlphaKeyUsed(normalized) && !isMasterKey(normalized)) {
    return { 
      valid: false, 
      error: 'This alpha key has already been used. Each key can only be used once.' 
    };
  }
  
  markAlphaKeyAsUsed(normalized, userId);
  createUserData(normalized, userId);
  
  return { 
    valid: true, 
    isMaster: isMasterKey(normalized) 
  };
}

export function logoutUser(): void {
  localStorage.removeItem(USER_STORAGE);
}

export function resetUsedAlphaKeys(): void {
  localStorage.removeItem(USED_KEYS_STORAGE);
  localStorage.removeItem(USER_STORAGE);
}

// Re-export types and constants
export { MAX_UPLOADS_REGULAR };
export type { UserData };
