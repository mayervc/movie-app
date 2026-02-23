// === Planes de suscripción ===

export type SubscriptionPlanSlug = "basic" | "premium";

export interface SubscriptionPlan {
  slug: SubscriptionPlanSlug;
  name: string;
  price: number; // precio mensual en USD
  discount_percent: number; // % de descuento en tickets
  free_tickets_per_month: number;
  features: string[];
}

// Planes hardcodeados para el frontend (el backend los gestiona con Stripe)
export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    slug: "basic",
    name: "Básico",
    price: 9.99,
    discount_percent: 25,
    free_tickets_per_month: 8,
    features: [
      "25% de descuento en tickets",
      "8 tickets gratis al mes",
      "Acceso prioritario a estrenos",
      "Soporte por email",
    ],
  },
  {
    slug: "premium",
    name: "Premium",
    price: 19.99,
    discount_percent: 50,
    free_tickets_per_month: 16,
    features: [
      "50% de descuento en tickets",
      "16 tickets gratis al mes",
      "Acceso prioritario a estrenos",
      "Asientos VIP cuando disponibles",
      "Soporte prioritario 24/7",
      "Cancelación en cualquier momento",
    ],
  },
];

// === Suscripción del usuario ===

export type SubscriptionStatus =
  | "active"
  | "canceled"
  | "past_due"
  | "trialing"
  | "incomplete"
  | "incomplete_expired"
  | "unpaid";

export interface UserSubscription {
  id: number;
  stripe_subscription_id: string;
  plan: SubscriptionPlanSlug;
  status: SubscriptionStatus;
  current_period_start: string; // ISO date
  current_period_end: string; // ISO date
  cancel_at_period_end: boolean;
  free_tickets_remaining: number;
  free_tickets_used: number;
  discount_percent: number;
  createdAt: string;
  updatedAt: string;
}

// === Requests / Responses ===

export interface CreateSubscriptionCheckoutRequest {
  plan: SubscriptionPlanSlug;
}

export interface CreateSubscriptionCheckoutResponse {
  url: string;
  sessionId?: string;
}

export interface CancelSubscriptionResponse {
  message: string;
  cancel_at_period_end: boolean;
  current_period_end: string;
}

export interface ReactivateSubscriptionResponse {
  message: string;
  status: SubscriptionStatus;
}
