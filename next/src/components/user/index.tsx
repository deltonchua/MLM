import { useAppSelector } from '../../app/hooks';
import { selectUser } from '../../slices/userSlice';
import { UserInterface } from '../../interfaces/User';
import useModal from '../../hooks/useModal';
import Identicon from '../Identicon';
import Column from '../Column';
import UpdateName from './UpdateName';
import UpdateEmail from './UpdateEmail';
import UploadPhoto from './UploadPhoto';
import styles from './User.module.scss';

const User = () => {
  const {
    uid,
    photoURL,
    name,
    displayName,
    email,
    emailVerified,
  } = useAppSelector(selectUser) as UserInterface;
  const {
    modalOpen: PhotoOpen,
    showModal: showPhoto,
    hideModal: hidePhoto,
  } = useModal();
  const {
    modalOpen: NameOpen,
    showModal: showName,
    hideModal: hideName,
  } = useModal();
  const {
    modalOpen: EmailOpen,
    showModal: showEmail,
    hideModal: hideEmail,
  } = useModal();

  return (
    <section className={styles['section']}>
      <div className={styles['profile']}>
        <button
          className={styles['photo']}
          onClick={showPhoto}
          title='Upload Photo'
        >
          <Identicon photoURL={photoURL} address={uid} />
        </button>
        <p>{name ?? 'Jane Doe'}</p>
        <span>{displayName ?? 'User'}</span>
        {PhotoOpen && <UploadPhoto hideModal={hidePhoto} />}
      </div>
      <div>
        <Column title='Name'>
          <button
            className={styles['btn-content']}
            onClick={showName}
            title='Edit Name'
          >
            <div>
              <span>{name ?? 'Jane Doe'}</span>
              <span className={styles['status']}>{displayName ?? 'User'}</span>
            </div>
          </button>
        </Column>
        {NameOpen && <UpdateName hideModal={hideName} />}
      </div>
      <div>
        <Column
          title='Email'
          description='You will be contacted at this email address for user-related notification.'
        >
          <div className='btn-content'>
            <div>
              <div className={styles['email']}>
                <p>{email ?? 'Email not set'}</p>
                {email && (
                  <span>{emailVerified ? 'Verified' : 'Not verified'}</span>
                )}
              </div>
            </div>
          </div>
          <button
            className={`${styles['btn-content']} ${styles['action']}`}
            onClick={showEmail}
            title={`${email ? 'Update' : 'Add'} Email`}
          >
            <div>{email ? 'Update' : 'Add'} email</div>
          </button>
        </Column>
        {EmailOpen && <UpdateEmail hideModal={hideEmail} />}
      </div>
    </section>
  );
};

export default User;
