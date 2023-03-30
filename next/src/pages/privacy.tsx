import type { NextPage } from 'next';
import Meta from '../components/Meta';
import PrivacyPolicy from '../components/Privacy';
import styles from './Main.module.scss';

const Privacy: NextPage = () => {
  return (
    <main>
      <Meta title='Privacy Policy | Big Family' />
      <div className={styles['container-sm']}>
        <h1 className={styles['page-title']}>Privacy Policy</h1>
        <PrivacyPolicy />
      </div>
    </main>
  );
};

export default Privacy;
