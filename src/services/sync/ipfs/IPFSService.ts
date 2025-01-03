/**
 * IPFS服务接口
 */
export interface IPFSService {
  /**
   * 上传加密数据到IPFS
   * @param data - 要上传的数据
   * @param userAddress - 用户钱包地址，用于标识文件
   * @returns 返回IPFS的CID和访问URL
   */
  uploadData(data: any, userAddress: string): Promise<{
    cid: string;
    url: string;
  }>;

  /**
   * 从IPFS下载数据
   * @param cid - IPFS内容标识符
   */
  downloadData(cid: string): Promise<any>;
}

/**
 * IPFS服务Pinata实现
 */
export class IPFSServiceImpl implements IPFSService {
  private pinataJwt: string;
  private pinataGateway: string;
  
  constructor() {
    // 初始化Pinata配置
    const pinataJwt = process.env.PINATA_JWT;
    const pinataGateway = process.env.PINATA_GATEWAY_URL;

    if (!pinataJwt || !pinataGateway) {
      throw new Error('Pinata配置缺失');
    }

    this.pinataJwt = pinataJwt;
    this.pinataGateway = pinataGateway;
  }

  /**
   * 上传数据到IPFS
   */
  async uploadData(data: any, userAddress: string) {
    try {
      // 将数据转换为Blob
      const jsonString = JSON.stringify(data);
      const blob = new Blob([jsonString], { type: 'application/json' });

      // 创建FormData
      const formData = new FormData();
      formData.append('file', blob, 'data.json');

      // 添加元数据
      formData.append('pinataMetadata', JSON.stringify({
        name: `data-${userAddress.toLowerCase()}`,
        keyvalues: {
          userAddress: userAddress.toLowerCase(),
          timestamp: Date.now().toString()
        }
      }));
      
      // 上传到Pinata
      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.pinataJwt}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Pinata API error: ${response.status}`);
      }

      const result = await response.json();

      // 获取Gateway URL
      const gatewayUrl = `https://${this.pinataGateway}/ipfs/${result.IpfsHash}`;

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
   * 从IPFS下载数据
   */
  async downloadData(cid: string): Promise<any> {
    try {
      // 通过Gateway获取数据
      const url = `https://${this.pinataGateway}/ipfs/${cid}`;
      
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
} 