import api from "./api";
import type { Cinema, CinemaSearchResponse } from "@/types/cinema.types";

export const cinemasService = {
  search: async (params: {
    q?: string;
    page?: number;
    limit?: number;
  }): Promise<CinemaSearchResponse> => {
    const { data } = await api.get("/cinemas/search", { params });
    return data;
  },

  getAll: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<CinemaSearchResponse> => {
    const { data } = await api.get("/cinemas", { params });
    return data;
  },

  getById: async (id: number): Promise<Cinema> => {
    const { data } = await api.get(`/cinemas/${id}`);
    return data;
  },
};
