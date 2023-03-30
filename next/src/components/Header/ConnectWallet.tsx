import Link from 'next/link';
import { useWeb3React } from '@web3-react/core';
import { injected } from '../../connectors';
import Modal from '../Modal';
import styles from './Header.module.scss';

declare global {
  interface Window {
    ethereum: any;
  }
}

export const Content = () => {
  const { activate } = useWeb3React();

  return (
    <div className={styles['connect-wallet']}>
      <div className={styles['info']}>
        By connecting a wallet, you acknowledge that you have read and agree to
        Big Family’s{' '}
        <Link href='/terms'>
          <a
            target='_blank'
            rel='noopener noreferrer'
            className={styles['link']}
          >
            Terms of Service
          </a>
        </Link>
        .
      </div>
      {!window.ethereum ? (
        <a
          href='https://metamask.io'
          target='_blank'
          rel='noopener noreferrer'
          className={styles['btn-content']}
          title='Install MetaMask'
        >
          <img src='/images/metamask.svg' alt='' />
          <div>Install MetaMask</div>
        </a>
      ) : window.ethereum.isTrust ? (
        <button
          className={styles['btn-content']}
          onClick={() => activate(injected)}
          title='Trust Wallet'
        >
          <img src='/images/trust.svg' alt='' />
          <div>Trust Wallet</div>
        </button>
      ) : (
        <button
          className={styles['btn-content']}
          onClick={() => activate(injected)}
          title='MetaMask'
        >
          <img src='/images/metamask.svg' alt='' />
          <div>MetaMask</div>
        </button>
      )}
      {/* <button
        className={styles['btn-content']}
        onClick={() => activate(walletconnect)}
        title='WalletConnect'
      >
        <img src='/images/walletconnect.svg' alt='' />
        <div>WalletConnect</div>
      </button> */}
    </div>
  );
};

const ConnectWallet = ({ hideModal }: { hideModal: () => void }) => (
  <Modal title='Connect Wallet' hideModal={hideModal}>
    <Content />
  </Modal>
);

export default ConnectWallet;
