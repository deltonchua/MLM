import styles from './Loader.module.scss';

const Loader = () => {
  return (
    <div className={styles['container']}>
      <img src='/images/loader.svg' alt='Loading' title='Loading' />
    </div>
  );
};

export default Loader;
