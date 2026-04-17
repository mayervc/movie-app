export interface CreateCheckoutSessionRequest {
  showtimeId: number;
  seatIds: number[];
  successUrl: string;
  cancelUrl: string;
}

export interface CreateCheckoutSessionResponse {
  url: string;
  sessionId?: string;
}

// === Session status ===

export interface SessionStatusResponse {
  status: "complete" | "expired" | "open";
  payment_status: "paid" | "unpaid" | "no_payment_required";
  customer_email?: string;
}

// === Refunds ===

export interface RefundRequest {
  ticket_id: number;
  reason?: "duplicate" | "fraudulent" | "requested_by_customer";
}

export interface RefundResponse {
  refund_id: string;
  status: "succeeded" | "pending" | "failed";
  amount: number;
}
