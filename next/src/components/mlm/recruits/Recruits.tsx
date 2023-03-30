import { useAppSelector } from '../../../app/hooks';
import { selectRecruit } from '../../../slices/recruitSlice';
import { MemberInterface } from '../../../interfaces/Member';
import Identicon from '../../Identicon';
import styles from './Recruit.module.scss';

const Recruits = () => {
  const { downline } = useAppSelector(selectRecruit) as MemberInterface;

  return (
    <section className={styles['recruits']}>
      <h2 className={styles['section-title']}>Recruits</h2>
      <div className={styles['total']}>
        <p>{downline.length.toLocaleString()}</p>
        <span>members</span>
      </div>
      <div className={styles['members']}>
        {downline.map((d, i) => (
          <div className={styles['member']} title={d.displayName} key={i}>
            <Identicon
              photoURL={d.photoURL}
              address={d.uid}
              className={styles['identicon']}
            />
            <div>
              <p>{d.name}</p>
              <span>{d.displayName}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Recruits;
