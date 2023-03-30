import Link from 'next/link';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { selectCart, addCartItem } from '../../../slices/cartSlice';
import { ProductInterface } from '../../../interfaces/Product';
import useToast from '../../../hooks/useToast';
import { formatPrice } from '../../../utils/format';
import styles from './Product.module.scss';

const Profile = ({ product }: { product: ProductInterface }) => {
  const {
    id: productID,
    linkID,
    name,
    images,
    prices,
    unit_label,
    metadata,
  } = product;
  const { id: priceID, unit_amount } = prices[0];
  const cart = useAppSelector(selectCart);
  const dipsatch = useAppDispatch();
  const toast = useToast();

  return (
    <section className={styles['profile']}>
      <div className={styles['img']}>
        <img src={images[0]} alt='' />
      </div>
      <div className={styles['right']}>
        <div>
          <h1>{name}</h1>
          <span>{metadata.seller}</span>
        </div>
        <div className={styles['btm']}>
          {cart && cart[priceID] ? (
            <Link href='/store/cart'>
              <a className={styles['btn-sm']} title='View Cart'>
                VIEW CART
              </a>
            </Link>
          ) : (
            <button
              className={styles['btn-sm']}
              title='Add to Cart'
              onClick={() => {
                dipsatch(
                  addCartItem({
                    priceID,
                    productID,
                    linkID,
                    name,
                    unit_amount,
                    unit_label,
                    image: images[0],
                    quantity: 1,
                    seller: metadata.seller,
                  })
                );
                toast(`${name} added to cart.`);
              }}
            >
              ADD TO CART
            </button>
          )}
          <p className={styles['price']}>${formatPrice(unit_amount / 100)}</p>
        </div>
      </div>
    </section>
  );
};

export default Profile;
