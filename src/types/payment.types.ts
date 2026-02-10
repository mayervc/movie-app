export interface CreateCheckoutSessionRequest {
  showtime_id: number;
  seat_ids: number[];
  /** Opcional: para que el BE arme success_url y cancel_url con el movieId */
  movie_id?: number;
}

export interface CreateCheckoutSessionResponse {
  url: string;
  sessionId?: string;
}
