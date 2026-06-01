---
title: API
description: Frontend API services and payment callback flow
---

# API

## Orders

### createOrder
- Method: POST
- Path: /orders
- Payload: `{ items: [{ contentId: number, quantity: number }] }`
- Returns: order object `{ id, status, ... }`

### initializePayment
- Method: POST
- Path: /orders/{orderId}/initialize-payment
- Returns: `{ authorizationUrl: string, reference: string, ... }`
- Usage: redirect the user to `authorizationUrl`

### verifyPayment
- Method: POST
- Path: /orders/verify-payment/{reference}
- Returns: `{ status: string, message: string }`
- Usage: Called from the frontend after Paystack redirects back with a `reference`

## Payment Callback Page
- Route: `/payment/callback`
- Behavior:
  - Reads `reference` or `trxref` from the query string
  - Calls `ordersApi.verifyPayment(reference)`
  - Shows a status indicator (pending/success/error)
  - Redirects back to `/library`

## Frontend Service: ordersApi
Located at: `src/lib/api/orders.ts`

- `createOrder(payload)`
- `initializePayment(orderId)`
- `verifyPayment(reference)`
