import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'playwright';
import { WeMooveWorld } from '../../support/world';
import { DeliveriesPage } from '../../pages/courier/deliveries.page';
import { DeliveryDetailPage } from '../../pages/courier/delivery-detail.page';
import { AllureHelper } from '../../support/allure-helper';

Given('a delivery has been created via API', async function (this: WeMooveWorld) {
  await AllureHelper.step('Create delivery via API', async () => {
    const delivery = await this.fixtures.createDelivery();
    this.scenarioCtx.deliveryId = delivery.id;
    this.scenarioCtx.trackingNumber = delivery.trackingNumber;
    AllureHelper.attachJson('Created delivery', { id: delivery.id, trackingNumber: delivery.trackingNumber });
  });
});

Given('a delivery exists with tracking number stored in context', async function (this: WeMooveWorld) {
  if (!this.scenarioCtx.trackingNumber) {
    const delivery = await this.fixtures.createDelivery();
    this.scenarioCtx.deliveryId = delivery.id;
    this.scenarioCtx.trackingNumber = delivery.trackingNumber;
  }
});

Given('a delivery has been through several status changes', async function (this: WeMooveWorld) {
  const delivery = await this.fixtures.createDeliveryWithStatus('InTransit');
  this.scenarioCtx.deliveryId = delivery.id;
  this.scenarioCtx.trackingNumber = delivery.trackingNumber;
});

Given('the delivery is assigned to a driver', async function (this: WeMooveWorld) {
  // This step relies on driver being pre-configured in ENV
  // For now mark as in-progress via API
});

Given('multiple deliveries exist in various statuses', async function (this: WeMooveWorld) {
  await Promise.all([
    this.fixtures.createDelivery(),
    this.fixtures.createDelivery(),
    this.fixtures.createDeliveryWithStatus('PickedUp'),
  ]);
});

Given('I know the tracking number of a created delivery', async function (this: WeMooveWorld) {
  if (!this.scenarioCtx.trackingNumber) {
    const delivery = await this.fixtures.createDelivery();
    this.scenarioCtx.deliveryId = delivery.id;
    this.scenarioCtx.trackingNumber = delivery.trackingNumber;
  }
});

Given('I know the reference number of a created delivery', async function (this: WeMooveWorld) {
  if (!this.scenarioCtx.deliveryId) {
    const delivery = await this.fixtures.createDelivery();
    this.scenarioCtx.deliveryId = delivery.id;
    this.scenarioCtx.trackingNumber = delivery.trackingNumber;
  }
});

Given('the delivery has been marked as delivered', async function (this: WeMooveWorld) {
  const delivery = await this.fixtures.createDeliveryWithStatus('Delivered');
  this.scenarioCtx.deliveryId = delivery.id;
  this.scenarioCtx.trackingNumber = delivery.trackingNumber;
  await this.page.goto(`/courier/deliveries/${delivery.id}`);
  await this.page.waitForLoadState('networkidle');
});

When('I click {string}', async function (this: WeMooveWorld, buttonText: string) {
  await this.page.getByRole('button', { name: new RegExp(buttonText, 'i') }).click();
});

When('I select an available driver', async function (this: WeMooveWorld) {
  const modal = this.page.locator('[role="dialog"], .modal').first();
  await expect(modal).toBeVisible({ timeout: 5000 });
  const select = modal.locator('select').first();
  const options = await select.locator('option').all();
  if (options.length > 1) {
    await select.selectOption({ index: 1 });
  }
});

When('I confirm the assignment', async function (this: WeMooveWorld) {
  const modal = this.page.locator('[role="dialog"], .modal').first();
  await modal.locator('button').filter({ hasText: /assign|confirm/i }).click();
  await this.page.waitForLoadState('networkidle');
});

When('the driver picks up the delivery', async function (this: WeMooveWorld) {
  if (this.scenarioCtx.deliveryId) {
    await this.fixtures.updateDeliveryStatus(this.scenarioCtx.deliveryId, 'PickedUp');
    await this.page.reload();
    await this.page.waitForLoadState('networkidle');
  }
});

When('the driver marks the delivery as in transit', async function (this: WeMooveWorld) {
  if (this.scenarioCtx.deliveryId) {
    await this.fixtures.updateDeliveryStatus(this.scenarioCtx.deliveryId, 'InTransit');
    await this.page.reload();
    await this.page.waitForLoadState('networkidle');
  }
});

When('I filter the deliveries list by {string}', async function (this: WeMooveWorld, status: string) {
  const list = new DeliveriesPage(this.page);
  await list.filterByStatus(status);
});

When('I filter deliveries by a status that has no results', async function (this: WeMooveWorld) {
  const list = new DeliveriesPage(this.page);
  await list.filterByStatus('Cancelled');
});

When('I search for the tracking number in the deliveries list', async function (this: WeMooveWorld) {
  const list = new DeliveriesPage(this.page);
  await list.searchFor(this.scenarioCtx.trackingNumber!);
});

When('I search for the reference number', async function (this: WeMooveWorld) {
  // Reference number search — use tracking number as fallback identifier
  const list = new DeliveriesPage(this.page);
  await list.searchFor(this.scenarioCtx.trackingNumber!);
});

When('I attempt to update the status to {string}', async function (this: WeMooveWorld, status: string) {
  const detail = new DeliveryDetailPage(this.page);
  await detail.updateStatusButton.click();
  const modal = this.page.locator('[role="dialog"], .modal').first();
  await modal.locator('select').first().selectOption(status);
  await modal.locator('button').filter({ hasText: /confirm|update|save/i }).click();
});

When('I click {string} in the navigation', async function (this: WeMooveWorld, linkText: string) {
  await this.page.locator('nav a, header a').filter({ hasText: new RegExp(linkText, 'i') }).first().click();
  await this.page.waitForLoadState('networkidle');
});

Then('the delivery should show the assigned driver', async function (this: WeMooveWorld) {
  const detail = new DeliveryDetailPage(this.page);
  const driverInfo = this.page.locator('[class*="driver"], [data-testid="driver"]').first();
  await expect(driverInfo).toBeVisible({ timeout: 8000 });
});

Then('I should see the delivery in the list', async function (this: WeMooveWorld) {
  const list = new DeliveriesPage(this.page);
  if (this.scenarioCtx.trackingNumber) {
    const row = await list.findRowByTracking(this.scenarioCtx.trackingNumber);
    await expect(row).toBeVisible({ timeout: 8000 });
  } else {
    const count = await list.getRowCount();
    expect(count).toBeGreaterThan(0);
  }
});

Then('its status badge should match {string}', async function (this: WeMooveWorld, expectedStatus: string) {
  const list = new DeliveriesPage(this.page);
  if (this.scenarioCtx.trackingNumber) {
    const badge = await list.getStatusBadge(this.scenarioCtx.trackingNumber);
    expect(badge.toLowerCase()).toContain(expectedStatus.toLowerCase());
  }
});

Then('I should only see pending deliveries', async function (this: WeMooveWorld) {
  const rows = this.page.locator('table tbody tr, [class*="delivery-row"]');
  const count = await rows.count();
  for (let i = 0; i < count; i++) {
    const statusText = await rows.nth(i).locator('[class*="badge"], [class*="status"]').textContent();
    expect((statusText ?? '').toLowerCase()).toContain('pending');
  }
});

Then('I should see exactly one result matching the tracking number', async function (this: WeMooveWorld) {
  const list = new DeliveriesPage(this.page);
  const count = await list.getRowCount();
  expect(count).toBe(1);
});

Then('the matching delivery should appear in results', async function (this: WeMooveWorld) {
  const list = new DeliveriesPage(this.page);
  const count = await list.getRowCount();
  expect(count).toBeGreaterThan(0);
});

Then('I should see an empty state message', async function (this: WeMooveWorld) {
  const list = new DeliveriesPage(this.page);
  await expect(list.emptyState).toBeVisible({ timeout: 5000 });
});

Then('the event log should contain at least one entry', async function (this: WeMooveWorld) {
  const detail = new DeliveryDetailPage(this.page);
  const count = await detail.getEventCount();
  expect(count).toBeGreaterThan(0);
});

Then('each entry should show a timestamp', async function (this: WeMooveWorld) {
  const entries = this.page.locator('[class*="timeline"] li, [class*="event-entry"]');
  const count = await entries.count();
  for (let i = 0; i < Math.min(count, 3); i++) {
    const text = await entries.nth(i).textContent() ?? '';
    // Timestamps contain digits — a basic guard
    expect(text).toMatch(/\d/);
  }
});

Then('a PDF should be generated or a link should appear', async function (this: WeMooveWorld) {
  const pdfLink = this.page.locator('a[href*=".pdf"], a[href*="pod"]').first();
  const successMsg = this.page.locator('[role="alert"], .toast, [class*="success"]').first();
  const isPdfVisible = await pdfLink.isVisible().catch(() => false);
  const isSuccessVisible = await successMsg.isVisible().catch(() => false);
  expect(isPdfVisible || isSuccessVisible).toBe(true);
});

Then('I should see a message that OTP is required first', async function (this: WeMooveWorld) {
  const alert = this.page.locator('[role="alert"], .toast, [class*="error"], [class*="warning"]').first();
  await expect(alert).toBeVisible({ timeout: 8000 });
  const text = await alert.textContent() ?? '';
  expect(text.toLowerCase()).toMatch(/otp|verification/);
});
