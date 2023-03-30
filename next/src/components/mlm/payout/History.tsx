import { useAppSelector } from '../../../app/hooks';
import { selectPayoutHistory } from '../../../slices/payoutSlice';
import { formatPrice, formatTXID } from '../../../utils/format';
import styles from './Payout.module.scss';

const History = () => {
  const history = useAppSelector(selectPayoutHistory);

  return (
    <section className={styles['section']}>
      {history.map((h, i) => (
        <div key={i} className={styles['history']}>
          <header className={styles['date']}>
            <p>Date</p>
            <span>{new Date(h.createdAt).toDateString()}</span>
          </header>
          <div>
            <p>Address</p>
            <a
              href={`https://etherscan.io/address/${h.address}`}
              target='_blank'
              rel='noopener noreferrer'
              className={styles['link']}
              title={h.address}
            >
              {formatTXID(h.address)}
            </a>
          </div>
          <div>
            <p>Amount</p>
            <span>
              {formatPrice(h.amount.ito)} ITO / ${formatPrice(h.amount.usd)}
            </span>
          </div>
          <div>
            <p>Status</p>
            <span>{h.status.toUpperCase()}</span>
          </div>
          <div>
            <p>txID</p>
            {h.txID === 'PENDING' ? (
              <span>PENDING</span>
            ) : (
              <a
                href={`https://etherscan.io/tx/${h.txID}`}
                target='_blank'
                rel='noopener noreferrer'
                className={styles['link']}
                title={h.txID}
              >
                {formatTXID(h.txID)}
              </a>
            )}
          </div>
        </div>
      ))}
    </section>
  );
};

export default History;
