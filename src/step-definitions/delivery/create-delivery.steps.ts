import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from 'playwright';
import { WeMooveWorld } from '../../support/world';
import { CreateDeliveryPage } from '../../pages/courier/create-delivery.page';
import { DeliveryDetailPage } from '../../pages/courier/delivery-detail.page';
import { standardDeliveryPayload } from '../../utils/test-data/deliveries';
import { AllureHelper } from '../../support/allure-helper';
import { faker } from '@faker-js/faker';
import { southAfricanPhone, southAfricanAddress } from '../../utils/faker-helpers';

Given('I am logged in as a courier admin', async function (this: WeMooveWorld) {
  const { LoginPage } = await import('../../pages/auth/login.page');
  const { ENV } = await import('../../support/env');
  const login = new LoginPage(this.page);
  await login.loginAs(ENV.users.courierAdmin);
});

Given('I am logged in as a dispatcher', async function (this: WeMooveWorld) {
  const { LoginPage } = await import('../../pages/auth/login.page');
  const { ENV } = await import('../../support/env');
  const login = new LoginPage(this.page);
  await login.loginAs(ENV.users.dispatcher);
});

Given('I am logged in as a driver', async function (this: WeMooveWorld) {
  const { LoginPage } = await import('../../pages/auth/login.page');
  const { ENV } = await import('../../support/env');
  const login = new LoginPage(this.page);
  await login.loginAs(ENV.users.driver);
});

When(
  'I fill in the sender details:',
  async function (this: WeMooveWorld, table: DataTable) {
    const data = table.rowsHash();
    const form = new CreateDeliveryPage(this.page);
    if (data.name) await form.fillField(form.senderNameInput, data.name);
    if (data.phone) await form.fillField(form.senderPhoneInput, data.phone);
    if (data.email) await form.fillField(form.senderEmailInput, data.email);
    if (data.company) await form.fillField(form.senderCompanyInput, data.company);
  }
);

When(
  'I fill in the receiver details:',
  async function (this: WeMooveWorld, table: DataTable) {
    const data = table.rowsHash();
    const form = new CreateDeliveryPage(this.page);
    if (data.name) await form.fillField(form.receiverNameInput, data.name);
    if (data.phone) await form.fillField(form.receiverPhoneInput, data.phone);
    if (data.email) await form.fillField(form.receiverEmailInput, data.email);
  }
);

When(
  'I fill in the addresses:',
  async function (this: WeMooveWorld, table: DataTable) {
    const data = table.rowsHash();
    const form = new CreateDeliveryPage(this.page);
    if (data.pickupAddress) await form.fillField(form.pickupAddressInput, data.pickupAddress);
    if (data.dropoffAddress) await form.fillField(form.dropoffAddressInput, data.dropoffAddress);
  }
);

When(
  'I fill in the item details:',
  async function (this: WeMooveWorld, table: DataTable) {
    const data = table.rowsHash();
    const form = new CreateDeliveryPage(this.page);
    if (data.description) await form.fillField(form.itemDescriptionInput, data.description);
    if (data.value) await form.fillField(form.itemValueInput, data.value);
  }
);

When('I enable OTP verification', async function (this: WeMooveWorld) {
  const form = new CreateDeliveryPage(this.page);
  const checked = await form.requireOtpToggle.isChecked().catch(() => false);
  if (!checked) await form.requireOtpToggle.click();
});

When('I enable pickup photos', async function (this: WeMooveWorld) {
  const form = new CreateDeliveryPage(this.page);
  const checked = await form.requirePickupPhotosToggle.isChecked().catch(() => false);
  if (!checked) await form.requirePickupPhotosToggle.click();
});

When('I enable delivery photos', async function (this: WeMooveWorld) {
  const form = new CreateDeliveryPage(this.page);
  const checked = await form.requireDeliveryPhotosToggle.isChecked().catch(() => false);
  if (!checked) await form.requireDeliveryPhotosToggle.click();
});

When('I enable item verification', async function (this: WeMooveWorld) {
  const form = new CreateDeliveryPage(this.page);
  const checked = await form.requireItemVerificationToggle.isChecked().catch(() => false);
  if (!checked) await form.requireItemVerificationToggle.click();
});

When('I fill in a complete delivery form', async function (this: WeMooveWorld) {
  await AllureHelper.step('Fill complete delivery form', async () => {
    const form = new CreateDeliveryPage(this.page);
    await form.fill({
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
      itemValue: faker.number.int({ min: 500, max: 20000 }),
      requireOtp: true,
      requirePickupPhotos: true,
      requireDeliveryPhotos: true,
    });
  });
});

When('I fill in the sender details with an invalid phone {string}', async function (this: WeMooveWorld, phone: string) {
  const form = new CreateDeliveryPage(this.page);
  await form.fillField(form.senderPhoneInput, phone);
});

When('I fill in the sender details with email {string}', async function (this: WeMooveWorld, email: string) {
  const form = new CreateDeliveryPage(this.page);
  await form.fillField(form.senderEmailInput, email);
});

When('I submit the delivery form', async function (this: WeMooveWorld) {
  await AllureHelper.step('Submit delivery form', async () => {
    const form = new CreateDeliveryPage(this.page);
    await form.submit();
  });
});

When('I submit the delivery form without filling required fields', async function (this: WeMooveWorld) {
  const form = new CreateDeliveryPage(this.page);
  await form.submit();
});

Then('a new delivery should be created', async function (this: WeMooveWorld) {
  await expect(this.page).toHaveURL(
    /\/courier\/deliveries\/[a-zA-Z0-9-]+/,
    { timeout: 15000 }
  );
  // Extract delivery ID from URL for subsequent steps
  const url = this.page.url();
  const match = url.match(/\/deliveries\/([a-zA-Z0-9-]+)/);
  if (match) {
    this.scenarioCtx.deliveryId = match[1];
    this.fixtures.trackDelivery(match[1]);
  }
});

Then('I should see the delivery details page', async function (this: WeMooveWorld) {
  const detail = new DeliveryDetailPage(this.page);
  await expect(detail.trackingNumber).toBeVisible({ timeout: 10000 });
  AllureHelper.attachJson('Delivery context', this.scenarioCtx);
});

Then('the delivery status should be {string}', async function (this: WeMooveWorld, status: string) {
  const detail = new DeliveryDetailPage(this.page);
  await detail.expectStatus(status);
});

Then('I should see an access denied message', async function (this: WeMooveWorld) {
  const body = this.page.locator('body');
  await expect(body).toContainText(/access denied|forbidden|not authorized/i, { timeout: 5000 });
});

Then('I should be redirected away from the page', async function (this: WeMooveWorld) {
  await expect(this.page).not.toHaveURL(/\/courier\/deliveries\/create/);
});

Then('the delivery should require item verification', async function (this: WeMooveWorld) {
  const detail = new DeliveryDetailPage(this.page);
  const evidenceSection = detail.evidenceSection;
  await expect(evidenceSection).toContainText(/item.*(verification|check)/i);
});

Then('I should see a phone number validation error', async function (this: WeMooveWorld) {
  const error = this.page.locator('[aria-invalid="true"], [class*="error"]').first();
  await expect(error).toBeVisible({ timeout: 5000 });
});

Then('I should see an email validation error', async function (this: WeMooveWorld) {
  const error = this.page.locator('[aria-invalid="true"], [class*="error"]').first();
  await expect(error).toBeVisible({ timeout: 5000 });
});

Then('I should see validation errors for required fields', async function (this: WeMooveWorld) {
  const errors = this.page.locator('[aria-invalid="true"], [class*="error"]');
  await expect(errors.first()).toBeVisible({ timeout: 5000 });
});
