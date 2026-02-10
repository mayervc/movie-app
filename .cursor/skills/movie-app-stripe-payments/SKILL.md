---
name: movie-app-stripe-payments
description: Implementa el flujo de pagos con Stripe en el frontend Movie App. Usa cuando el usuario pida pagos con Stripe, checkout Stripe, integración de pagos, o modificar el flujo de compra de tickets para incluir pago.
---

# Pagos con Stripe (Frontend Movie App)

## Enfoque recomendado: Stripe Checkout (redirect)

Usar **Checkout Session** creada en el backend y redirigir al usuario a Stripe. El BE crea la sesión, devuelve `url` (o `sessionId`), y el FE redirige. Tras el pago, Stripe redirige a `success_url`; el BE confirma la compra vía webhook.

- **Ventajas:** No manejas datos de tarjeta en el FE, PCI simple, menos código.
- **Alternativa:** Payment Element en página propia (más control UX, más trabajo).

## Flujo con Checkout Session

1. Usuario en paso "confirmar" (cine, showtime, asientos ya elegidos).
2. FE llama al BE: `POST /api/payments/create-checkout-session` con `{ showtime_id, seat_ids }` (y opcionalmente `success_url`, `cancel_url` si el BE lo permite).
3. BE crea Stripe Checkout Session, guarda en BD estado "pending" si aplica, devuelve `{ url }` (o `sessionId` para usar con Stripe.js).
4. FE hace `window.location.href = url` (redirección a Stripe).
5. Usuario paga en Stripe; Stripe redirige a `success_url` (ej: `/ticket-purchase/:movieId/success?session_id=...`).
6. BE recibe webhook `checkout.session.completed`, crea los tickets, actualiza estado.
7. Página de success en el FE muestra confirmación; puede llamar a `GET /api/tickets` o a un endpoint de "orden por session_id" si el BE lo expone.

## Implementación en el frontend

### Servicio de pagos

- **Archivo:** `src/services/payments.service.ts`
- **Función:** `createCheckoutSession(showtimeId: number, seatIds: number[])` → llama a `api.post('/payments/create-checkout-session', { showtime_id: showtimeId, seat_ids: seatIds })` → devuelve `data.url` (o `data.sessionId`).
- Usar el `api` configurado (interceptor con token). Requiere auth.

### Integración en el flujo de compra

- En `useTicketPurchase` (o en el paso "confirm" de `TicketPurchase.tsx`): en lugar de llamar directo a `ticketsService.purchase`, primero llamar a `paymentsService.createCheckoutSession(showtimeId, seatIds)` y luego redirigir a `data.url`.
- Opcional: guardar en sessionStorage los datos necesarios para la página de success (movieId, showtimeId, etc.) por si la success_url no trae todo en query.

### Página de success

- Ruta ej: `/ticket-purchase/:movieId/success`
- Query: `session_id` (Stripe Session ID) si el BE lo pasa en `success_url`.
- Mostrar mensaje de "Pago realizado" y, si el BE expone un endpoint para obtener tickets por `session_id`, mostrar resumen de tickets; si no, mensaje genérico y link a "Mis tickets" o Home.

### Página de cancel

- Ruta ej: `/ticket-purchase/:movieId` (volver al flujo) o `/ticket-purchase/:movieId/cancel`.
- Mostrar "Pago cancelado" y botón para reintentar o elegir otros asientos.

## Variables de entorno (frontend)

- No guardar claves secretas de Stripe en el FE. Solo el BE usa `STRIPE_SECRET_KEY`.
- Opcional: `VITE_STRIPE_PUBLISHABLE_KEY` si más adelante usas Payment Element o Stripe.js en el FE (no necesario para solo redirect a Checkout).

## Tipos TypeScript

```typescript
// types/payment.types.ts (ejemplo)
export interface CreateCheckoutSessionRequest {
  showtime_id: number;
  seat_ids: number[];
}

export interface CreateCheckoutSessionResponse {
  url: string;           // Redirección a Stripe Checkout
  sessionId?: string;    // Opcional
}
```

## Coordinación con el backend

- **Siempre** que implementes o cambies este flujo, genera o actualiza la especificación para el BE en `docs/BACKEND_SPEC_STRIPE_PAGOS.md` usando el skill **movie-app-backend-spec** (endpoints, webhook, modelos, success_url/cancel_url).
- El BE debe implementar: creación de Checkout Session, webhook `checkout.session.completed`, y opcionalmente endpoint para consultar orden/tickets por `session_id`.

## Checklist

- [ ] `payments.service.ts` con `createCheckoutSession` usando `api`
- [ ] Flujo de compra redirige a Stripe en lugar de llamar directo a `ticketsService.purchase`
- [ ] Rutas success y cancel configuradas en React Router
- [ ] Tipos en `types/payment.types.ts`
- [ ] Doc en `docs/BACKEND_SPEC_STRIPE_PAGOS.md` actualizado con lo que el BE debe implementar
