import Big from 'big.js';
import { isAddress } from '@ethersproject/address';
import { ChangeEvent, FormEvent, useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { useAppSelector, useAppDispatch } from '../../../app/hooks';
import { selectMember, setMember } from '../../../slices/memberSlice';
import { MemberInterface } from '../../../interfaces/Member';
import { useFunctions } from '../../../hooks/firebase';
import useSignMessage from '../../../hooks/useSignMessage';
import useToast from '../../../hooks/useToast';
import { ADDRESS_PATTERN, MIN_PAYOUT } from '../../../utils/constants';
import Modal from '../../Modal';
import Loader from '../../Loader';
import styles from './MLM.module.scss';

const Content = () => {
  const { uid, availablePayout = 0 } = useAppSelector(
    selectMember
  ) as MemberInterface;
  const [address, setAddress] = useState(uid);
  const [addressError, setAddressError] = useState(false);
  const maxPayout = new Big(availablePayout).round(3, 0).toNumber();
  const [amount, setAmount] = useState<number | string>(
    Math.min(MIN_PAYOUT, maxPayout)
  );
  const [loading, setLoading] = useState(false);

  const onAddressChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newAddress = e.target.value.trim();
    setAddress(newAddress);
    if (!newAddress) {
      setAddressError(false);
      return;
    }
    setAddressError(!isAddress(newAddress));
  };

  const onAmountChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newAmount = e.target.value;
    setAmount(
      newAmount ? new Big(newAmount).round(3, 0).toNumber() : newAmount
    );
  };

  const functions = useFunctions();
  const signMessage = useSignMessage();
  const toast = useToast();
  const dispatch = useAppDispatch();
  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!address || addressError || !amount || amount > maxPayout) return;
    let signature;
    try {
      setLoading(true);
      signature = await signMessage(`Withdraw ${amount} ITO to ${address}`);
    } catch (err) {
      console.error(err);
      toast(`Error: ${(err as Error).message}`);
      setLoading(false);
    }
    if (!signature) return;
    const data = {
      address: address.trim(),
      amount,
      signature,
    };
    try {
      const { data: payoutData } = await httpsCallable(
        functions,
        'payout'
      )(data);
      toast(payoutData as string);
      const { data: memberData } = await httpsCallable(
        functions,
        'getMember'
      )();
      dispatch(setMember(memberData as MemberInterface));
    } catch (err) {
      console.error(err);
      toast(`Error: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className={styles['withdraw']} onSubmit={onSubmit}>
      <div>
        <div>
          <div className={styles['input']}>
            <label htmlFor='address'>Address</label>
            <input
              type='text'
              name='address'
              id='address'
              placeholder='0xabc123...'
              minLength={42}
              maxLength={42}
              pattern={ADDRESS_PATTERN.source}
              onChange={onAddressChange}
              value={address}
              required
            />
          </div>
          {addressError && (
            <span className={styles['input-message-error']}>
              Invalid Ethereum address.
            </span>
          )}
        </div>
        <div className={styles['input']}>
          <label htmlFor='amount'>Amount (ITO)</label>
          <input
            type='number'
            name='amount'
            id='amount'
            placeholder={MIN_PAYOUT.toString()}
            min={MIN_PAYOUT}
            max={maxPayout}
            step={1e-3}
            onChange={onAmountChange}
            value={amount}
            required
          />
          <span
            onClick={(e) => {
              setAmount(maxPayout);
            }}
            title='Maximum'
          >
            MAX
          </span>
        </div>
      </div>
      <button
        type='submit'
        className={styles['btn-blue-centered']}
        disabled={loading}
        title='Withdraw'
      >
        Withdraw
      </button>
      {loading && <Loader />}
    </form>
  );
};

const CashOut = ({ hideModal }: { hideModal: () => void }) => (
  <Modal title='Withdraw' hideModal={hideModal}>
    <Content />
  </Modal>
);

export default CashOut;
