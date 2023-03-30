import { useAppSelector } from '../../../app/hooks';
import { selectMember } from '../../../slices/memberSlice';
import { MemberInterface } from '../../../interfaces/Member';
import Identicon from '../../Identicon';
import styles from './MLM.module.scss';

const Referrer = () => {
  const { referredBy } = useAppSelector(selectMember) as MemberInterface;

  return (
    <section className={styles['referrer']}>
      <h2 className={styles['section-title']}>Referred By</h2>
      <div className={styles['member']}>
        <Identicon
          photoURL={referredBy?.photoURL}
          address={referredBy?.uid as string}
        />
        <div>
          <p>{referredBy?.name}</p>
          <span>{referredBy?.displayName}</span>
        </div>
      </div>
    </section>
  );
};

export default Referrer;
