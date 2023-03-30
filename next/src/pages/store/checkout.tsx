import type { NextPage } from 'next';
import { useEffect } from 'react';
import { useAppDispatch } from '../../app/hooks';
import { emptyCart } from '../../slices/cartSlice';
import Meta from '../../components/Meta';
import CheckoutComponent from '../../components/store/Checkout';
import styles from '../Main.module.scss';

const Checkout: NextPage = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(emptyCart());
  }, [dispatch]);

  return (
    <main className={styles['bg-gray']}>
      <Meta title='Checkout | Big Family' />
      <div className={styles['container-md']}>
        <CheckoutComponent />
      </div>
    </main>
  );
};

export default Checkout;
