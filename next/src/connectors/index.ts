import { InjectedConnector } from '@web3-react/injected-connector';
// import { WalletConnectConnector } from '@web3-react/walletconnect-connector';

const supportedChainIds = [1];

export const injected = new InjectedConnector({ supportedChainIds });

// export const walletconnect = new WalletConnectConnector({
//   supportedChainIds,
//   rpc: {
//     1: `https://eth-mainnet.alchemyapi.io/v2/${process.env.NEXT_PUBLIC_ALCHEMY_API_KEY}`,
//   },
// });
