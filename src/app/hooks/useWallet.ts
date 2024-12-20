import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { Network } from '../types/network';

/**
 * 钱包Hook的返回类型
 */
interface UseWalletReturn {
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isConnected: boolean;
  address: string | null;
  network: Network | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.JsonRpcSigner | null;
}

/**
 * 钱包Hook
 */
export function useWallet(): UseWalletReturn {
  const [address, setAddress] = useState<string | null>(null);
  const [network, setNetwork] = useState<Network | null>(null);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);

  /**
   * 初始化钱包连接
   */
  const initializeWallet = useCallback(async () => {
    if (!window.ethereum) return;

    try {
      // 检查是否已授权
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const network = await provider.getNetwork();

        setProvider(provider);
        setSigner(signer);
        setAddress(address);
        setNetwork({
          chainId: Number(network.chainId),
          name: network.name
        });
      }
    } catch (error) {
      console.error('初始化钱包失败:', error);
    }
  }, []);

  /**
   * 连接钱包
   */
  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      throw new Error('请安装MetaMask钱包');
    }

    try {
      // 请求用户连接钱包
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      await initializeWallet();
    } catch (error) {
      console.error('连接钱包失败:', error);
      throw new Error('连接钱包失败');
    }
  }, [initializeWallet]);

  /**
   * 断开钱包连接
   */
  const disconnectWallet = useCallback(() => {
    setProvider(null);
    setSigner(null);
    setAddress(null);
    setNetwork(null);
  }, []);

  // 初始化时检查钱包状态
  useEffect(() => {
    initializeWallet();
  }, [initializeWallet]);

  // 监听账户变化
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = async (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          await initializeWallet();
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, [disconnectWallet, initializeWallet]);

  // 监听网络变化
  useEffect(() => {
    if (window.ethereum) {
      const handleChainChanged = async () => {
        await initializeWallet();
      };

      window.ethereum.on('chainChanged', handleChainChanged);
      return () => {
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [initializeWallet]);

  return {
    connectWallet,
    disconnectWallet,
    isConnected: !!address,
    address,
    network,
    provider,
    signer
  };
} 