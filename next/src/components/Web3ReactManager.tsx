import {
  useEagerConnect,
  useInactiveListener,
  useAccount,
} from '../hooks/web3';

const Web3ReactManager = ({ children }: { children: JSX.Element }) => {
  const triedEager = useEagerConnect();
  useInactiveListener(!triedEager);
  useAccount();

  return children;
};

export default Web3ReactManager;
