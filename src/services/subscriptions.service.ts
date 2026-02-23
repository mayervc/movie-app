import api from "./api";
import type {
  CreateSubscriptionCheckoutResponse,
  UserSubscription,
  CancelSubscriptionResponse,
  ReactivateSubscriptionResponse,
  SubscriptionPlanSlug,
} from "@/types/subscription.types";

export const subscriptionsService = {
  /**
   * Obtiene la suscripción activa del usuario autenticado.
   * Devuelve null si no tiene suscripción.
   */
  getMySubscription: async (): Promise<UserSubscription | null> => {
    try {
      const { data } = await api.get<UserSubscription>(
        "/subscriptions/my-subscription"
      );
      return data;
    } catch {
      return null;
    }
  },

  /**
   * Crea una sesión de Stripe Checkout para suscribirse a un plan.
   * Redirige al usuario al checkout de Stripe.
   */
  createCheckoutSession: async (
    plan: SubscriptionPlanSlug
  ): Promise<CreateSubscriptionCheckoutResponse> => {
    const { data } = await api.post<CreateSubscriptionCheckoutResponse>(
      "/subscriptions/create-checkout",
      { plan }
    );
    return data;
  },

  /**
   * Cancela la suscripción al final del periodo actual.
   */
  cancel: async (): Promise<CancelSubscriptionResponse> => {
    const { data } = await api.post<CancelSubscriptionResponse>(
      "/subscriptions/cancel"
    );
    return data;
  },

  /**
   * Reactiva una suscripción que fue cancelada (antes de que expire).
   */
  reactivate: async (): Promise<ReactivateSubscriptionResponse> => {
    const { data } = await api.post<ReactivateSubscriptionResponse>(
      "/subscriptions/reactivate"
    );
    return data;
  },
};
