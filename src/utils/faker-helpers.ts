import { faker } from '@faker-js/faker';

export function southAfricanPhone(): string {
  const prefixes = ['060', '061', '062', '063', '064', '065', '066', '067', '068', '071', '072', '073', '074', '076', '078', '079', '081', '082', '083', '084'];
  const prefix = faker.helpers.arrayElement(prefixes);
  const number = faker.string.numeric(7);
  return `${prefix}${number}`;
}

export function southAfricanAddress(): string {
  const cities = ['Cape Town', 'Johannesburg', 'Durban', 'Pretoria', 'Port Elizabeth', 'Bloemfontein', 'East London', 'Nelspruit', 'Polokwane', 'Kimberley'];
  const city = faker.helpers.arrayElement(cities);
  return `${faker.location.buildingNumber()} ${faker.location.street()}, ${city}, South Africa`;
}

export function referenceNumber(): string {
  return `REF-${faker.string.alphanumeric(8).toUpperCase()}`;
}

export function deliveryItemPayload() {
  return {
    name: faker.commerce.product(),
    description: faker.commerce.productDescription(),
    quantityExpected: faker.number.int({ min: 1, max: 5 }),
    serialNumber: faker.string.alphanumeric(10).toUpperCase(),
    declaredValue: faker.number.int({ min: 100, max: 20000 }),
    category: faker.helpers.arrayElement(['Electronics', 'Furniture', 'Clothing', 'Appliances', 'Fragile', 'Other']),
  };
}

export function strongPassword(): string {
  return `Test@${faker.string.numeric(4)}!${faker.string.alpha(3).toUpperCase()}`;
}

export function uniqueEmail(prefix = 'test'): string {
  return `${prefix}+${Date.now()}@wemoove-test.local`;
}
