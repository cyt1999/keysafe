import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Password, PasswordState } from '@/types/password';

/**
 * 密码管理状态的初始值
 * @property {Password[]} passwords - 密码列表
 * @property {boolean} loading - 是否正在加载数据
 * @property {string | null} error - 操作过程中的错误信息
 */
const initialState: PasswordState = {
  passwords: [],
  loading: false,
  error: null,
};

/**
 * 密码管理状态的 Slice
 * 包含了所有与密码管理相关的状态更新逻辑
 */
export const passwordSlice = createSlice({
  name: 'password',
  initialState,
  reducers: {
    /**
     * 设置加载状态
     * @param state - 当前状态
     * @param action - 包含 boolean 类型的 payload，表示是否正在加载
     */
    setLoading: (state: PasswordState, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    /**
     * 设置密码列表
     * 用于初始化或完全替换密码列表
     * @param state - 当前状态
     * @param action - 包含密码数组的 payload
     */
    setPasswords: (state: PasswordState, action: PayloadAction<Password[]>) => {
      state.passwords = action.payload;
    },

    /**
     * 添加新密码
     * @param state - 当前状态
     * @param action - 包含新密码对象的 payload
     */
    addPassword: (state: PasswordState, action: PayloadAction<Password>) => {
      state.passwords.push(action.payload);
    },

    /**
     * 更新现有密码
     * @param state - 当前状态
     * @param action - 包含更新后的密码对象的 payload
     */
    updatePassword: (state: PasswordState, action: PayloadAction<Password>) => {
      const index = state.passwords.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.passwords[index] = action.payload;
      }
    },

    /**
     * 删除密码
     * @param state - 当前状态
     * @param action - 包含要删除的密码ID的 payload
     */
    deletePassword: (state: PasswordState, action: PayloadAction<string>) => {
      state.passwords = state.passwords.filter(p => p.id !== action.payload);
    },

    /**
     * 设置错误信息
     * @param state - 当前状态
     * @param action - 包含错误信息的 payload，可以是 null（表示清除错误）
     */
    setError: (state: PasswordState, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    /**
     * 清空密码列表
     * 通常在用户登出时调用
     * @param state - 当前状态
     */
    clearPasswords: (state: PasswordState) => {
      state.passwords = [];
      state.error = null;
    },
  },
});

// 导出所有 action creators
export const {
  setLoading,
  setPasswords,
  addPassword,
  updatePassword,
  deletePassword,
  setError,
  clearPasswords,
} = passwordSlice.actions;

// 导出 reducer
export default passwordSlice.reducer; 