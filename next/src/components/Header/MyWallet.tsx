import Link from 'next/link';
import { useState, useMemo } from 'react';
import { useAppSelector } from '../../app/hooks';
import { selectAuth, selectAddress, selectITO } from '../../slices/authSlice';
import { selectUser } from '../../slices/userSlice';
import { useAuth } from '../../hooks/firebase';
import Modal from '../Modal';
import Identicon from '../Identicon';
import Address from '../Address';
import Column from '../Column';
import LinkItem from '../Column/LinkItem';
import { formatFund } from '../../utils/format';
import ArrowRightIcon from '../../icons/ArrowRight';
import Loader from '../Loader';
import styles from './Header.module.scss';

export const Content = () => {
  const auth = useAppSelector(selectAuth);
  const user = useAppSelector(selectUser);
  const address = useAppSelector(selectAddress) as string;
  const ITO = useAppSelector(selectITO);
  const [loading, setLoading] = useState(false);

  const { signIn, signOut } = useAuth();

  const Profile = useMemo(
    () => (
      <div className={styles['profile']}>
        <Identicon photoURL={user?.photoURL} address={address} />
        <div>
          <p>{user?.displayName ?? 'User'}</p>
          <span>
            {!auth
              ? 'Not signed in'
              : !user?.email
              ? 'Email not set'
              : !user.emailVerified
              ? 'Email not verified'
              : user.email}
          </span>
        </div>
      </div>
    ),
    [auth, user, address]
  );

  return (
    <div className={styles['my-wallet']}>
      <div>
        {auth ? (
          <Link href='/user'>
            <a className={styles['btn-content']} title='Update Profile'>
              <div>
                {Profile}
                <ArrowRightIcon className={styles['icon']} />
              </div>
            </a>
          </Link>
        ) : (
          <div className={styles['profile-container']}>{Profile}</div>
        )}
        <Column>
          <Address address={address} />
          <div className={styles['btn-content']}>
            <div>
              <span>Funds</span>
              <span className={styles['status']}>
                {formatFund(ITO || 0)} ITO
              </span>
            </div>
          </div>
          <LinkItem
            link={`https://etherscan.io/address/${address}`}
            name='View on Etherscan'
          />
        </Column>
      </div>
      {auth ? (
        <button
          className={styles['btn-red-centered']}
          onClick={signOut}
          title='Sign Out'
          disabled={loading}
        >
          Sign Out
        </button>
      ) : (
        <button
          className={styles['btn-blue-centered']}
          onClick={async () => {
            setLoading(true);
            await signIn();
            setLoading(false);
          }}
          title='Sign In'
          disabled={loading}
        >
          Sign In
        </button>
      )}
      {loading && <Loader />}
    </div>
  );
};

const MyWallet = ({ hideModal }: { hideModal: () => void }) => (
  <Modal title='My Wallet' hideModal={hideModal}>
    <Content />
  </Modal>
);

export default MyWallet;
