import api from "./api";
import type {
  CinemaSearchParams,
  CinemaSearchResponse,
} from "@/types/cinema.types";

export const cinemasService = {
  /**
   * Buscar cinemas (requiere autenticación)
   */
  search: async (
    params: CinemaSearchParams
  ): Promise<CinemaSearchResponse> => {
    const { data } = await api.post("/cinemas/search", params);
    return data;
  },
};
