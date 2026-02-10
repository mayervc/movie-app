export interface RoomSeat {
  id: number;
  seatRowLabel: string; // Ej: "A", "B", "C"
  seatRow: number; // Fila (0-indexed)
  seatColumnLabel: number; // Ej: 1, 2, 3
  seatColumn: number; // Columna (0-indexed)
}

export interface RoomBlock {
  id: number;
  blockRow: number;
  blockColumn: number;
  rowSeats: number;
  columnsSeats: number;
  seats: RoomSeat[];
}

export interface Room {
  id: number;
  name: string;
  rowsBlocks: number;
  columnsBlocks: number;
  details?: string | null;
}

export interface RoomWithSeats extends Room {
  blocks: RoomBlock[];
}
