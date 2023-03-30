import type { NextPage } from 'next';
import { useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { useFunctions } from '../../../hooks/firebase';
import { useAppDispatch } from '../../../app/hooks';
import { setCommissionHistory } from '../../../slices/commissionSlice';
import { CommissionInterface } from '../../../interfaces/Commission';
import useToast from '../../../hooks/useToast';
import MemberRoute from '../../../components/MemberRoute';
import Meta from '../../../components/Meta';
import PageHeader from '../../../components/Header/PageHeader';
import History from '../../../components/mlm/commission/History';
import styles from '../../Main.module.scss';

const Commission = () => {
  const functions = useFunctions();
  const dispatch = useAppDispatch();
  const toast = useToast();

  useEffect(() => {
    const fetchCommission = async () => {
      try {
        const res = await httpsCallable(functions, 'getCommissionHistory')();
        dispatch(setCommissionHistory(res.data as CommissionInterface[]));
      } catch (err) {
        console.error(err);
        toast(`Error: ${(err as Error).message}`);
      }
    };
    fetchCommission();
  }, [functions, dispatch, toast]);

  return (
    <main className={`${styles['enter']} ${styles['bg-gray']}`}>
      <Meta title='Commission | Big Family' />
      <PageHeader title='Commission' />
      <div className={styles['container-sm']}>
        <History />
      </div>
    </main>
  );
};

const CommissionPage: NextPage = () => (
  <MemberRoute>
    <Commission />
  </MemberRoute>
);

export default CommissionPage;
