# Especificación Backend: Historial de compras / transacciones

Este documento describe lo que debe implementar el **backend movie-api** para que el frontend pueda mostrar el **historial de compras** (transacciones) del usuario.

---

## 1. Resumen

El frontend necesita un endpoint que devuelva la **lista de compras/órdenes** del usuario autenticado, con la información suficiente para mostrar en una lista tipo "Mis compras": película, cine, fecha y hora de la función, cantidad de tickets y monto total. Opcionalmente se puede incluir paginación.

---

## 2. Endpoint

### GET /api/orders

Devuelve el historial de órdenes (compras de tickets) del usuario autenticado, ordenado por fecha de compra descendente (más recientes primero).

**Alternativa de ruta:** `GET /api/users/me/orders` si se prefiere mantener todo bajo el recurso del usuario.

**Autenticación:** Bearer token requerido.

**Query params (opcionales):**

| Parámetro | Tipo   | Descripción                |
|----------|--------|----------------------------|
| page     | number | Página (por defecto 1)     |
| limit    | number | Cantidad por página (por defecto 20, máx. 50) |

**Response 200 (sin paginación):**

```json
{
  "orders": [
    {
      "id": 1,
      "movie_id": 10,
      "movie_title": "Nombre de la película",
      "cinema_name": "Cine XYZ",
      "room_name": "Sala 3",
      "showtime_date": "2025-02-15",
      "showtime_time": "18:30",
      "tickets_count": 2,
      "total_amount": 24.50,
      "created_at": "2025-02-10T14:30:00.000Z"
    }
  ]
}
```

**Response 200 (con paginación, recomendado):**

```json
{
  "orders": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

**Campos de cada ítem en `orders`:**

| Campo          | Tipo   | Descripción                                      |
|----------------|--------|--------------------------------------------------|
| id             | number | ID de la orden (o agrupación de compra)          |
| movie_id       | number | ID de la película                                |
| movie_title    | string | Título de la película                            |
| cinema_name    | string | Nombre del cine                                  |
| room_name      | string | Nombre de la sala                                |
| showtime_date  | string | Fecha de la función (YYYY-MM-DD)                 |
| showtime_time  | string | Hora de inicio (HH:mm)                           |
| tickets_count  | number | Cantidad de tickets de la compra                 |
| total_amount   | number | Monto total pagado (ej. 24.50)                   |
| created_at     | string | Fecha/hora de la compra (ISO 8601)               |

**Códigos de error:**

- **401** – No autenticado.

---

## 3. Origen de los datos en el backend

Las órdenes pueden derivarse de:

1. **Tabla `orders` (recomendado):** Si ya existe (o se crea) una tabla de órdenes al procesar el pago (Stripe Checkout Session o compra directa), cada fila es una orden. Se consulta `WHERE user_id = ?` ordenado por `created_at DESC`.

2. **Agrupación de `tickets`:** Si no hay tabla de órdenes, se pueden agrupar los tickets del usuario. Criterio de agrupación: mismo `showtime_id` y misma ventana de tiempo de creación (ej. mismos segundos/minutos). Para cada grupo se obtiene: showtime (fecha, hora, sala), cine, película, cantidad de tickets, y suma de precios (si está guardada por ticket). El `id` puede ser el `showtime_id` + alguna clave compuesta, o el `id` del primer ticket del grupo.

3. **Tabla `payments` o `checkout_sessions`:** Si se guarda cada Checkout Session completada con `user_id`, `showtime_id`, `total`, `created_at`, se puede construir la lista desde ahí y enriquecer con datos de showtime, cine y película.

El frontend solo espera el array `orders` con la estructura indicada; no asume un modelo concreto en BD.

---

## 4. Tipos TypeScript (sincronización FE)

El frontend usará algo equivalente a:

```ts
interface OrderHistoryItem {
  id: number;
  movie_id: number;
  movie_title: string;
  cinema_name: string;
  room_name: string;
  showtime_date: string;   // YYYY-MM-DD
  showtime_time: string;   // HH:mm
  tickets_count: number;
  total_amount: number;
  created_at: string;     // ISO 8601
}

interface OrdersResponse {
  orders: OrderHistoryItem[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

---

## 5. Notas

- **Paginación:** Aunque el primer entregable puede ser "sin paginación" (devolver todas las órdenes con un límite razonable, ej. 100), se recomienda implementar `page` y `limit` para no sobrecargar la respuesta.
- **Moneda:** `total_amount` en la misma unidad que se use en el resto del sistema (ej. dólares con 2 decimales).
- **Orden:** Siempre más recientes primero (`created_at DESC`).

Cuando este endpoint esté implementado, el frontend consumirá `GET /api/orders` (o `/api/users/me/orders`) y mostrará el historial en la página "Mis compras" / "Historial de transacciones".

---

## 6. Historial de compras de suscripción

Para mostrar también en "Mis compras" las **compras de planes de suscripción**, el frontend usa **GET /api/subscriptions** (no usar `/api/subscription-purchases`; ese endpoint ya no existe). El frontend unifica órdenes de tickets y compras de suscripción en una sola lista ordenada por `created_at` descendente.

### GET /api/subscriptions

Devuelve el historial de compras de suscripción del usuario: cada vez que se suscribió (o renovó) un plan, con plan, monto y fecha.

**Autenticación:** Bearer token requerido.

**Query params (opcionales):** Los mismos que en órdenes (`page`, `limit`) si se desea paginación.

**Response 200:**

```json
{
  "purchases": [
    {
      "id": 1,
      "plan_slug": "basic",
      "plan_name": "Básico",
      "total_amount": 9.99,
      "created_at": "2025-02-10T14:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 3,
    "totalPages": 1
  }
}
```

**Campos de cada ítem:**

| Campo         | Tipo   | Descripción                                                |
|---------------|--------|------------------------------------------------------------|
| id            | number | ID del registro (subscription o subscription_event)        |
| plan_slug     | string | Slug del plan: `"basic"` o `"premium"`                     |
| plan_name     | string | Nombre para mostrar: Básico, Premium                       |
| total_amount  | number | Monto pagado (ej. 9.99)                                    |
| created_at    | string | Fecha/hora del pago o alta de suscripción (ISO)           |

**Origen de los datos en el backend:**

- Opción A: Desde la tabla `subscriptions`. Cada fila tiene `user_id`, `plan` (slug), `created_at`. El monto puede venir del Price de Stripe (guardado en config/env por plan) o de un campo `amount` si se guardó al crear la suscripción. Para renovaciones, hace falta registrar cada cobro (ej. tabla `subscription_invoices` o eventos al procesar `invoice.payment_succeeded`).
- Opción B (mínimo viable): Solo alta de suscripción. Consultar `subscriptions` con `WHERE user_id = ?` ordenado por `created_at DESC`. Incluir suscripciones activas y canceladas. `plan_name` puede mapearse en backend desde `plan_slug` (basic → Básico, premium → Premium). `total_amount` desde el precio del plan en Stripe o constante por plan.

**Códigos de error:**

- **401** – No autenticado.

El frontend combina `GET /api/orders` y `GET /api/subscriptions`, ordena por `created_at` descendente y muestra en la misma página tanto tickets como compras de planes, con distinto diseño por tipo (ticket vs suscripción).
