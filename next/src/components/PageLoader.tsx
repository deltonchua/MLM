import styles from './PageLoader.module.scss';

const PageLoader = () => {
  return (
    <div className={styles['container']}>
      <img src='/images/logo.png' alt='Big Family' title='Loading' />
    </div>
  );
};

export default PageLoader;
