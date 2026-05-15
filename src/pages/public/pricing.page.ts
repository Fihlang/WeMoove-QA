import { Page, expect } from 'playwright';
import { BasePage } from '../base.page';

export class PricingPage extends BasePage {
  readonly heading = this.loc('h1, h2').filter({ hasText: /pricing|plans/i }).first();
  readonly planCards = this.loc('[class*="plan-card"], [class*="pricing-card"], .plan, .card').filter({ hasText: /month|free|R/i });
  readonly starterPlan = this.planCards.filter({ hasText: /starter|free/i }).first();
  readonly growthPlan = this.planCards.filter({ hasText: /growth/i }).first();
  readonly scalePlan = this.planCards.filter({ hasText: /scale|enterprise/i }).first();

  readonly getStartedButtons = this.getByRole('link', { name: /get started|choose|select/i });
  readonly contactButton = this.getByRole('link', { name: /contact|talk.*to.*us/i });

  readonly faqSection = this.loc('[id*="faq"], [class*="faq"], section').filter({ hasText: /frequently|questions/i });
  readonly faqItems = this.faqSection.locator('[class*="faq-item"], details, [class*="accordion"]');

  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.navigate('/pricing');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.heading).toBeVisible({ timeout: 10000 });
  }

  async getPlanCount(): Promise<number> {
    return this.planCards.count();
  }

  async getPlanPrice(planName: string): Promise<string> {
    const card = this.planCards.filter({ hasText: new RegExp(planName, 'i') }).first();
    const price = card.locator('[class*="price"], .amount, strong').first();
    return (await price.textContent()) ?? '';
  }

  async clickPlanCta(planName: string): Promise<void> {
    const card = this.planCards.filter({ hasText: new RegExp(planName, 'i') }).first();
    const button = card.getByRole('link').or(card.getByRole('button')).first();
    await button.click();
    await this.page.waitForLoadState('networkidle');
  }

  async expandFaqItem(index: number): Promise<void> {
    const item = this.faqItems.nth(index);
    await item.click();
  }

  async isFaqItemExpanded(index: number): Promise<boolean> {
    const item = this.faqItems.nth(index);
    const expanded = await item.getAttribute('open') ?? await item.getAttribute('aria-expanded');
    return expanded !== null && expanded !== 'false';
  }
}
