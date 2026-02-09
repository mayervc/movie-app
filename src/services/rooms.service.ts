import api from "./api";
import type { RoomWithSeats } from "@/types/room.types";

export const roomsService = {
  /**
   * Obtener sala con asientos (requiere auth)
   */
  getWithSeats: async (roomId: number): Promise<RoomWithSeats> => {
    const { data } = await api.get(`/rooms/${roomId}`, {
      params: { includeSeats: true },
    });
    return data;
  },
};
