import type { NextPage } from 'next';
import { useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { useFunctions } from '../../../hooks/firebase';
import { useAppDispatch } from '../../../app/hooks';
import { setPayoutHistory } from '../../../slices/payoutSlice';
import { PayoutInterface } from '../../../interfaces/Commission';
import useToast from '../../../hooks/useToast';
import MemberRoute from '../../../components/MemberRoute';
import Meta from '../../../components/Meta';
import PageHeader from '../../../components/Header/PageHeader';
import History from '../../../components/mlm/payout/History';
import styles from '../../Main.module.scss';

const Payout = () => {
  const functions = useFunctions();
  const dispatch = useAppDispatch();
  const toast = useToast();

  useEffect(() => {
    const fetchPayout = async () => {
      try {
        const res = await httpsCallable(functions, 'getPayoutHistory')();
        dispatch(setPayoutHistory(res.data as PayoutInterface[]));
      } catch (err) {
        console.error(err);
        toast(`Error: ${(err as Error).message}`);
      }
    };
    fetchPayout();
  }, [functions, dispatch, toast]);

  return (
    <main className={`${styles['enter']} ${styles['bg-gray']}`}>
      <Meta title='Payout | Big Family' />
      <PageHeader title='Payout' />
      <div className={styles['container-sm']}>
        <History />
      </div>
    </main>
  );
};

const PayoutPage: NextPage = () => (
  <MemberRoute>
    <Payout />
  </MemberRoute>
);

export default PayoutPage;
