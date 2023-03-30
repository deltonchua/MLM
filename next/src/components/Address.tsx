import { useState, useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';
import { isAddress } from '@ethersproject/address';
import useCopy from '../hooks/useCopy';
import { formatAddress } from '../utils/format';
import useIsMounted from '../hooks/useIsMounted';
import CopyIcon from '../icons/Copy';
import styles from './Address.module.scss';

const Address = ({ address }: { address: string }) => {
  const { library } = useWeb3React();
  const [ENSName, setENSName] = useState<string | null>(null);
  const isMounted = useIsMounted();
  const copy = useCopy();

  useEffect(() => {
    setENSName(null);
    const getName = async () => {
      if (!library) return;
      const ens = await library.lookupAddress(address);
      if (isMounted()) setENSName(ens);
    };
    if (address && isAddress(address)) {
      getName();
    }
  }, [address, isMounted, library]);

  return (
    <button
      title='Copy Address'
      onClick={() => copy(formatAddress(address), 'Address')}
      className={styles['btn-content']}
    >
      <div>
        <span>Address</span>
        <span className={styles['status']}>
          {ENSName ?? formatAddress(address, true)}
        </span>
        <CopyIcon className={styles['icon']} />
      </div>
    </button>
  );
};

export default Address;
