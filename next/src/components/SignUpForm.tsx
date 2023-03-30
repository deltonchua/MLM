import Link from 'next/link';
import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/router';
import { httpsCallable } from 'firebase/functions';
import { useAppSelector } from '../app/hooks';
import { selectUser } from '../slices/userSlice';
import useIsMounted from '../hooks/useIsMounted';
import useToast from '../hooks/useToast';
import useSignMessage from '../hooks/useSignMessage';
import useDebounce from '../hooks/useDebounce';
import { useAuth, useFunctions } from '../hooks/firebase';
import { DISPLAY_NAME_PATTERN, EMAIL_PATTERN } from '../utils/constants';
import Loader from './Loader';
import styles from './SignUp.module.scss';
import Column from './Column';
import LinkItem from './Column/LinkItem';
import ArticleIcon from '../icons/Article';
import DiamondIcon from '../icons/Diamond';

const SignUpForm = () => {
  const user = useAppSelector(selectUser);
  const [name, setName] = useState(user?.name || '');
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const debouncedDisplayName = useDebounce(displayName);
  const [displayNameMsg, setDisplayNameMsg] = useState('');
  const [email, setEmail] = useState(user?.email || '');
  const router = useRouter();
  const [referralID, setReferralID] = useState(
    (router.query.ref as string) || ''
  );
  const [loading, setLoading] = useState(false);

  const functions = useFunctions();
  const isMounted = useIsMounted();
  const signMessage = useSignMessage();
  const toast = useToast();
  const { signOut } = useAuth();

  // Validate displayName
  useEffect(() => {
    const lookupDisplayName = async () => {
      const res = await httpsCallable(
        functions,
        'lookupDisplayName'
      )({ displayName: debouncedDisplayName });
      if (isMounted()) setDisplayNameMsg(res.data as string);
    };
    if (debouncedDisplayName && debouncedDisplayName !== user?.displayName) {
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
  }, [functions, isMounted, user?.displayName, debouncedDisplayName]);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (
      !name ||
      !debouncedDisplayName ||
      (debouncedDisplayName !== user?.displayName &&
        !displayNameMsg.includes('available')) ||
      !email
    )
      return;
    let signature;
    try {
      setLoading(true);
      signature = await signMessage('Sign Up');
    } catch (err) {
      console.error(err);
      toast(`Error: ${(err as Error).message}`);
      setLoading(false);
    }
    if (!signature) return;
    const data = {
      name: name.trim(),
      displayName: debouncedDisplayName.trim(),
      email: email.trim().toLowerCase(),
      referralID: referralID.trim(),
      signature,
    };
    try {
      const { data: resData } = await httpsCallable(functions, 'signUp')(data);
      toast(resData as string);
      signOut();
    } catch (err) {
      console.error(err);
      toast(`Error: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={styles['section']}>
      <form className={styles['form']} onSubmit={onSubmit}>
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
            required
            autoFocus
          />
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
              required
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
            required
          />
        </div>
        <div>
          <div className='input'>
            <label htmlFor='referralID'>Referral ID</label>
            <input
              type='text'
              name='referralID'
              id='referralID'
              placeholder='0xabc12345'
              onChange={(e) => setReferralID(e.target.value.trim())}
              value={referralID}
            />
          </div>
          <span className={styles['input-message']}>* Optional</span>
        </div>
        <Column>
          <LinkItem
            link='/terms'
            external={true}
            Img={ArticleIcon}
            name='Terms of Service'
          />
          <LinkItem
            link='/#membership'
            external={true}
            Img={DiamondIcon}
            name=' Member Benefits'
          />
        </Column>
        <button
          type='submit'
          className={styles['btn-filled']}
          disabled={loading}
          title='Sign Up'
        >
          Sign Up
        </button>
      </form>
      {loading && <Loader />}
    </section>
  );
};

export default SignUpForm;
