import type { NextPage } from 'next';
import Meta from '../components/Meta';
import TermsOfService from '../components/Terms';
import styles from './Main.module.scss';

const Terms: NextPage = () => {
  return (
    <main>
      <Meta title='Terms of Service | Big Family' />
      <div className={styles['container-sm']}>
        <h1 className={styles['page-title']}>Terms of Service</h1>
        <TermsOfService />
      </div>
    </main>
  );
};

export default Terms;
