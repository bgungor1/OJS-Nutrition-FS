export interface PaymentTransactionResponse {
  id: string;
  order_id: string;
  provider: string;
  provider_ref: string;
  card_type: string;
  last4: string;
  status: string;
  created_at: string;
}
