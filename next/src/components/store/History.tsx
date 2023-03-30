import { useAppSelector } from '../../app/hooks';
import { selectPaymentHistory } from '../../slices/paymentSlice';
import { formatPrice } from '../../utils/format';
import styles from './History.module.scss';

const History = () => {
  const history = useAppSelector(selectPaymentHistory);

  return (
    <section className={styles['section']}>
      {history.map((h, i) => {
        const { amount, updatedAt, items } = h;
        return (
          <div key={i} className={styles['history']}>
            <header className={styles['date']}>
              <p>Date</p>
              <span>{new Date(updatedAt).toDateString()}</span>
            </header>
            {items.map((item, ind) => (
              <div key={ind}>
                <p>{item.quantity}x</p>
                <span>{item.description}</span>
              </div>
            ))}
            <div>
              <p>Amount</p>
              <span>${formatPrice(amount / 100)}</span>
            </div>
          </div>
        );
      })}
    </section>
  );
};

export default History;
