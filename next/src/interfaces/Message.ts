export interface MessageInterface {
  domain: {
    chainId: number;
    name: string;
    version: string;
  };
  types: {
    Message: {
      name: string;
      type: string;
    }[];
  };
  value: {
    action: string;
    address: string;
    timestamp: number;
  };
}
