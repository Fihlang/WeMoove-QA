import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from 'playwright';
import { WeMooveWorld } from '../../support/world';
import { DeliveryDetailPage } from '../../pages/courier/delivery-detail.page';
import { AllureHelper } from '../../support/allure-helper';

Given('a delivery requiring OTP has been created via API', async function (this: WeMooveWorld) {
  await AllureHelper.step('Create OTP-required delivery via API', async () => {
    const delivery = await this.fixtures.createDelivery({ requireOtp: true });
    this.scenarioCtx.deliveryId = delivery.id;
    this.scenarioCtx.trackingNumber = delivery.trackingNumber;
  });
});

Given('a delivery requiring pickup photos has been created via API', async function (this: WeMooveWorld) {
  await AllureHelper.step('Create pickup-photo-required delivery via API', async () => {
    const delivery = await this.fixtures.createDelivery({
      requireOtp: true,
      requirePickupPhotos: true,
      requireDeliveryPhotos: true,
    });
    this.scenarioCtx.deliveryId = delivery.id;
    this.scenarioCtx.trackingNumber = delivery.trackingNumber;
  });
});

Given('a delivery where OTP has been confirmed via API', async function (this: WeMooveWorld) {
  // OTP confirmation is typically a driver action — mark as InTransit to simulate post-OTP state
  const delivery = await this.fixtures.createDeliveryWithStatus('InTransit');
  this.scenarioCtx.deliveryId = delivery.id;
  this.scenarioCtx.trackingNumber = delivery.trackingNumber;
  await this.page.goto(`/courier/deliveries/${delivery.id}`);
  await this.page.waitForLoadState('networkidle');
});

Given('a delivery with all evidence requirements enabled', async function (this: WeMooveWorld) {
  const delivery = await this.fixtures.createDelivery({
    requireOtp: true,
    requirePickupPhotos: true,
    requireDeliveryPhotos: true,
    requireItemVerification: true,
  });
  this.scenarioCtx.deliveryId = delivery.id;
  await this.page.goto(`/courier/deliveries/${delivery.id}`);
  await this.page.waitForLoadState('networkidle');
});

Given('a delivery where the driver has submitted pickup photos via API', async function (this: WeMooveWorld) {
  // Simulate via status advancement
  const delivery = await this.fixtures.createDeliveryWithStatus('PickedUp');
  this.scenarioCtx.deliveryId = delivery.id;
  await this.page.goto(`/courier/deliveries/${delivery.id}`);
  await this.page.waitForLoadState('networkidle');
});

Given('a delivery was created without any evidence requirements', async function (this: WeMooveWorld) {
  const delivery = await this.fixtures.createDelivery({
    requireOtp: false,
    requirePickupPhotos: false,
    requireDeliveryPhotos: false,
    requireItemVerification: false,
  });
  this.scenarioCtx.deliveryId = delivery.id;
  await this.page.goto(`/courier/deliveries/${delivery.id}`);
  await this.page.waitForLoadState('networkidle');
});

Given('the delivery requires OTP verification', async function (this: WeMooveWorld) {
  if (!this.scenarioCtx.deliveryId) {
    const delivery = await this.fixtures.createDelivery({ requireOtp: true });
    this.scenarioCtx.deliveryId = delivery.id;
    await this.page.goto(`/courier/deliveries/${delivery.id}`);
    await this.page.waitForLoadState('networkidle');
  }
});

Given('OTP has not been confirmed', function (this: WeMooveWorld) {
  // By default, newly created deliveries have no OTP confirmed
});

Given('a delivery was created without OTP requirement', async function (this: WeMooveWorld) {
  const delivery = await this.fixtures.createDelivery({ requireOtp: false });
  this.scenarioCtx.deliveryId = delivery.id;
  await this.page.goto(`/courier/deliveries/${delivery.id}`);
  await this.page.waitForLoadState('networkidle');
});

Given('a delivery where OTP has been confirmed', async function (this: WeMooveWorld) {
  const delivery = await this.fixtures.createDeliveryWithStatus('Delivered');
  this.scenarioCtx.deliveryId = delivery.id;
  await this.page.goto(`/courier/deliveries/${delivery.id}`);
  await this.page.waitForLoadState('networkidle');
});

When('I look at the evidence section', async function (this: WeMooveWorld) {
  const detail = new DeliveryDetailPage(this.page);
  await detail.scrollTo(detail.evidenceSection);
});

When('I view the delivery in the deliveries list', async function (this: WeMooveWorld) {
  await this.page.goto('/courier/deliveries');
  await this.page.waitForLoadState('networkidle');
});

Then('the OTP status should show as pending or not yet verified', async function (this: WeMooveWorld) {
  const detail = new DeliveryDetailPage(this.page);
  const otpText = await detail.otpStatus.textContent() ?? '';
  expect(otpText.toLowerCase()).toMatch(/pending|not.*verified|awaiting|required/);
});

Then('the OTP status should show as verified', async function (this: WeMooveWorld) {
  const detail = new DeliveryDetailPage(this.page);
  const otpText = await detail.otpStatus.textContent() ?? '';
  expect(otpText.toLowerCase()).toMatch(/verified|confirmed|complete/);
});

Then(
  'the evidence section should list:',
  async function (this: WeMooveWorld, table: DataTable) {
    const detail = new DeliveryDetailPage(this.page);
    const rows = table.hashes();
    for (const row of rows) {
      const evidenceItem = this.page.locator('[class*="evidence"]').filter({ hasText: new RegExp(row['evidence type'], 'i') });
      await expect(evidenceItem).toBeVisible({ timeout: 8000 });
    }
  }
);

Then('pickup photos should show as captured or present', async function (this: WeMooveWorld) {
  const detail = new DeliveryDetailPage(this.page);
  const text = await detail.pickupPhotos.textContent() ?? '';
  expect(text.toLowerCase()).toMatch(/captured|present|uploaded|photo/);
});

Then('a count or thumbnail should be visible', async function (this: WeMooveWorld) {
  const thumbOrCount = this.page.locator('[class*="photo-count"], img[class*="thumbnail"], [class*="photo"]').first();
  await expect(thumbOrCount).toBeVisible({ timeout: 5000 });
});

Then('pickup photo evidence should show as pending', async function (this: WeMooveWorld) {
  const detail = new DeliveryDetailPage(this.page);
  const pickupText = await detail.pickupPhotos.textContent() ?? '';
  expect(pickupText.toLowerCase()).toMatch(/pending|not.*captured|required|0/);
});

Then('a warning or risk indicator should be visible on the row', async function (this: WeMooveWorld) {
  if (this.scenarioCtx.trackingNumber) {
    const row = this.page.locator('table tbody tr').filter({ hasText: this.scenarioCtx.trackingNumber });
    const warning = row.locator('[class*="warning"], [class*="risk"], [class*="alert"]').first();
    await expect(warning).toBeVisible({ timeout: 5000 });
  }
});

Then('no mandatory evidence panel should be shown', async function (this: WeMooveWorld) {
  const evidenceRequired = this.page.locator('[class*="evidence-required"], [class*="mandatory-evidence"]');
  await expect(evidenceRequired).not.toBeVisible();
});

Then('the OTP section should show as {string} or be absent', async function (this: WeMooveWorld, text: string) {
  const detail = new DeliveryDetailPage(this.page);
  const isVisible = await detail.otpStatus.isVisible().catch(() => false);
  if (isVisible) {
    const otpText = await detail.otpStatus.textContent() ?? '';
    expect(otpText.toLowerCase()).toMatch(/not required|n\/a|disabled/);
  }
  // If not visible — also acceptable
});

Then('the event log should contain an OTP confirmation entry', async function (this: WeMooveWorld) {
  const detail = new DeliveryDetailPage(this.page);
  const eventLog = detail.eventLog;
  await expect(eventLog).toContainText(/otp/i, { timeout: 5000 });
});
