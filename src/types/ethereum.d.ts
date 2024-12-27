/**
 * 扩展 Window 接口以支持 Ethereum 对象
 */
interface Window {
  /**
   * Ethereum 对象，包含与以太坊相关的功能
   */
  ethereum?: {
    /**
     * 是否为 MetaMask 扩展
     */
    isMetaMask?: boolean;
    request: (...args: any[]) => Promise<any>;
    on: (event: string, callback: (...args: any[]) => void) => void;
    removeListener: (event: string, callback: (...args: any[]) => void) => void;
    removeAllListeners: (event: string) => void;
  };
} 