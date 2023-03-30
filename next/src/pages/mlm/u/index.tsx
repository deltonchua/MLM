import type { NextPage } from 'next';
import { useEffect, useMemo } from 'react';
import { httpsCallable } from 'firebase/functions';
import { useFunctions } from '../../../hooks/firebase';
import { useAppSelector, useAppDispatch } from '../../../app/hooks';
import { selectMember, setMember } from '../../../slices/memberSlice';
import { MemberInterface } from '../../../interfaces/Member';
import useToast from '../../../hooks/useToast';
import PageLoader from '../../../components/PageLoader';
import MemberRoute from '../../../components/MemberRoute';
import Meta from '../../../components/Meta';
import MemberComponent from '../../../components/mlm/u';
import styles from '../../Main.module.scss';

const Member = () => {
  const functions = useFunctions();
  const member = useAppSelector(selectMember);
  const dispatch = useAppDispatch();
  const toast = useToast();

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const res = await httpsCallable(functions, 'getMember')();
        dispatch(setMember(res.data as MemberInterface));
      } catch (err) {
        console.error(err);
        toast(`Error: ${(err as Error).message}`);
      }
    };
    fetchMember();
    // eslint-disable-next-line
  }, []);

  return member ? (
    <main>
      <Meta title='Member Profile | Big Family' />
      <div className={styles['container-md']}>
        <h1 className={styles['page-title']}>MLM</h1>
        <h3 className={styles['page-subtitle']}>My Profile</h3>
        <MemberComponent />
      </div>
    </main>
  ) : (
    <PageLoader />
  );
};

const MemberPage: NextPage = () => (
  <MemberRoute>
    <Member />
  </MemberRoute>
);

export default MemberPage;
