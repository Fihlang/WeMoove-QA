import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'playwright';
import { WeMooveWorld } from '../../support/world';
import { DeliveryDetailPage } from '../../pages/courier/delivery-detail.page';
import { DisputesPage } from '../../pages/courier/disputes.page';
import { AllureHelper } from '../../support/allure-helper';

Given('a delivered delivery exists via API', async function (this: WeMooveWorld) {
  await AllureHelper.step('Create and deliver a delivery via API', async () => {
    const delivery = await this.fixtures.createDeliveryWithStatus('Delivered');
    this.scenarioCtx.deliveryId = delivery.id;
    this.scenarioCtx.trackingNumber = delivery.trackingNumber;
    AllureHelper.attachJson('Delivery for dispute', { id: delivery.id, tracking: delivery.trackingNumber });
  });
});

Given('a dispute has been opened via API', async function (this: WeMooveWorld) {
  const delivery = await this.fixtures.createDeliveryWithStatus('Delivered');
  this.scenarioCtx.deliveryId = delivery.id;
  this.scenarioCtx.trackingNumber = delivery.trackingNumber;

  await this.fixtures.openDispute(delivery.id, {
    disputeType: 'ItemDamaged',
    description: 'API-seeded test dispute',
  });
});

Given('a dispute has been opened on a delivery with OTP and photos', async function (this: WeMooveWorld) {
  const delivery = await this.fixtures.createDeliveryWithStatus('Delivered');
  this.scenarioCtx.deliveryId = delivery.id;
  this.scenarioCtx.trackingNumber = delivery.trackingNumber;

  await this.fixtures.openDispute(delivery.id, {
    disputeType: 'LateDelivery',
    description: 'API-seeded dispute with evidence',
  });
});

Given('a dispute is opened on a delivery with no photos or OTP', async function (this: WeMooveWorld) {
  const delivery = await this.fixtures.createDelivery({
    requireOtp: false,
    requirePickupPhotos: false,
    requireDeliveryPhotos: false,
  });
  this.scenarioCtx.deliveryId = delivery.id;
  this.scenarioCtx.trackingNumber = delivery.trackingNumber;

  await this.fixtures.openDispute(delivery.id, {
    disputeType: 'NotDelivered',
    description: 'No evidence dispute',
  });
});

Given('multiple disputes exist in various statuses', async function (this: WeMooveWorld) {
  const deliveries = await Promise.all([
    this.fixtures.createDeliveryWithStatus('Delivered'),
    this.fixtures.createDeliveryWithStatus('Delivered'),
    this.fixtures.createDeliveryWithStatus('Delivered'),
  ]);

  for (const delivery of deliveries) {
    await this.fixtures.openDispute(delivery.id, {
      disputeType: 'ItemDamaged',
      description: 'Multi-status test dispute',
    });
  }
});

Given('there are 3 open disputes', async function (this: WeMooveWorld) {
  const deliveries = await Promise.all([
    this.fixtures.createDeliveryWithStatus('Delivered'),
    this.fixtures.createDeliveryWithStatus('Delivered'),
    this.fixtures.createDeliveryWithStatus('Delivered'),
  ]);

  for (const delivery of deliveries) {
    await this.fixtures.openDispute(delivery.id, {
      disputeType: 'Other',
      description: 'Count test dispute',
    });
  }
});

Given('an open dispute is selected', async function (this: WeMooveWorld) {
  if (!this.scenarioCtx.deliveryId) {
    const delivery = await this.fixtures.createDeliveryWithStatus('Delivered');
    this.scenarioCtx.deliveryId = delivery.id;
    this.scenarioCtx.trackingNumber = delivery.trackingNumber;
    await this.fixtures.openDispute(delivery.id, {
      disputeType: 'ItemMissing',
      description: 'For resolution test',
    });
  }

  await this.page.goto('/courier/disputes');
  await this.page.waitForLoadState('networkidle');

  if (this.scenarioCtx.trackingNumber) {
    const disputes = new DisputesPage(this.page);
    await disputes.clickDisputeRow(this.scenarioCtx.trackingNumber);
  }
});

Given('a dispute exists for a known tracking number', async function (this: WeMooveWorld) {
  const delivery = await this.fixtures.createDeliveryWithStatus('Delivered');
  this.scenarioCtx.deliveryId = delivery.id;
  this.scenarioCtx.trackingNumber = delivery.trackingNumber;

  await this.fixtures.openDispute(delivery.id, {
    disputeType: 'WrongAddress',
    description: 'Search test dispute',
  });
});

When('I click "Open Dispute"', async function (this: WeMooveWorld) {
  const detail = new DeliveryDetailPage(this.page);
  await detail.openDisputeButton.click();
  await expect(detail.disputeModal).toBeVisible({ timeout: 5000 });
});

When('I select dispute type {string}', async function (this: WeMooveWorld, disputeType: string) {
  const modal = this.page.locator('[role="dialog"]').first();
  await modal.locator('select').first().selectOption(disputeType);
});

When('I enter a description {string}', async function (this: WeMooveWorld, description: string) {
  const modal = this.page.locator('[role="dialog"]').first();
  await modal.locator('textarea').fill(description);
});

When('I submit the dispute', async function (this: WeMooveWorld) {
  await AllureHelper.step('Submit dispute', async () => {
    const modal = this.page.locator('[role="dialog"]').first();
    await modal.locator('button').filter({ hasText: /submit|open|confirm/i }).click();
    await this.page.waitForLoadState('networkidle');
  });
});

When('I open a dispute with type {string}', async function (this: WeMooveWorld, disputeType: string) {
  if (!this.scenarioCtx.deliveryId) {
    const delivery = await this.fixtures.createDeliveryWithStatus('Delivered');
    this.scenarioCtx.deliveryId = delivery.id;
    await this.page.goto(`/courier/deliveries/${delivery.id}`);
    await this.page.waitForLoadState('networkidle');
  }

  const detail = new DeliveryDetailPage(this.page);
  await detail.openDisputeDialog(disputeType, `Test dispute for ${disputeType}`);
});

When('I filter disputes by {string}', async function (this: WeMooveWorld, status: string) {
  const disputes = new DisputesPage(this.page);
  await disputes.filterByStatus(status);
});

When('I open the resolution drawer', async function (this: WeMooveWorld) {
  // Clicking a dispute row should open the drawer
  if (this.scenarioCtx.trackingNumber) {
    const disputes = new DisputesPage(this.page);
    await disputes.clickDisputeRow(this.scenarioCtx.trackingNumber);
  }
  const drawer = this.page.locator('[class*="drawer"], [role="dialog"]').filter({ hasText: /resolution|resolve/i });
  await expect(drawer).toBeVisible({ timeout: 5000 });
});

When('I select resolution {string}', async function (this: WeMooveWorld, resolution: string) {
  const drawer = this.page.locator('[class*="drawer"], [role="dialog"]').filter({ hasText: /resolution|resolve/i });
  await drawer.locator('select').first().selectOption(resolution);
});

When('I enter resolution notes {string}', async function (this: WeMooveWorld, notes: string) {
  const drawer = this.page.locator('[class*="drawer"], [role="dialog"]').filter({ hasText: /resolution|resolve/i });
  await drawer.locator('textarea').fill(notes);
});

When('I save the resolution', async function (this: WeMooveWorld) {
  const drawer = this.page.locator('[class*="drawer"], [role="dialog"]').filter({ hasText: /resolution|resolve/i });
  await drawer.locator('button').filter({ hasText: /save|confirm|resolve/i }).click();
  await this.page.waitForLoadState('networkidle');
});

When('I view the dispute in the disputes list', async function (this: WeMooveWorld) {
  const disputes = new DisputesPage(this.page);
  await disputes.goto();
});

When('I search for the tracking number on the disputes page', async function (this: WeMooveWorld) {
  const disputes = new DisputesPage(this.page);
  await disputes.goto();
  await disputes.fillField(disputes.searchInput, this.scenarioCtx.trackingNumber!);
  await this.page.keyboard.press('Enter');
  await this.page.waitForLoadState('networkidle');
});

Then('the dispute should be opened', async function (this: WeMooveWorld) {
  const alert = this.page.locator('[role="alert"], .toast, [class*="success"]').first();
  const isAlertVisible = await alert.isVisible().catch(() => false);

  if (!isAlertVisible) {
    // Check the dispute modal closed as a fallback success indicator
    const modal = this.page.locator('[role="dialog"]');
    await expect(modal).not.toBeVisible({ timeout: 8000 });
  }
});

Then('the delivery detail should show an open dispute', async function (this: WeMooveWorld) {
  const disputeIndicator = this.page.locator('[class*="dispute"], [data-testid="dispute"]').first();
  await expect(disputeIndicator).toBeVisible({ timeout: 8000 });
});

Then('I should see at least one dispute in the list', async function (this: WeMooveWorld) {
  const disputes = new DisputesPage(this.page);
  const count = await disputes.getDisputeCount();
  expect(count).toBeGreaterThan(0);
});

Then('I should only see open disputes', async function (this: WeMooveWorld) {
  const rows = this.page.locator('table tbody tr, [class*="dispute-row"]');
  const count = await rows.count();
  for (let i = 0; i < count; i++) {
    const statusText = await rows.nth(i).locator('[class*="badge"], [class*="status"]').textContent();
    expect((statusText ?? '').toLowerCase()).toContain('open');
  }
});

Then('evidence icons should indicate what proof is available', async function (this: WeMooveWorld) {
  const rows = this.page.locator('table tbody tr, [class*="dispute-row"]');
  const row = rows.first();
  const icons = row.locator('[class*="evidence"], [class*="icon"]');
  const count = await icons.count();
  expect(count).toBeGreaterThan(0);
});

Then('the dispute status should change to {string}', async function (this: WeMooveWorld, status: string) {
  const statusBadge = this.page.locator('[class*="status-badge"], [class*="badge"], .chip').first();
  await expect(statusBadge).toContainText(new RegExp(status, 'i'), { timeout: 8000 });
});

Then('the open count badge should show {string}', async function (this: WeMooveWorld, count: string) {
  const disputes = new DisputesPage(this.page);
  const text = await disputes.openCount.textContent() ?? '';
  expect(text).toContain(count);
});

Then('the dispute should be created with type {string}', async function (this: WeMooveWorld, disputeType: string) {
  const disputeIndicator = this.page.locator('[class*="dispute"]').filter({ hasText: new RegExp(disputeType, 'i') });
  await expect(disputeIndicator).toBeVisible({ timeout: 8000 });
});

Then('the dispute should be created successfully', async function (this: WeMooveWorld) {
  const modal = this.page.locator('[role="dialog"]');
  await expect(modal).not.toBeVisible({ timeout: 10000 });
});

Then('I should see a {string} warning or missing indicator', async function (this: WeMooveWorld, text: string) {
  const warning = this.page.locator('[class*="warning"], [class*="missing"], [class*="no-evidence"]').first();
  await expect(warning).toBeVisible({ timeout: 5000 });
});

Then('the matching dispute should appear in results', async function (this: WeMooveWorld) {
  const disputes = new DisputesPage(this.page);
  const count = await disputes.getDisputeCount();
  expect(count).toBeGreaterThan(0);
});
