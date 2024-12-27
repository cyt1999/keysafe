/**
 * 密码生成器配置接口
 */
export interface PasswordGeneratorConfig {
  length: number;           // 密码长度
  useUppercase: boolean;    // 使用大写字母
  useLowercase: boolean;    // 使用小写字母
  useNumbers: boolean;      // 使用数字
  useSpecial: boolean;      // 使用特殊字符
}

/**
 * 密码生成器工具类
 */
export class PasswordGenerator {
  private static readonly UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  private static readonly LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
  private static readonly NUMBERS = '0123456789';
  private static readonly SPECIAL = '!@#$%^&*()_+-=[]{}|;:,.<>?';

  /**
   * 生成随机密码
   * @param config - 密码生成配置
   * @returns 生成的密码
   */
  static generate(config: PasswordGeneratorConfig): string {
    let charset = '';
    let password = '';

    // 构建字符集
    if (config.useUppercase) charset += this.UPPERCASE;
    if (config.useLowercase) charset += this.LOWERCASE;
    if (config.useNumbers) charset += this.NUMBERS;
    if (config.useSpecial) charset += this.SPECIAL;

    if (!charset) {
      throw new Error('至少需要选择一种字符类型');
    }

    // 确保包含所有选择的字符类型
    if (config.useUppercase) {
      password += this.UPPERCASE[Math.floor(Math.random() * this.UPPERCASE.length)];
    }
    if (config.useLowercase) {
      password += this.LOWERCASE[Math.floor(Math.random() * this.LOWERCASE.length)];
    }
    if (config.useNumbers) {
      password += this.NUMBERS[Math.floor(Math.random() * this.NUMBERS.length)];
    }
    if (config.useSpecial) {
      password += this.SPECIAL[Math.floor(Math.random() * this.SPECIAL.length)];
    }

    // 生成剩余字符
    while (password.length < config.length) {
      const randomChar = charset[Math.floor(Math.random() * charset.length)];
      password += randomChar;
    }

    // 打乱密码字符顺序
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  /**
   * 获取默认配置
   */
  static getDefaultConfig(): PasswordGeneratorConfig {
    return {
      length: 16,
      useUppercase: true,
      useLowercase: true,
      useNumbers: true,
      useSpecial: true,
    };
  }
} 