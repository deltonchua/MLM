import Stripe from 'stripe';

export const UPLINE_COMMISSION_RATE = 0.01;
export const BUYER_COMMISSION_RATE = 0.41;
export const DEFAULT_ITO_PRICE = 500;
export const MIN_PAYOUT = 0.2;

// members/{uid}/commissions/{id}
export interface CommissionInterface {
  paymentID: string;
  rate: number;
  amount: {
    usd: number;
    ito: number;
  };
  items: Stripe.LineItem[];
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

// members/{uid}/payout/{id}
export interface PayoutInterface {
  address: string;
  amount: {
    usd: number;
    ito: number;
  };
  status: 'pending' | 'success' | 'failed' | 'canceled';
  txID: string;
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}
