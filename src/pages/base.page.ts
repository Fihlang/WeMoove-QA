import { Page, Locator, expect } from 'playwright';

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  async navigate(path: string): Promise<void> {
    await this.page.goto(path);
    await this.page.waitForLoadState('networkidle');
  }

  async waitForUrl(pattern: string | RegExp): Promise<void> {
    await this.page.waitForURL(pattern, { timeout: 15000 });
  }

  async expectToastContaining(text: string): Promise<void> {
    const toast = this.page.locator('[role="alert"], .toast, .snackbar, .notification').filter({ hasText: text });
    await expect(toast).toBeVisible({ timeout: 8000 });
  }

  async expectPageHeading(text: string): Promise<void> {
    await expect(this.page.locator('h1, h2').filter({ hasText: text }).first()).toBeVisible();
  }

  async fillField(locator: Locator, value: string): Promise<void> {
    await locator.clear();
    await locator.fill(value);
  }

  async selectOption(locator: Locator, value: string): Promise<void> {
    await locator.selectOption(value);
  }

  async clickAndWaitForNav(locator: Locator): Promise<void> {
    await Promise.all([
      this.page.waitForNavigation({ waitUntil: 'networkidle' }),
      locator.click(),
    ]);
  }

  async isVisible(locator: Locator): Promise<boolean> {
    return locator.isVisible();
  }

  async getText(locator: Locator): Promise<string> {
    return (await locator.textContent()) ?? '';
  }

  async waitForElement(locator: Locator, timeout = 10000): Promise<void> {
    await locator.waitFor({ state: 'visible', timeout });
  }

  async scrollTo(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }

  protected loc(selector: string): Locator {
    return this.page.locator(selector);
  }

  protected getByTestId(id: string): Locator {
    return this.page.getByTestId(id);
  }

  protected getByRole(role: Parameters<Page['getByRole']>[0], options?: Parameters<Page['getByRole']>[1]): Locator {
    return this.page.getByRole(role, options);
  }

  protected getByLabel(label: string): Locator {
    return this.page.getByLabel(label);
  }

  protected getByText(text: string): Locator {
    return this.page.getByText(text);
  }

  protected getByPlaceholder(placeholder: string): Locator {
    return this.page.getByPlaceholder(placeholder);
  }
}
