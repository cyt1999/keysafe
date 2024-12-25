import { useState, useEffect } from 'react';
import { BrowserProvider } from 'ethers';
import { Network } from '../config/networks';

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
      
      setProvider(provider);
      setAddress(accounts[0]);
      setNetwork(network.chainId.toString() as Network);
      setIsConnected(true);
    } catch (error) {
      console.error('连接钱包失败:', error);
      throw error;
    }
  };

  const disconnect = () => {
    setProvider(null);
    setAddress(null);
    setNetwork(null);
    setIsConnected(false);
  };

  useEffect(() => {
    // 检查是否已连接
    if (window.ethereum) {
      const provider = new BrowserProvider(window.ethereum);
      provider.send('eth_accounts', []).then((accounts) => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          setProvider(provider);
          provider.getNetwork().then((network) => {
            setNetwork(network.chainId.toString() as Network);
            setIsConnected(true);
          });
        }
      });

      // 监听账户变化
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          setIsConnected(true);
        } else {
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