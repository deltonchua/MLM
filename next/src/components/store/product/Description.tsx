import styles from './Product.module.scss';

const Description = ({ description }: { description: string }) => {
  return (
    <section className={styles['description']}>
      <h2 className={styles['section-title']}>Description</h2>
      <p>{description}</p>
    </section>
  );
};

export default Description;
