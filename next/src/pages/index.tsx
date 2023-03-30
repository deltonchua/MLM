import type { NextPage } from 'next';
import Meta from '../components/Meta';
import HomeComponent from '../components/home';
import styles from './Main.module.scss';

const Home: NextPage = () => {
  return (
    <main className={styles['bg-gray']}>
      <Meta />
      <div className={styles['container-md']}>
        <HomeComponent />
      </div>
    </main>
  );
};

export default Home;
