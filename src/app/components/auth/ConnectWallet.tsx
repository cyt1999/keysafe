import React from 'react';
import { useWallet } from '../../hooks/useWallet';

export function ConnectWallet() {
  const { connectWallet, isConnected, address } = useWallet();

  if (isConnected) {
    return null;
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg text-center">
      <h2 className="text-2xl font-bold mb-4">欢迎使用 KeySafe</h2>
      <p className="text-gray-600 mb-6">
        请连接您的钱包以继续使用
      </p>
      <button
        onClick={connectWallet}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        连接钱包
      </button>
    </div>
  );
} 