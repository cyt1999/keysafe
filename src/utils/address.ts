/**
 * 缩短钱包地址显示
 * @param address - 完整的钱包地址
 * @returns 缩短后的地址 (例如: 0x1234...5678)
 */
export function shortenAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
} 