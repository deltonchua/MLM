import styles from './Product.module.scss';

const Photos = ({ photos }: { photos: string[] }) => {
  return (
    <section className={styles['photos']}>
      <h2 className={styles['section-title']}>Photos</h2>
      <div>
        <div className={styles['gallery']}>
          {photos.map((p, i) => (
            <div className={styles['img']} key={i}>
              <img src={p} alt='' />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Photos;
