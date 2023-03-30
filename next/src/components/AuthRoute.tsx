import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAppSelector } from '../app/hooks';
import { selectAuth } from '../slices/authSlice';
import { selectUser } from '../slices/userSlice';
import PageLoader from './PageLoader';

const AuthRoute = ({
  requireAuth = true,
  redirectURL = '/signin',
  children,
}: {
  requireAuth?: boolean;
  redirectURL?: string;
  children: JSX.Element;
}) => {
  const router = useRouter();
  const auth = useAppSelector(selectAuth);
  const user = useAppSelector(selectUser);

  useEffect(() => {
    if (auth === undefined) return;
    if ((requireAuth && (!auth || !user)) || (!requireAuth && (auth || user)))
      router.push(redirectURL);
  }, [requireAuth, redirectURL, router, auth, user]);

  return auth === undefined ||
    (requireAuth && (!auth || !user)) ||
    (!requireAuth && (auth || user)) ? (
    <PageLoader />
  ) : (
    children
  );
};

export default AuthRoute;
