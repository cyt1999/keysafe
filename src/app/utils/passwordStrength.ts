import { PasswordStrength, PasswordStrengthResult } from '../types/password';

/**
 * 密码强度检查工具类
 */
export class PasswordStrengthChecker {
  /**
   * 检查密码强度
   * @param password - 要检查的密码
   * @returns 密码强度检查结果
   */
  static check(password: string): PasswordStrengthResult {
    const score = this.calculateScore(password);
    const suggestions = this.getSuggestions(password);
    
    let strength: PasswordStrength;
    if (score < 50) {
      strength = PasswordStrength.Weak;
    } else if (score < 80) {
      strength = PasswordStrength.Medium;
    } else {
      strength = PasswordStrength.Strong;
    }

    return { strength, score, suggestions };
  }

  /**
   * 计算密码得分
   */
  private static calculateScore(password: string): number {
    let score = 0;
    
    // 长度检查
    score += Math.min(password.length * 4, 40);
    
    // 字符种类检查
    if (/[A-Z]/.test(password)) score += 15;
    if (/[a-z]/.test(password)) score += 15;
    if (/[0-9]/.test(password)) score += 15;
    if (/[^A-Za-z0-9]/.test(password)) score += 15;
    
    // 复杂性检查
    const uniqueChars = new Set(password).size;
    score += Math.min(uniqueChars * 2, 15);
    
    return Math.min(score, 100);
  }

  /**
   * 获取改进建议
   */
  private static getSuggestions(password: string): string[] {
    const suggestions: string[] = [];
    
    if (password.length < 8) {
      suggestions.push('密码长度建议至少8位');
    }
    if (!/[A-Z]/.test(password)) {
      suggestions.push('建议包含大写字母');
    }
    if (!/[a-z]/.test(password)) {
      suggestions.push('建议包含小写字母');
    }
    if (!/[0-9]/.test(password)) {
      suggestions.push('建议包含数字');
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      suggestions.push('建议包含特殊字符');
    }
    if (new Set(password).size < password.length * 0.7) {
      suggestions.push('建议避免重复字符');
    }
    
    return suggestions;
  }
} 