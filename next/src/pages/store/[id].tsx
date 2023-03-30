import type { NextPage, GetStaticProps, GetStaticPaths } from 'next';
import { ParsedUrlQuery } from 'querystring';
import { ProductInterface } from '../../interfaces/Product';
import Meta from '../../components/Meta';
import PageHeader from '../../components/Header/PageHeader';
import ProductComponent from '../../components/store/product';
import products from '../../db/products.json';
import styles from '../Main.module.scss';

interface ProductProps {
  product: ProductInterface;
}

const Product: NextPage<ProductProps> = ({ product }) => {
  return (
    <main className={styles['enter']}>
      <Meta title={`${product.name} | Big Family`} />
      <PageHeader />
      <div className={styles['container-md']}>
        <ProductComponent product={product} />
      </div>
    </main>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = products.map((p) => ({
    params: { id: p.linkID },
  }));
  return {
    paths,
    fallback: false,
  };
};

interface ParamsInterface extends ParsedUrlQuery {
  id: string;
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { id } = params as ParamsInterface;
  return {
    props: {
      product: products.find((p) => p.linkID === id),
    },
  };
};

export default Product;
