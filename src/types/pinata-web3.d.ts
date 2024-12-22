declare module 'pinata-web3' {
  interface PinataMetadata {
    name?: string;
    keyvalues?: Record<string, any>;
  }

  interface PinataOptions {
    pinataMetadata?: PinataMetadata;
  }

  interface PinataUploadResult {
    IpfsHash: string;
    PinSize: number;
    Timestamp: string;
  }

  interface PinataQueryFilters {
    metadata?: {
      keyvalues?: Record<string, {
        value: string;
        op: string;
      }>;
    };
    status?: string;
  }

  interface PinataQueryOptions {
    filters?: PinataQueryFilters;
    sort?: Record<string, number>;
    limit?: number;
  }

  interface PinataFile {
    ipfs_pin_hash: string;
    metadata: PinataMetadata;
    timestamp: string;
  }

  interface PinataQueryResult {
    files: PinataFile[];
    count: number;
  }

  export class PinataSDK {
    constructor(config: { pinataJwt: string; pinataGateway: string });

    upload: {
      file(
        data: Buffer | string | Blob,
        options?: PinataOptions
      ): Promise<PinataUploadResult>;
    };

    gateways: {
      convert(cid: string): Promise<string>;
    };

    query: {
      files(options: PinataQueryOptions): Promise<PinataQueryResult>;
    };
  }
} 