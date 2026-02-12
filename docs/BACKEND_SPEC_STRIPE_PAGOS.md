# Especificación Backend: Stripe Payments con Facturación Automática

## Resumen

El frontend de Movie App implementa un flujo de compra de tickets usando **Stripe Checkout Sessions**. Esta especificación describe los endpoints, webhooks y configuraciones que el backend debe implementar, incluyendo la **nueva funcionalidad de envío automático de facturas/recibos** al email del cliente.

---

## 1. Endpoints Requeridos

### 1.1 POST /api/payments/create-checkout-session

Crea una sesión de Stripe Checkout para comprar tickets de cine.

**Auth:** Bearer token requerido.

**Request Body:**

| Campo          | Tipo     | Requerido | Descripción                                                          |
|----------------|----------|-----------|----------------------------------------------------------------------|
| showtime_id    | number   | sí        | ID del showtime                                                      |
| seat_ids       | number[] | sí        | Array de IDs de asientos a comprar                                   |
| movie_id       | number   | no        | ID de la película (para construir success/cancel URLs)               |
| customer_email | string   | no        | Email del cliente para **facturación automática de Stripe**          |

**Ejemplo de request:**

```json
{
  "showtime_id": 42,
  "seat_ids": [101, 102, 103],
  "movie_id": 15,
  "customer_email": "usuario@ejemplo.com"
}
```

**Response 200:**

| Campo     | Tipo   | Descripción                              |
|-----------|--------|------------------------------------------|
| url       | string | URL de Stripe Checkout para redirigir    |
| sessionId | string | (Opcional) ID de la sesión para tracking |

**Ejemplo de response:**

```json
{
  "url": "https://checkout.stripe.com/c/pay/cs_test_...",
  "sessionId": "cs_test_..."
}
```

**Errores:**

| Código | Descripción                                |
|--------|--------------------------------------------|
| 400    | Datos inválidos o campos requeridos faltantes |
| 401    | Token no proporcionado o inválido           |
| 404    | Showtime no encontrado                      |
| 409    | Uno o más asientos ya están ocupados        |
| 500    | Error interno al crear la sesión de Stripe  |

---

### 1.2 GET /api/payments/order-by-session

Obtiene los datos de la orden/tickets creados a partir de una sesión de Stripe completada. Útil para mostrar el detalle de compra en la página de éxito.

**Auth:** Bearer token requerido.

**Query Parameters:**

| Campo      | Tipo   | Requerido | Descripción               |
|------------|--------|-----------|---------------------------|
| session_id | string | sí        | ID de la Checkout Session |

**Response 200:**

```json
{
  "tickets": [
    {
      "id": 1,
      "seat_label": "A1",
      "price": 15.00
    },
    {
      "id": 2,
      "seat_label": "A2",
      "price": 15.00
    }
  ],
  "showtime": {
    "id": 42,
    "start_time": "2026-02-15T20:00:00Z",
    "movie_title": "Dune: Part Three",
    "cinema_name": "Cinepolis Plaza",
    "room_name": "Sala 5"
  },
  "total": 30.00,
  "payment_status": "paid"
}
```

**Errores:**

| Código | Descripción                    |
|--------|--------------------------------|
| 400    | session_id no proporcionado    |
| 401    | No autenticado                 |
| 404    | Orden no encontrada            |

---

### 1.3 POST /api/payments/webhook

Endpoint para recibir webhooks de Stripe. **No requiere autenticación JWT**, pero requiere verificación de firma de Stripe.

**Headers requeridos:**

| Header           | Descripción                           |
|------------------|---------------------------------------|
| stripe-signature | Firma del webhook generada por Stripe |

**IMPORTANTE:** El body debe recibirse como **raw** (no parseado a JSON) para poder verificar la firma.

**Eventos a manejar:**

| Evento                        | Acción                                              |
|-------------------------------|-----------------------------------------------------|
| checkout.session.completed    | Crear tickets en BD, marcar asientos como ocupados  |
| payment_intent.succeeded      | Log de confirmación (opcional)                      |
| payment_intent.payment_failed | Notificar error, liberar reserva temporal           |
| charge.refunded               | Cancelar tickets, liberar asientos                  |

---

### 1.4 POST /api/payments/refund (Opcional)

Procesa un reembolso para un ticket comprado.

**Auth:** Bearer token requerido.

**Request Body:**

| Campo     | Tipo   | Requerido | Descripción                                      |
|-----------|--------|-----------|--------------------------------------------------|
| ticket_id | number | sí        | ID del ticket a reembolsar                       |
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

## 2. Facturación Automática por Email (NUEVO)

### 2.1 Descripción

Cuando el frontend envía `customer_email` en el request de `create-checkout-session`, el backend debe configurar la Checkout Session para que **Stripe envíe automáticamente un recibo/factura** al email del cliente una vez completado el pago.

### 2.2 Implementación en el Backend

Al crear la Checkout Session, usar el parámetro `customer_email` o `receipt_email`:

```typescript
const session = await stripe.checkout.sessions.create({
  // ... otros parámetros ...
  
  // Opción 1: customer_email en la sesión
  // Stripe pre-llena el campo de email en el checkout
  customer_email: req.body.customer_email,
  
  // Opción 2: Configurar Invoice si se requiere factura formal
  invoice_creation: {
    enabled: true,
    invoice_data: {
      description: `Tickets de cine - ${movieTitle}`,
      metadata: {
        showtime_id: String(showtime_id),
        user_id: String(userId),
      },
      // Opcional: personalizar factura
      custom_fields: [
        { name: 'Película', value: movieTitle },
        { name: 'Fecha', value: showtimeDate },
        { name: 'Cine', value: cinemaName },
      ],
    },
  },
  
  // Asegurar que se envíe recibo
  payment_intent_data: {
    receipt_email: req.body.customer_email,
  },
  
  // ... resto de configuración ...
});
```

### 2.3 Configuración Recomendada

**Para recibos simples** (email con resumen del pago):

```typescript
const session = await stripe.checkout.sessions.create({
  mode: 'payment',
  customer_email: customerEmail, // Pre-llena email en checkout
  payment_intent_data: {
    receipt_email: customerEmail, // Envía recibo automático
  },
  line_items: [...],
  success_url: '...',
  cancel_url: '...',
  metadata: {...},
});
```

**Para facturas formales** (PDF adjunto con detalles):

```typescript
const session = await stripe.checkout.sessions.create({
  mode: 'payment',
  customer_email: customerEmail,
  invoice_creation: {
    enabled: true,
    invoice_data: {
      description: `Entrada(s) de cine - ${movieTitle}`,
      footer: 'Gracias por tu compra en Movie App',
      metadata: {
        showtime_id: String(showtimeId),
        cinema_name: cinemaName,
      },
    },
  },
  line_items: [...],
  success_url: '...',
  cancel_url: '...',
  metadata: {...},
});
```

### 2.4 Flujo Completo

```
1. Usuario confirma compra en el FE
2. FE llama POST /api/payments/create-checkout-session
   - Envía: showtime_id, seat_ids, movie_id, customer_email
3. BE valida datos y disponibilidad de asientos
4. BE crea Checkout Session con:
   - customer_email (pre-llena el campo)
   - receipt_email en payment_intent_data (activa envío de recibo)
   - invoice_creation.enabled: true (opcional, para factura formal)
5. BE retorna { url } → FE redirige a Stripe
6. Usuario paga en Stripe Checkout
7. Stripe envía automáticamente recibo/factura al email
8. Stripe envía webhook checkout.session.completed
9. BE crea tickets y marca asientos como ocupados
10. Usuario es redirigido a success_url
```

---

## 3. Tipos TypeScript (Sincronizar FE ↔ BE)

### Request Types

```typescript
// POST /api/payments/create-checkout-session
interface CreateCheckoutSessionRequest {
  showtime_id: number;
  seat_ids: number[];
  movie_id?: number;       // Para construir URLs de retorno
  customer_email?: string; // Para facturación automática
}
```

### Response Types

```typescript
interface CreateCheckoutSessionResponse {
  url: string;
  sessionId?: string;
}

interface SessionStatusResponse {
  status: 'complete' | 'expired' | 'open';
  payment_status: 'paid' | 'unpaid' | 'no_payment_required';
  customer_email?: string;
}

interface RefundRequest {
  ticket_id: number;
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer';
}

interface RefundResponse {
  refund_id: string;
  status: 'succeeded' | 'pending' | 'failed';
  amount: number; // En centavos
}
```

---

## 4. Webhook Handler

### 4.1 Configuración del Raw Body

El endpoint de webhook debe recibir el body **sin parsear** para verificar la firma:

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

### 4.2 Handler con Idempotencia

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
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }
      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        await handleRefund(charge);
        break;
      }
      // ... otros eventos
    }
    
    await markEventProcessed(event.id);
  } catch (error) {
    console.error(`Error procesando evento ${event.type}:`, error);
    return res.status(500).json({ error: 'Error procesando webhook' });
  }
  
  res.json({ received: true });
};
```

### 4.3 Crear Tickets tras Pago Exitoso

```typescript
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const { user_id, showtime_id, seat_ids } = session.metadata!;
  
  // Crear tickets
  await Ticket.bulkCreate(
    JSON.parse(seat_ids).map((seatId: number) => ({
      userId: Number(user_id),
      showtimeId: Number(showtime_id),
      seatId,
      stripeSessionId: session.id,
      paymentIntentId: session.payment_intent as string,
      pricePaid: session.amount_total! / JSON.parse(seat_ids).length,
      status: 'confirmed',
    }))
  );
  
  // Marcar asientos como ocupados si no se hace automáticamente
  // ...
}
```

---

## 5. Variables de Entorno Requeridas

```bash
# Stripe
STRIPE_SECRET_KEY=sk_test_...        # o sk_live_... en producción
STRIPE_WEBHOOK_SECRET=whsec_...      # Secreto del webhook

# URLs
FRONTEND_URL=http://localhost:5173   # Para success/cancel URLs
```

---

## 6. Modelo de Datos Sugerido

### Tabla: stripe_events (para idempotencia)

| Campo       | Tipo         | Descripción                     |
|-------------|--------------|----------------------------------|
| id          | SERIAL       | PK                               |
| event_id    | VARCHAR(255) | ID del evento de Stripe (único)  |
| event_type  | VARCHAR(100) | Tipo de evento                   |
| processed_at| TIMESTAMP    | Cuándo se procesó                |

### Tabla: tickets (campos relacionados a Stripe)

| Campo             | Tipo         | Descripción                         |
|-------------------|--------------|-------------------------------------|
| stripe_session_id | VARCHAR(255) | ID de la Checkout Session           |
| payment_intent_id | VARCHAR(255) | ID del PaymentIntent                |
| price_paid        | DECIMAL      | Monto pagado (en la moneda local)   |
| status            | ENUM         | 'pending', 'confirmed', 'refunded'  |

---

## 7. Seguridad

1. **Siempre verificar la firma del webhook** con `stripe.webhooks.constructEvent`
2. **Nunca confiar solo en la confirmación del FE** — crear tickets solo desde el webhook
3. **Validar disponibilidad de asientos** antes de crear la sesión
4. **No exponer `STRIPE_SECRET_KEY`** en logs ni respuestas
5. **Implementar idempotencia** para evitar tickets duplicados si Stripe reenvía el evento

---

## 8. URLs de Success/Cancel

El backend debe construir las URLs usando el `movie_id` del request:

```typescript
const successUrl = `${FRONTEND_URL}/ticket-purchase/${movie_id}/success?session_id={CHECKOUT_SESSION_ID}`;
const cancelUrl = `${FRONTEND_URL}/ticket-purchase/${movie_id}/cancel`;
```

**Nota:** `{CHECKOUT_SESSION_ID}` es un template de Stripe que se reemplaza automáticamente.

---

## 9. Testing

### Tarjetas de Prueba

| Escenario              | Número               |
|------------------------|----------------------|
| Pago exitoso           | 4242 4242 4242 4242  |
| Pago rechazado         | 4000 0000 0000 0002  |
| Requiere 3D Secure     | 4000 0025 0000 3155  |
| Fondos insuficientes   | 4000 0000 0000 9995  |

### Testing de Webhooks Localmente

```bash
# Instalar Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Reenviar webhooks al backend local
stripe listen --forward-to localhost:3000/api/payments/webhook

# Disparar evento de prueba
stripe trigger checkout.session.completed
```

---

## 10. Checklist de Implementación

- [ ] Endpoint `POST /api/payments/create-checkout-session`
  - [ ] Validar auth (JWT)
  - [ ] Validar disponibilidad de asientos
  - [ ] Calcular precio total
  - [ ] Crear Checkout Session con `customer_email` y `receipt_email`
  - [ ] Incluir `invoice_creation.enabled: true` si se requieren facturas formales
  - [ ] Guardar metadata (user_id, showtime_id, seat_ids)
  - [ ] Retornar URL de checkout
- [ ] Endpoint `GET /api/payments/order-by-session`
  - [ ] Buscar tickets por `stripe_session_id`
  - [ ] Retornar datos de la orden
- [ ] Endpoint `POST /api/payments/webhook`
  - [ ] Configurar raw body (antes de json middleware)
  - [ ] Verificar firma de Stripe
  - [ ] Implementar idempotencia con tabla `stripe_events`
  - [ ] Handler para `checkout.session.completed` → crear tickets
  - [ ] Handler para `charge.refunded` → cancelar tickets
- [ ] Endpoint `POST /api/payments/refund` (opcional)
- [ ] Variables de entorno configuradas
- [ ] Modelo `stripe_events` creado
- [ ] Campos de Stripe añadidos al modelo `tickets`

---

## 11. Resumen de Cambios Recientes (Facturación Automática)

El frontend ahora envía el campo `customer_email` al crear la sesión de checkout. El backend debe:

1. **Aceptar el campo `customer_email`** en el request body
2. **Pasarlo a Stripe** al crear la Checkout Session:
   - `customer_email`: Pre-llena el email en el formulario de Stripe
   - `payment_intent_data.receipt_email`: Activa el envío automático del recibo
   - `invoice_creation.enabled: true`: (Opcional) Genera factura formal con PDF

Esto permite que los usuarios reciban automáticamente un comprobante de su compra sin que el backend tenga que implementar lógica adicional de envío de emails.
