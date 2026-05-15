import { ApiClient } from './api-client';

export interface CreateDeliveryPayload {
  senderName: string;
  senderPhone: string;
  senderEmail: string;
  senderCompany: string;
  receiverName: string;
  receiverPhone: string;
  receiverEmail: string;
  pickupAddress: string;
  dropoffAddress: string;
  itemDescription: string;
  itemValue: number;
  referenceNumber: string;
  requireOtp: boolean;
  requirePickupPhotos: boolean;
  requireDeliveryPhotos: boolean;
  requireItemVerification: boolean;
  items: Array<{
    name: string;
    description: string;
    quantityExpected: number;
    serialNumber: string;
    declaredValue: number;
    category: string;
  }>;
}

export interface DeliveryResponse {
  id: string;
  trackingNumber: string;
  status: string;
  senderName: string;
  receiverName: string;
  pickupAddress: string;
  dropoffAddress: string;
  createdAt: string;
}

export interface DisputePayload {
  disputeType: 'NotDelivered' | 'ItemDamaged' | 'ItemMissing' | 'WrongAddress' | 'LateDelivery' | 'Other';
  description: string;
}

export class DeliveryApi {
  constructor(private readonly client: ApiClient) {}

  async create(payload: CreateDeliveryPayload): Promise<DeliveryResponse> {
    return this.client.post<DeliveryResponse>('/api/deliveries', payload);
  }

  async getById(id: string): Promise<DeliveryResponse> {
    return this.client.get<DeliveryResponse>(`/api/deliveries/${id}`);
  }

  async updateStatus(id: string, status: string): Promise<void> {
    await this.client.put(`/api/deliveries/${id}/status`, { status });
  }

  async assignDriver(id: string, driverId: string): Promise<void> {
    await this.client.put(`/api/deliveries/${id}/assign-driver`, { driverId });
  }

  async openDispute(id: string, payload: DisputePayload): Promise<{ id: string }> {
    return this.client.post(`/api/deliveries/${id}/disputes`, payload);
  }

  async generatePod(id: string): Promise<{ pdfUrl: string }> {
    return this.client.post(`/api/deliveries/${id}/pod/generate`);
  }

  async delete(id: string): Promise<void> {
    return this.client.delete(`/api/deliveries/${id}`);
  }
}
