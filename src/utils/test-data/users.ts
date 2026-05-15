import { ENV } from '../../support/env';

export const USERS = {
  courierAdmin: {
    email: ENV.users.courierAdmin.email,
    password: ENV.users.courierAdmin.password,
    role: 'CourierAdmin',
    displayName: 'Courier Admin',
  },
  dispatcher: {
    email: ENV.users.dispatcher.email,
    password: ENV.users.dispatcher.password,
    role: 'Dispatcher',
    displayName: 'Dispatcher',
  },
  driver: {
    email: ENV.users.driver.email,
    password: ENV.users.driver.password,
    role: 'Driver',
    displayName: 'Driver',
  },
  sender: {
    email: ENV.users.sender.email,
    password: ENV.users.sender.password,
    role: 'Sender',
    displayName: 'Sender',
  },
};

export type UserRole = keyof typeof USERS;
