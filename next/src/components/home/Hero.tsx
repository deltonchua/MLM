import Link from 'next/link';
import styles from './Home.module.scss';

const Hero = () => {
  return (
    <section className={styles['hero']}>
      <div className={styles['img']}>
        <img src='/images/world.svg' alt='' />
      </div>
      <div className={styles['container-sm']}>
        <h1>A Big Family multi-level experience</h1>
        <p>Tell a friend and earn referral commission on every purchase.</p>
        <Link href='/mlm/u'>
          <a className={styles['btn-filled']}>Sign Up</a>
        </Link>
      </div>
    </section>
  );
};

export default Hero;
