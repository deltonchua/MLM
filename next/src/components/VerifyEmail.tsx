import styles from './home/Home.module.scss';

const VerifyEmail = () => {
  return (
    <section className={styles['hero']}>
      <div className={styles['img']}>
        <img src='/images/mail.svg' alt='' />
      </div>
      <div className={styles['container-sm']}>
        <h1>Verifying...</h1>
        <p>Please hold while we verify your email.</p>
      </div>
    </section>
  );
};

export default VerifyEmail;
