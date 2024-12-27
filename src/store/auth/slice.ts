import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User } from '@/types/auth';

/**
 * 认证状态的初始值
 * @property {User | null} user - 当前登录用户信息，未登录时为 null
 * @property {boolean} isAuthenticated - 用户是否已认证
 * @property {boolean} loading - 是否正在进行认证相关操作
 * @property {string | null} error - 认证过程中的错误信息
 */
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

/**
 * 认证状态管理的 Slice
 * 包含了所有与认证相关的状态更新逻辑
 */
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * 设置加载状态
     * @param state - 当前状态
     * @param action - 包含 boolean 类型的 payload，表示是否正在加载
     */
    setLoading: (state: AuthState, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    /**
     * 设置用户信息
     * 同时会更新认证状态
     * @param state - 当前状态
     * @param action - 包含用户信息的 payload，可以是 null（表示登出）
     */
    setUser: (state: AuthState, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    },

    /**
     * 设置错误信息
     * @param state - 当前状态
     * @param action - 包含错误信息的 payload，可以是 null（表示清除错误）
     */
    setError: (state: AuthState, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    /**
     * 登出操作
     * 清除用户信息和认证状态
     * @param state - 当前状态
     */
    logout: (state: AuthState) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
  },
});

// 导出所有 action creators
export const { setLoading, setUser, setError, logout } = authSlice.actions;

// 导出 reducer
export default authSlice.reducer; 