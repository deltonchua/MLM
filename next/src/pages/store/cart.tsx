import { Content } from '../../components/Header/Cart';
import Meta from '../../components/Meta';
import PageHeader from '../../components/Header/PageHeader';
import styles from '../Main.module.scss';

const Cart = () => {
  return (
    <main className={`${styles['bg-gray']} ${styles['enter']}`}>
      <Meta title='Cart | Big Family' />
      <PageHeader title='Cart' />
      <div className={styles['container-sm']}>
        <section className={styles['section']}>
          <Content />
        </section>
      </div>
    </main>
  );
};

export default Cart;
