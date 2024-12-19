import { useState, useEffect } from 'react';
import { BrowserProvider, Network } from 'ethers';

interface WalletState {
  isConnected: boolean;
  address: string | null;
  network: Network | null;
  provider: BrowserProvider | null;
}

export function useWallet() {
  const [walletState, setWalletState] = useState<WalletState>({
    isConnected: false,
    address: null,
    network: null,
    provider: null,
  });

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('请安装 MetaMask!');
      return;
    }

    try {
      const provider = new BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const network = await provider.getNetwork();
      
      setWalletState({
        isConnected: true,
        address: accounts[0],
        network,
        provider,
      });

      localStorage.setItem('walletConnected', 'true');
    } catch (error) {
      console.error('连接钱包失败:', error);
    }
  };

  const disconnectWallet = () => {
    setWalletState({
      isConnected: false,
      address: null,
      network: null,
      provider: null,
    });
    localStorage.removeItem('walletConnected');
  };

  const checkAndRestoreConnection = async () => {
    if (
      typeof window.ethereum !== 'undefined' && 
      localStorage.getItem('walletConnected') === 'true'
    ) {
      try {
        const provider = new BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        
        if (accounts.length > 0) {
          const network = await provider.getNetwork();
          setWalletState({
            isConnected: true,
            address: accounts[0].address,
            network,
            provider,
          });
        }
      } catch (error) {
        console.error('恢复钱包连接失败:', error);
        localStorage.removeItem('walletConnected');
      }
    }
  };

  useEffect(() => {
    checkAndRestoreConnection();

    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setWalletState(prev => ({
            ...prev,
            address: accounts[0],
          }));
        }
      });

      window.ethereum.on('chainChanged', () => {
        checkAndRestoreConnection();
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners();
      }
    };
  }, []);

  return {
    ...walletState,
    connectWallet,
    disconnectWallet,
  };
} 