import type { NextPage } from 'next';
import AuthRoute from '../../components/AuthRoute';
import Meta from '../../components/Meta';
import UserData from '../../components/user';
import styles from '../Main.module.scss';

const User: NextPage = () => {
  return (
    <AuthRoute>
      <main className={styles['bg-gray']}>
        <Meta title='User Profile | Big Family' />
        <div className={styles['container-sm']}>
          <h1 className={styles['page-title']}>User</h1>
          <h3 className={styles['page-subtitle']}>My Profile</h3>
          <UserData />
        </div>
      </main>
    </AuthRoute>
  );
};

export default User;
