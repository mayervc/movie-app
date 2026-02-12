---
name: movie-app-backend-spec
description: Genera o actualiza documentos de especificación para el backend movie-api. Usa cuando implementes una feature en el frontend que requiera nuevos endpoints, webhooks, modelos o cambios en el BE, o cuando el usuario pida "documentar para el backend", "especificación BE" o "qué debe implementar el backend".
---

# Especificaciones para el Backend (movie-api)

## Objetivo

Cuando una feature del frontend dependa del backend, genera (o actualiza) un documento en `docs/` que describa **qué debe implementar el backend**. Así puedes:
- Enviar el doc al repo del backend o a otro agente
- Implementar tú mismo en el BE con una guía clara
- Mantener un contrato FE–BE en un solo lugar

## Ubicación del backend

- **Proyecto:** movie-api (ruta típica: `~/cursor/movie-api` o la que uses)
- **Stack:** Node.js + Express + PostgreSQL + Sequelize
- **Base URL API:** `http://localhost:3000/api`

## Dónde guardar las especificaciones

- **Carpeta:** `docs/` en la raíz del frontend (movie-app)
- **Nombre sugerido:** `BACKEND_SPEC_<tema>.md` (ej: `BACKEND_SPEC_STRIPE_PAGOS.md`)

## Estructura del documento

Cada especificación debe incluir:

1. **Resumen** – Una frase sobre qué feature del FE requiere esto en el BE.
2. **Endpoints** – Método, ruta, body/query, headers, respuesta esperada y códigos de error.
3. **Tipos / modelos** – Campos necesarios (para que BE y FE coincidan).
4. **Webhooks** (si aplica) – URL, eventos, payload, idempotencia.
5. **Variables de entorno** (si aplica) – Ej: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`.
6. **Flujo resumido** – Pasos en orden (ej: 1. FE llama a POST /payments/create-session, 2. BE crea Stripe Session…).
7. **Notas de seguridad** – Validaciones, auth, no exponer secretos.

## Ejemplo de sección de endpoint

```markdown
### POST /api/payments/create-checkout-session

Crea una sesión de Stripe Checkout para comprar tickets.

**Auth:** Bearer token requerido.

**Body:**
| Campo         | Tipo     | Requerido | Descripción                    |
|---------------|----------|-----------|--------------------------------|
| showtime_id   | number   | sí        | ID del showtime                |
| seat_ids      | number[] | sí        | IDs de asientos                |

**Response 200:**
| Campo        | Tipo   | Descripción           |
|--------------|--------|------------------------|
| sessionId    | string | Stripe Checkout Session ID |
| url          | string | URL a redirigir (opcional) |

**Errores:** 400 (datos inválidos), 401 (no auth), 409 (asientos ya ocupados).
```

## Cuándo generar el doc

- Al implementar pagos (Stripe, etc.) que requieran sesión o webhook en el BE.
- Al añadir cualquier flujo donde el FE llame a un endpoint que aún no exista.
- Cuando el usuario diga explícitamente "documenta lo que necesita el backend" o "crea la spec para el BE".

## Checklist antes de cerrar el doc

- [ ] Todos los endpoints tienen método, ruta, body/query y respuesta
- [ ] Tipos compartidos (request/response) están definidos
- [ ] Webhooks incluyen evento(s) y recomendación de idempotencia
- [ ] Se menciona qué hace el FE con cada respuesta (redirección, estado, etc.)
