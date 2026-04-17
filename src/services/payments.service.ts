import api from "./api";
import type {
  CreateCheckoutSessionRequest,
  CreateCheckoutSessionResponse,
} from "@/types/payment.types";
import type { TicketPurchaseResponse } from "@/types/ticket.types";

export const paymentsService = {
  createCheckoutSession: async (
    showtimeId: number,
    seatIds: number[],
    successUrl: string,
    cancelUrl: string
  ): Promise<CreateCheckoutSessionResponse> => {
    const body: CreateCheckoutSessionRequest = {
      showtimeId,
      seatIds,
      successUrl,
      cancelUrl,
    };
    const { data } = await api.post<CreateCheckoutSessionResponse>(
      "/payments/create-checkout-session",
      body
    );
    return data;
  },

  getOrderBySession: async (
    sessionId: string
  ): Promise<TicketPurchaseResponse | null> => {
    try {
      const { data } = await api.get<TicketPurchaseResponse>(
        "/payments/order-by-session",
        { params: { sessionId } }
      );
      return data;
    } catch {
      return null;
    }
  },
};
