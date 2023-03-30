import Link from 'next/link';
import styles from './home/Home.module.scss';

const NotFound = () => {
  return (
    <section className={styles['hero']}>
      <div className={styles['img']}>
        <img src='/images/404.svg' alt='' />
      </div>
      <div className={styles['container-sm']}>
        <h1>Not found</h1>
        <p>The page you are looking for does not exist.</p>
        <Link href='/'>
          <a className={styles['btn-filled']}>Take Me Home</a>
        </Link>
      </div>
    </section>
  );
};

export default NotFound;
