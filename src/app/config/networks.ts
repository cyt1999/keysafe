import { Network } from 'ethers';

// 定义网络信息接口
interface NetworkInfo {
  name: string;    // 网络显示名称
  logo: string;    // 网络logo URL
  color: string;   // 网络标识颜色
}

/**
 * 获取网络详细信息
 * @param network - ethers.js 的 Network 对象
 * @returns NetworkInfo - 包含网络名称、logo和颜色的对象
 */
export const getNetworkInfo = (network: Network): NetworkInfo => {
  // 将网络ID转换为数字
  const chainId = Number(network.chainId);
  
  // 定义支持的网络及其配置信息
  const networks: Record<number, NetworkInfo> = {
    // Ethereum主网
    1: {
      name: 'Ethereum Mainnet',
      logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg',
      color: '#627EEA'
    },
    // Polygon (Matic) 网络
    137: {
      name: 'Polygon',
      logo: 'https://cryptologos.cc/logos/polygon-matic-logo.svg',
      color: '#8247E5'
    },
    // BNB智能链
    56: {
      name: 'BNB Chain',
      logo: 'https://cryptologos.cc/logos/bnb-bnb-logo.svg',
      color: '#F3BA2F'
    },
    // Arbitrum One L2网络
    42161: {
      name: 'Arbitrum One',
      logo: 'https://cryptologos.cc/logos/arbitrum-arb-logo.svg',
      color: '#28A0F0'
    },
    // Optimism L2网络
    10: {
      name: 'Optimism',
      logo: 'https://cryptologos.cc/logos/optimism-ethereum-op-logo.svg',
      color: '#FF0420'
    },
  };

  // 返回匹配的网络信息，如果未找到则返回默认值
  return networks[chainId] || {
    name: network.name,
    logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.svg',
    color: '#627EEA'
  };
}; 