import { Page, expect } from 'playwright';
import { BasePage } from '../base.page';

export interface UserCredentials {
  email: string;
  password: string;
}

export class LoginPage extends BasePage {
  readonly emailInput = this.getByLabel('Email');
  readonly passwordInput = this.getByLabel('Password');
  readonly submitButton = this.getByRole('button', { name: /sign in|log in/i });
  readonly forgotPasswordLink = this.getByText(/forgot.*password/i);
  readonly registerLink = this.getByText(/register|sign up|create account/i);
  readonly errorMessage = this.loc('.error-message, [role="alert"]');

  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.navigate('/auth/login');
  }

  async login(credentials: UserCredentials): Promise<void> {
    await this.fillField(this.emailInput, credentials.email);
    await this.fillField(this.passwordInput, credentials.password);
    await this.submitButton.click();
  }

  async loginAs(credentials: UserCredentials): Promise<void> {
    await this.goto();
    await this.login(credentials);
    await this.page.waitForURL(/\/courier|\/driver|\/sender|\/dashboard/, { timeout: 15000 });
  }

  async expectLoginError(message?: string): Promise<void> {
    await expect(this.errorMessage).toBeVisible({ timeout: 8000 });
    if (message) {
      await expect(this.errorMessage).toContainText(message);
    }
  }

  async expectEmailValidationError(): Promise<void> {
    const err = this.loc('[class*="error"], .field-error, [aria-invalid="true"]');
    await expect(err.first()).toBeVisible();
  }

  async isOnLoginPage(): Promise<boolean> {
    return this.page.url().includes('/auth/login') || this.page.url().includes('/login');
  }

  async clickForgotPassword(): Promise<void> {
    await this.forgotPasswordLink.click();
  }

  async clickRegister(): Promise<void> {
    await this.registerLink.click();
  }
}
