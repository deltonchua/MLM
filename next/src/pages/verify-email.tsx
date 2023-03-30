import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { useFunctions } from '../hooks/firebase';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { selectUser, setUser } from '../slices/userSlice';
import { UserInterface } from '../interfaces/User';
import useToast from '../hooks/useToast';
import AuthRoute from '../components/AuthRoute';
import Meta from '../components/Meta';
import VerifyEmailComponent from '../components/VerifyEmail';
import { AUTOID_PATTERN } from '../utils/constants';
import styles from './Main.module.scss';

const VerifyEmail = () => {
  const router = useRouter();
  const functions = useFunctions();
  const dispatch = useAppDispatch();
  const { emailVerified } = useAppSelector(selectUser) as UserInterface;
  const toast = useToast();

  useEffect(() => {
    if (emailVerified) {
      router.push('/user');
      return;
    }
    const t = (router.query.t as string) || '';
    const token = t.trim();
    if (!AUTOID_PATTERN.test(token)) {
      toast('Invalid email verification link.');
      return;
    }
    const verifyEmail = async () => {
      try {
        const res = await httpsCallable(functions, 'verifyEmail')({ token });
        toast(res.data as string);
        const { data } = await httpsCallable(functions, 'getUser')();
        dispatch(setUser(data as UserInterface));
      } catch (err) {
        console.error(err);
        toast(`Error: ${(err as Error).message}`);
      }
    };
    verifyEmail();
    // eslint-disable-next-line
  }, [emailVerified]);

  return (
    <main className={styles['bg-gray']}>
      <Meta title='Verify Email | Big Family' />
      <div className={styles['container-sm']}>
        <VerifyEmailComponent />
      </div>
    </main>
  );
};

const VerifyEmailPage: NextPage = () => (
  <AuthRoute>
    <VerifyEmail />
  </AuthRoute>
);

export default VerifyEmailPage;
