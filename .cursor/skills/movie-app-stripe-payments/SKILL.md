---
name: movie-app-stripe-payments
description: Implementa pagos con Stripe en Movie App (frontend React/TS + backend Node/TS). Usa cuando el usuario pida pagos con Stripe, checkout, suscripciones, webhooks, reembolsos, gestión de clientes, o cualquier integración de pagos. Incluye mejores prácticas oficiales de Stripe y patrones de implementación completos.
---

# Stripe Payments — Movie App (Skill Unificada)

Guía completa para integrar Stripe en Movie App. Combina mejores prácticas oficiales de Stripe, patrones de implementación y la integración específica del proyecto (Vite + React + TypeScript frontend, Node/Express + TypeScript backend).

---

## 1. Reglas Fundamentales de Stripe (Qué usar y qué NO usar)

Estas reglas son **obligatorias** y provienen de las recomendaciones oficiales de Stripe.

### APIs recomendadas (usar siempre)

- **Checkout Sessions**: API principal para pagos on-session. Soporta pagos únicos y suscripciones. Priorizar siempre.
- **Payment Intents**: Aceptable para pagos off-session o cuando necesitas modelar el checkout tú mismo.
- **Setup Intents**: Para guardar métodos de pago sin cobrar (suscripciones futuras).
- **Billing/Subscription APIs**: Para modelos de ingresos recurrentes.
- **Payment Element**: Alternativa aceptable a Checkout cuando se necesita personalización avanzada de UI. Combinarlo con CheckoutSessions API cuando sea posible.

### APIs prohibidas (NUNCA usar)

- **Charges API**: Obsoleta. Si el usuario la pide, recomendar [migrar a Checkout Sessions o Payment Intents](https://docs.stripe.com/payments/payment-intents/migration/charges).
- **Sources API**: Deprecada. Nunca usarla para guardar tarjetas.
- **Card Element legacy / Payment Element en modo card**: Obsoletos. Recomendar [migrar al Payment Element](https://docs.stripe.com/payments/payment-element/migration).
- **Tokens API**: Evitar salvo necesidad absoluta.

### Directrices importantes

- Siempre usar la **última versión** de la API y SDK de Stripe.
- Preferir **Stripe-hosted Checkout** o **Embedded Checkout** sobre UI custom.
- Activar **dynamic payment methods** en el dashboard en lugar de pasar `payment_method_types` manualmente — Stripe elige automáticamente los métodos según ubicación y preferencias del usuario.
- Para usuarios con SCA (Europa): implementar 3D Secure.
- Para Stripe Connect (marketplaces): seguir [integration recommendations](https://docs.stripe.com/connect/integration-recommendations) y [controller properties](https://docs.stripe.com/connect/migrate-to-controller-properties). No mezclar tipos de cargo.
- Si el usuario quiere renderizar Payment Element antes de crear PaymentIntent/SetupIntent (ej. para surcharging), usar **Stripe Confirmation Tokens** — nunca `createPaymentMethod` ni `createToken`.

### Documentación de referencia

- [Integration Options](https://docs.stripe.com/payments/payment-methods/integration-options)
- [API Tour](https://docs.stripe.com/payments-api/tour)
- [Go Live Checklist](https://docs.stripe.com/get-started/checklist/go-live) — revisar antes de ir a producción.

---

## 2. Flujos de Pago Disponibles

### Flujo A: Checkout Session — Hosted (Recomendado para Movie App)

Stripe aloja la página de pago. Mínima carga PCI, implementación rápida.

```
Usuario confirma compra → FE llama al BE → BE crea Checkout Session → FE redirige a Stripe → Usuario paga → Stripe redirige a success_url → BE recibe webhook → Tickets creados
```

### Flujo B: Checkout Session — Embedded

Stripe renderiza un formulario embebido en tu página. Más control visual, misma seguridad.

### Flujo C: Payment Intents + Payment Element (Custom UI)

Control total sobre la UI del checkout. Más complejo, requiere Stripe.js. Usar solo si se necesita personalización avanzada.

### Flujo D: Setup Intents (Guardar método de pago)

Recopilar método de pago sin cobrar. Útil para suscripciones y pagos futuros.

**Para Movie App, usar siempre el Flujo A (Checkout Session Hosted)** salvo que se requiera explícitamente otra cosa.

---

## 3. Implementación en Movie App — Frontend (React + TypeScript)

### 3.1 Servicio de pagos

**Archivo:** `src/services/payments.service.ts`

```typescript
import api from '@/services/api';
import type {
  CreateCheckoutSessionRequest,
  CreateCheckoutSessionResponse,
} from '@/types/payment.types';

export const paymentsService = {
  /**
   * Crear Checkout Session para compra de tickets.
   * Redirige al usuario a Stripe Checkout.
   *
   * Se envía el customer_email para que Stripe envíe el recibo/factura
   * automáticamente al completar el pago.
   */
  createCheckoutSession: async (
    showtimeId: number,
    seatIds: number[],
    movieId?: number,
    customerEmail?: string
  ): Promise<CreateCheckoutSessionResponse> => {
    const body: CreateCheckoutSessionRequest = {
      showtime_id: showtimeId,
      seat_ids: seatIds,
      ...(movieId != null && { movie_id: movieId }),
      ...(customerEmail && { customer_email: customerEmail }),
    };
    const { data } = await api.post<CreateCheckoutSessionResponse>(
      '/payments/create-checkout-session',
      body
    );
    return data;
  },

  /**
   * Obtiene la orden/tickets por session_id.
   * Útil en la página de éxito para mostrar el detalle de la compra.
   */
  getOrderBySession: async (sessionId: string) => {
    const { data } = await api.get('/payments/order-by-session', {
      params: { session_id: sessionId },
    });
    return data;
  },

  /**
   * Solicitar reembolso de un ticket.
   */
  requestRefund: async (ticketId: number, reason?: string) => {
    const { data } = await api.post('/payments/refund', {
      ticket_id: ticketId,
      reason,
    });
    return data;
  },
};
```

### 3.2 Integración en el flujo de compra

En `useTicketPurchase` o en el paso "confirm" de `TicketPurchase.tsx`:

```typescript
import { paymentsService } from '@/services/payments.service';

const handleConfirmPurchase = async () => {
  try {
    setLoading(true);
    const { url } = await paymentsService.createCheckoutSession(
      showtimeId,
      selectedSeatIds
    );

    // Guardar datos para la página de success (opcional)
    sessionStorage.setItem(
      'pending_purchase',
      JSON.stringify({ movieId, showtimeId, seatIds: selectedSeatIds })
    );

    // Redirigir a Stripe Checkout
    window.location.href = url;
  } catch (err: any) {
    setError(
      err.response?.data?.errors?.[0]?.message || 'Error al iniciar el pago'
    );
  } finally {
    setLoading(false);
  }
};
```

### 3.3 Página de Success

**Ruta:** `/ticket-purchase/:movieId/success`

```typescript
import { useState, useEffect } from 'react';
import { useSearchParams, useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { paymentsService } from '@/services/payments.service';

export const PaymentSuccess = () => {
  const { movieId } = useParams();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setStatus('error');
        return;
      }
      try {
        await paymentsService.getSessionStatus(sessionId);
        setStatus('success');
        sessionStorage.removeItem('pending_purchase');
      } catch {
        setStatus('error');
      }
    };
    verifyPayment();
  }, [sessionId]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-slate-400">Verificando pago...</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-slate-50 px-4"
    >
      {status === 'success' ? (
        <>
          <h1 className="text-3xl font-bold text-green-400 mb-4">
            ¡Pago realizado con éxito!
          </h1>
          <p className="text-slate-400 mb-8">
            Tus tickets han sido confirmados.
          </p>
          <Link
            to="/my-tickets"
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Ver mis tickets
          </Link>
        </>
      ) : (
        <>
          <h1 className="text-3xl font-bold text-red-400 mb-4">
            Error al verificar el pago
          </h1>
          <Link
            to={`/ticket-purchase/${movieId}`}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Reintentar
          </Link>
        </>
      )}
    </motion.div>
  );
};
```

### 3.4 Página de Cancel

**Ruta:** `/ticket-purchase/:movieId/cancel`

```typescript
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export const PaymentCancel = () => {
  const { movieId } = useParams();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-slate-50 px-4"
    >
      <h1 className="text-3xl font-bold text-yellow-400 mb-4">
        Pago cancelado
      </h1>
      <p className="text-slate-400 mb-8">
        No se realizó ningún cobro. Puedes intentar de nuevo.
      </p>
      <Link
        to={`/ticket-purchase/${movieId}`}
        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
      >
        Volver a elegir asientos
      </Link>
    </motion.div>
  );
};
```

### 3.5 Rutas en React Router

```typescript
import { lazy, Suspense } from 'react';

const PaymentSuccess = lazy(() => import('@/pages/PaymentSuccess'));
const PaymentCancel = lazy(() => import('@/pages/PaymentCancel'));

// Dentro del router:
<Route
  path="/ticket-purchase/:movieId/success"
  element={
    <Suspense fallback={<Loading />}>
      <PaymentSuccess />
    </Suspense>
  }
/>
<Route
  path="/ticket-purchase/:movieId/cancel"
  element={
    <Suspense fallback={<Loading />}>
      <PaymentCancel />
    </Suspense>
  }
/>
```

---

## 4. Implementación en Movie App — Backend (Node + Express + TypeScript)

### 4.1 Crear Checkout Session

```typescript
// controllers/payments.controller.ts
import Stripe from 'stripe';
import { Request, Response } from 'express';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia', // Usar la versión más reciente
});

export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const { showtime_id, seat_ids } = req.body;
    const userId = req.user.id; // Del middleware de auth

    // Validar disponibilidad de asientos, calcular precio, etc.
    const amount = await calculateTotalAmount(showtime_id, seat_ids);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Tickets de cine (${seat_ids.length} asientos)`,
              // images: ['https://tu-dominio.com/ticket-image.jpg'],
            },
            unit_amount: amount, // En centavos (ej: 1500 = $15.00)
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/ticket-purchase/{movieId}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/ticket-purchase/{movieId}/cancel`,
      metadata: {
        user_id: String(userId),
        showtime_id: String(showtime_id),
        seat_ids: JSON.stringify(seat_ids),
      },
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ errors: [{ message: 'Error al crear sesión de pago' }] });
  }
};
```

### 4.2 Webhook Handler

```typescript
// controllers/webhook.controller.ts
import Stripe from 'stripe';
import { Request, Response } from 'express';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;

  try {
    // IMPORTANTE: req.body debe ser el raw body (Buffer), no parsed JSON
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Idempotencia: verificar si el evento ya fue procesado
  const alreadyProcessed = await isEventProcessed(event.id);
  if (alreadyProcessed) {
    return res.json({ received: true });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSucceeded(paymentIntent);
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailed(paymentIntent);
        break;
      }
      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        await handleRefund(charge);
        break;
      }
      default:
        console.log(`Evento no manejado: ${event.type}`);
    }

    await markEventProcessed(event.id);
  } catch (error) {
    console.error(`Error procesando evento ${event.type}:`, error);
    // Retornar 500 para que Stripe reintente
    return res.status(500).json({ error: 'Error procesando webhook' });
  }

  res.json({ received: true });
};

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { user_id, showtime_id, seat_ids } = session.metadata!;

  // Crear tickets en la BD
  await createTickets({
    userId: Number(user_id),
    showtimeId: Number(showtime_id),
    seatIds: JSON.parse(seat_ids),
    stripeSessionId: session.id,
    paymentIntentId: session.payment_intent as string,
    amountPaid: session.amount_total!,
  });
}

async function handlePaymentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  console.log(`Pago exitoso: ${paymentIntent.id}`);
  // Actualizar estado del pedido si aplica
}

async function handlePaymentFailed(paymentIntent: Stripe.PaymentIntent) {
  const error = paymentIntent.last_payment_error;
  console.error(`Pago fallido: ${error?.message}`);
  // Notificar al usuario, actualizar estado
}

async function handleRefund(charge: Stripe.Charge) {
  console.log(`Reembolso procesado: ${charge.id}`);
  // Actualizar estado del ticket, liberar asientos
}
```

### 4.3 Configuración del raw body para webhooks

```typescript
// En app.ts o server.ts — ANTES del middleware json global
import express from 'express';

const app = express();

// Webhook necesita el raw body para verificar la firma
app.post(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' }),
  handleStripeWebhook
);

// El resto de rutas usa JSON parsed normalmente
app.use(express.json());
```

### 4.4 Reembolsos

```typescript
// services/payments.service.ts (backend)
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const createRefund = async (
  paymentIntentId: string,
  amount?: number, // Parcial en centavos, o undefined para reembolso total
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
): Promise<Stripe.Refund> => {
  const refund = await stripe.refunds.create({
    payment_intent: paymentIntentId,
    ...(amount && { amount }),
    ...(reason && { reason }),
  });
  return refund;
};
```

### 4.5 Customer Management (opcional, para funciones avanzadas)

```typescript
// services/stripe-customer.service.ts (backend)
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const stripeCustomerService = {
  create: async (email: string, name: string, userId: number) => {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: { user_id: String(userId) },
    });
    return customer;
  },

  listPaymentMethods: async (customerId: string) => {
    const methods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });
    return methods.data;
  },

  createPortalSession: async (customerId: string, returnUrl: string) => {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    return session.url;
  },
};
```

### 4.6 Suscripciones (si se implementa modelo premium)

```typescript
// services/subscription.service.ts (backend)
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const subscriptionService = {
  /**
   * Crear suscripción via Checkout Session (recomendado).
   */
  createCheckoutForSubscription: async (
    customerId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string
  ) => {
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
    return session;
  },

  /**
   * Cancelar suscripción al final del periodo.
   */
  cancel: async (subscriptionId: string) => {
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });
    return subscription;
  },

  /**
   * Obtener estado de suscripción.
   */
  getStatus: async (subscriptionId: string) => {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription;
  },
};

// Webhook events para suscripciones:
// - 'customer.subscription.created'
// - 'customer.subscription.updated'
// - 'customer.subscription.deleted'
// - 'invoice.payment_succeeded'
// - 'invoice.payment_failed'
```

---

## 5. Tipos TypeScript Compartidos

```typescript
// types/payment.types.ts

// === Checkout ===

export interface CreateCheckoutSessionRequest {
  showtime_id: number;
  seat_ids: number[];
  /** Opcional: para que el BE arme success_url y cancel_url con el movieId */
  movie_id?: number;
  /** Email del usuario para que Stripe envíe la factura/recibo automáticamente */
  customer_email?: string;
}

export interface CreateCheckoutSessionResponse {
  url: string;
  sessionId?: string;
}

export interface SessionStatusResponse {
  status: 'complete' | 'expired' | 'open';
  payment_status: 'paid' | 'unpaid' | 'no_payment_required';
  customer_email?: string;
}

// === Reembolsos ===

export interface RefundRequest {
  ticket_id: number;
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
}

export interface RefundResponse {
  refund_id: string;
  status: 'succeeded' | 'pending' | 'failed';
  amount: number;
}

// === Suscripciones (si aplica) ===

export interface SubscriptionInfo {
  id: string;
  status: 'active' | 'past_due' | 'canceled' | 'incomplete';
  current_period_end: string;
  cancel_at_period_end: boolean;
  plan_name: string;
  price_amount: number;
  currency: string;
}
```

---

## 5.1 Facturación Automática por Email

### Frontend

El servicio de pagos ahora acepta el email del cliente para que Stripe envíe automáticamente recibos/facturas:

```typescript
// En useTicketPurchase.ts o el componente de confirmación
const { user } = useAuth();

const handleConfirmPurchase = async () => {
  const { url } = await paymentsService.createCheckoutSession(
    showtimeId,
    selectedSeatIds,
    movieId,
    user?.email ?? undefined // Enviar email para facturación automática
  );
  window.location.href = url;
};
```

### Backend

Al crear la Checkout Session, configurar Stripe para enviar recibos:

```typescript
const session = await stripe.checkout.sessions.create({
  mode: 'payment',
  // Pre-llena el campo de email en Checkout
  customer_email: req.body.customer_email,
  // Envía recibo automático al completar el pago
  payment_intent_data: {
    receipt_email: req.body.customer_email,
  },
  // (Opcional) Genera factura formal con PDF
  invoice_creation: {
    enabled: true,
    invoice_data: {
      description: `Tickets de cine - ${movieTitle}`,
      footer: 'Gracias por tu compra en Movie App',
    },
  },
  line_items: [...],
  success_url: '...',
  cancel_url: '...',
  metadata: {...},
});
```

**Nota:** Ver `docs/BACKEND_SPEC_STRIPE_PAGOS.md` para la especificación completa del backend.

---

## 6. Variables de Entorno

### Frontend (`.env`)

```bash
# Solo necesaria si usas Payment Element o Stripe.js en el FE.
# NO necesaria si solo usas redirect a Checkout Session.
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**NUNCA guardar claves secretas (`sk_`) en el frontend.**

### Backend (`.env`)

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=http://localhost:5173
```

---

## 7. Testing

### Tarjetas de prueba de Stripe

| Escenario | Número de tarjeta |
|---|---|
| Pago exitoso | `4242 4242 4242 4242` |
| Pago rechazado | `4000 0000 0000 0002` |
| Requiere 3D Secure | `4000 0025 0000 3155` |
| Fondos insuficientes | `4000 0000 0000 9995` |
| Error de procesamiento | `4000 0000 0000 0119` |

- Usar cualquier fecha futura para expiración.
- Usar cualquier CVC de 3 dígitos.

### Testing de webhooks en desarrollo

```bash
# Instalar Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Escuchar webhooks y reenviar al backend local
stripe listen --forward-to localhost:3000/api/payments/webhook

# En otra terminal, disparar un evento de prueba
stripe trigger checkout.session.completed
```

### Test unitario de webhook (ejemplo)

```typescript
import Stripe from 'stripe';

describe('Webhook Handler', () => {
  it('debe crear tickets cuando checkout.session.completed', async () => {
    const mockSession: Partial<Stripe.Checkout.Session> = {
      id: 'cs_test_123',
      payment_intent: 'pi_test_456',
      amount_total: 3000,
      metadata: {
        user_id: '1',
        showtime_id: '5',
        seat_ids: '[1, 2]',
      },
    };

    await handleCheckoutCompleted(mockSession as Stripe.Checkout.Session);

    // Verificar que se crearon los tickets
    const tickets = await getTicketsBySessionId('cs_test_123');
    expect(tickets).toHaveLength(2);
  });
});
```

---

## 8. Mejores Prácticas de Implementación

### Seguridad

1. **Siempre verificar firmas de webhook** con `stripe.webhooks.constructEvent`.
2. **Nunca confiar solo en la confirmación del cliente** — siempre usar webhooks para confirmar pagos.
3. **Nunca manejar datos de tarjeta en tu servidor** — dejar que Stripe Checkout/Payment Element lo haga.
4. **Nunca exponer `STRIPE_SECRET_KEY`** en el frontend o logs.

### Robustez

5. **Idempotencia en webhooks**: Stripe puede enviar el mismo evento más de una vez. Guardar el `event.id` y verificar antes de procesar.
6. **Usar `metadata`** para vincular objetos de Stripe con tu BD (user_id, showtime_id, etc.).
7. **Manejar todos los estados de error** de Stripe con try/catch y mensajes claros al usuario.
8. **Importes siempre en centavos**: `$15.00` = `1500`. Usar la unidad más pequeña de la moneda.

### Performance

9. **Responder rápido a webhooks** (< 5 segundos). Si el procesamiento es pesado, encolar y responder 200 inmediatamente.
10. **No hacer polling** del estado del pago — usar webhooks.

### UX

11. **Mostrar loading claro** mientras se crea la sesión y se redirige.
12. **Guardar datos en sessionStorage** antes de redirigir a Stripe, por si la success_url no trae todos los datos.
13. **Página de cancel con opción de reintentar**, no solo un mensaje de error.
14. **Deshabilitar el botón de pago** mientras se procesa para evitar pagos duplicados.

---

## 9. Coordinación Frontend ↔ Backend

- **Siempre** que implementes o cambies el flujo de pagos, genera o actualiza la especificación para el BE en `docs/BACKEND_SPEC_STRIPE_PAGOS.md` usando el skill **movie-app-backend-spec** (endpoints, webhook, modelos, success_url/cancel_url).
- El BE debe implementar como mínimo:
  1. `POST /api/payments/create-checkout-session` — Crea Checkout Session.
  2. `POST /api/payments/webhook` — Recibe webhooks de Stripe (con raw body).
  3. `GET /api/payments/session-status/:sessionId` — (Opcional) Verificar estado de sesión.
  4. `POST /api/payments/refund` — (Opcional) Solicitar reembolso.

---

## 10. Checklist de Implementación

### Frontend

- [ ] `payments.service.ts` con `createCheckoutSession` usando `api` configurado
- [ ] Flujo de compra redirige a Stripe en lugar de llamar directo a `ticketsService.purchase`
- [ ] Rutas success y cancel configuradas en React Router con lazy loading
- [ ] Tipos en `types/payment.types.ts`
- [ ] Estados de loading durante creación de sesión y redirección
- [ ] Manejo de errores consistente con el resto de la app
- [ ] Botón de pago se deshabilita mientras se procesa

### Backend

- [ ] Endpoint `create-checkout-session` con validación de asientos y cálculo de precio
- [ ] Webhook handler con verificación de firma y raw body
- [ ] Idempotencia en procesamiento de webhooks (guardar event_id)
- [ ] Creación de tickets solo tras confirmación via webhook
- [ ] Metadata en Checkout Session para vincular con la BD
- [ ] Endpoint de reembolso (si aplica)
- [ ] Variables de entorno configuradas (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`)

### Pre-producción

- [ ] Revisar [Go Live Checklist](https://docs.stripe.com/get-started/checklist/go-live) de Stripe
- [ ] Cambiar claves de test (`sk_test_`) a producción (`sk_live_`)
- [ ] Configurar webhook endpoint en el dashboard de Stripe para producción
- [ ] Probar con todas las tarjetas de prueba (éxito, rechazo, 3DS, fondos insuficientes)
- [ ] Verificar que webhooks se procesan correctamente con `stripe listen`

### Documentación

- [ ] `docs/BACKEND_SPEC_STRIPE_PAGOS.md` actualizado con endpoints y modelos
