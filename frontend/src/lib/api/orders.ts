import apiClient from './client'

export interface CreateOrderItem {
  content_id: number
  quantity: number
}

export interface CreateOrderPayload {
  items: CreateOrderItem[]
  shipping_address?: string
  notes?: string
}

export interface OrderResponse {
  id: number
  total_amount: number
  status: string
}

export interface InitializePaymentResponse {
  authorization_url: string
  access_code: string
  reference: string
}

export const ordersApi = {
  async createOrder(payload: CreateOrderPayload): Promise<OrderResponse> {
    const res = await apiClient.post<OrderResponse>('/orders', payload)
    return res.data
  },
  async initializePayment(orderId: number): Promise<InitializePaymentResponse> {
    const res = await apiClient.post<InitializePaymentResponse>(`/orders/${orderId}/initialize-payment`)
    return res.data
  },
  async verifyPayment(reference: string): Promise<{ message: string; status: string }> {
    const res = await apiClient.post<{ message: string; status: string }>(`/orders/verify-payment/${reference}`)
    return res.data
  },
}
