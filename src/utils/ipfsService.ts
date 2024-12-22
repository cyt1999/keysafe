import { PinataSDK } from 'pinata-web3';
import { EncryptedPasswordData } from './types';

/**
 * IPFS服务接口
 */
export interface IPFSService {
  /**
   * 上传加密数据到IPFS
   * @param data - 要上传的加密数据
   * @param userAddress - 用户钱包地址，用于标识文件
   * @returns 返回IPFS的CID和访问URL
   */
  uploadData(data: EncryptedPasswordData, userAddress: string): Promise<{
    cid: string;
    url: string;
  }>;

  /**
   * 从IPFS下载加密数据
   * @param cid - IPFS内容标识符
   */
  downloadData(cid: string): Promise<EncryptedPasswordData>;

  /**
   * 获取用户最新的数据CID
   * @param userAddress - 用户钱包地址
   * @returns 返回最新的CID，如果没有则返回null
   */
  getLatestUserCid(userAddress: string): Promise<string | null>;
}

/**
 * IPFS服务Pinata实现
 */
export class IPFSServiceImpl implements IPFSService {
  private pinata: PinataSDK;
  
  constructor() {
    // 初始化Pinata SDK
    const pinataJwt = process.env.NEXT_PUBLIC_PINATA_JWT;
    const pinataGateway = process.env.NEXT_PUBLIC_GATEWAY_URL;

    if (!pinataJwt || !pinataGateway) {
      throw new Error('Pinata配置缺失');
    }

    this.pinata = new PinataSDK({
      pinataJwt,
      pinataGateway
    });
  }

  /**
   * 上传加密数据到IPFS
   * 使用Pinata的文件管理功能，添加用户地址作为元数据
   */
  async uploadData(data: EncryptedPasswordData, userAddress: string) {
    try {
      // 将数据转换为Blob
      const jsonString = JSON.stringify(data);
      const blob = new Blob([jsonString], { type: 'application/json' });

      // 创建FormData
      const formData = new FormData();
      formData.append('file', blob, 'password-data.json');

      // 添加元数据
      formData.append('pinataMetadata', JSON.stringify({
        name: `password-data-${userAddress.toLowerCase()}`,
        keyvalues: {
          type: 'password-data',
          userAddress: userAddress.toLowerCase(),
          timestamp: Date.now().toString()
        }
      }));
      
      // 直接使用fetch API上传到Pinata
      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Pinata API error: ${response.status}`);
      }

      const result = await response.json();

      // 获取Gateway URL
      const gatewayUrl = `https://${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${result.IpfsHash}`;

      return {
        cid: result.IpfsHash,
        url: gatewayUrl
      };
    } catch (error) {
      console.error('上传到IPFS失败:', error);
      throw new Error('上传到IPFS失败');
    }
  }

  /**
   * 从IPFS下载加密数据
   * 通过Pinata网关获取数据
   */
  async downloadData(cid: string): Promise<EncryptedPasswordData> {
    try {
      // 通过Pinata网关获取数据URL
      const url = await this.pinata.gateways.convert(cid);
      
      // 获取数据
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('从IPFS下载失败:', error);
      throw new Error('从IPFS下载失败');
    }
  }

  /**
   * 获取用户最新的数据CID
   * 通过Pinata的查询API获取用户最新的文件
   */
  async getLatestUserCid(userAddress: string): Promise<string | null> {
    try {
      // 查询用户的所有文件
      const filters = {
        status: 'pinned',
        metadata: {
          name: `password-data-${userAddress.toLowerCase()}`
        }
      };

      // 使用 fetch 直接调用 Pinata API
      const response = await fetch('https://api.pinata.cloud/data/pinList', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`
        }
      });

      if (!response.ok) {
        throw new Error(`Pinata API error: ${response.status}`);
      }

      const data = await response.json();
      
      // 检查是否有匹配的文件
      const userFiles = data.rows.filter((pin: any) => 
        pin.metadata?.name === `password-data-${userAddress.toLowerCase()}`
      );

      // 按时间戳排序，获取最新的文件
      if (userFiles.length > 0) {
        userFiles.sort((a: any, b: any) => 
          new Date(b.date_pinned).getTime() - new Date(a.date_pinned).getTime()
        );
        return userFiles[0].ipfs_pin_hash;
      }

      return null;
    } catch (error) {
      console.error('获取最新CID失败:', error);
      throw new Error('获取最新CID失败');
    }
  }
} 