import type { NextPage } from 'next';
import Meta from '../components/Meta';
import NotFoundComponent from '../components/NotFound';
import styles from './Main.module.scss';

const NotFound: NextPage = () => {
  return (
    <main className={styles['bg-gray']}>
      <Meta title='404 | Big Family' />
      <div className={styles['container-md']}>
        <NotFoundComponent />
      </div>
    </main>
  );
};

export default NotFound;
