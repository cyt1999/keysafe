import { CryptoUtils } from './cryptoUtils';
import { IPFSService } from './ipfsService';
import { PasswordEntry, EncryptedPasswordData, EncryptedData } from './types';

export class PasswordManager {
  private static readonly DB_NAME = 'keysafe_db';
  private static readonly STORE_NAME = 'passwords';
  private encryptionKey: CryptoKey | null = null;
  private ipfsService: IPFSService;
  private lastSyncCid: string | null = null;

  constructor(ipfsService: IPFSService) {
    this.ipfsService = ipfsService;
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
   */
  async syncFromIPFS(cid: string): Promise<void> {
    if (!this.encryptionKey) {
      throw new Error('加密密钥未设置');
    }

    try {
      // 从IPFS下载数据
      const encryptedData = await this.ipfsService.downloadData(cid);
      
      // 保存到本地数据库
      const db = await this.getDatabase();
      const tx = db.transaction(PasswordManager.STORE_NAME, 'readwrite');
      const store = tx.objectStore(PasswordManager.STORE_NAME);

      await new Promise<void>((resolve, reject) => {
        const request = store.put(encryptedData, 'data');
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });

      this.lastSyncCid = cid;
    } catch (error) {
      console.error('同步IPFS数据失败:', error);
      throw new Error('同步IPFS数据失败');
    }
  }

  /**
   * 同步数据到IPFS
   */
  private async syncToIPFS(encryptedData: EncryptedPasswordData): Promise<string> {
    try {
      // 上传到IPFS
      const cid = await this.ipfsService.uploadData(encryptedData);
      this.lastSyncCid = cid;
      return cid;
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
        getRequest.onsuccess = () => {
          try {
            const existingData: EncryptedPasswordData = getRequest.result || { entries: {}, lastModified: Date.now() };
            
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
} 