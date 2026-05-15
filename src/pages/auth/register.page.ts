import { Page, expect } from 'playwright';
import { BasePage } from '../base.page';

export interface RegisterData {
  name: string;
  surname: string;
  email: string;
  password: string;
  confirmPassword?: string;
  role?: string;
  courierCompanyName?: string;
}

export class RegisterPage extends BasePage {
  readonly nameInput = this.getByLabel(/first name|name/i);
  readonly surnameInput = this.getByLabel(/surname|last name/i);
  readonly emailInput = this.getByLabel('Email');
  readonly passwordInput = this.getByLabel(/^password/i);
  readonly confirmPasswordInput = this.getByLabel(/confirm password/i);
  readonly roleSelect = this.getByLabel(/role/i);
  readonly courierCompanyInput = this.getByLabel(/company name/i);
  readonly submitButton = this.getByRole('button', { name: /register|sign up|create account/i });
  readonly loginLink = this.getByText(/already.*account|sign in|log in/i);

  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.navigate('/auth/register');
  }

  async register(data: RegisterData): Promise<void> {
    await this.fillField(this.nameInput, data.name);
    await this.fillField(this.surnameInput, data.surname);
    await this.fillField(this.emailInput, data.email);
    await this.fillField(this.passwordInput, data.password);

    if (data.confirmPassword !== undefined) {
      await this.fillField(this.confirmPasswordInput, data.confirmPassword);
    } else {
      await this.fillField(this.confirmPasswordInput, data.password);
    }

    if (data.role) {
      await this.roleSelect.selectOption(data.role);
    }

    if (data.courierCompanyName) {
      await this.fillField(this.courierCompanyInput, data.courierCompanyName);
    }

    await this.submitButton.click();
  }

  async expectFieldError(fieldLabel: string): Promise<void> {
    const field = this.getByLabel(fieldLabel);
    await expect(field).toHaveAttribute('aria-invalid', 'true');
  }

  async expectRegistrationSuccess(): Promise<void> {
    await this.page.waitForURL(/\/courier|\/driver|\/sender|\/dashboard|\/auth\/login/, { timeout: 15000 });
  }

  async courierCompanyFieldVisible(): Promise<boolean> {
    return this.courierCompanyInput.isVisible();
  }
}
