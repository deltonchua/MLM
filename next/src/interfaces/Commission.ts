import { LineItemInterface } from './Product';

export interface CommissionInterface {
  paymentID: string;
  rate: number;
  amount: {
    usd: number;
    ito: number;
  };
  items: LineItemInterface[];
  createdAt: number;
  updatedAt: number;
}

export interface PayoutInterface {
  address: string;
  amount: {
    usd: number;
    ito: number;
  };
  status: 'pending' | 'success' | 'failed' | 'canceled';
  txID: string;
  createdAt: number;
  updatedAt: number;
}
