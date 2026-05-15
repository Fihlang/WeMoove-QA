import { Given, When, Then, DataTable } from '@cucumber/cucumber';
import { expect } from 'playwright';
import { WeMooveWorld } from '../../support/world';
import { RegisterPage } from '../../pages/auth/register.page';
import { ENV } from '../../support/env';
import { faker } from '@faker-js/faker';
import { AllureHelper } from '../../support/allure-helper';

When(
  'I fill in the registration form with:',
  async function (this: WeMooveWorld, table: DataTable) {
    const data = table.rowsHash();
    const register = new RegisterPage(this.page);
    const email = data.email === '<UNIQUE_EMAIL>'
      ? `test+${Date.now()}@wemoove-test.local`
      : data.email;

    await AllureHelper.step('Fill registration form', async () => {
      await register.register({
        name: data.name,
        surname: data.surname,
        email,
        password: data.password,
        role: data.role,
        courierCompanyName: data.courierCompany,
      });
    });

    this.scenarioCtx.createdUserEmail = email;
  }
);

When('I fill in the registration form using an existing email', async function (this: WeMooveWorld) {
  const register = new RegisterPage(this.page);
  await register.register({
    name: 'Test',
    surname: 'User',
    email: ENV.users.courierAdmin.email,
    password: 'Test@1234!',
    role: 'Sender',
  });
});

When('I fill in the registration form with a password {string}', async function (this: WeMooveWorld, password: string) {
  const register = new RegisterPage(this.page);
  await register.register({
    name: faker.person.firstName(),
    surname: faker.person.lastName(),
    email: `test+${Date.now()}@wemoove-test.local`,
    password,
    role: 'Sender',
  });
});

When('I fill in the registration form with mismatched passwords', async function (this: WeMooveWorld) {
  const register = new RegisterPage(this.page);
  await register.fillField(register.nameInput, faker.person.firstName());
  await register.fillField(register.surnameInput, faker.person.lastName());
  await register.fillField(register.emailInput, `test+${Date.now()}@wemoove-test.local`);
  await register.fillField(register.passwordInput, 'Test@1234!');
  await register.fillField(register.confirmPasswordInput, 'DifferentPass@5678!');
  await register.submitButton.click();
});

When('I submit the registration form', async function (this: WeMooveWorld) {
  // form was already submitted inline in the fill step
});

When('I select the {string} role', async function (this: WeMooveWorld, role: string) {
  const register = new RegisterPage(this.page);
  await register.roleSelect.selectOption(role);
});

Then('I should be registered and redirected to the dashboard', async function (this: WeMooveWorld) {
  await AllureHelper.step('Verify registration success and redirect', async () => {
    await expect(this.page).toHaveURL(
      /\/courier\/dashboard|\/driver|\/sender|\/dashboard/,
      { timeout: 15000 }
    );
  });
});

Then('I should see an error indicating the email is already registered', async function (this: WeMooveWorld) {
  const error = this.page.locator('[role="alert"], .error-message, [class*="error"]').first();
  await expect(error).toBeVisible({ timeout: 8000 });
  const text = await error.textContent() ?? '';
  expect(text.toLowerCase()).toMatch(/already|exists|registered|taken/);
});

Then('I should see a password strength error', async function (this: WeMooveWorld) {
  const error = this.page.locator('[aria-invalid="true"], [class*="error"]').first();
  await expect(error).toBeVisible({ timeout: 5000 });
});

Then('I should see a password mismatch error', async function (this: WeMooveWorld) {
  const error = this.page.locator('[aria-invalid="true"], [class*="error"]').first();
  await expect(error).toBeVisible({ timeout: 5000 });
});

Then('the company name field should be visible', async function (this: WeMooveWorld) {
  const register = new RegisterPage(this.page);
  await expect(register.courierCompanyInput).toBeVisible({ timeout: 3000 });
});

Then('the company name field should not be visible', async function (this: WeMooveWorld) {
  const register = new RegisterPage(this.page);
  await expect(register.courierCompanyInput).not.toBeVisible();
});
