import { useMemo } from 'react';
import { isAddress } from '@ethersproject/address';
import createIcon from './blockies';
import UserIcon from '../../icons/User';

const Identicon = ({
  photoURL,
  address = '',
  className: cssClass,
}: {
  photoURL?: string | null;
  address: string;
  className?: string;
}) => {
  const url = useMemo(
    () =>
      isAddress(address)
        ? createIcon({
            seed: address.toLowerCase(),
            size: 8,
            scale: 6,
          }).toDataURL()
        : '',
    [address]
  );
  const className = cssClass ? `identicon ${cssClass}` : 'identicon';

  return photoURL ? (
    <img src={photoURL} alt='' className={className} />
  ) : url ? (
    <img src={url} alt='' className={className} />
  ) : (
    <UserIcon className={className} />
  );
};

export default Identicon;
