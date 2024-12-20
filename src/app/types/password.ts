import { ethers } from 'ethers';

/**
 * 密码条目接口
 */
export interface PasswordEntry {
  id: string;
  title: string;
  username: string;
  password: string;
  url?: string;
  notes?: string;
  createdAt?: number;
  updatedAt?: number;
}

/**
 * 密码强度等级
 */
export enum PasswordStrength {
  Weak = 'weak',
  Medium = 'medium',
  Strong = 'strong'
}

/**
 * 密码强度检查结果
 */
export interface PasswordStrengthResult {
  strength: PasswordStrength;
  score: number;  // 0-100
  suggestions: string[];
}

/**
 * 密码管理器配置接口
 */
export interface PasswordManagerConfig {
  sessionDuration: number;    // 会话持续时间（毫秒）
  inactiveTimeout: number;    // 无操作超时时间（毫秒）
} 