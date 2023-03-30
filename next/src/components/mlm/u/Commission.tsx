import Link from 'next/link';
import { useAppSelector } from '../../../app/hooks';
import { selectMember } from '../../../slices/memberSlice';
import { MemberInterface } from '../../../interfaces/Member';
import { formatFund } from '../../../utils/format';
import styles from './MLM.module.scss';

const Commission = () => {
  const {
    weeklyCommission = 0,
    monthlyCommission = 0,
    totalCommission = 0,
  } = useAppSelector(selectMember) as MemberInterface;

  return (
    <section className={styles['commission']}>
      <header className={styles['section-header']}>
        <h2 className={styles['section-title']}>Commission</h2>
        <div>
          <Link href='/mlm/u/commission'>
            <a title='See History'>See History</a>
          </Link>
        </div>
      </header>
      <div className={styles['statistics']}>
        {[weeklyCommission, monthlyCommission, totalCommission].map((c, i) => (
          <div key={i}>
            <p>{formatFund(c)}</p>
            <span>ITO</span>
            <span>
              {i === 0 ? 'This week' : i === 1 ? 'This month' : 'Total'}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Commission;
