// Solicitud de compra de tickets
export interface TicketPurchaseRequest {
  showtime_id: number;
  seats: number[]; // IDs de asientos
}

// Respuesta de compra de tickets
export interface TicketPurchaseResponse {
  showtime_id: number;
  room_id: number;
  room_name: string;
  cinema_id: number;
  cinema_name: string;
  movie_id: number;
  movie_title: string;
  start_time: string; // Formato: "HH:mm"
  end_time: string; // Formato: "HH:mm"
  tickets: TicketSeat[];
}

// Ticket individual con info del asiento
export interface TicketSeat {
  id: number;
  seat: {
    id: number;
    row: string; // Ej: "A", "B"
    column: string; // Ej: "5", "10"
  };
}

// Ticket del usuario (desde GET /showtimes/:id/tickets)
export interface UserTicket {
  id: number;
  movie_title: string;
  cinema_name: string;
  room_name: string;
  showtime_date: string; // YYYY-MM-DD
  showtime_time: string; // HH:mm
  seat_label: string; // Ej: "A5", "B10"
  ticket_price: number;
}
