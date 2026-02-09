// Parámetros de búsqueda de showtimes
export interface ShowtimeSearchParams {
  movie_id?: number;
  cinema_id?: number;
  date?: string; // Formato: YYYY-MM-DD
}

// Resultado de búsqueda de showtimes (agrupado por sala)
export interface ShowtimeSearchResult {
  id: number;
  room_id: number;
  room_name: string;
  showtimes: ShowtimeItem[];
}

// Showtime individual dentro de un resultado de búsqueda
export interface ShowtimeItem {
  id: number;
  room_id: number;
  start_time: string; // Formato: "HH:mm"
  end_time: string; // Formato: "HH:mm"
  booked_seats: number; // Cantidad de asientos reservados (no IDs)
  ticket_price: number;
}

// Detalles completos de un showtime específico
export interface ShowtimeDetails {
  id: number;
  room_id: number;
  start_time: string; // Formato: "HH:mm"
  end_time: string; // Formato: "HH:mm"
  booked_seats: number[]; // Array de IDs de asientos reservados
  room_seats: number; // Total de asientos en la sala
  ticket_price: number;
}
