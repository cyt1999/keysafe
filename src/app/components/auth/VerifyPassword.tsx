import { useState } from 'react';
import { PasswordUtils } from '@/utils/passwordUtils';
import { StorageUtils } from '@/utils/storage';
import { SessionUtils } from '@/utils/sessionUtils';

interface VerifyPasswordProps {
  address: string;
  onSuccess: () => void;
}

export default function VerifyPassword({ address, onSuccess }: VerifyPasswordProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
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
        SessionUtils.createSession(address);
        onSuccess();
      } else {
        setError('密码错误');
      }
    } catch (err) {
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