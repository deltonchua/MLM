import { ProductInterface } from '../../../interfaces/Product';
import styles from './Product.module.scss';

const Info = ({ product }: { product: ProductInterface }) => {
  const { category, metadata } = product;
  const info = {
    category: category.join(', '),
    ...metadata,
  };

  return (
    <section className={styles['product-info']}>
      <h2 className={styles['section-title']}>Information</h2>
      <div className={styles['grid']}>
        {Object.entries(info).map((e, i) =>
          e[1] ? (
            <div key={i}>
              <p>{e[0]}</p>
              <span>{e[1]}</span>
            </div>
          ) : null
        )}
      </div>
    </section>
  );
};

export default Info;
