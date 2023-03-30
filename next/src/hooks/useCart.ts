import { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { selectCart, setCart } from '../slices/cartSlice';

const useCart = () => {
  const cart = useAppSelector(selectCart);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const storage = localStorage.getItem('cart');
    dispatch(setCart(storage ? JSON.parse(storage) : {}));
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);
};

export default useCart;
