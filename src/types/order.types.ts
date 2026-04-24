export interface SubscriptionPurchaseItem {
  id: number;
  plan_slug: string;
  plan_name: string;
  total_amount: number;
  created_at: string;
}

export interface SubscriptionPurchasesResponse {
  purchases: SubscriptionPurchaseItem[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
