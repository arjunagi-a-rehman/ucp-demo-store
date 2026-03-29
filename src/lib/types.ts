export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  imageUrl: string;
  inventory: number;
  sku: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface BuyerAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
}

export interface BuyerInfo {
  email: string;
  shippingAddress: BuyerAddress;
  paymentMethod: string;
}

export interface CheckoutSession {
  id: string;
  userId: string;
  status: "incomplete" | "ready_for_complete" | "complete";
  lineItems: LineItem[];
  buyer: BuyerInfo | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LineItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  status: "processing" | "shipped" | "delivered";
  lineItems: LineItem[];
  buyer: BuyerInfo;
  total: number;
  trackingUrl: string | null;
  checkoutSessionId: string;
  createdAt?: Date;
}

export interface UserProfile {
  email: string;
  displayName: string;
  photoURL: string;
  role: "customer" | "admin";
  createdAt?: Date;
}
