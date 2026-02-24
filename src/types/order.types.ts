export interface OrderHistoryItem {
  id: number;
  movie_id: number;
  movie_title: string;
  cinema_name: string;
  room_name: string;
  showtime_date: string;
  showtime_time: string;
  tickets_count: number;
  total_amount: number;
  created_at: string;
}

export interface OrdersResponse {
  orders: OrderHistoryItem[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** Compra de suscripción (plan) para el historial unificado */
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

/** Ítem del historial unificado: ticket o suscripción */
export type PurchaseHistoryItem =
  | { type: "ticket"; data: OrderHistoryItem }
  | { type: "subscription"; data: SubscriptionPurchaseItem };
