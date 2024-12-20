import React, { useState, useEffect } from 'react';
import { useUser } from '../../hooks/useUser';
import { usePasswordManager } from '../../hooks/usePasswordManager';

interface LoginFormProps {
  onSuccess: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { user, isNewUser, createPassword, verifyPassword } = useUser();
  const { unlock, loading: unlocking, isLocked } = usePasswordManager();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 监听锁定状态变化
  useEffect(() => {
    if (!isLocked) {
      console.log('LoginForm: 检测到解锁状态变化，触发成功回调');
      onSuccess();
    }
  }, [isLocked, onSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('请输入密码');
      return;
    }

    if (isNewUser) {
      if (password.length < 8) {
        setError('密码长度至少为8位');
        return;
      }
      if (password !== confirmPassword) {
        setError('两次输入的密码不一致');
        return;
      }
    }

    try {
      console.log('LoginForm: 开始登录流程...');
      setLoading(true);
      setError(null);

      if (isNewUser) {
        console.log('LoginForm: 创建新用户...');
        await createPassword(password);
      } else {
        console.log('LoginForm: 验证密码...');
        const isValid = await verifyPassword(password);
        if (!isValid) {
          setError('密码错误');
          return;
        }
      }

      console.log('LoginForm: 解锁密码管理器...');
      await unlock(password);
      console.log('LoginForm: 解锁成功，等待状态更新...');
    } catch (err) {
      console.error('LoginForm: 登录失败:', err);
      setError(err instanceof Error ? err.message : '操作失败');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  const isProcessing = loading || unlocking;

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <img
          src={user.avatar}
          alt="用户头像"
          className="w-20 h-20 mx-auto rounded-full"
        />
        <h2 className="mt-4 text-xl font-semibold">{user.nickname}</h2>
        <p className="text-sm text-gray-500 mt-1">{user.address}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            {isNewUser ? '创建主密码' : '输入主密码'}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder={isNewUser ? '请创建主��码' : '请输入主密码'}
            disabled={isProcessing}
            autoFocus
          />
        </div>

        {isNewUser && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              确认主密码
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="请再次输入主密码"
              disabled={isProcessing}
            />
          </div>
        )}

        {error && (
          <div className="text-red-500 text-sm mt-2">{error}</div>
        )}

        <button
          type="submit"
          disabled={isProcessing}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isProcessing ? '处理中...' : (isNewUser ? '创建密码' : '解锁')}
        </button>

        {isNewUser && (
          <p className="text-sm text-gray-500 mt-2">
            请记住您的主密码，它将用于加密您的所有数据。如果忘记主密码，将无法恢复您的数据。
          </p>
        )}
      </form>
    </div>
  );
} 