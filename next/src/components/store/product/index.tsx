import { ProductInterface } from '../../../interfaces/Product';
import Profile from './Profile';
import Photos from './Photos';
import Description from './Description';
import Info from './Info';

const Product = ({ product }: { product: ProductInterface }) => {
  return (
    <>
      <Profile product={product} />
      <Photos photos={product.images} />
      <Description description={product.description} />
      <Info product={product} />
    </>
  );
};

export default Product;
