// 認證相關工具函數
import { AuthUser } from '../models/auth.model';

/**
 * 檢查用戶是否已認證
 */
export function isAuthenticated(user: AuthUser | null): boolean {
  return user !== null && !user.isAnonymous;
}

/**
 * 檢查用戶郵件是否已驗證
 */
export function isEmailVerified(user: AuthUser | null): boolean {
  return user !== null && user.emailVerified;
}

/**
 * 獲取用戶顯示名稱
 */
export function getDisplayName(user: AuthUser | null): string {
  if (!user) return '未登入';
  return user.displayName || user.email || '未知用戶';
}

/**
 * 獲取用戶頭像縮寫
 */
export function getUserInitials(user: AuthUser | null): string {
  if (!user) return 'AN';
  const name = user.displayName || user.email || '';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

/**
 * 檢查密碼強度
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} {
  const feedback: string[] = [];
  let score = 0;

  if (password.length < 6) {
    feedback.push('密碼至少需要6個字元');
  } else {
    score += 1;
  }

  if (password.length >= 8) {
    score += 1;
  }

  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('密碼應包含小寫字母');
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('密碼應包含大寫字母');
  }

  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('密碼應包含數字');
  }

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1;
  } else {
    feedback.push('密碼應包含特殊字元');
  }

  return {
    isValid: score >= 3,
    score,
    feedback
  };
}

/**
 * 生成安全的隨機密碼
 */
export function generateSecurePassword(length: number = 12): string {
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  const allChars = lowercase + uppercase + numbers + symbols;
  let password = '';
  
  // 確保至少包含每種類型的字元
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // 填充剩餘長度
  for (let i = 4; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // 打亂字元順序
  return password.split('').sort(() => Math.random() - 0.5).join('');
}