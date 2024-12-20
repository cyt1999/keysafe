import { User } from '../types/user';
import { CryptoUtils } from '../utils/crypto';

/**
 * 用户管理器类
 */
export class UserManager {
  private static instance: UserManager;
  private readonly STORAGE_KEY = 'keysafe_users';
  private readonly TEST_USER_ADDRESS = '0xC9301f9f0FDbe4FFfB25AA2283eCE76e7544501F';

  private constructor() {
    // 确保在客户端环境下初始化测试用户
    if (typeof window !== 'undefined') {
      this.initializeTestUser();
    }
  }

  public static getInstance(): UserManager {
    if (!UserManager.instance) {
      UserManager.instance = new UserManager();
    }
    return UserManager.instance;
  }

  private initializeTestUser(): void {
    const users = this.getAllUsers();
    if (!users[this.TEST_USER_ADDRESS]) {
      // 生成随机头像和昵称
      const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${this.TEST_USER_ADDRESS}`;
      const nickname = `User${Math.floor(Math.random() * 10000)}`;

      // 创建测试用户
      const testUser: User = {
        address: this.TEST_USER_ADDRESS,
        avatar,
        nickname,
        hasSetupPassword: false
      };

      // 保存用户信息
      this.saveUser(testUser);
    }
  }

  private getAllUsers(): Record<string, User> {
    if (typeof window === 'undefined') {
      return {};
    }
    const usersJson = localStorage.getItem(this.STORAGE_KEY);
    const users = usersJson ? JSON.parse(usersJson) : {};
    return users;
  }

  private saveUser(user: User): void {
    if (typeof window === 'undefined') {
      return;
    }
    const users = this.getAllUsers();
    users[user.address] = user;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
  }

  public getUser(address: string): User | null {
    const users = this.getAllUsers();
    return users[address] || null;
  }

  public createPassword(address: string, masterPassword: string): void {
    if (typeof window === 'undefined') {
      return;
    }

    const user = this.getUser(address);
    if (!user) {
      throw new Error('用户不存在');
    }

    // 生成盐值和验证数据
    const { salt, verificationData } = CryptoUtils.createMasterPasswordVerification(masterPassword);

    // 更新用户信息
    user.hasSetupPassword = true;
    user.passwordSalt = salt;
    user.passwordVerification = verificationData;

    // 保存更新后的用户信息
    this.saveUser(user);
  }

  public verifyPassword(address: string, masterPassword: string): boolean {
    const user = this.getUser(address);
    if (!user || !user.hasSetupPassword || !user.passwordSalt || !user.passwordVerification) {
      return false;
    }

    console.log('Verifying password for address:', address);
    console.log('Verifying with data:', {
      salt: user.passwordSalt,
      verification: user.passwordVerification
    });

    return CryptoUtils.verifyMasterPassword(
      masterPassword,
      user.passwordSalt,
      user.passwordVerification
    );
  }
} 