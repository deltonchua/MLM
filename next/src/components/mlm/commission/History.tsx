import { useAppSelector } from '../../../app/hooks';
import { selectCommissionHistory } from '../../../slices/commissionSlice';
import { formatPrice } from '../../../utils/format';
import styles from './Commission.module.scss';

const History = () => {
  const history = useAppSelector(selectCommissionHistory);

  return (
    <section className={styles['section']}>
      {history.map((h, i) => {
        const { amount, rate, createdAt, items } = h;
        return (
          <div key={i} className={styles['history']}>
            <header className={styles['date']}>
              <p>Date</p>
              <span>{new Date(createdAt).toDateString()}</span>
            </header>
            {items.map((item, ind) => (
              <div key={ind}>
                <p>{item.quantity}x</p>
                <span>{item.description}</span>
              </div>
            ))}
            <div>
              <p>Commission Rate</p>
              <span>{rate * 100}%</span>
            </div>
            <div>
              <p>Amount</p>
              <span>{formatPrice(amount.ito)} ITO</span>
            </div>
            <div>
              <p>Amount in USD</p>
              <span>${formatPrice(amount.usd)}</span>
            </div>
          </div>
        );
      })}
    </section>
  );
};

export default History;
