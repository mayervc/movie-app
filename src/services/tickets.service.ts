import api from "./api";
import type { Ticket, TicketPurchaseResponse } from "@/types/ticket.types";

export const ticketsService = {
  purchase: async (
    showtimeId: number,
    seatIds: number[],
    paymentIntentId: string
  ): Promise<TicketPurchaseResponse> => {
    const { data } = await api.post("/tickets", {
      showtimeId,
      seatIds,
      paymentIntentId,
    });
    return data;
  },

  getById: async (id: number): Promise<Ticket> => {
    const { data } = await api.get(`/tickets/${id}`);
    return data;
  },

  cancel: async (id: number): Promise<void> => {
    await api.delete(`/tickets/${id}`);
  },
};
