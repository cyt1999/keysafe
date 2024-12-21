import { useState } from 'react';
import { PasswordUtils } from '@/utils/passwordUtils';
import { StorageUtils } from '@/utils/storage';
import { SessionUtils } from '@/utils/sessionUtils';

interface CreatePasswordProps {
  address: string;
  onSuccess: () => void;
}

export default function CreatePassword({ address, onSuccess }: CreatePasswordProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 8) {
      setError('密码长度至少为8位');
      return;
    }

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    try {
      // 创建主密码验证数据
      const masterKeyData = PasswordUtils.createMasterKeyData(password);
      
      // 保存到本地存储
      StorageUtils.saveUserData(address, masterKeyData);
      
      // 创建会话
      SessionUtils.createSession(address);
      
      // 调用成功回调
      onSuccess();
    } catch (err) {
      setError('创建密码时发生错误');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">创建主密码</h2>
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
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            确认主密码
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="请再次输入主密码"
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
          创建密码
        </button>
      </form>
    </div>
  );
} 