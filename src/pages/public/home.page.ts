import { Page, expect } from 'playwright';
import { BasePage } from '../base.page';

export class HomePage extends BasePage {
  readonly heroHeading = this.loc('h1');
  readonly heroSubtext = this.loc('h1 + p, h1 ~ p, .hero p').first();
  readonly ctaButton = this.loc('.hero a, .cta-button, [class*="hero"] a').first();
  readonly getStartedButton = this.getByRole('link', { name: /get started|start.*free|sign up/i });
  readonly learnMoreButton = this.getByRole('link', { name: /learn more/i });

  readonly navbar = this.loc('nav, header');
  readonly navLogo = this.navbar.locator('a[class*="logo"], img[alt*="logo"], [class*="brand"]').first();
  readonly navPricingLink = this.navbar.locator('a').filter({ hasText: /pricing/i });
  readonly navLoginLink = this.navbar.locator('a').filter({ hasText: /log in|sign in/i });
  readonly navRegisterLink = this.navbar.locator('a').filter({ hasText: /sign up|register|get started/i });

  readonly featuresSection = this.loc('[id*="features"], [class*="features"], section').filter({ hasText: /features|how it works/i }).first();
  readonly problemsSection = this.loc('[id*="problems"], [class*="problems"], section').filter({ hasText: /problem|dispute|challenge/i }).first();
  readonly pricingPreviewSection = this.loc('[id*="pricing"], [class*="pricing"], section').filter({ hasText: /pricing|plan/i }).first();
  readonly testimonialsSection = this.loc('[id*="testimonial"], [class*="testimonial"], section').filter({ hasText: /testimonial|quote|said/i }).first();

  readonly footer = this.loc('footer');
  readonly footerLinks = this.footer.locator('a');

  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.navigate('/');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.heroHeading).toBeVisible({ timeout: 10000 });
  }

  async getHeroHeadingText(): Promise<string> {
    return (await this.heroHeading.textContent()) ?? '';
  }

  async clickGetStarted(): Promise<void> {
    await (this.getStartedButton.or(this.ctaButton)).first().click();
    await this.page.waitForLoadState('networkidle');
  }

  async clickPricing(): Promise<void> {
    await this.navPricingLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  async expectNoFakeStats(): Promise<void> {
    const bodyText = await this.page.locator('body').textContent() ?? '';
    // These specific fake numbers should not appear
    const forbidden = ['500+ companies', '78% reduction', '50,000+ deliveries'];
    for (const str of forbidden) {
      if (bodyText.includes(str)) {
        throw new Error(`Fake stat found on homepage: "${str}"`);
      }
    }
  }

  async isSectionVisible(section: 'features' | 'problems' | 'pricing' | 'testimonials'): Promise<boolean> {
    const map = {
      features: this.featuresSection,
      problems: this.problemsSection,
      pricing: this.pricingPreviewSection,
      testimonials: this.testimonialsSection,
    };
    return map[section].isVisible();
  }
}
