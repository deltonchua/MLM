import { useWeb3React } from '@web3-react/core';
import { generateMessage } from '../utils/message';
import useToast from './useToast';

const useSignMessage = () => {
  const { account: address, library, chainId } = useWeb3React();
  const toast = useToast();

  const signMessage = async (action: string) => {
    const message = generateMessage(
      chainId as number,
      address as string,
      action
    );
    toast('Signature Request: Sign the message with your wallet.');
    const signature: string = await library
      .getSigner(address)
      ._signTypedData(...Object.values(message));
    // const isWalletConnect = library.provider.isWalletConnect;
    return { address, message, signature };
  };

  return signMessage;
};

export default useSignMessage;
