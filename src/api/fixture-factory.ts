import { ApiClient } from './api-client';
import { AuthApi } from './auth.api';
import { DeliveryApi, CreateDeliveryPayload, DeliveryResponse } from './delivery.api';
import { ENV } from '../support/env';
import { faker } from '@faker-js/faker';

interface CreatedUser {
  id: string;
  email: string;
  token: string;
}

export class FixtureFactory {
  private readonly client: ApiClient;
  private readonly auth: AuthApi;
  private readonly delivery: DeliveryApi;

  private createdDeliveryIds: string[] = [];
  private createdUserEmails: string[] = [];

  constructor() {
    this.client = new ApiClient(ENV.apiBaseUrl);
    this.auth = new AuthApi(this.client);
    this.delivery = new DeliveryApi(this.client);
  }

  async loginAs(role: keyof typeof ENV.users): Promise<string> {
    const creds = ENV.users[role];
    const res = await this.auth.login({ email: creds.email, password: creds.password });
    this.client.setToken(res.token);
    return res.token;
  }

  async createDelivery(overrides: Partial<CreateDeliveryPayload> = {}): Promise<DeliveryResponse> {
    if (!this.client['authToken']) {
      await this.loginAs('courierAdmin');
    }

    const payload: CreateDeliveryPayload = {
      senderName: faker.person.fullName(),
      senderPhone: faker.phone.number('+2760#######'),
      senderEmail: faker.internet.email(),
      senderCompany: faker.company.name(),
      receiverName: faker.person.fullName(),
      receiverPhone: faker.phone.number('+2771#######'),
      receiverEmail: faker.internet.email(),
      pickupAddress: `${faker.location.streetAddress()}, ${faker.location.city()}, South Africa`,
      dropoffAddress: `${faker.location.streetAddress()}, ${faker.location.city()}, South Africa`,
      itemDescription: faker.commerce.productName(),
      itemValue: faker.number.int({ min: 100, max: 50000 }),
      referenceNumber: `REF-${faker.string.alphanumeric(8).toUpperCase()}`,
      requireOtp: true,
      requirePickupPhotos: true,
      requireDeliveryPhotos: true,
      requireItemVerification: false,
      items: [
        {
          name: faker.commerce.product(),
          description: faker.commerce.productDescription(),
          quantityExpected: faker.number.int({ min: 1, max: 5 }),
          serialNumber: faker.string.alphanumeric(10).toUpperCase(),
          declaredValue: faker.number.int({ min: 50, max: 10000 }),
          category: 'Electronics',
        },
      ],
      ...overrides,
    };

    const created = await this.delivery.create(payload);
    this.createdDeliveryIds.push(created.id);
    return created;
  }

  async createDeliveryWithStatus(
    status: 'PickedUp' | 'InTransit' | 'Delivered',
    overrides: Partial<CreateDeliveryPayload> = {}
  ): Promise<DeliveryResponse> {
    const delivery = await this.createDelivery(overrides);
    const transitions: string[] = [];

    if (status === 'PickedUp' || status === 'InTransit' || status === 'Delivered') {
      transitions.push('PickedUp');
    }
    if (status === 'InTransit' || status === 'Delivered') {
      transitions.push('InTransit');
    }
    if (status === 'Delivered') {
      transitions.push('Delivered');
    }

    for (const s of transitions) {
      await this.delivery.updateStatus(delivery.id, s);
    }

    return this.delivery.getById(delivery.id);
  }

  async registerUser(overrides: {
    name?: string;
    surname?: string;
    email?: string;
    password?: string;
    role?: string;
    courierCompanyName?: string;
  } = {}): Promise<CreatedUser> {
    const email = overrides.email ?? faker.internet.email();
    const password = overrides.password ?? 'Test@1234!';

    const res = await this.auth.register({
      name: overrides.name ?? faker.person.firstName(),
      surname: overrides.surname ?? faker.person.lastName(),
      email,
      password,
      role: overrides.role ?? 'Sender',
      courierCompanyName: overrides.courierCompanyName,
    });

    this.createdUserEmails.push(email);

    return {
      id: res.user.id,
      email,
      token: res.token,
    };
  }

  trackDelivery(id: string): void {
    if (!this.createdDeliveryIds.includes(id)) {
      this.createdDeliveryIds.push(id);
    }
  }

  async openDispute(deliveryId: string, payload: { disputeType: string; description: string }): Promise<{ id: string }> {
    return this.delivery.openDispute(deliveryId, payload as Parameters<typeof this.delivery.openDispute>[1]);
  }

  async updateDeliveryStatus(deliveryId: string, status: string): Promise<void> {
    return this.delivery.updateStatus(deliveryId, status);
  }

  async cleanup(): Promise<void> {
    if (!this.client['authToken']) {
      try {
        await this.loginAs('courierAdmin');
      } catch {
        return;
      }
    }

    for (const id of this.createdDeliveryIds) {
      try {
        await this.delivery.delete(id);
      } catch {
        // best-effort cleanup
      }
    }

    this.createdDeliveryIds = [];
    this.createdUserEmails = [];
  }
}
