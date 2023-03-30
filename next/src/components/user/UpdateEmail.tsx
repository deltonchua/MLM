import { useState, useEffect, useMemo } from 'react';
import { httpsCallable } from 'firebase/functions';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { selectUser, setUser } from '../../slices/userSlice';
import { UserInterface } from '../../interfaces/User';
import useDebounce from '../../hooks/useDebounce';
import useToast from '../../hooks/useToast';
import { useFunctions } from '../../hooks/firebase';
import { EMAIL_PATTERN } from '../../utils/constants';
import Modal from '../Modal';
import Loader from '../Loader';
import styles from './User.module.scss';

const UpdateName = ({ hideModal }: { hideModal: () => void }) => {
  const { email: existingEmail, emailVerified } = useAppSelector(
    selectUser
  ) as UserInterface;
  const [email, setEmail] = useState(existingEmail || '');
  const debouncedEmail = useDebounce(email.trim().toLowerCase());
  const [emailMsg, setEmailMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const functions = useFunctions();
  const dispatch = useAppDispatch();
  const toast = useToast();

  //   Validate email
  useEffect(() => {
    if (!debouncedEmail) {
      setEmailMsg('');
      return;
    }
    if (!EMAIL_PATTERN.test(debouncedEmail)) {
      setEmailMsg('Invalid email address.');
      return;
    }
    setEmailMsg('');
  }, [debouncedEmail]);

  const enabled = useMemo(
    () => debouncedEmail && debouncedEmail !== existingEmail && !emailMsg,
    [debouncedEmail, existingEmail, emailMsg]
  );

  const onDone = async () => {
    if (!enabled) return;
    try {
      setLoading(true);
      const res = await httpsCallable(
        functions,
        'updateEmail'
      )({ email: debouncedEmail.trim().toLowerCase() });
      toast(res.data as string);
      const { data } = await httpsCallable(functions, 'getUser')();
      dispatch(setUser(data as UserInterface));
    } catch (err) {
      console.error(err);
      toast(`Error: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const onVerify = async () => {
    try {
      setLoading(true);
      const res = await httpsCallable(functions, 'sendVerificationEmail')();
      toast(res.data as string);
    } catch (err) {
      console.error(err);
      toast(`Error: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title='Update Email'
      hideModal={hideModal}
      onDone={
        debouncedEmail && debouncedEmail !== existingEmail ? onDone : undefined
      }
      disabled={loading || !enabled}
    >
      <div className={styles['form-column']}>
        <div>
          <div className={styles['input']}>
            <label htmlFor='email'>Email</label>
            <input
              type='email'
              name='email'
              id='email'
              placeholder='janedoe@mail.com'
              pattern={EMAIL_PATTERN.source}
              onChange={(e) => setEmail(e.target.value.trim())}
              value={email}
            />
          </div>
          {emailMsg && (
            <span className={styles['input-message-error']}>{emailMsg}</span>
          )}
        </div>
        {existingEmail && !emailVerified && debouncedEmail === existingEmail && (
          <button
            type='submit'
            className={styles['btn-blue-centered']}
            onClick={onVerify}
            disabled={loading}
            title='Verify Email'
          >
            Verify Email
          </button>
        )}
        {loading && <Loader />}
      </div>
    </Modal>
  );
};

export default UpdateName;
