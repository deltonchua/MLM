import Big from 'big.js';
import { isAddress, getAddress } from '@ethersproject/address';

enum AddressError {
  NULL = 'No Address',
  INVAILD = 'Invalid Address',
}

export const formatAddress = (address: string, short = false) => {
  if (!address) return AddressError.NULL;
  if (!isAddress(address)) return AddressError.INVAILD;
  const checksumAddress = getAddress(address);
  return short ? checksumAddress.slice(0, 8) : checksumAddress;
};

export const formatFund = (fund: number | string) => {
  const rounded = new Big(fund).round(3, 0);
  if (rounded.gte(1e9))
    return new Big(rounded).div(1e9).round(1).toString() + 'B';
  if (rounded.gte(1e6))
    return new Big(rounded).div(1e6).round(1).toString() + 'M';
  // if (rounded.gte(1e3))
  //   return new Big(rounded).div(1e3).round(1).toString() + 'K';
  return rounded.toNumber().toLocaleString();
};

export const formatPrice = (price: number | string) => {
  return new Big(price).round(3, 0).toNumber().toLocaleString();
};

export const formatTXID = (txID: string) => {
  return txID.slice(0, 8);
};
