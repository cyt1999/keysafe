import { useState } from 'react';
import { PasswordUtils } from '@/utils/passwordUtils';
import { StorageUtils } from '@/utils/storage';
import { SessionUtils } from '@/utils/sessionUtils';
import { useWallet } from '@/app/hooks/useWallet';

interface VerifyPasswordProps {
  address: string;
  onSuccess: () => void;
}

export default function VerifyPassword({ address, onSuccess }: VerifyPasswordProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { provider } = useWallet();

  const getWalletSignature = async (): Promise<string> => {
    if (!provider) {
      throw new Error('钱包未连接');
    }
    const signer = await provider.getSigner();
    const message = 'KeySafe: 请签名以验证您的身份';
    return await signer.signMessage(message);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const userData = StorageUtils.getUserData(address);
    if (!userData) {
      setError('用户数据不存在');
      return;
    }

    try {
      const isValid = PasswordUtils.verifyMasterPassword(
        password,
        userData.salt,
        userData.verificationString,
        userData.encryptedVerificationString
      );

      if (isValid) {
        try {
          // 获取钱包签名
          const signature = await getWalletSignature();
          // 从密码派生主密钥
          const masterKey = PasswordUtils.deriveKey(password, userData.salt);
          
          // 创建会话并保存必要的信息
          SessionUtils.createSession(address, { signature, masterKey });
          onSuccess();
        } catch (error) {
          console.error('设置加密密钥失败:', error);
          setError('设置加密密钥失败，请重试');
        }
      } else {
        setError('密码错误');
      }
    } catch (err) {
      console.error('验证密码时发生错误:', err);
      setError('验证密码时发生错误');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">验证主密码</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            主密码
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="请输入主密码"
          />
        </div>

        {error && (
          <div className="mb-4 text-red-500 text-sm text-center">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          验证密码
        </button>
      </form>
    </div>
  );
} 