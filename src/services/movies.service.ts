import api from "./api";
import type { Movie } from "@/types/movie.types";
import type { PaginatedResponse } from "@/types/api.types";

export const getMovies = async (params?: {
  page?: number;
  genre?: string;
  year?: string;
  rating?: string;
  language?: string;
}): Promise<PaginatedResponse<Movie>> => {
  const response = await api.get("/movies", { params });
  return response.data;
};

export const getMovieById = async (id: string): Promise<Movie> => {
  const response = await api.get(`/movies/${id}`);
  return response.data;
};

export const searchMovies = async (query: string): Promise<Movie[]> => {
  const response = await api.get("/movies/search", { params: { q: query } });
  return response.data;
};

export const getPopularMovies = async (): Promise<Movie[]> => {
  const response = await api.get("/movies/popular");
  return response.data?.data ?? response.data;
};

export const getTrendingMovies = async (): Promise<Movie[]> => {
  const response = await api.get("/movies/trending");
  return response.data?.data ?? response.data;
};

export const getTrendingMoviesPdf = async (signal?: AbortSignal): Promise<Blob> => {
  const response = await api.get("/movies/trending/pdf", {
    responseType: "blob",
    signal,
  });
  return response.data;
};
