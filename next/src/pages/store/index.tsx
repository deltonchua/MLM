import type { NextPage, GetStaticProps } from 'next';
import { ProductInterface } from '../../interfaces/Product';
import Meta from '../../components/Meta';
import StoreFront from '../../components/store/StoreFront';
import products from '../../db/products.json';
import styles from '../Main.module.scss';

interface StoreProps {
  products: ProductInterface[];
}

const Store: NextPage<StoreProps> = ({ products }) => {
  return (
    <main className={styles['bg-gray']}>
      <Meta title='Store | Big Family' />
      <div className={styles['container-md']}>
        <h1 className={styles['page-title']}>Store</h1>
        <h3 className={styles['page-subtitle']}>Shop Here</h3>
        <StoreFront products={products} />
      </div>
    </main>
  );
};

export const getStaticProps: GetStaticProps = () => {
  return {
    props: {
      products,
    },
  };
};

export default Store;
