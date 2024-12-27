export type Network = string;

interface NetworkInfo {
  name: string;
  logo: string;
  color: string;
}

const networks: Record<Network, NetworkInfo> = {
  '1': {
    name: 'Ethereum',
    logo: '/images/eth.svg',
    color: '#627EEA'
  },
  '137': {
    name: 'Polygon',
    logo: '/images/polygon.svg',
    color: '#8247E5'
  },
  '56': {
    name: 'BSC',
    logo: '/images/bsc.svg',
    color: '#F3BA2F'
  }
};

export function getNetworkInfo(network: Network): NetworkInfo {
  return networks[network] || {
    name: 'Unknown',
    logo: '/images/unknown.svg',
    color: '#666666'
  };
} 