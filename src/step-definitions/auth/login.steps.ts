import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'playwright';
import { WeMooveWorld } from '../../support/world';
import { LoginPage } from '../../pages/auth/login.page';
import { ENV } from '../../support/env';
import { AllureHelper } from '../../support/allure-helper';

When(
  'I enter email {string} and password {string}',
  async function (this: WeMooveWorld, email: string, password: string) {
    const resolvedEmail = email === '<COURIER_ADMIN_EMAIL>' ? ENV.users.courierAdmin.email : email;
    const resolvedPass = password === '<COURIER_ADMIN_PASSWORD>' ? ENV.users.courierAdmin.password : password;

    await AllureHelper.step('Enter credentials', async () => {
      const login = new LoginPage(this.page);
      await login.fillField(login.emailInput, resolvedEmail);
      await login.fillField(login.passwordInput, resolvedPass);
    });
  }
);

When('I enter valid dispatcher credentials', async function (this: WeMooveWorld) {
  const login = new LoginPage(this.page);
  await login.fillField(login.emailInput, ENV.users.dispatcher.email);
  await login.fillField(login.passwordInput, ENV.users.dispatcher.password);
});

When('I enter valid driver credentials', async function (this: WeMooveWorld) {
  const login = new LoginPage(this.page);
  await login.fillField(login.emailInput, ENV.users.driver.email);
  await login.fillField(login.passwordInput, ENV.users.driver.password);
});

When('I enter valid sender credentials', async function (this: WeMooveWorld) {
  const login = new LoginPage(this.page);
  await login.fillField(login.emailInput, ENV.users.sender.email);
  await login.fillField(login.passwordInput, ENV.users.sender.password);
});

When('I submit the login form', async function (this: WeMooveWorld) {
  await AllureHelper.step('Submit login form', async () => {
    const login = new LoginPage(this.page);
    await login.submitButton.click();
  });
});

When('I submit the login form without filling any fields', async function (this: WeMooveWorld) {
  const login = new LoginPage(this.page);
  await login.submitButton.click();
});

When('I click the {string} link', async function (this: WeMooveWorld, linkText: string) {
  await this.page.getByText(linkText, { exact: false }).click();
  await this.page.waitForLoadState('networkidle');
});

Then('I should be redirected to the courier dashboard', async function (this: WeMooveWorld) {
  await AllureHelper.step('Verify courier dashboard redirect', async () => {
    await expect(this.page).toHaveURL(/\/courier\/dashboard|\/courier/, { timeout: 15000 });
  });
});

Then('I should be redirected to the driver portal', async function (this: WeMooveWorld) {
  await expect(this.page).toHaveURL(/\/driver/, { timeout: 15000 });
});

Then('I should be redirected to the sender portal', async function (this: WeMooveWorld) {
  await expect(this.page).toHaveURL(/\/sender/, { timeout: 15000 });
});

Then('I should see the main navigation sidebar', async function (this: WeMooveWorld) {
  const sidebar = this.page.locator('nav[class*="sidebar"], aside, .sidebar');
  await expect(sidebar).toBeVisible({ timeout: 8000 });
});

Then('I should see a login error message', async function (this: WeMooveWorld) {
  await AllureHelper.step('Verify login error is shown', async () => {
    const error = this.page.locator('[role="alert"], .error-message, [class*="error"]').first();
    await expect(error).toBeVisible({ timeout: 8000 });
  });
});

Then('I should remain on the login page', async function (this: WeMooveWorld) {
  await expect(this.page).toHaveURL(/\/auth\/login|\/login/);
});

Then('I should see an email validation error', async function (this: WeMooveWorld) {
  const err = this.page.locator('[aria-invalid="true"], [class*="error"]').first();
  await expect(err).toBeVisible({ timeout: 5000 });
});

Then('I should see validation errors for required fields', async function (this: WeMooveWorld) {
  const errors = this.page.locator('[aria-invalid="true"], [class*="error"], .field-error');
  await expect(errors.first()).toBeVisible({ timeout: 5000 });
});
