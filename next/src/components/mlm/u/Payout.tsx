import Link from 'next/link';
import { useAppSelector } from '../../../app/hooks';
import useModal from '../../../hooks/useModal';
import useToast from '../../../hooks/useToast';
import { selectMember } from '../../../slices/memberSlice';
import { MemberInterface } from '../../../interfaces/Member';
import { formatFund } from '../../../utils/format';
import { MIN_PAYOUT } from '../../../utils/constants';
import Withdraw from './Withdraw';
import styles from './MLM.module.scss';

const Payout = () => {
  const { totalPayout = 0, availablePayout = 0 } = useAppSelector(
    selectMember
  ) as MemberInterface;
  const { modalOpen, showModal, hideModal } = useModal();
  const toast = useToast();

  return (
    <section className={styles['payout']}>
      <header className={styles['section-header']}>
        <h2 className={styles['section-title']}>Payout</h2>
        <div>
          <Link href='/mlm/u/payout'>
            <a title='See History'>See History</a>
          </Link>
        </div>
      </header>
      <div className={styles['grid']}>
        <div>
          <div>
            <p>Total</p>
            <span>{formatFund(totalPayout)} ITO</span>
          </div>
        </div>
        <div>
          <div>
            <p>Available</p>
            <span>{formatFund(availablePayout)} ITO</span>
          </div>
          <button
            className={styles['btn-sm']}
            onClick={() => {
              availablePayout < MIN_PAYOUT
                ? toast(
                    `Insufficient commission. Minimum payout is ${MIN_PAYOUT} ITO.`
                  )
                : showModal();
            }}
            title='Withdraw'
          >
            Withdraw
          </button>
        </div>
      </div>
      {modalOpen && <Withdraw hideModal={hideModal} />}
    </section>
  );
};

export default Payout;
