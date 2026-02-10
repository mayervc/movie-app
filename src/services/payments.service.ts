import api from "./api";
import type {
  CreateCheckoutSessionRequest,
  CreateCheckoutSessionResponse,
} from "@/types/payment.types";
import type { TicketPurchaseResponse } from "@/types/ticket.types";

export const paymentsService = {
  /**
   * Crea una sesión de Stripe Checkout. El backend devuelve la URL
   * a la que redirigir al usuario. Requiere auth.
   */
  createCheckoutSession: async (
    showtimeId: number,
    seatIds: number[],
    movieId?: number
  ): Promise<CreateCheckoutSessionResponse> => {
    const body: CreateCheckoutSessionRequest = {
      showtime_id: showtimeId,
      seat_ids: seatIds,
      ...(movieId != null && { movie_id: movieId }),
    };
    const { data } = await api.post<CreateCheckoutSessionResponse>(
      "/payments/create-checkout-session",
      body
    );
    return data;
  },

  /**
   * Obtiene la orden/tickets por session_id (opcional en el BE).
   * Útil en la página de éxito para mostrar el detalle de la compra.
   */
  getOrderBySession: async (
    sessionId: string
  ): Promise<TicketPurchaseResponse | null> => {
    try {
      const { data } = await api.get<TicketPurchaseResponse>(
        "/payments/order-by-session",
        { params: { session_id: sessionId } }
      );
      return data;
    } catch {
      return null;
    }
  },
};
