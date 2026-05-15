import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'playwright';
import { WeMooveWorld } from '../../support/world';
import { ENV } from '../../support/env';

Given('I am an anonymous visitor', function (this: WeMooveWorld) {
  // no-op — browser starts without auth by default
});

Given('I am on the login page', async function (this: WeMooveWorld) {
  await this.page.goto(`${ENV.baseUrl}/auth/login`);
  await this.page.waitForLoadState('networkidle');
});

Given('I am on the registration page', async function (this: WeMooveWorld) {
  await this.page.goto(`${ENV.baseUrl}/auth/register`);
  await this.page.waitForLoadState('networkidle');
});

Given('I am on the forgot password page', async function (this: WeMooveWorld) {
  await this.page.goto(`${ENV.baseUrl}/auth/forgot-password`);
  await this.page.waitForLoadState('networkidle');
});

Given('I am on the homepage', async function (this: WeMooveWorld) {
  await this.page.goto(ENV.baseUrl);
  await this.page.waitForLoadState('networkidle');
});

When('I visit the homepage', async function (this: WeMooveWorld) {
  await this.page.goto(ENV.baseUrl);
  await this.page.waitForLoadState('networkidle');
});

When('I navigate to the pricing page', async function (this: WeMooveWorld) {
  await this.page.goto(`${ENV.baseUrl}/pricing`);
  await this.page.waitForLoadState('networkidle');
});

When('I navigate to the create delivery page', async function (this: WeMooveWorld) {
  await this.page.goto(`${ENV.baseUrl}/courier/deliveries/create`);
  await this.page.waitForLoadState('networkidle');
});

When('I navigate to the deliveries list', async function (this: WeMooveWorld) {
  await this.page.goto(`${ENV.baseUrl}/courier/deliveries`);
  await this.page.waitForLoadState('networkidle');
});

When('I navigate to the disputes page', async function (this: WeMooveWorld) {
  await this.page.goto(`${ENV.baseUrl}/courier/disputes`);
  await this.page.waitForLoadState('networkidle');
});

Given('I am on the delivery detail page', async function (this: WeMooveWorld) {
  if (!this.scenarioCtx.deliveryId) {
    throw new Error('No deliveryId in scenarioCtx — ensure a delivery is created first');
  }
  await this.page.goto(`${ENV.baseUrl}/courier/deliveries/${this.scenarioCtx.deliveryId}`);
  await this.page.waitForLoadState('networkidle');
});

Then('I should be on the login page', async function (this: WeMooveWorld) {
  await expect(this.page).toHaveURL(/\/auth\/login|\/login/);
});

Then('I should be on the forgot password page', async function (this: WeMooveWorld) {
  await expect(this.page).toHaveURL(/\/auth\/forgot-password|\/forgot-password/);
});

Then('I should be on the registration page', async function (this: WeMooveWorld) {
  await expect(this.page).toHaveURL(/\/auth\/register|\/register/);
});

Then('the page should load successfully', async function (this: WeMooveWorld) {
  const status = await this.page.evaluate(() => document.readyState);
  expect(status).toBe('complete');
});
