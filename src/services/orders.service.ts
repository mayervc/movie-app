import api from "./api";
import type { OrdersResponse } from "@/types/order.types";

export const ordersService = {
  /**
   * Obtiene el historial de compras del usuario (requiere auth).
   */
  getMyOrders: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<OrdersResponse> => {
    const { data } = await api.get<OrdersResponse>("/orders", { params });
    return data;
  },
};
