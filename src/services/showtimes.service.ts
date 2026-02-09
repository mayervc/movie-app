import api from "./api";
import type {
  ShowtimeSearchParams,
  ShowtimeSearchResult,
  ShowtimeDetails,
} from "@/types/showtime.types";
import type { UserTicket } from "@/types/ticket.types";

export const showtimesService = {
  /**
   * Buscar showtimes disponibles (público, no requiere auth)
   */
  search: async (
    params: ShowtimeSearchParams
  ): Promise<ShowtimeSearchResult[]> => {
    const { data } = await api.post("/showtimes/search", params);
    return data.showtimes;
  },

  /**
   * Obtener detalles de un showtime específico (requiere auth)
   */
  getById: async (showtimeId: number): Promise<ShowtimeDetails> => {
    const { data } = await api.get(`/showtimes/${showtimeId}`);
    return data;
  },

  /**
   * Obtener tickets del usuario para un showtime (requiere auth)
   */
  getUserTickets: async (showtimeId: number): Promise<UserTicket[]> => {
    const { data } = await api.get(`/showtimes/${showtimeId}/tickets`);
    return data.tickets;
  },
};
