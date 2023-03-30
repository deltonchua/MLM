import Link from 'next/link';
import { ProductInterface } from '../../interfaces/Product';
import { formatPrice } from '../../utils/format';
import styles from './Store.module.scss';

const StoreFront = ({ products }: { products: ProductInterface[] }) => {
  return (
    <section className={styles['products']}>
      {products
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((p, i) => {
          const { linkID, images, name, metadata, prices, category } = p;
          return (
            <Link href={`/store/${linkID}`} key={i}>
              <a title={name}>
                <div className={styles['img']}>
                  <img src={images[0]} alt='' />
                </div>
                <div className={styles['product-info']}>
                  <div>
                    <span>{metadata.seller}</span>
                    <p>{name}</p>
                  </div>
                  <div className={styles['btm']}>
                    <p className={styles['btn-sm']}>
                      {category[0].toUpperCase()}
                    </p>
                    <p>${formatPrice(prices[0].unit_amount / 100)}</p>
                  </div>
                </div>
              </a>
            </Link>
          );
        })}
    </section>
  );
};

export default StoreFront;
