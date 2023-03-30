import type { NextPage } from 'next';
import MemberRoute from '../components/MemberRoute';
import Meta from '../components/Meta';
import Form from '../components/SignUpForm';
import styles from './Main.module.scss';

const SignUp: NextPage = () => {
  return (
    <MemberRoute requireMembership={false} redirectURL='/mlm/u'>
      <main className={styles['bg-gray']}>
        <Meta title='Sign Up | Big Family' />
        <div className={styles['container-sm']}>
          <h1 className={styles['page-title']}>Sign Up</h1>
          <h3 className={styles['page-subtitle']}>
            Join Big Family&#39;s multi-level marketing team.
          </h3>
          <Form />
        </div>
      </main>
    </MemberRoute>
  );
};

export default SignUp;
