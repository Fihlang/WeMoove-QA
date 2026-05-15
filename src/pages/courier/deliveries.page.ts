import { Page, Locator, expect } from 'playwright';
import { BasePage } from '../base.page';

export class DeliveriesPage extends BasePage {
  readonly heading = this.loc('h1, h2').filter({ hasText: /deliveries/i });
  readonly createButton = this.getByRole('link', { name: /new delivery|create/i });
  readonly searchInput = this.getByPlaceholder(/search|tracking number|reference/i);
  readonly statusFilter = this.getByLabel(/status|filter/i);
  readonly tableRows = this.loc('table tbody tr, [class*="delivery-row"], [class*="list-item"]');
  readonly emptyState = this.loc('[class*="empty"], [class*="no-results"]').filter({ hasText: /no deliveries|empty/i });

  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.navigate('/courier/deliveries');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.heading).toBeVisible({ timeout: 10000 });
  }

  async searchFor(query: string): Promise<void> {
    await this.fillField(this.searchInput, query);
    await this.page.keyboard.press('Enter');
    await this.page.waitForLoadState('networkidle');
  }

  async filterByStatus(status: string): Promise<void> {
    await this.statusFilter.selectOption(status);
    await this.page.waitForLoadState('networkidle');
  }

  async getRowCount(): Promise<number> {
    return this.tableRows.count();
  }

  async clickFirstRow(): Promise<void> {
    await this.tableRows.first().click();
    await this.page.waitForLoadState('networkidle');
  }

  async findRowByTracking(trackingNumber: string): Promise<Locator> {
    return this.tableRows.filter({ hasText: trackingNumber });
  }

  async clickRowByTracking(trackingNumber: string): Promise<void> {
    const row = await this.findRowByTracking(trackingNumber);
    await row.click();
    await this.page.waitForLoadState('networkidle');
  }

  async getStatusBadge(trackingNumber: string): Promise<string> {
    const row = await this.findRowByTracking(trackingNumber);
    const badge = row.locator('[class*="badge"], [class*="status"], .chip');
    return (await badge.textContent()) ?? '';
  }
}
