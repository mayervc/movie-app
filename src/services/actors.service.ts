import api from "./api";
import type { Actor } from "@/types/actor.types";

export const actorsService = {
  getActorById: async (id: string | number): Promise<Actor> => {
    const { data } = await api.get<Actor>(`/actors/${id}`);
    return data;
  },
};
