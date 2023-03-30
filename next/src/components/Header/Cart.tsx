import Big from 'big.js';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import {
  selectCart,
  addCartItem,
  removeCartItem,
} from '../../slices/cartSlice';
import { CartInterface } from '../../interfaces/Product';
import { selectAuth } from '../../slices/authSlice';
import { selectUser } from '../../slices/userSlice';
import { useFunctions } from '../../hooks/firebase';
import useToast from '../../hooks/useToast';
import Modal from '../Modal';
import Column from '../Column';
import LinkItem from '../Column/LinkItem';
import { formatPrice } from '../../utils/format';
import StoreIcon from '../../icons/Store';
import DiamondIcon from '../../icons/Diamond';
import ArticleIcon from '../../icons/Article';
import ArrowUpIcon from '../../icons/ArrowUp';
import ArrowDownIcon from '../../icons/ArrowDown';
import Loader from '../Loader';
import styles from './Header.module.scss';

export const Content = () => {
  const cart = useAppSelector(selectCart);
  const auth = useAppSelector(selectAuth);
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const cartEmpty = useMemo(() => !cart || Object.keys(cart).length === 0, [
    cart,
  ]);
  const [loading, setLoading] = useState(false);

  const functions = useFunctions();
  const router = useRouter();
  const toast = useToast();

  const onClick = async () => {
    if (cartEmpty || loading) return;
    if (!auth || !user) {
      router.push('/signin');
      return;
    }
    try {
      setLoading(true);
      const res = await httpsCallable(
        functions,
        'checkout'
      )({
        lineItems: Object.values(cart as CartInterface).map((v) => ({
          price: v.priceID,
          quantity: v.quantity,
        })),
      });
      toast(`Redirecting to Stripe checkout page.`);
      router.push((res.data as { url: string }).url);
    } catch (err) {
      console.error(err);
      toast(`Error: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles['cart']}>
      <div>
        {cart && !cartEmpty && (
          <>
            <Column title='Items'>
              {Object.values(cart).map((item, i) => {
                const {
                  priceID,
                  linkID,
                  name,
                  unit_amount,
                  image,
                  seller,
                  quantity,
                } = item;
                return (
                  <div className={styles['item']} key={i}>
                    <Link href={`/store/${linkID}`}>
                      <a title={name}>
                        <div className={styles['img']}>
                          <img src={image} alt='' />
                        </div>
                        <div>
                          <p>{name}</p>
                          <span>{seller}</span>
                          <p className={styles['price']}>
                            ${formatPrice(unit_amount / 100)}
                          </p>
                        </div>
                      </a>
                    </Link>
                    <div className={styles['amount']}>
                      <button
                        onClick={() => {
                          dispatch(addCartItem(item));
                        }}
                        title='Add Item'
                      >
                        <ArrowUpIcon />
                      </button>
                      <p>{quantity}x</p>
                      <button
                        onClick={() => {
                          dispatch(removeCartItem(priceID));
                        }}
                        title='Reduce Item'
                      >
                        <ArrowDownIcon />
                      </button>
                    </div>
                  </div>
                );
              })}
              <div className={styles['order']}>
                <p>Total</p>
                <p>
                  $
                  {formatPrice(
                    Object.values(cart).reduce(
                      (a, b) =>
                        new Big(b.quantity)
                          .times(b.unit_amount / 100)
                          .plus(a)
                          .toNumber(),
                      0
                    )
                  )}
                </p>
              </div>
            </Column>
            {/* <Column title='Order Summary'>
              {Object.values(cart).map((item, i) => {
                const { name, unit_amount, quantity } = item;
                return (
                  <div className={styles['order']} key={i}>
                    <div>
                      <p>{name}</p>
                      <span>{quantity}x</span>
                    </div>
                    <p>
                      $
                      {formatPrice(
                        new Big(unit_amount / 100).times(quantity).toNumber()
                      )}
                    </p>
                  </div>
                );
              })}
              <div className={styles['order']}>
                <p>Total</p>
                <p>
                  $
                  {formatPrice(
                    Object.values(cart).reduce(
                      (a, b) =>
                        new Big(b.quantity)
                          .times(b.unit_amount / 100)
                          .plus(a)
                          .toNumber(),
                      0
                    )
                  )}
                </p>
              </div>
            </Column> */}
          </>
        )}
        <Column title='Links'>
          <LinkItem link='/store' Img={StoreIcon} name='Continue Shopping' />
          <LinkItem link='/mlm/u' Img={DiamondIcon} name='Earn Rewards' />
          <LinkItem
            link='/store/history'
            Img={ArticleIcon}
            name='Purchase History'
          />
        </Column>
      </div>
      {!cartEmpty && (
        <button
          className={styles['btn-blue-centered']}
          title='Check Out'
          disabled={cartEmpty || loading}
          onClick={onClick}
        >
          Check Out
        </button>
      )}
      {loading && <Loader />}
    </div>
  );
};

const Cart = ({ hideModal }: { hideModal: () => void }) => (
  <Modal title='Cart' hideModal={hideModal}>
    <Content />
  </Modal>
);

export default Cart;
