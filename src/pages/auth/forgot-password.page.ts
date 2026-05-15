import { Page, expect } from 'playwright';
import { BasePage } from '../base.page';

export class ForgotPasswordPage extends BasePage {
  readonly emailInput = this.getByLabel('Email');
  readonly submitButton = this.getByRole('button', { name: /send|reset|submit/i });
  readonly successMessage = this.loc('[class*="success"], .success-message, [role="status"]');
  readonly errorMessage = this.loc('[class*="error"], .error-message, [role="alert"]');
  readonly backToLoginLink = this.getByText(/back.*login|sign in/i);

  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.navigate('/auth/forgot-password');
  }

  async submitEmail(email: string): Promise<void> {
    await this.fillField(this.emailInput, email);
    await this.submitButton.click();
  }

  async expectSuccessMessage(): Promise<void> {
    await expect(this.successMessage).toBeVisible({ timeout: 8000 });
  }

  async expectErrorMessage(): Promise<void> {
    await expect(this.errorMessage).toBeVisible({ timeout: 8000 });
  }
}

export class ResetPasswordPage extends BasePage {
  readonly newPasswordInput = this.getByLabel(/new password/i);
  readonly confirmPasswordInput = this.getByLabel(/confirm password/i);
  readonly submitButton = this.getByRole('button', { name: /reset|save|confirm/i });

  constructor(page: Page) {
    super(page);
  }

  async resetPassword(newPassword: string): Promise<void> {
    await this.fillField(this.newPasswordInput, newPassword);
    await this.fillField(this.confirmPasswordInput, newPassword);
    await this.submitButton.click();
  }

  async expectRedirectToLogin(): Promise<void> {
    await this.page.waitForURL(/\/auth\/login|\/login/, { timeout: 10000 });
  }
}
