export interface CreateCheckoutSessionRequest {
  showtime_id: number;
  seat_ids: number[];
  /** Opcional: para que el BE arme success_url y cancel_url con el movieId */
  movie_id?: number;
  /** Email del usuario para que Stripe envíe la factura/recibo automáticamente */
  customer_email?: string;
}

export interface CreateCheckoutSessionResponse {
  url: string;
  sessionId?: string;
}

// === Estado de sesión ===

export interface SessionStatusResponse {
  status: "complete" | "expired" | "open";
  payment_status: "paid" | "unpaid" | "no_payment_required";
  customer_email?: string;
}

// === Reembolsos ===

export interface RefundRequest {
  ticket_id: number;
  reason?: "duplicate" | "fraudulent" | "requested_by_customer";
}

export interface RefundResponse {
  refund_id: string;
  status: "succeeded" | "pending" | "failed";
  amount: number;
}
