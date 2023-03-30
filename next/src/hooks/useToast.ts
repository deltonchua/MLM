import { useAppDispatch } from '../app/hooks';
import { toast } from '../slices/toastSlice';

const useToast = () => {
  const dispatch = useAppDispatch();
  return (message: string) => dispatch(toast(message));
};

export default useToast;
