import { useAppSelector } from '../../../app/hooks';
import { selectMember } from '../../../slices/memberSlice';
import { MemberInterface } from '../../../interfaces/Member';
import Profile from './Profile';
import Commission from './Commission';
import Payout from './Payout';
import Referrer from './Referrer';
import Recruits from './Recruits';

const Member = () => {
  const { referredBy } = useAppSelector(selectMember) as MemberInterface;

  return (
    <>
      <Profile />
      <Commission />
      <Payout />
      {referredBy && <Referrer />}
      <Recruits />
    </>
  );
};

export default Member;
