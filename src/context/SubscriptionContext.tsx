import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useAuth } from "@/context/AuthContext";
import { subscriptionsService } from "@/services/subscriptions.service";
import type { UserSubscription } from "@/types/subscription.types";
import { SUBSCRIPTION_PLANS } from "@/types/subscription.types";

interface SubscriptionContextType {
  /** Suscripción del usuario o null si no tiene */
  subscription: UserSubscription | null;
  /** Cargando estado de la suscripción */
  loading: boolean;
  /** Si el usuario tiene una suscripción activa */
  isSubscribed: boolean;
  /** Si la suscripción fue cancelada pero sigue activa hasta el fin del periodo */
  isCanceling: boolean;
  /** Porcentaje de descuento actual (0 si no tiene suscripción) */
  discountPercent: number;
  /** Tickets gratis restantes en el mes */
  freeTicketsRemaining: number;
  /** Nombre del plan actual */
  planName: string | null;
  /** Refrescar la suscripción desde el backend */
  refresh: () => Promise<void>;
  /**
   * Calcula el precio final de N tickets aplicando descuento y/o tickets gratis.
   * Retorna { originalTotal, finalTotal, freeTicketsApplied, discountAmount }
   */
  calculatePrice: (
    ticketPrice: number,
    quantity: number
  ) => PriceBreakdown;
}

export interface PriceBreakdown {
  originalTotal: number;
  finalTotal: number;
  freeTicketsApplied: number;
  discountAmount: number;
  discountPercent: number;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
  undefined
);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuth();
  const [subscription, setSubscription] = useState<UserSubscription | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  const fetchSubscription = useCallback(async () => {
    if (!isAuthenticated) {
      setSubscription(null);
      return;
    }
    try {
      setLoading(true);
      const data = await subscriptionsService.getMySubscription();
      setSubscription(data);
    } catch {
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Cargar suscripción al autenticarse
  useEffect(() => {
    fetchSubscription();
  }, [fetchSubscription]);

  const isSubscribed =
    subscription?.status === "active" || subscription?.status === "trialing";

  const isCanceling =
    isSubscribed && (subscription?.cancel_at_period_end ?? false);

  const discountPercent = isSubscribed
    ? subscription?.discount_percent ?? 0
    : 0;

  const freeTicketsRemaining = isSubscribed
    ? subscription?.free_tickets_remaining ?? 0
    : 0;

  const planName = isSubscribed
    ? SUBSCRIPTION_PLANS.find((p) => p.slug === subscription?.plan)?.name ??
      null
    : null;

  const calculatePrice = useCallback(
    (ticketPrice: number, quantity: number): PriceBreakdown => {
      const originalTotal = ticketPrice * quantity;

      if (!isSubscribed || !subscription) {
        return {
          originalTotal,
          finalTotal: originalTotal,
          freeTicketsApplied: 0,
          discountAmount: 0,
          discountPercent: 0,
        };
      }

      // Primero aplicar tickets gratis
      const freeToUse = Math.min(freeTicketsRemaining, quantity);
      const ticketsToPay = quantity - freeToUse;

      // Luego aplicar descuento sobre los tickets restantes
      const subtotal = ticketsToPay * ticketPrice;
      const discount = subtotal * (discountPercent / 100);
      const finalTotal = subtotal - discount;

      return {
        originalTotal,
        finalTotal: Math.max(0, finalTotal),
        freeTicketsApplied: freeToUse,
        discountAmount: discount + freeToUse * ticketPrice,
        discountPercent,
      };
    },
    [isSubscribed, subscription, freeTicketsRemaining, discountPercent]
  );

  return (
    <SubscriptionContext.Provider
      value={{
        subscription,
        loading,
        isSubscribed,
        isCanceling,
        discountPercent,
        freeTicketsRemaining,
        planName,
        refresh: fetchSubscription,
        calculatePrice,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error(
      "useSubscription must be used within SubscriptionProvider"
    );
  }
  return context;
};
