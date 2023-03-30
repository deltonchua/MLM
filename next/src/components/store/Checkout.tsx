import Link from 'next/link';
import styles from '../home/Home.module.scss';

const Checkout = () => {
  return (
    <section className={styles['hero']}>
      <div className={styles['img']}>
        <img src='/images/stripe.svg' alt='' />
      </div>
      <div className={styles['container-sm']}>
        <h1>Thank you</h1>
        <p>Your payment has been received.</p>
        <Link href='/store'>
          <a className={styles['btn-filled']}>Back to Store</a>
        </Link>
      </div>
    </section>
  );
};

export default Checkout;
