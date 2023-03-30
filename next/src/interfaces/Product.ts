export interface PriceInterface {
  id: string;
  product: string;
  active: boolean;
  unit_amount: number;
  currency: string;
  type: 'one_time' | 'recurring';
}

export interface LineItemInterface {
  amount_subtotal: number;
  amount_total: number;
  currency: string;
  description: string;
  id: string;
  object: 'item';
  price: PriceInterface;
  quantity: number | null;
}

type ProductCategory = 'food';

export interface ProductInterface {
  id: string;
  active: boolean;
  name: string;
  description: string;
  shippable: boolean | null;
  unit_label: string;
  images: string[];
  metadata: {
    seller: string;
    origin: string;
    [key: string]: string;
  };
  prices: PriceInterface[];
  category: ProductCategory[];
  linkID: string;
}

export interface CartItemInterface {
  productID: string;
  priceID: string;
  linkID: string;
  name: string;
  unit_label: string;
  unit_amount: number;
  quantity: number;
  image: string;
  seller: string;
}

export interface CartInterface {
  [priceID: string]: CartItemInterface;
}

export interface PaymentInterface {
  id: string;
  amount: number;
  updatedAt: number;
  items: LineItemInterface[];
}
