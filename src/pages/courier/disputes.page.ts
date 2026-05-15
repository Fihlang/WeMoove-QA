import { Page, Locator, expect } from 'playwright';
import { BasePage } from '../base.page';

export class DisputesPage extends BasePage {
  readonly heading = this.loc('h1, h2').filter({ hasText: /disputes/i });
  readonly openCount = this.loc('[data-testid="open-count"], [class*="stat"]').filter({ hasText: /open/i });
  readonly underReviewCount = this.loc('[data-testid="review-count"], [class*="stat"]').filter({ hasText: /review/i });
  readonly disputeRows = this.loc('table tbody tr, [class*="dispute-row"]');
  readonly statusFilter = this.getByLabel(/status|filter/i);
  readonly typeFilter = this.getByLabel(/type/i);
  readonly searchInput = this.getByPlaceholder(/search|tracking|reference/i);

  // Resolution drawer
  readonly resolutionDrawer = this.loc('[class*="drawer"], [role="dialog"]').filter({ hasText: /resolution|resolve/i });
  readonly resolutionSelect = this.resolutionDrawer.locator('select, [class*="select"]').first();
  readonly resolutionNotes = this.resolutionDrawer.locator('textarea');
  readonly saveResolutionButton = this.resolutionDrawer.locator('button').filter({ hasText: /save|confirm|resolve/i });

  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.navigate('/courier/disputes');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.heading).toBeVisible({ timeout: 10000 });
  }

  async getDisputeCount(): Promise<number> {
    return this.disputeRows.count();
  }

  async clickDisputeRow(trackingNumber: string): Promise<void> {
    const row = this.disputeRows.filter({ hasText: trackingNumber });
    await row.click();
  }

  async filterByStatus(status: string): Promise<void> {
    await this.statusFilter.selectOption(status);
    await this.page.waitForLoadState('networkidle');
  }

  async resolveDispute(resolution: string, notes: string): Promise<void> {
    await expect(this.resolutionDrawer).toBeVisible({ timeout: 5000 });
    await this.resolutionSelect.selectOption(resolution);
    await this.fillField(this.resolutionNotes, notes);
    await this.saveResolutionButton.click();
  }

  async getEvidenceIcon(row: Locator, type: 'otp' | 'pickup' | 'delivery'): Promise<boolean> {
    const icon = row.locator(`[data-testid="${type}-evidence"], [class*="${type}"]`);
    const classes = await icon.getAttribute('class') ?? '';
    return classes.includes('present') || classes.includes('green') || classes.includes('success');
  }
}
