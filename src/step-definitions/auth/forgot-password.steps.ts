import { When, Then } from '@cucumber/cucumber';
import { expect } from 'playwright';
import { WeMooveWorld } from '../../support/world';
import { ForgotPasswordPage } from '../../pages/auth/forgot-password.page';
import { ENV } from '../../support/env';

When('I enter a registered email address', async function (this: WeMooveWorld) {
  const fp = new ForgotPasswordPage(this.page);
  await fp.fillField(fp.emailInput, ENV.users.courierAdmin.email);
});

When('I enter {string}', async function (this: WeMooveWorld, value: string) {
  const fp = new ForgotPasswordPage(this.page);
  await fp.fillField(fp.emailInput, value);
});

When('I submit the forgot password form', async function (this: WeMooveWorld) {
  const fp = new ForgotPasswordPage(this.page);
  await fp.submitButton.click();
});

When('I submit the forgot password form without entering an email', async function (this: WeMooveWorld) {
  const fp = new ForgotPasswordPage(this.page);
  await fp.submitButton.click();
});

Then('I should see a success message about the reset link', async function (this: WeMooveWorld) {
  const fp = new ForgotPasswordPage(this.page);
  await fp.expectSuccessMessage();
});

Then('I should see a success message', async function (this: WeMooveWorld) {
  const fp = new ForgotPasswordPage(this.page);
  await fp.expectSuccessMessage();
});

Then('the response should not reveal whether the email exists', async function (this: WeMooveWorld) {
  // The success message must be generic, not "email not found"
  const body = await this.page.locator('body').textContent() ?? '';
  expect(body.toLowerCase()).not.toMatch(/not found|no account|does not exist/);
});

Then('I should see an email format validation error', async function (this: WeMooveWorld) {
  const error = this.page.locator('[aria-invalid="true"], [class*="error"]').first();
  await expect(error).toBeVisible({ timeout: 5000 });
});

Then('I should see a required field error', async function (this: WeMooveWorld) {
  const error = this.page.locator('[aria-invalid="true"], [class*="error"], :required:invalid').first();
  await expect(error).toBeVisible({ timeout: 5000 });
});
