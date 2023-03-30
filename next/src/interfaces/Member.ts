export interface RefInterface {
  uid: string;
  referralID: string;
  name: string;
  displayName: string;
  photoURL?: string;
}

export interface DownlineInterface extends RefInterface {
  joined: number;
}

export interface MemberInterface {
  uid: string;
  name: string;
  displayName: string;
  photoURL?: string;
  referralID: string;
  referredBy?: RefInterface;
  downline: DownlineInterface[];
  weeklyCommission: number;
  monthlyCommission: number;
  totalCommission?: number;
  totalPayout?: number;
  availablePayout?: number;
  lastPayout?: number;
  joined: number;
}
