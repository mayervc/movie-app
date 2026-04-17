import api from "./api";
import type {
  CreateSubscriptionCheckoutResponse,
  UserSubscription,
  CancelSubscriptionResponse,
  ReactivateSubscriptionResponse,
  SubscriptionPlanSlug,
} from "@/types/subscription.types";
import type { SubscriptionPurchasesResponse } from "@/types/order.types";

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
    plan: SubscriptionPlanSlug,
    successUrl: string,
    cancelUrl: string
  ): Promise<CreateSubscriptionCheckoutResponse> => {
    const { data } = await api.post<CreateSubscriptionCheckoutResponse>(
      "/subscriptions/create-checkout",
      { plan, successUrl, cancelUrl }
    );
    return data;
  },

  verify: async (sessionId: string): Promise<UserSubscription> => {
    const { data } = await api.post<UserSubscription>(
      "/subscriptions/verify",
      { sessionId }
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

  /**
   * Obtiene el historial de compras de suscripción del usuario.
   * Endpoint: GET /api/subscriptions (query: page, limit).
   */
  getSubscriptionPurchases: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<SubscriptionPurchasesResponse> => {
    try {
      const { data } = await api.get<SubscriptionPurchasesResponse>(
        "/subscriptions",
        { params }
      );
      return data;
    } catch {
      return { purchases: [] };
    }
  },
};
