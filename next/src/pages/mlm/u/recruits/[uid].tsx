import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { useFunctions } from '../../../../hooks/firebase';
import { useAppDispatch, useAppSelector } from '../../../../app/hooks';
import { setRecruit, selectRecruit } from '../../../../slices/recruitSlice';
import useToast from '../../../../hooks/useToast';
import MemberRoute from '../../../../components/MemberRoute';
import Meta from '../../../../components/Meta';
import PageLoader from '../../../../components/PageLoader';
import PageHeader from '../../../../components/Header/PageHeader';
import Profile from '../../../../components/mlm/recruits/Profile';
import Recruits from '../../../../components/mlm/recruits/Recruits';
import styles from '../../../Main.module.scss';
import { MemberInterface } from '../../../../interfaces/Member';

const Recruit = () => {
  const router = useRouter();
  const { uid } = router.query;
  const recruit = useAppSelector(selectRecruit);
  const functions = useFunctions();
  const dispatch = useAppDispatch();
  const toast = useToast();

  useEffect(() => {
    const fetchRecruit = async () => {
      try {
        const res = await httpsCallable(functions, 'getDownline')({ id: uid });
        dispatch(setRecruit(res.data as MemberInterface));
      } catch (err) {
        console.error(err);
        toast(`Error: ${(err as Error).message}`);
      }
    };
    fetchRecruit();
    // eslint-disable-next-line
  }, []);

  return recruit ? (
    <main className={styles['enter']}>
      <Meta title='Recruit | Big Family' />
      <PageHeader title='Recruit' />
      <div className={styles['container-sm']}>
        <Profile />
        <Recruits />
      </div>
    </main>
  ) : (
    <PageLoader />
  );
};

const CommissionPage: NextPage = () => (
  <MemberRoute>
    <Recruit />
  </MemberRoute>
);

export default CommissionPage;
