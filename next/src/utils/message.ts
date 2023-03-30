import { utils } from 'ethers';
import { MessageInterface } from '../interfaces/Message';

export const generateMessage = (
  chainId: number,
  address: string,
  action: string
) => {
  const domain = {
    chainId,
    name: 'Big Family',
    version: '1',
  };
  const types = {
    Message: [
      { name: 'action', type: 'string' },
      { name: 'address', type: 'address' },
      { name: 'timestamp', type: 'uint256' },
    ],
  };
  const value = {
    action,
    address,
    timestamp: Date.now(),
  };
  return {
    domain,
    types,
    value,
  } as MessageInterface;
};

export const verifyMessage = (
  address: string,
  { domain, types, value }: MessageInterface,
  signature: string
) => {
  return utils.verifyTypedData(domain, types, value, signature) === address;
};
