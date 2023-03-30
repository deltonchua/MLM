import { useAppSelector } from '../../../app/hooks';
import { selectMember } from '../../../slices/memberSlice';
import { MemberInterface } from '../../../interfaces/Member';
import useCopy from '../../../hooks/useCopy';
import Identicon from '../../Identicon';
import styles from './MLM.module.scss';

const Profile = () => {
  const {
    uid,
    name,
    displayName,
    photoURL,
    referralID,
    joined,
  } = useAppSelector(selectMember) as MemberInterface;
  const copy = useCopy();

  return (
    <section className={styles['profile']}>
      <div className={styles['name']}>
        <Identicon photoURL={photoURL} address={uid} />
        <div>
          <p>{name}</p>
          <span>{displayName}</span>
        </div>
      </div>
      <div>
        <div>
          <p>Joined</p>
          <span>{new Date(joined).toDateString()}</span>
        </div>
      </div>
      <div>
        <div>
          <p>Referral ID</p>
          <span>{referralID}</span>
        </div>
        <button
          className={styles['btn-sm']}
          onClick={() => copy(referralID, 'Referral ID')}
          title='Copy Referral ID'
        >
          Copy
        </button>
        <button
          className={styles['btn-sm']}
          onClick={() =>
            copy(
              `${process.env.NEXT_PUBLIC_SITE}/signup?ref=${referralID}`,
              'Referral link'
            )
          }
          title='Share Referral Link'
        >
          Share
        </button>
      </div>
    </section>
  );
};

export default Profile;
