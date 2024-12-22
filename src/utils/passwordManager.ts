import { CryptoUtils } from './cryptoUtils';
import { IPFSService } from './ipfsService';
import { PasswordEntry, EncryptedPasswordData, EncryptedData } from './types';

/**
 * 同步事件类型
 */
export interface SyncEvent {
  type: 'sync-completed' | 'sync-error';
  detail: {
    success?: boolean;
    error?: Error;
    dataChanged?: boolean;
  };
}

/**
 * 密码管理器类
 */
export class PasswordManager {
  private static readonly DB_NAME = 'keysafe_db';
  private static readonly STORE_NAME = 'passwords';
  private static readonly SYNC_INTERVAL = 5 * 60 * 1000; // 5分钟同步一次

  private encryptionKey: CryptoKey | null = null;
  private ipfsService: IPFSService;
  private lastSyncCid: string | null = null;
  private userAddress: string;
  private syncInterval: NodeJS.Timeout | null = null;
  private eventListeners: Map<string, ((event: SyncEvent) => void)[]> = new Map();

  constructor(ipfsService: IPFSService, userAddress: string) {
    this.ipfsService = ipfsService;
    this.userAddress = userAddress;
    this.initDatabase();
  }

  /**
   * 初始化IndexedDB数据库
   */
  private async initDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(PasswordManager.DB_NAME, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(PasswordManager.STORE_NAME)) {
          db.createObjectStore(PasswordManager.STORE_NAME);
        }
      };
    });
  }

  /**
   * 设置加密密钥
   */
  async setEncryptionKey(walletSignature: string, masterKey: Buffer): Promise<void> {
    this.encryptionKey = await CryptoUtils.deriveEncryptionKey(walletSignature, masterKey);
  }

  /**
   * 获取数据库连接
   */
  private getDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(PasswordManager.DB_NAME);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  /**
   * 从IPFS同步数据
   * 如果不提供CID，则自动获取用户最新的数据
   */
  async syncFromIPFS(cid?: string): Promise<void> {
    if (!this.encryptionKey) {
      throw new Error('加密密钥未设置');
    }

    try {
      // 如果没有提供CID，获取用户最新的数据CID
      const targetCid = cid || await this.ipfsService.getLatestUserCid(this.userAddress);
      if (!targetCid) {
        console.log('没有找到用户数据');
        return;
      }

      // 从IPFS下载数据
      const encryptedData = await this.ipfsService.downloadData(targetCid);
      
      // 保存到本地数据库
      const db = await this.getDatabase();
      const tx = db.transaction(PasswordManager.STORE_NAME, 'readwrite');
      const store = tx.objectStore(PasswordManager.STORE_NAME);

      await new Promise<void>((resolve, reject) => {
        const request = store.put(encryptedData, 'data');
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });

      this.lastSyncCid = targetCid;
    } catch (error) {
      console.error('同步IPFS数据失败:', error);
      throw new Error('同步IPFS数据失败');
    }
  }

  /**
   * 同步数据到IPFS
   * 使用用户地址作为标识上传数据
   */
  private async syncToIPFS(encryptedData: EncryptedPasswordData): Promise<string> {
    try {
      // 上传到IPFS，并添加用户地址作为标识
      const result = await this.ipfsService.uploadData(encryptedData, this.userAddress);
      this.lastSyncCid = result.cid;
      return result.cid;
    } catch (error) {
      console.error('同步到IPFS失败:', error);
      throw new Error('同步到IPFS失败');
    }
  }

  /**
   * 加密并保存密码条目
   */
  async saveEntry(entry: PasswordEntry): Promise<void> {
    if (!this.encryptionKey) {
      throw new Error('加密密钥未设置');
    }

    let encryptedEntry: EncryptedData;
    try {
      // 加密新条目
      encryptedEntry = await CryptoUtils.encrypt(
        JSON.stringify(entry),
        this.encryptionKey
      );
    } catch (error) {
      console.error('加密密码失败:', error);
      throw new Error('加密密码失败');
    }

    try {
      const db = await this.getDatabase();
      const tx = db.transaction(PasswordManager.STORE_NAME, 'readwrite');
      const store = tx.objectStore(PasswordManager.STORE_NAME);

      // 将所有数据库操作包装在一个Promise中
      await new Promise<void>((resolve, reject) => {
        // 获取现有数据
        const getRequest = store.get('data');
        
        getRequest.onerror = () => reject(getRequest.error);
        getRequest.onsuccess = async () => {
          try {
            const existingData: EncryptedPasswordData = getRequest.result || { 
              entries: {}, 
              lastModified: Date.now() 
            };
            
            // 更新数据结构
            const newData: EncryptedPasswordData = {
              entries: {
                ...existingData.entries,
                [entry.id]: encryptedEntry
              },
              lastModified: Date.now()
            };

            // 保存到数据库
            const putRequest = store.put(newData, 'data');
            putRequest.onerror = () => reject(putRequest.error);
            putRequest.onsuccess = () => resolve();
          } catch (error) {
            reject(error);
          }
        };
      });

      // 等待事务完成
      await new Promise<void>((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(new Error('事务已中止'));
      });

      // 同步到IPFS
      try {
        const result = await this.syncToIPFS(await this.getLocalData() as EncryptedPasswordData);
        this.emit({
          type: 'sync-completed',
          detail: { 
            success: true,
            dataChanged: true
          }
        });
      } catch (error) {
        console.error('同步到IPFS失败:', error);
        this.emit({
          type: 'sync-error',
          detail: { error: error instanceof Error ? error : new Error('同步到IPFS失败') }
        });
        // 不抛出错误，因为本地保存已经成功
      }

    } catch (error) {
      console.error('保存密码失败:', error);
      throw new Error('保存密码失败');
    }
  }

  /**
   * 获取所有密码条目
   */
  async getAllEntries(): Promise<PasswordEntry[]> {
    if (!this.encryptionKey) {
      throw new Error('加密密钥未设置');
    }

    const db = await this.getDatabase();
    const tx = db.transaction(PasswordManager.STORE_NAME, 'readonly');
    const store = tx.objectStore(PasswordManager.STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.get('data');
      
      request.onerror = () => reject(request.error);
      request.onsuccess = async () => {
        const encryptedData: EncryptedPasswordData = request.result;
        if (!encryptedData) {
          resolve([]);
          return;
        }

        try {
          const entries = await Promise.all(
            Object.entries(encryptedData.entries).map(async ([id, encrypted]) => {
              const decrypted = await CryptoUtils.decrypt(encrypted, this.encryptionKey!);
              return JSON.parse(decrypted) as PasswordEntry;
            })
          );
          resolve(entries);
        } catch (error) {
          reject(error);
        }
      };
    });
  }

  /**
   * 删除密码条目
   */
  async deleteEntry(id: string): Promise<void> {
    if (!this.encryptionKey) {
      throw new Error('加密密钥未设置');
    }

    const db = await this.getDatabase();
    const tx = db.transaction(PasswordManager.STORE_NAME, 'readwrite');
    const store = tx.objectStore(PasswordManager.STORE_NAME);

    return new Promise((resolve, reject) => {
      const getRequest = store.get('data');
      
      getRequest.onerror = () => reject(getRequest.error);
      getRequest.onsuccess = async () => {
        const encryptedData: EncryptedPasswordData = getRequest.result;
        if (!encryptedData) {
          resolve();
          return;
        }

        // 删除指定条目
        const { [id]: removed, ...remainingEntries } = encryptedData.entries;
        
        const newData: EncryptedPasswordData = {
          entries: remainingEntries,
          lastModified: Date.now()
        };

        try {
          const putRequest = store.put(newData, 'data');
          await new Promise<void>((resolve, reject) => {
            putRequest.onerror = () => reject(putRequest.error);
            putRequest.onsuccess = () => resolve();
          });

          // 同步到IPFS
          await this.syncToIPFS(newData);
          resolve();
        } catch (error) {
          reject(error);
        }
      };
    });
  }

  /**
   * 清除所有数据
   */
  async clearAllData(): Promise<void> {
    const db = await this.getDatabase();
    const tx = db.transaction(PasswordManager.STORE_NAME, 'readwrite');
    const store = tx.objectStore(PasswordManager.STORE_NAME);

    await new Promise<void>((resolve, reject) => {
      const request = store.clear();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });

    // 清除IPFS同步状态
    this.lastSyncCid = null;
  }

  /**
   * 获取最后同步的CID
   */
  getLastSyncCid(): string | null {
    return this.lastSyncCid;
  }

  /**
   * 启动自动同步
   */
  startAutoSync(): void {
    if (this.syncInterval) {
      return;
    }
    
    // 立即进行一次同步
    this.checkAndSync();
    
    // 设置定期同步
    this.syncInterval = setInterval(() => {
      this.checkAndSync();
    }, PasswordManager.SYNC_INTERVAL);
  }

  /**
   * 停止自动同步
   */
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * 检查并同步数据
   */
  private async checkAndSync(): Promise<void> {
    if (!this.encryptionKey) {
      this.emit({
        type: 'sync-error',
        detail: { error: new Error('加密密钥未设置') }
      });
      return;
    }

    try {
      // 获取最新的CID
      const latestCid = await this.ipfsService.getLatestUserCid(this.userAddress);
      
      // 如果没有最新数据，或者CID相同，不需要同步
      if (!latestCid || latestCid === this.lastSyncCid) {
        return;
      }

      // 获取本地数据的最后修改时间
      const localData = await this.getLocalData();
      const remoteData = await this.ipfsService.downloadData(latestCid);

      // 如果远程数据比本地数据新，则同步
      if (!localData || remoteData.lastModified > localData.lastModified) {
        await this.syncFromIPFS(latestCid);
        this.emit({
          type: 'sync-completed',
          detail: { success: true }
        });
      }
    } catch (error) {
      console.error('自动同步失败:', error);
      this.emit({
        type: 'sync-error',
        detail: { error: error instanceof Error ? error : new Error('同步失败') }
      });
    }
  }

  /**
   * 获取本地数据
   */
  private async getLocalData(): Promise<EncryptedPasswordData | null> {
    const db = await this.getDatabase();
    const tx = db.transaction(PasswordManager.STORE_NAME, 'readonly');
    const store = tx.objectStore(PasswordManager.STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = store.get('data');
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  /**
   * 添加事件监听器
   */
  addEventListener(type: SyncEvent['type'], listener: (event: SyncEvent) => void): void {
    const listeners = this.eventListeners.get(type) || [];
    listeners.push(listener);
    this.eventListeners.set(type, listeners);
  }

  /**
   * 移除事件监听器
   */
  removeEventListener(type: SyncEvent['type'], listener: (event: SyncEvent) => void): void {
    const listeners = this.eventListeners.get(type);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * 触发事件
   */
  private emit(event: SyncEvent): void {
    const listeners = this.eventListeners.get(event.type) || [];
    listeners.forEach(listener => listener(event));
  }

  /**
   * 手动同步数据
   * 检查并同步最新数据，返回是否有数据更新
   */
  async manualSync(): Promise<boolean> {
    if (!this.encryptionKey) {
      this.emit({
        type: 'sync-error',
        detail: { error: new Error('加密密钥未设置') }
      });
      return false;
    }

    try {
      // 获取最新的CID
      const latestCid = await this.ipfsService.getLatestUserCid(this.userAddress);
      
      // 如果没有最新数据，或者CID相同，不需要同步
      if (!latestCid || latestCid === this.lastSyncCid) {
        this.emit({
          type: 'sync-completed',
          detail: { 
            success: true,
            dataChanged: false
          }
        });
        return false;
      }

      // 获取本地数据的最后修改时间
      const localData = await this.getLocalData();
      const remoteData = await this.ipfsService.downloadData(latestCid);

      // 如果远程数据比本地数据新，则同步
      if (!localData || remoteData.lastModified > localData.lastModified) {
        await this.syncFromIPFS(latestCid);
        this.emit({
          type: 'sync-completed',
          detail: { 
            success: true,
            dataChanged: true
          }
        });
        return true;
      }

      this.emit({
        type: 'sync-completed',
        detail: { 
          success: true,
          dataChanged: false
        }
      });
      return false;
    } catch (error) {
      console.error('手动同步失败:', error);
      this.emit({
        type: 'sync-error',
        detail: { error: error instanceof Error ? error : new Error('同步失败') }
      });
      throw error;
    }
  }
} 