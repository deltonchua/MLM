import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAppSelector } from '../app/hooks';
import { selectAuth, selectAddress } from '../slices/authSlice';
import { selectUser } from '../slices/userSlice';
import PageLoader from '../components/PageLoader';
import Meta from '../components/Meta';
import { Content as ConnectWallet } from '../components/Header/ConnectWallet';
import { Content as MyWallet } from '../components/Header/MyWallet';
import styles from './Main.module.scss';

const SignIn: NextPage = () => {
  const router = useRouter();
  const auth = useAppSelector(selectAuth);
  const user = useAppSelector(selectUser);
  const address = useAppSelector(selectAddress);

  useEffect(() => {
    if (auth === undefined) return;
    if (auth && user) {
      const ref = router.query.ref;
      typeof ref === 'string' ? router.push(ref) : router.back();
    }
  }, [router, auth, user]);

  return auth === undefined || (auth && user) ? (
    <PageLoader />
  ) : (
    <main className={styles['bg-gray']}>
      <Meta title='Sign In | Big Family' />
      <div className={styles['container-sm']}>
        <h1 className={styles['page-title']}>Sign In</h1>
        <h3 className={styles['page-subtitle']}>
          {address ? 'My Wallet' : 'Connect Wallet'}
        </h3>
        <section className={styles['section']}>
          {address ? <MyWallet /> : <ConnectWallet />}
        </section>
      </div>
    </main>
  );
};

export default SignIn;
