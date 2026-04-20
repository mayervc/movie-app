import api from "./api";
import type { User, UpdateProfileRequest } from "@/types/user.types";
import type { UserTicket } from "@/types/ticket.types";

export const usersService = {
  getMe: async (): Promise<User> => {
    const { data } = await api.get<User>("/users/me");
    return data;
  },

  getMyTickets: async (): Promise<UserTicket[]> => {
    const { data } = await api.get<UserTicket[]>("/users/me/tickets");
    return data;
  },

  updateProfile: async (
    id: number,
    payload: UpdateProfileRequest
  ): Promise<User> => {
    const { data } = await api.patch<User>(`/users/${id}`, payload);
    return data;
  },
};
