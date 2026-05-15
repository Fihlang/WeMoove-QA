import { CreateDeliveryPayload } from '../../api/delivery.api';
import { southAfricanPhone, southAfricanAddress, referenceNumber, deliveryItemPayload } from '../faker-helpers';
import { faker } from '@faker-js/faker';

export function standardDeliveryPayload(overrides: Partial<CreateDeliveryPayload> = {}): CreateDeliveryPayload {
  return {
    senderName: faker.person.fullName(),
    senderPhone: southAfricanPhone(),
    senderEmail: faker.internet.email(),
    senderCompany: faker.company.name(),
    receiverName: faker.person.fullName(),
    receiverPhone: southAfricanPhone(),
    receiverEmail: faker.internet.email(),
    pickupAddress: southAfricanAddress(),
    dropoffAddress: southAfricanAddress(),
    itemDescription: faker.commerce.productDescription(),
    itemValue: faker.number.int({ min: 500, max: 25000 }),
    referenceNumber: referenceNumber(),
    requireOtp: true,
    requirePickupPhotos: true,
    requireDeliveryPhotos: true,
    requireItemVerification: false,
    items: [deliveryItemPayload()],
    ...overrides,
  };
}

export function highValueDeliveryPayload(overrides: Partial<CreateDeliveryPayload> = {}): CreateDeliveryPayload {
  return standardDeliveryPayload({
    itemValue: faker.number.int({ min: 25000, max: 200000 }),
    requireOtp: true,
    requirePickupPhotos: true,
    requireDeliveryPhotos: true,
    requireItemVerification: true,
    items: Array.from({ length: faker.number.int({ min: 2, max: 5 }) }, () => deliveryItemPayload()),
    ...overrides,
  });
}

export function minimalDeliveryPayload(overrides: Partial<CreateDeliveryPayload> = {}): CreateDeliveryPayload {
  return standardDeliveryPayload({
    requireOtp: false,
    requirePickupPhotos: false,
    requireDeliveryPhotos: false,
    requireItemVerification: false,
    items: [deliveryItemPayload()],
    ...overrides,
  });
}
