import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

function required(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

function optional(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

export const ENV = {
  baseUrl: optional('BASE_URL', 'https://www.furnmovers.com'),
  apiBaseUrl: optional('API_BASE_URL', 'https://api.furnmovers.com'),
  environment: optional('ENV', 'staging') as 'dev' | 'staging' | 'prod',

  browser: optional('BROWSER', 'chromium') as 'chromium' | 'firefox' | 'webkit',
  headless: optional('HEADLESS', 'true') === 'true',
  slowMo: parseInt(optional('SLOW_MO', '0'), 10),
  viewportWidth: parseInt(optional('VIEWPORT_WIDTH', '1440'), 10),
  viewportHeight: parseInt(optional('VIEWPORT_HEIGHT', '900'), 10),

  defaultTimeout: parseInt(optional('DEFAULT_TIMEOUT', '30000'), 10),
  navigationTimeout: parseInt(optional('NAVIGATION_TIMEOUT', '60000'), 10),
  expectTimeout: parseInt(optional('EXPECT_TIMEOUT', '10000'), 10),

  screenshotOnFailure: optional('SCREENSHOT_ON_FAILURE', 'true') === 'true',
  videoOnFailure: optional('VIDEO_ON_FAILURE', 'true') === 'true',
  traceOnFailure: optional('TRACE_ON_FAILURE', 'true') === 'true',
  retryCount: parseInt(optional('RETRY_COUNT', '2'), 10),

  users: {
    superAdmin: {
      email: optional('SUPER_ADMIN_EMAIL', 'superadmin@wemoove.test'),
      password: optional('SUPER_ADMIN_PASSWORD', 'Test@12345!'),
      role: 'SuperAdmin',
    },
    courierAdmin: {
      email: optional('COURIER_ADMIN_EMAIL', 'courier.admin@wemoove.test'),
      password: optional('COURIER_ADMIN_PASSWORD', 'Test@12345!'),
      role: 'CourierAdmin',
    },
    dispatcher: {
      email: optional('DISPATCHER_EMAIL', 'dispatcher@wemoove.test'),
      password: optional('DISPATCHER_PASSWORD', 'Test@12345!'),
      role: 'Dispatcher',
    },
    driver: {
      email: optional('DRIVER_EMAIL', 'driver@wemoove.test'),
      password: optional('DRIVER_PASSWORD', 'Test@12345!'),
      role: 'Driver',
    },
    sender: {
      email: optional('SENDER_EMAIL', 'sender@wemoove.test'),
      password: optional('SENDER_PASSWORD', 'Test@12345!'),
      role: 'Sender',
    },
  },
};
