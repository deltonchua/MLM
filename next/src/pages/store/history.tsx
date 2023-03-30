import type { NextPage } from 'next';
import { useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { useFunctions } from '../../hooks/firebase';
import { useAppDispatch } from '../../app/hooks';
import { setPaymentHistory } from '../../slices/paymentSlice';
import { PaymentInterface } from '../../interfaces/Product';
import useToast from '../../hooks/useToast';
import AuthRoute from '../../components/AuthRoute';
import Meta from '../../components/Meta';
import PageHeader from '../../components/Header/PageHeader';
import History from '../../components/store/History';
import styles from '../Main.module.scss';

const PurchaseHistory = () => {
  const functions = useFunctions();
  const dispatch = useAppDispatch();
  const toast = useToast();

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        const res = await httpsCallable(functions, 'getPaymentHistory')();
        dispatch(setPaymentHistory(res.data as PaymentInterface[]));
      } catch (err) {
        console.error(err);
        toast(`Error: ${(err as Error).message}`);
      }
    };
    fetchPayment();
  }, [functions, dispatch, toast]);

  return (
    <main className={`${styles['enter']} ${styles['bg-gray']}`}>
      <Meta title='Purchase History | Big Family' />
      <PageHeader title='Purchase History' />
      <div className={styles['container-sm']}>
        <History />
      </div>
    </main>
  );
};

const PurchaseHistoryPage: NextPage = () => (
  <AuthRoute>
    <PurchaseHistory />
  </AuthRoute>
);

export default PurchaseHistoryPage;
