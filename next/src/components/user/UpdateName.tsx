import { useState, useEffect, useMemo } from 'react';
import { httpsCallable } from 'firebase/functions';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { selectUser, setUser } from '../../slices/userSlice';
import { UserInterface } from '../../interfaces/User';
import useDebounce from '../../hooks/useDebounce';
import useIsMounted from '../../hooks/useIsMounted';
import useToast from '../../hooks/useToast';
import { useFunctions } from '../../hooks/firebase';
import { DISPLAY_NAME_PATTERN } from '../../utils/constants';
import Modal from '../Modal';
import Loader from '../Loader';
import styles from './User.module.scss';

const UpdateName = ({ hideModal }: { hideModal: () => void }) => {
  const {
    name: existingName,
    displayName: existingDisplayName,
  } = useAppSelector(selectUser) as UserInterface;
  const [name, setName] = useState(existingName || '');
  const debouncedName = useDebounce(name);
  const [nameMsg, setNameMsg] = useState('');
  const [displayName, setDisplayName] = useState(existingDisplayName || '');
  const debouncedDisplayName = useDebounce(displayName);
  const [displayNameMsg, setDisplayNameMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const functions = useFunctions();
  const dispatch = useAppDispatch();
  const isMounted = useIsMounted();
  const toast = useToast();

  // Validate name
  useEffect(() => {
    if (!debouncedName) {
      setNameMsg('');
      return;
    }
    const trimmed = debouncedName.trim();
    if (trimmed.length < 4 || trimmed.length > 40) {
      setNameMsg('Name is invalid. Choose 4-40 characters.');
      return;
    }
    setNameMsg('');
  }, [debouncedName]);

  // Validate displayName
  useEffect(() => {
    const lookupDisplayName = async () => {
      const res = await httpsCallable(
        functions,
        'lookupDisplayName'
      )({ displayName: debouncedDisplayName });
      if (isMounted()) setDisplayNameMsg(res.data as string);
    };
    if (debouncedDisplayName && debouncedDisplayName !== existingDisplayName) {
      if (!DISPLAY_NAME_PATTERN.test(debouncedDisplayName)) {
        setDisplayNameMsg(
          'Display name is invalid. Choose 4-20 characters from a-Z, 0-9.'
        );
        return;
      }
      try {
        lookupDisplayName();
      } catch (err) {
        console.error(err);
        setDisplayNameMsg('Internal error. Please try again later.');
      }
      return;
    }
    setDisplayNameMsg('');
  }, [functions, isMounted, existingDisplayName, debouncedDisplayName]);

  const enabled = useMemo(
    () =>
      (debouncedName && debouncedName !== existingName && !nameMsg) ||
      (displayNameMsg && displayNameMsg.includes('available')),
    [debouncedName, existingName, nameMsg, displayNameMsg]
  );

  const onDone = async () => {
    if (!enabled) return;
    let update: {
      [key: string]: any;
    } = {};
    if (debouncedName && debouncedName !== existingName && !nameMsg) {
      update.name = debouncedName.trim();
    }
    if (displayNameMsg && displayNameMsg.includes('available')) {
      update.displayName = debouncedDisplayName.trim();
    }
    if (Object.keys(update).length === 0) return;
    try {
      setLoading(true);
      const res = await httpsCallable(functions, 'updateName')(update);
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

  return (
    <Modal
      title='Update Name'
      hideModal={hideModal}
      onDone={onDone}
      disabled={loading || !enabled}
    >
      <div className={styles['form']}>
        <div>
          <div className={styles['input']}>
            <label htmlFor='name'>Name</label>
            <input
              type='text'
              name='name'
              id='name'
              placeholder='Jane Doe'
              minLength={4}
              maxLength={40}
              onChange={(e) => setName(e.target.value)}
              value={name}
            />
          </div>
          {nameMsg && (
            <span className={styles['input-message-error']}>{nameMsg}</span>
          )}
        </div>
        <div>
          <div className={styles['input']}>
            <label htmlFor='displayName'>Display name</label>
            <input
              type='text'
              name='displayName'
              id='displayName'
              placeholder='janedoe42'
              minLength={4}
              maxLength={20}
              pattern={DISPLAY_NAME_PATTERN.source}
              onChange={(e) => setDisplayName(e.target.value.trim())}
              value={displayName}
            />
          </div>
          {displayNameMsg && (
            <span
              className={
                displayNameMsg.includes('available')
                  ? styles['input-message-success']
                  : styles['input-message-error']
              }
            >
              {displayNameMsg}
            </span>
          )}
        </div>
        {loading && <Loader />}
      </div>
    </Modal>
  );
};

export default UpdateName;
