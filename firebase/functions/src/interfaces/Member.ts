export interface RefInterface {
  uid: string;
  referralID: string;
  name: string;
  displayName: string;
  photoURL?: string;
}

// members/{uid}/downline/{id}
export interface DownlineInterface extends RefInterface {
  joined: FirebaseFirestore.Timestamp;
}

// members/{uid}
export interface MemberInterface {
  uid: string;
  name: string;
  displayName: string;
  photoURL?: string;
  referralID: string;
  referredBy?: RefInterface;
  upline?: string[];
  totalCommission?: number;
  totalPayout?: number;
  availablePayout?: number;
  lastPayout?: FirebaseFirestore.Timestamp;
  joined: FirebaseFirestore.Timestamp;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}
