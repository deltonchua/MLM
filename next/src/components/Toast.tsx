import { useCallback, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { selectToasts, removeToast } from '../slices/toastSlice';
import { ToastInterface } from '../interfaces/Toast';
import styles from './Toast.module.scss';

const TIMEOUT = 4_000;

const Toast = ({ toast }: { toast: ToastInterface }) => {
  const dispatch = useAppDispatch();
  const clearMessage = useCallback(() => {
    dispatch(removeToast(toast.timestamp));
  }, [dispatch, toast.timestamp]);

  useEffect(() => {
    setTimeout(clearMessage, TIMEOUT);
  }, [clearMessage]);

  return (
    <div className={styles['message']}>
      <span>{toast.message}</span>
      <button onClick={clearMessage} title='OK'>
        OK
      </button>
    </div>
  );
};

const ToastContainer = () => {
  const toasts = useAppSelector(selectToasts);
  return (
    <div>
      {toasts.map((t, i) => (
        <Toast toast={t} key={i} />
      ))}
    </div>
  );
};

export default ToastContainer;
