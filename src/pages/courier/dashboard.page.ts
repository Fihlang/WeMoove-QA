import { Page, expect } from 'playwright';
import { BasePage } from '../base.page';

export class DashboardPage extends BasePage {
  readonly heading = this.loc('h1, h2').filter({ hasText: /dashboard/i });
  readonly newDeliveryButton = this.getByRole('link', { name: /new delivery|create delivery/i });
  readonly disputesLink = this.getByRole('link', { name: /disputes/i });
  readonly trackingLink = this.getByRole('link', { name: /tracking/i });

  // Stat cards
  readonly totalDeliveriesCard = this.loc('[data-testid="stat-total"], .stat-card').filter({ hasText: /total/i });
  readonly activeDeliveriesCard = this.loc('[data-testid="stat-active"], .stat-card').filter({ hasText: /active|in.?transit/i });
  readonly openDisputesCard = this.loc('[data-testid="stat-disputes"], .stat-card').filter({ hasText: /dispute/i });
  readonly deliveredCard = this.loc('[data-testid="stat-delivered"], .stat-card').filter({ hasText: /delivered/i });

  // Sidebar navigation
  readonly sidebar = this.loc('nav[class*="sidebar"], aside[class*="sidebar"], .sidebar');
  readonly sidebarDeliveries = this.sidebar.locator('a').filter({ hasText: /deliveries/i });
  readonly sidebarDisputes = this.sidebar.locator('a').filter({ hasText: /disputes/i });
  readonly sidebarAccounts = this.sidebar.locator('a').filter({ hasText: /accounts/i });
  readonly sidebarBilling = this.sidebar.locator('a').filter({ hasText: /billing/i });
  readonly sidebarTracking = this.sidebar.locator('a').filter({ hasText: /tracking/i });

  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.navigate('/courier/dashboard');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.heading).toBeVisible({ timeout: 10000 });
  }

  async getStatValue(cardLocator: ReturnType<typeof this.loc>): Promise<number> {
    const text = await cardLocator.locator('.stat-value, [class*="value"], strong').textContent();
    return parseInt((text ?? '0').replace(/\D/g, ''), 10);
  }

  async navigateTo(section: 'deliveries' | 'disputes' | 'accounts' | 'billing' | 'tracking'): Promise<void> {
    const map = {
      deliveries: this.sidebarDeliveries,
      disputes: this.sidebarDisputes,
      accounts: this.sidebarAccounts,
      billing: this.sidebarBilling,
      tracking: this.sidebarTracking,
    };
    await map[section].click();
    await this.page.waitForLoadState('networkidle');
  }
}
