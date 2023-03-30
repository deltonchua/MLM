import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAppSelector } from '../app/hooks';
import { selectAuth } from '../slices/authSlice';
import PageLoader from './PageLoader';

const MemberRoute = ({
  requireMembership = true,
  redirectURL = '/signup',
  children,
}: {
  requireMembership?: boolean;
  redirectURL?: string;
  children: JSX.Element;
}) => {
  const router = useRouter();
  const auth = useAppSelector(selectAuth);

  useEffect(() => {
    if (auth === undefined) return;
    if (!auth) {
      router.push('/signin');
      return;
    }
    if (
      (requireMembership && !auth.member) ||
      (!requireMembership && auth.member)
    ) {
      router.push(redirectURL);
      return;
    }
  }, [requireMembership, redirectURL, router, auth]);

  return !auth ||
    (requireMembership && !auth.member) ||
    (!requireMembership && auth.member) ? (
    <PageLoader />
  ) : (
    children
  );
};

export default MemberRoute;
