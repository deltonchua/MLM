import { useAppSelector } from '../../../app/hooks';
import { selectRecruit } from '../../../slices/recruitSlice';
import { MemberInterface } from '../../../interfaces/Member';
import Identicon from '../../Identicon';
import styles from './Recruit.module.scss';

const Profile = () => {
  const { uid, name, displayName, photoURL } = useAppSelector(
    selectRecruit
  ) as MemberInterface;

  return (
    <section className={styles['section']}>
      <div className={styles['member']}>
        <Identicon photoURL={photoURL} address={uid} />
        <div>
          <p>{name}</p>
          <span>{displayName}</span>
        </div>
      </div>
    </section>
  );
};

export default Profile;
