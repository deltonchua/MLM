import { Contract, utils } from 'ethers';
import ITO from '../contracts/ITO';

const getITO = async (address: string, provider: any) => {
  const contract = new Contract(ITO.address, ITO.ABI, provider);
  const balance = await contract.balanceOf(address);
  return utils.formatEther(balance || 0);
};

export default getITO;
