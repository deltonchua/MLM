import Link from 'next/link';
import { useAppSelector } from '../../../app/hooks';
import { selectMember } from '../../../slices/memberSlice';
import { MemberInterface } from '../../../interfaces/Member';
import Identicon from '../../Identicon';
import styles from './MLM.module.scss';

const Recruits = () => {
  const { downline } = useAppSelector(selectMember) as MemberInterface;

  return (
    <section className={styles['recruits']}>
      <h2 className={styles['section-title']}>Recruits</h2>
      <div className={styles['total']}>
        <p>{downline.length.toLocaleString()}</p>
        <span>members</span>
      </div>
      <div className={styles['members']}>
        {downline.map((d, i) => (
          <Link href={`/mlm/u/recruits/${d.uid}`} key={i}>
            <a className={styles['member']} title={d.displayName}>
              <Identicon
                photoURL={d.photoURL}
                address={d.uid}
                className={styles['identicon']}
              />
              <div>
                <p>{d.name}</p>
                <span>{d.displayName}</span>
              </div>
              <span className={styles['btn-sm']}>View</span>
            </a>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default Recruits;
