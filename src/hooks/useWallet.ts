import { useState, useEffect } from 'react';
import { BrowserProvider } from 'ethers';
import { Network } from '@/config/networks';
import { SessionUtils } from '@/utils/sessionUtils';

export function useWallet() {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [network, setNetwork] = useState<Network | null>(null);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);

  const connect = async () => {
    try {
      if (!window.ethereum) {
        throw new Error('请安装 MetaMask');
      }

      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const network = await provider.getNetwork();
      const currentAddress = accounts[0];
      
      // 存储钱包地址到会话
      SessionUtils.setWalletAddress(currentAddress);
      
      setProvider(provider);
      setAddress(currentAddress);
      setNetwork(network.chainId.toString() as Network);
      setIsConnected(true);

      return currentAddress;
    } catch (error) {
      console.error('连接钱包失败:', error);
      throw error;
    }
  };

  const disconnect = () => {
    // 清除会话中的钱包地址
    SessionUtils.clearWalletAddress();
    SessionUtils.clearDataKey();
    
    setProvider(null);
    setAddress(null);
    setNetwork(null);
    setIsConnected(false);
  };

  useEffect(() => {
    // 首先检查 sessionStorage 中是否有钱包地址
    const sessionAddress = SessionUtils.getWalletAddress();
    if (!sessionAddress) {
      disconnect();
      return;
    }

    // 如果有会话中的钱包地址，再检查 MetaMask 状态
    if (window.ethereum) {
      const provider = new BrowserProvider(window.ethereum);
      provider.send('eth_accounts', []).then((accounts) => {
        if (accounts.length > 0 && accounts[0].toLowerCase() === sessionAddress.toLowerCase()) {
          setAddress(accounts[0]);
          setProvider(provider);
          provider.getNetwork().then((network) => {
            setNetwork(network.chainId.toString() as Network);
            setIsConnected(true);
          });
        } else {
          // MetaMask 的地址与会话中的地址不匹配，清除会话
          SessionUtils.clearWalletAddress();
          SessionUtils.clearDataKey();
          disconnect();
        }
      });

      // 监听账户变化
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        const sessionAddress = SessionUtils.getWalletAddress();
        if (accounts.length > 0 && sessionAddress && accounts[0].toLowerCase() === sessionAddress.toLowerCase()) {
          setAddress(accounts[0]);
          setIsConnected(true);
        } else {
          // 账户变化且与会话不匹配，清除会话
          SessionUtils.clearWalletAddress();
          SessionUtils.clearDataKey();
          disconnect();
        }
      });

      // 监听网络变化
      window.ethereum.on('chainChanged', (chainId: string) => {
        setNetwork(chainId as Network);
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  return {
    isConnected,
    address,
    network,
    provider,
    connect,
    disconnect
  };
} 