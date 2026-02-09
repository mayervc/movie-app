import api from "./api";
import type { TicketPurchaseResponse } from "@/types/ticket.types";

export const ticketsService = {
  /**
   * Comprar tickets (requiere auth)
   */
  purchase: async (
    showtimeId: number,
    seatIds: number[]
  ): Promise<TicketPurchaseResponse> => {
    const { data } = await api.post("/tickets", {
      showtime_id: showtimeId,
      seats: seatIds,
    });
    return data;
  },

  /**
   * Generar token de Google Wallet (opcional, requiere auth)
   */
  generateWalletToken: async (
    ticketId: number
  ): Promise<{ token: string; ticket_id: number }> => {
    const { data } = await api.post("/tickets/google-wallet-token", {
      ticketId,
    });
    return data;
  },
};
