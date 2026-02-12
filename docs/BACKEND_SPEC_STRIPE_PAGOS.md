# Especificación Backend: Stripe Payments + Suscripciones

## Resumen

El frontend de Movie App implementa dos flujos de pago con Stripe:

1. **Compra de tickets** — Pagos únicos via Stripe Checkout (`mode: 'payment'`)
2. **Suscripciones** — Planes mensuales recurrentes via Stripe Checkout (`mode: 'subscription'`)

Las suscripciones otorgan **tickets gratis al mes** y **descuentos porcentuales** sobre el precio de tickets.

### Planes de Suscripción

| Plan      | Slug      | Precio/mes | Descuento en tickets | Tickets gratis/mes |
|-----------|-----------|------------|----------------------|--------------------|
| Básico    | `basic`   | $9.99 USD  | 25%                  | 8                  |
| Premium   | `premium` | $19.99 USD | 50%                  | 16                 |

---

## Índice

1. [Endpoints de Pagos (Tickets)](#1-endpoints-de-pagos-tickets)
2. [Endpoints de Suscripciones](#2-endpoints-de-suscripciones)
3. [Webhook de Stripe](#3-webhook-de-stripe)
4. [Modelo de Datos](#4-modelo-de-datos)
5. [Lógica de Negocio](#5-lógica-de-negocio)
6. [Productos y Precios en Stripe](#6-productos-y-precios-en-stripe)
7. [Variables de Entorno](#7-variables-de-entorno)
8. [Tipos TypeScript (Sincronización FE ↔ BE)](#8-tipos-typescript-sincronización-fe--be)
9. [URLs del Frontend](#9-urls-del-frontend)
10. [Seguridad](#10-seguridad)
11. [Testing](#11-testing)
12. [Checklist de Implementación](#12-checklist-de-implementación)

---

## 1. Endpoints de Pagos (Tickets)

### 1.1 POST /api/payments/create-checkout-session

Crea una sesión de Stripe Checkout para comprar tickets de cine. Si el usuario tiene una suscripción activa, el backend debe **aplicar los descuentos y tickets gratis** al calcular el precio.

**Auth:** Bearer token requerido.

**Request Body:**

| Campo          | Tipo     | Requerido | Descripción                                                |
|----------------|----------|-----------|------------------------------------------------------------|
| showtime_id    | number   | sí        | ID del showtime                                            |
| seat_ids       | number[] | sí        | Array de IDs de asientos a comprar                         |
| movie_id       | number   | no        | ID de la película (para construir success/cancel URLs)     |
| customer_email | string   | no        | Email del cliente para facturación automática de Stripe    |

**Ejemplo de request:**

```json
{
  "showtime_id": 42,
  "seat_ids": [101, 102, 103],
  "movie_id": 15,
  "customer_email": "usuario@ejemplo.com"
}
```

**Lógica del backend (pseudocódigo):**

```
1. Validar auth y obtener user_id
2. Validar que el showtime existe y los asientos están disponibles
3. Obtener ticket_price del showtime
4. Consultar suscripción activa del usuario (si tiene)
5. Si tiene suscripción activa:
   a. Calcular cuántos tickets gratis puede usar: min(free_tickets_remaining, seat_ids.length)
   b. Tickets con cargo = seat_ids.length - tickets_gratis_usados
   c. Precio con descuento = tickets_con_cargo * ticket_price * (1 - discount_percent/100)
   d. Si el total es $0 (todos gratis):
      - Crear tickets directamente en BD (sin pasar por Stripe)
      - Decrementar free_tickets_remaining
      - Retornar { url: success_url_directa } o crear la sesión con amount=0
6. Si no tiene suscripción o hay monto a pagar:
   - Crear Checkout Session con el monto calculado
   - Guardar en metadata: user_id, showtime_id, seat_ids, free_tickets_applied, discount_percent
7. Retornar { url, sessionId }
```

**Response 200:**

```json
{
  "url": "https://checkout.stripe.com/c/pay/cs_test_...",
  "sessionId": "cs_test_..."
}
```

**Configuración de la Checkout Session:**

```typescript
const session = await stripe.checkout.sessions.create({
  mode: 'payment',
  customer_email: customerEmail,
  payment_intent_data: {
    receipt_email: customerEmail, // Envía recibo automático
  },
  invoice_creation: {
    enabled: true,
    invoice_data: {
      description: `Tickets de cine - ${movieTitle}`,
      custom_fields: [
        { name: 'Película', value: movieTitle },
        { name: 'Cine', value: cinemaName },
      ],
    },
  },
  line_items: [
    {
      price_data: {
        currency: 'usd',
        product_data: {
          name: `Ticket - ${movieTitle}`,
          description: `${cinemaName} | ${roomName} | ${startTime}`,
        },
        unit_amount: unitAmountAfterDiscount, // En centavos, con descuento aplicado
      },
      quantity: ticketsConCargo,
    },
  ],
  metadata: {
    user_id: String(userId),
    showtime_id: String(showtimeId),
    seat_ids: JSON.stringify(seatIds),
    free_tickets_applied: String(freeTicketsApplied),
    discount_percent: String(discountPercent),
  },
  success_url: `${FRONTEND_URL}/movie/${movieId}/tickets/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${FRONTEND_URL}/movie/${movieId}/tickets/cancel`,
});
```

**Errores:**

| Código | Descripción                                   |
|--------|-----------------------------------------------|
| 400    | Datos inválidos o campos requeridos faltantes |
| 401    | Token no proporcionado o inválido             |
| 404    | Showtime no encontrado                        |
| 409    | Uno o más asientos ya están ocupados          |
| 500    | Error interno al crear la sesión de Stripe    |

---

### 1.2 GET /api/payments/order-by-session

Obtiene los datos de la orden/tickets creados a partir de una sesión de Stripe completada.

**Auth:** Bearer token requerido.

**Query Parameters:**

| Campo      | Tipo   | Requerido | Descripción               |
|------------|--------|-----------|---------------------------|
| session_id | string | sí        | ID de la Checkout Session |

**Response 200:**

```json
{
  "showtime_id": 42,
  "room_id": 5,
  "room_name": "Sala 5",
  "cinema_id": 3,
  "cinema_name": "Cinepolis Plaza",
  "movie_id": 15,
  "movie_title": "Dune: Part Three",
  "start_time": "20:00",
  "end_time": "22:30",
  "tickets": [
    {
      "id": 1,
      "seat": { "id": 101, "row": "A", "column": "1" }
    },
    {
      "id": 2,
      "seat": { "id": 102, "row": "A", "column": "2" }
    }
  ]
}
```

**Errores:**

| Código | Descripción                 |
|--------|-----------------------------|
| 400    | session_id no proporcionado |
| 401    | No autenticado              |
| 404    | Orden no encontrada         |

---

### 1.3 POST /api/payments/refund (Opcional)

Procesa un reembolso para un ticket comprado.

**Auth:** Bearer token requerido.

**Request Body:**

| Campo     | Tipo   | Requerido | Descripción                                        |
|-----------|--------|-----------|----------------------------------------------------|
| ticket_id | number | sí        | ID del ticket a reembolsar                         |
| reason    | string | no        | `duplicate`, `fraudulent`, `requested_by_customer` |

**Response 200:**

```json
{
  "refund_id": "re_...",
  "status": "succeeded",
  "amount": 1500
}
```

---

## 2. Endpoints de Suscripciones

### 2.1 GET /api/subscriptions/my-subscription

Retorna la suscripción activa del usuario autenticado. Si no tiene suscripción, retorna 404 (el frontend maneja esto como `null`).

**Auth:** Bearer token requerido.

**Response 200:**

```json
{
  "id": 1,
  "stripe_subscription_id": "sub_1234567890",
  "plan": "basic",
  "status": "active",
  "current_period_start": "2026-02-01T00:00:00.000Z",
  "current_period_end": "2026-03-01T00:00:00.000Z",
  "cancel_at_period_end": false,
  "free_tickets_remaining": 5,
  "free_tickets_used": 3,
  "discount_percent": 25,
  "createdAt": "2026-01-15T10:30:00.000Z",
  "updatedAt": "2026-02-10T14:00:00.000Z"
}
```

**Campos de la respuesta:**

| Campo                    | Tipo    | Descripción                                                   |
|--------------------------|---------|---------------------------------------------------------------|
| id                       | number  | PK de la tabla subscriptions                                  |
| stripe_subscription_id   | string  | ID de la suscripción en Stripe (`sub_...`)                    |
| plan                     | string  | `"basic"` o `"premium"`                                       |
| status                   | string  | Estado de Stripe (ver sección de estados abajo)               |
| current_period_start     | string  | Inicio del periodo actual (ISO 8601)                          |
| current_period_end       | string  | Fin del periodo actual (ISO 8601)                             |
| cancel_at_period_end     | boolean | `true` si el usuario canceló pero el periodo sigue activo     |
| free_tickets_remaining   | number  | Tickets gratis disponibles en el mes actual                   |
| free_tickets_used        | number  | Tickets gratis usados en el mes actual                        |
| discount_percent         | number  | Porcentaje de descuento del plan (25 o 50)                    |
| createdAt                | string  | Fecha de creación del registro                                |
| updatedAt                | string  | Última actualización                                          |

**Estados posibles de `status`:**

| Status               | Descripción                                             | El FE lo considera activo |
|----------------------|---------------------------------------------------------|---------------------------|
| `active`             | Suscripción activa y al día                             | Sí                        |
| `trialing`           | En periodo de prueba (si se implementa)                 | Sí                        |
| `canceled`           | Cancelada y periodo expirado                            | No                        |
| `past_due`           | Pago pendiente/fallido                                  | No                        |
| `incomplete`         | Primer pago no completado                               | No                        |
| `incomplete_expired` | Primer pago expirado                                    | No                        |
| `unpaid`             | Pagos fallidos repetidamente                            | No                        |

**Errores:**

| Código | Descripción                                     |
|--------|-------------------------------------------------|
| 401    | No autenticado                                  |
| 404    | El usuario no tiene suscripción (el FE maneja como null) |

---

### 2.2 POST /api/subscriptions/create-checkout

Crea una sesión de Stripe Checkout en modo `subscription` para que el usuario se suscriba a un plan.

**Auth:** Bearer token requerido.

**Request Body:**

| Campo | Tipo   | Requerido | Descripción                       |
|-------|--------|-----------|-----------------------------------|
| plan  | string | sí        | Slug del plan: `"basic"` o `"premium"` |

**Ejemplo de request:**

```json
{
  "plan": "premium"
}
```

**Lógica del backend:**

```
1. Validar auth y obtener user_id + email
2. Validar que plan sea "basic" o "premium"
3. Verificar si ya tiene una suscripción activa
   - Si tiene el mismo plan → error 409
   - Si tiene otro plan → puede hacer upgrade/downgrade (cancelar anterior y crear nueva)
4. Obtener el Stripe Price ID correspondiente al plan (desde config o env vars)
5. Crear o reutilizar un Stripe Customer para el usuario
6. Crear Checkout Session con mode: 'subscription'
7. Retornar { url, sessionId }
```

**Configuración de la Checkout Session:**

```typescript
// Mapeo de planes a Stripe Price IDs (configurar en env vars)
const PLAN_PRICE_IDS: Record<string, string> = {
  basic: process.env.STRIPE_PRICE_BASIC!,    // price_...
  premium: process.env.STRIPE_PRICE_PREMIUM!, // price_...
};

// Buscar o crear Stripe Customer
let customer = await findStripeCustomerByUserId(userId);
if (!customer) {
  customer = await stripe.customers.create({
    email: user.email,
    metadata: { user_id: String(userId) },
  });
  await saveStripeCustomerId(userId, customer.id);
}

const session = await stripe.checkout.sessions.create({
  mode: 'subscription',
  customer: customer.id,
  line_items: [
    {
      price: PLAN_PRICE_IDS[plan],
      quantity: 1,
    },
  ],
  metadata: {
    user_id: String(userId),
    plan: plan,
  },
  subscription_data: {
    metadata: {
      user_id: String(userId),
      plan: plan,
    },
  },
  success_url: `${FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${FRONTEND_URL}/subscription/cancel`,
});
```

**Response 200:**

```json
{
  "url": "https://checkout.stripe.com/c/pay/cs_test_...",
  "sessionId": "cs_test_..."
}
```

**Errores:**

| Código | Descripción                                    |
|--------|------------------------------------------------|
| 400    | Plan inválido (no es `basic` ni `premium`)     |
| 401    | No autenticado                                 |
| 409    | Ya tiene una suscripción activa con ese plan   |
| 500    | Error al crear la sesión de Stripe             |

---

### 2.3 POST /api/subscriptions/cancel

Cancela la suscripción del usuario al final del periodo actual. **No cancela inmediatamente**, el usuario sigue disfrutando de los beneficios hasta que expire el periodo.

**Auth:** Bearer token requerido.

**Request Body:** Vacío.

**Lógica del backend:**

```typescript
// Obtener la suscripción del usuario
const sub = await getUserSubscription(userId);
if (!sub || sub.status !== 'active') {
  return res.status(404).json({ errors: [{ message: 'No tienes una suscripción activa' }] });
}

// Cancelar al final del periodo (NO inmediatamente)
const updated = await stripe.subscriptions.update(sub.stripe_subscription_id, {
  cancel_at_period_end: true,
});

// Actualizar en BD
await updateSubscription(sub.id, {
  cancel_at_period_end: true,
});
```

**Response 200:**

```json
{
  "message": "Suscripción cancelada. Se mantendrá activa hasta el fin del periodo.",
  "cancel_at_period_end": true,
  "current_period_end": "2026-03-01T00:00:00.000Z"
}
```

**Errores:**

| Código | Descripción                            |
|--------|----------------------------------------|
| 401    | No autenticado                         |
| 404    | No tiene suscripción activa            |
| 500    | Error al cancelar en Stripe            |

---

### 2.4 POST /api/subscriptions/reactivate

Reactiva una suscripción que fue cancelada (pero que aún no ha expirado, es decir, `cancel_at_period_end: true` y `status: 'active'`).

**Auth:** Bearer token requerido.

**Request Body:** Vacío.

**Lógica del backend:**

```typescript
const sub = await getUserSubscription(userId);
if (!sub || sub.status !== 'active' || !sub.cancel_at_period_end) {
  return res.status(400).json({
    errors: [{ message: 'No hay suscripción pendiente de cancelación para reactivar' }]
  });
}

// Reactivar en Stripe
const updated = await stripe.subscriptions.update(sub.stripe_subscription_id, {
  cancel_at_period_end: false,
});

// Actualizar en BD
await updateSubscription(sub.id, {
  cancel_at_period_end: false,
});
```

**Response 200:**

```json
{
  "message": "Suscripción reactivada correctamente.",
  "status": "active"
}
```

**Errores:**

| Código | Descripción                                         |
|--------|-----------------------------------------------------|
| 400    | No hay suscripción cancelada pendiente de expirar   |
| 401    | No autenticado                                      |
| 500    | Error al reactivar en Stripe                        |

---

## 3. Webhook de Stripe

### 3.1 POST /api/payments/webhook

Endpoint para recibir todos los webhooks de Stripe. **No requiere autenticación JWT**, pero requiere verificación de firma.

**IMPORTANTE:** El body debe recibirse como **raw** (Buffer, no parseado a JSON) para verificar la firma.

```typescript
// ANTES del middleware json global
app.post(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' }),
  handleStripeWebhook
);

// Después para el resto de rutas
app.use(express.json());
```

### 3.2 Eventos a manejar

#### Pagos de tickets

| Evento                         | Acción                                                        |
|--------------------------------|---------------------------------------------------------------|
| `checkout.session.completed`   | Si `mode === 'payment'`: crear tickets, marcar asientos, decrementar `free_tickets_remaining` si aplica |
| `payment_intent.payment_failed`| Log de error, liberar reserva temporal si existe              |
| `charge.refunded`              | Cancelar tickets, liberar asientos                            |

#### Suscripciones

| Evento                               | Acción                                                                   |
|---------------------------------------|--------------------------------------------------------------------------|
| `checkout.session.completed`          | Si `mode === 'subscription'`: crear registro en tabla `subscriptions`    |
| `customer.subscription.created`       | Crear/actualizar suscripción en BD con datos del plan                    |
| `customer.subscription.updated`       | Actualizar status, periodo, cancel_at_period_end en BD                   |
| `customer.subscription.deleted`       | Marcar suscripción como `canceled` en BD                                 |
| `invoice.payment_succeeded`           | Renovación exitosa: resetear `free_tickets_remaining` al iniciar nuevo periodo |
| `invoice.payment_failed`              | Marcar como `past_due`, notificar al usuario                             |

### 3.3 Handler principal

```typescript
export const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body, // Raw body (Buffer)
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Idempotencia: verificar si ya se procesó
  const alreadyProcessed = await isEventProcessed(event.id);
  if (alreadyProcessed) {
    return res.json({ received: true });
  }

  try {
    switch (event.type) {
      // === Checkout completado (tickets O suscripción) ===
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === 'payment') {
          await handleTicketCheckoutCompleted(session);
        } else if (session.mode === 'subscription') {
          await handleSubscriptionCheckoutCompleted(session);
        }
        break;
      }

      // === Suscripción creada ===
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCreated(subscription);
        break;
      }

      // === Suscripción actualizada ===
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      // === Suscripción eliminada/expirada ===
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      // === Renovación de suscripción exitosa ===
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          await handleSubscriptionRenewal(invoice);
        }
        break;
      }

      // === Pago de suscripción fallido ===
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          await handleSubscriptionPaymentFailed(invoice);
        }
        break;
      }

      // === Reembolso ===
      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        await handleRefund(charge);
        break;
      }
    }

    await markEventProcessed(event.id);
  } catch (error) {
    console.error(`Error procesando evento ${event.type}:`, error);
    return res.status(500).json({ error: 'Error procesando webhook' });
  }

  res.json({ received: true });
};
```

### 3.4 Handlers de suscripción detallados

#### handleSubscriptionCheckoutCompleted

```typescript
async function handleSubscriptionCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = Number(session.metadata?.user_id);
  const plan = session.metadata?.plan as 'basic' | 'premium';
  const subscriptionId = session.subscription as string;

  // Obtener detalles de la suscripción desde Stripe
  const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);

  // Datos del plan
  const PLAN_CONFIG = {
    basic:   { discount_percent: 25, free_tickets_per_month: 8  },
    premium: { discount_percent: 50, free_tickets_per_month: 16 },
  };

  const config = PLAN_CONFIG[plan];

  // Crear registro en BD
  await Subscription.create({
    user_id: userId,
    stripe_subscription_id: subscriptionId,
    stripe_customer_id: session.customer as string,
    plan: plan,
    status: 'active',
    current_period_start: new Date(stripeSub.current_period_start * 1000),
    current_period_end: new Date(stripeSub.current_period_end * 1000),
    cancel_at_period_end: false,
    discount_percent: config.discount_percent,
    free_tickets_per_month: config.free_tickets_per_month,
    free_tickets_remaining: config.free_tickets_per_month,
    free_tickets_used: 0,
  });
}
```

#### handleSubscriptionUpdated

```typescript
async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const userId = Number(subscription.metadata?.user_id);

  await Subscription.update(
    {
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000),
      current_period_end: new Date(subscription.current_period_end * 1000),
      cancel_at_period_end: subscription.cancel_at_period_end,
    },
    { where: { stripe_subscription_id: subscription.id } }
  );
}
```

#### handleSubscriptionDeleted

```typescript
async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await Subscription.update(
    {
      status: 'canceled',
      cancel_at_period_end: false,
    },
    { where: { stripe_subscription_id: subscription.id } }
  );
}
```

#### handleSubscriptionRenewal (resetear tickets gratis)

```typescript
async function handleSubscriptionRenewal(invoice: Stripe.Invoice) {
  const subscriptionId = invoice.subscription as string;
  const sub = await Subscription.findOne({
    where: { stripe_subscription_id: subscriptionId },
  });

  if (!sub) return;

  // Obtener datos actualizados de Stripe
  const stripeSub = await stripe.subscriptions.retrieve(subscriptionId);

  // Resetear tickets gratis para el nuevo periodo
  const PLAN_CONFIG = {
    basic:   { free_tickets_per_month: 8  },
    premium: { free_tickets_per_month: 16 },
  };

  const freeTickets = PLAN_CONFIG[sub.plan]?.free_tickets_per_month ?? 0;

  await sub.update({
    free_tickets_remaining: freeTickets,
    free_tickets_used: 0,
    current_period_start: new Date(stripeSub.current_period_start * 1000),
    current_period_end: new Date(stripeSub.current_period_end * 1000),
    status: 'active',
  });
}
```

#### handleTicketCheckoutCompleted (actualizado para suscripciones)

```typescript
async function handleTicketCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = Number(session.metadata!.user_id);
  const showtimeId = Number(session.metadata!.showtime_id);
  const seatIds: number[] = JSON.parse(session.metadata!.seat_ids);
  const freeTicketsApplied = Number(session.metadata!.free_tickets_applied || 0);

  // Crear tickets en BD
  await Ticket.bulkCreate(
    seatIds.map((seatId) => ({
      userId,
      showtimeId,
      seatId,
      stripeSessionId: session.id,
      paymentIntentId: session.payment_intent as string,
      pricePaid: session.amount_total! / 100 / seatIds.length,
      status: 'confirmed',
    }))
  );

  // Si se usaron tickets gratis, decrementar el contador
  if (freeTicketsApplied > 0) {
    await Subscription.decrement('free_tickets_remaining', {
      by: freeTicketsApplied,
      where: { user_id: userId, status: 'active' },
    });
    await Subscription.increment('free_tickets_used', {
      by: freeTicketsApplied,
      where: { user_id: userId, status: 'active' },
    });
  }
}
```

---

## 4. Modelo de Datos

### 4.1 Tabla: `subscriptions`

| Campo                    | Tipo            | Null | Default | Descripción                                                |
|--------------------------|-----------------|------|---------|------------------------------------------------------------|
| id                       | INTEGER (PK)    | No   | auto    | ID autoincremental                                         |
| user_id                  | INTEGER (FK)    | No   |         | FK → users.id (UNIQUE, un usuario solo puede tener una)    |
| stripe_subscription_id   | VARCHAR(255)    | No   |         | ID de suscripción en Stripe (`sub_...`), UNIQUE            |
| stripe_customer_id       | VARCHAR(255)    | No   |         | ID del customer en Stripe (`cus_...`)                      |
| plan                     | ENUM            | No   |         | `'basic'` \| `'premium'`                                  |
| status                   | VARCHAR(50)     | No   |         | Estado de Stripe: `active`, `canceled`, `past_due`, etc.   |
| current_period_start     | TIMESTAMP       | No   |         | Inicio del periodo de facturación actual                   |
| current_period_end       | TIMESTAMP       | No   |         | Fin del periodo de facturación actual                      |
| cancel_at_period_end     | BOOLEAN         | No   | false   | Si se cancelará al final del periodo                       |
| discount_percent         | INTEGER         | No   |         | 25 para basic, 50 para premium                             |
| free_tickets_per_month   | INTEGER         | No   |         | 8 para basic, 16 para premium                              |
| free_tickets_remaining   | INTEGER         | No   |         | Tickets gratis disponibles en el periodo actual             |
| free_tickets_used        | INTEGER         | No   | 0       | Tickets gratis usados en el periodo actual                  |
| createdAt                | TIMESTAMP       | No   | now()   | Fecha de creación                                           |
| updatedAt                | TIMESTAMP       | No   | now()   | Última actualización                                        |

**Índices:**

- `UNIQUE(user_id)` — Un usuario solo puede tener una suscripción activa
- `UNIQUE(stripe_subscription_id)`
- `INDEX(status)`

**Relaciones:**

- `subscriptions.user_id` → `users.id` (1:1)

### 4.2 Tabla: `stripe_customers` (opcional, puede ser campo en `users`)

| Campo              | Tipo         | Descripción                        |
|--------------------|--------------|------------------------------------|
| id                 | SERIAL       | PK                                 |
| user_id            | INTEGER (FK) | FK → users.id, UNIQUE              |
| stripe_customer_id | VARCHAR(255) | ID del customer en Stripe          |

**Alternativa:** Agregar `stripe_customer_id VARCHAR(255)` directamente a la tabla `users`.

### 4.3 Tabla: `stripe_events` (para idempotencia)

| Campo        | Tipo         | Descripción                      |
|--------------|--------------|----------------------------------|
| id           | SERIAL       | PK                               |
| event_id     | VARCHAR(255) | ID del evento de Stripe (UNIQUE) |
| event_type   | VARCHAR(100) | Tipo de evento                   |
| processed_at | TIMESTAMP    | Cuándo se procesó                |

### 4.4 Tabla: `tickets` (campos de Stripe, ya existente)

Asegurar que la tabla tickets tenga estos campos:

| Campo             | Tipo         | Descripción                           |
|-------------------|--------------|---------------------------------------|
| stripe_session_id | VARCHAR(255) | ID de la Checkout Session             |
| payment_intent_id | VARCHAR(255) | ID del PaymentIntent                  |
| price_paid        | DECIMAL      | Monto pagado (0 si fue ticket gratis) |
| status            | ENUM         | `'pending'`, `'confirmed'`, `'refunded'` |

---

## 5. Lógica de Negocio

### 5.1 Cálculo de precio con suscripción

Cuando el usuario tiene suscripción activa y compra tickets, el backend debe calcular el precio final:

```typescript
function calculateTicketPrice(
  ticketPrice: number,     // Precio unitario del ticket (ej: $15.00)
  quantity: number,        // Cantidad de tickets (ej: 3)
  subscription: Subscription | null
): {
  originalTotal: number;
  finalTotal: number;
  freeTicketsApplied: number;
  discountAmount: number;
} {
  const originalTotal = ticketPrice * quantity;

  if (!subscription || subscription.status !== 'active') {
    return { originalTotal, finalTotal: originalTotal, freeTicketsApplied: 0, discountAmount: 0 };
  }

  // 1. Aplicar tickets gratis primero
  const freeToUse = Math.min(subscription.free_tickets_remaining, quantity);
  const ticketsToPay = quantity - freeToUse;

  // 2. Aplicar descuento porcentual sobre los tickets restantes
  const subtotal = ticketsToPay * ticketPrice;
  const discountAmount = subtotal * (subscription.discount_percent / 100);
  const finalTotal = Math.max(0, subtotal - discountAmount);

  return {
    originalTotal,
    finalTotal,
    freeTicketsApplied: freeToUse,
    discountAmount: discountAmount + (freeToUse * ticketPrice),
  };
}
```

**Ejemplo concreto:**

- Usuario con plan Premium (50% descuento, 5 tickets gratis restantes)
- Compra 3 tickets a $15.00 c/u
- Tickets gratis aplicados: 3 (tiene 5, solo necesita 3)
- Tickets a pagar: 0
- **Total: $0.00**

Otro ejemplo:

- Usuario con plan Básico (25% descuento, 2 tickets gratis restantes)
- Compra 5 tickets a $10.00 c/u
- Tickets gratis aplicados: 2
- Tickets a pagar: 3 × $10.00 = $30.00
- Descuento 25%: -$7.50
- **Total: $22.50**

### 5.2 Caso especial: Total = $0

Si después de aplicar tickets gratis y descuento el total es $0:

```typescript
if (finalTotal === 0) {
  // NO crear Checkout Session de Stripe (no se puede con $0)
  // Crear los tickets directamente en BD
  await Ticket.bulkCreate(
    seatIds.map((seatId) => ({
      userId,
      showtimeId,
      seatId,
      stripeSessionId: null,
      paymentIntentId: null,
      pricePaid: 0,
      status: 'confirmed',
    }))
  );

  // Decrementar tickets gratis
  await Subscription.decrement('free_tickets_remaining', {
    by: freeTicketsApplied,
    where: { user_id: userId, status: 'active' },
  });
  await Subscription.increment('free_tickets_used', {
    by: freeTicketsApplied,
    where: { user_id: userId, status: 'active' },
  });

  // Retornar URL de éxito directa (sin session_id de Stripe)
  return res.json({
    url: `${FRONTEND_URL}/movie/${movieId}/tickets/success`,
  });
}
```

### 5.3 Renovación mensual de tickets gratis

Cuando Stripe renueva la suscripción (evento `invoice.payment_succeeded`), se deben resetear los contadores:

- `free_tickets_remaining` → valor del plan (8 o 16)
- `free_tickets_used` → 0

Esto ocurre automáticamente en el handler `handleSubscriptionRenewal` documentado en la sección 3.4.

### 5.4 Upgrade / Downgrade de plan

Si un usuario quiere cambiar de plan:

1. Cancelar la suscripción actual en Stripe (inmediatamente, no al final del periodo)
2. Crear nueva Checkout Session con el nuevo plan
3. El webhook `customer.subscription.deleted` marca la anterior como cancelada
4. El webhook `customer.subscription.created` crea la nueva

**Alternativa más elegante:** Usar `stripe.subscriptions.update()` para cambiar el price, pero es más complejo de manejar.

---

## 6. Productos y Precios en Stripe

### 6.1 Crear productos en Stripe Dashboard o via API

Se necesitan 2 productos con precios recurrentes mensuales:

```typescript
// Crear via API (ejecutar una sola vez durante setup)

// Producto 1: Plan Básico
const basicProduct = await stripe.products.create({
  name: 'Movie App - Plan Básico',
  description: '25% de descuento en tickets + 8 tickets gratis al mes',
});

const basicPrice = await stripe.prices.create({
  product: basicProduct.id,
  unit_amount: 999,  // $9.99 en centavos
  currency: 'usd',
  recurring: {
    interval: 'month',
  },
});

// Producto 2: Plan Premium
const premiumProduct = await stripe.products.create({
  name: 'Movie App - Plan Premium',
  description: '50% de descuento en tickets + 16 tickets gratis al mes',
});

const premiumPrice = await stripe.prices.create({
  product: premiumProduct.id,
  unit_amount: 1999,  // $19.99 en centavos
  currency: 'usd',
  recurring: {
    interval: 'month',
  },
});

// Guardar estos IDs en las variables de entorno:
// STRIPE_PRICE_BASIC=price_xxx
// STRIPE_PRICE_PREMIUM=price_xxx
```

### 6.2 Desde el Dashboard de Stripe

1. Ir a **Products** → **Add product**
2. Crear "Plan Básico":
   - Precio: $9.99
   - Billing period: Monthly
   - Copiar el Price ID (`price_...`)
3. Crear "Plan Premium":
   - Precio: $19.99
   - Billing period: Monthly
   - Copiar el Price ID (`price_...`)
4. Agregar los Price IDs a las variables de entorno

---

## 7. Variables de Entorno

```bash
# Stripe - Keys
STRIPE_SECRET_KEY=sk_test_...              # o sk_live_... en producción
STRIPE_WEBHOOK_SECRET=whsec_...            # Secreto del webhook endpoint

# Stripe - Price IDs de los planes de suscripción
STRIPE_PRICE_BASIC=price_...               # Price ID del plan Básico ($9.99/mes)
STRIPE_PRICE_PREMIUM=price_...             # Price ID del plan Premium ($19.99/mes)

# URLs
FRONTEND_URL=http://localhost:5173         # URL del frontend para success/cancel URLs
```

---

## 8. Tipos TypeScript (Sincronización FE ↔ BE)

Estos son los tipos exactos que el frontend espera. Las respuestas del backend **deben coincidir exactamente**.

### Tipos de suscripción

```typescript
// Slugs válidos de plan
type SubscriptionPlanSlug = 'basic' | 'premium';

// Estados posibles
type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'past_due'
  | 'trialing'
  | 'incomplete'
  | 'incomplete_expired'
  | 'unpaid';

// GET /api/subscriptions/my-subscription → Response
interface UserSubscription {
  id: number;
  stripe_subscription_id: string;
  plan: SubscriptionPlanSlug;
  status: SubscriptionStatus;
  current_period_start: string;       // ISO 8601
  current_period_end: string;         // ISO 8601
  cancel_at_period_end: boolean;
  free_tickets_remaining: number;
  free_tickets_used: number;
  discount_percent: number;           // 25 o 50
  createdAt: string;                  // ISO 8601
  updatedAt: string;                  // ISO 8601
}

// POST /api/subscriptions/create-checkout → Request
interface CreateSubscriptionCheckoutRequest {
  plan: SubscriptionPlanSlug;
}

// POST /api/subscriptions/create-checkout → Response
interface CreateSubscriptionCheckoutResponse {
  url: string;
  sessionId?: string;
}

// POST /api/subscriptions/cancel → Response
interface CancelSubscriptionResponse {
  message: string;
  cancel_at_period_end: boolean;
  current_period_end: string;         // ISO 8601
}

// POST /api/subscriptions/reactivate → Response
interface ReactivateSubscriptionResponse {
  message: string;
  status: SubscriptionStatus;
}
```

### Tipos de pagos (tickets)

```typescript
// POST /api/payments/create-checkout-session → Request
interface CreateCheckoutSessionRequest {
  showtime_id: number;
  seat_ids: number[];
  movie_id?: number;
  customer_email?: string;
}

// POST /api/payments/create-checkout-session → Response
interface CreateCheckoutSessionResponse {
  url: string;
  sessionId?: string;
}

// GET /api/payments/order-by-session → Response
interface TicketPurchaseResponse {
  showtime_id: number;
  room_id: number;
  room_name: string;
  cinema_id: number;
  cinema_name: string;
  movie_id: number;
  movie_title: string;
  start_time: string;    // "HH:mm"
  end_time: string;      // "HH:mm"
  tickets: TicketSeat[];
}

interface TicketSeat {
  id: number;
  seat: {
    id: number;
    row: string;       // "A", "B", etc.
    column: string;    // "1", "2", etc.
  };
}

// POST /api/payments/refund → Request
interface RefundRequest {
  ticket_id: number;
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
}

// POST /api/payments/refund → Response
interface RefundResponse {
  refund_id: string;
  status: 'succeeded' | 'pending' | 'failed';
  amount: number;
}
```

### Formato de errores (global)

Todos los errores del backend deben seguir este formato:

```typescript
interface ApiErrorResponse {
  errors: Array<{
    field?: string;
    message: string;
  }>;
}
```

---

## 9. URLs del Frontend

El backend debe usar estas URLs al configurar las Checkout Sessions:

### Tickets

| URL                                                    | Uso                             |
|--------------------------------------------------------|---------------------------------|
| `{FRONTEND_URL}/movie/{movieId}/tickets/success?session_id={CHECKOUT_SESSION_ID}` | Pago de tickets exitoso |
| `{FRONTEND_URL}/movie/{movieId}/tickets/cancel`        | Pago de tickets cancelado       |

### Suscripciones

| URL                                                    | Uso                             |
|--------------------------------------------------------|---------------------------------|
| `{FRONTEND_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}` | Suscripción exitosa  |
| `{FRONTEND_URL}/subscription/cancel`                   | Suscripción cancelada/abandonada |

**Nota:** `{CHECKOUT_SESSION_ID}` es un template de Stripe que se reemplaza automáticamente con el ID real de la sesión.

---

## 10. Seguridad

1. **Siempre verificar la firma del webhook** con `stripe.webhooks.constructEvent`
2. **Nunca confiar solo en la confirmación del frontend** — crear tickets solo desde el webhook (excepto cuando el total es $0)
3. **Validar disponibilidad de asientos** antes de crear la sesión
4. **No exponer `STRIPE_SECRET_KEY`** en logs ni respuestas
5. **Implementar idempotencia** con tabla `stripe_events` para evitar tickets duplicados si Stripe reenvía eventos
6. **Validar que el plan sea válido** (`basic` o `premium`) antes de crear la sesión
7. **Verificar que el usuario no tenga ya una suscripción activa** del mismo plan antes de crear una nueva
8. **Calcular el precio en el backend** — nunca confiar en precios enviados desde el frontend
9. **Verificar propiedad** — un usuario solo puede ver/cancelar/reactivar SU propia suscripción

---

## 11. Testing

### Tarjetas de prueba

| Escenario              | Número              |
|------------------------|---------------------|
| Pago exitoso           | 4242 4242 4242 4242 |
| Pago rechazado         | 4000 0000 0000 0002 |
| Requiere 3D Secure     | 4000 0025 0000 3155 |
| Fondos insuficientes   | 4000 0000 0000 9995 |

### Testing de webhooks localmente

```bash
# Instalar Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Reenviar webhooks al backend local
stripe listen --forward-to localhost:3000/api/payments/webhook

# Disparar eventos de prueba
stripe trigger checkout.session.completed
stripe trigger customer.subscription.created
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted
stripe trigger invoice.payment_succeeded
```

### Configurar eventos del webhook en Stripe Dashboard

En **Developers → Webhooks → Add endpoint**, seleccionar estos eventos:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`
- `charge.refunded`
- `payment_intent.payment_failed`

---

## 12. Checklist de Implementación

### Stripe Setup

- [ ] Crear productos y precios en Stripe Dashboard (Básico y Premium)
- [ ] Guardar Price IDs en variables de entorno
- [ ] Configurar webhook endpoint en Stripe Dashboard
- [ ] Guardar webhook secret en variables de entorno

### Base de Datos

- [ ] Crear tabla `subscriptions` con todos los campos documentados
- [ ] Crear tabla `stripe_events` para idempotencia
- [ ] Agregar campo `stripe_customer_id` a tabla `users` (o crear tabla `stripe_customers`)
- [ ] Asegurar campos de Stripe en tabla `tickets`
- [ ] Crear migración para todos los cambios

### Endpoints de Suscripciones

- [ ] `GET /api/subscriptions/my-subscription`
  - [ ] Validar auth (JWT)
  - [ ] Retornar suscripción con todos los campos del tipo `UserSubscription`
  - [ ] Retornar 404 si no tiene suscripción
- [ ] `POST /api/subscriptions/create-checkout`
  - [ ] Validar auth (JWT)
  - [ ] Validar que `plan` sea `basic` o `premium`
  - [ ] Verificar que no tenga suscripción activa del mismo plan
  - [ ] Crear/reutilizar Stripe Customer
  - [ ] Crear Checkout Session con `mode: 'subscription'`
  - [ ] Guardar metadata: `user_id`, `plan`
  - [ ] Retornar `{ url, sessionId }`
- [ ] `POST /api/subscriptions/cancel`
  - [ ] Validar auth (JWT)
  - [ ] Verificar que tiene suscripción activa
  - [ ] Llamar `stripe.subscriptions.update({ cancel_at_period_end: true })`
  - [ ] Actualizar BD
  - [ ] Retornar `{ message, cancel_at_period_end, current_period_end }`
- [ ] `POST /api/subscriptions/reactivate`
  - [ ] Validar auth (JWT)
  - [ ] Verificar que tiene suscripción con `cancel_at_period_end: true`
  - [ ] Llamar `stripe.subscriptions.update({ cancel_at_period_end: false })`
  - [ ] Actualizar BD
  - [ ] Retornar `{ message, status }`

### Endpoint de Pagos (actualización)

- [ ] `POST /api/payments/create-checkout-session`
  - [ ] Consultar suscripción activa del usuario
  - [ ] Calcular tickets gratis y descuento
  - [ ] Si total = $0, crear tickets sin Stripe y retornar URL de éxito directa
  - [ ] Si total > $0, incluir `free_tickets_applied` y `discount_percent` en metadata
  - [ ] Crear Checkout Session con el precio final calculado

### Webhook

- [ ] Configurar raw body antes del middleware JSON
- [ ] Verificar firma de Stripe
- [ ] Implementar idempotencia con tabla `stripe_events`
- [ ] Handler: `checkout.session.completed` (mode=payment) → crear tickets, decrementar free_tickets
- [ ] Handler: `checkout.session.completed` (mode=subscription) → crear suscripción
- [ ] Handler: `customer.subscription.created` → crear/actualizar suscripción
- [ ] Handler: `customer.subscription.updated` → actualizar status y periodo
- [ ] Handler: `customer.subscription.deleted` → marcar como cancelada
- [ ] Handler: `invoice.payment_succeeded` → resetear tickets gratis del nuevo periodo
- [ ] Handler: `invoice.payment_failed` → marcar como past_due
- [ ] Handler: `charge.refunded` → cancelar tickets y liberar asientos
