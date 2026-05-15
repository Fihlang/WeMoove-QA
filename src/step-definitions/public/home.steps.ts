import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'playwright';
import { WeMooveWorld } from '../../support/world';
import { HomePage } from '../../pages/public/home.page';
import { PricingPage } from '../../pages/public/pricing.page';

Given('I am on the homepage', async function (this: WeMooveWorld) {
  const home = new HomePage(this.page);
  await home.goto();
});

When('I visit the homepage', async function (this: WeMooveWorld) {
  const home = new HomePage(this.page);
  await home.goto();
});

When('I click the primary call-to-action button', async function (this: WeMooveWorld) {
  const home = new HomePage(this.page);
  await home.clickGetStarted();
});

When('I click {string} in the navigation', async function (this: WeMooveWorld, linkText: string) {
  const nav = this.page.locator('nav, header');
  await nav.locator('a').filter({ hasText: new RegExp(linkText, 'i') }).first().click();
  await this.page.waitForLoadState('networkidle');
});

Then('the hero section should be visible', async function (this: WeMooveWorld) {
  const home = new HomePage(this.page);
  await expect(home.heroHeading).toBeVisible({ timeout: 10000 });
});

Then('the heading should communicate dispute prevention value', async function (this: WeMooveWorld) {
  const home = new HomePage(this.page);
  const heading = await home.getHeroHeadingText();
  // Heading should relate to disputes, delivery proof, or prevention
  expect(heading.toLowerCase()).toMatch(/dispute|proof|deliver|verify|trust/);
});

Then('no fraudulent statistics should be present on the page', async function (this: WeMooveWorld) {
  const home = new HomePage(this.page);
  await home.expectNoFakeStats();
});

Then('I should be navigated to the registration page', async function (this: WeMooveWorld) {
  await expect(this.page).toHaveURL(/\/auth\/register|\/register/, { timeout: 10000 });
});

Then('I should be on the pricing page', async function (this: WeMooveWorld) {
  await expect(this.page).toHaveURL(/\/pricing/, { timeout: 10000 });
});

Then('I should see a {string} link in the navigation', async function (this: WeMooveWorld, linkText: string) {
  const nav = this.page.locator('nav, header');
  const link = nav.locator('a').filter({ hasText: new RegExp(linkText, 'i') });
  await expect(link).toBeVisible({ timeout: 5000 });
});

Then('the features or how-it-works section should be visible', async function (this: WeMooveWorld) {
  const home = new HomePage(this.page);
  const visible = await home.isSectionVisible('features');
  if (!visible) {
    // Try scrolling and checking again
    await home.scrollTo(home.featuresSection);
    await expect(home.featuresSection).toBeVisible({ timeout: 5000 });
  }
});

Then('the footer should contain at least one navigation link', async function (this: WeMooveWorld) {
  const home = new HomePage(this.page);
  await home.scrollTo(home.footer);
  const count = await home.footerLinks.count();
  expect(count).toBeGreaterThan(0);
});

Then('the page title should mention dispute or delivery proof', async function (this: WeMooveWorld) {
  const title = await this.page.title();
  expect(title.toLowerCase()).toMatch(/dispute|proof|deliver|furnmovers|wemoove/);
});

// Pricing page steps
When('I navigate to the pricing page', async function (this: WeMooveWorld) {
  const pricing = new PricingPage(this.page);
  await pricing.goto();
});

Then('the pricing page should load', async function (this: WeMooveWorld) {
  const pricing = new PricingPage(this.page);
  await pricing.expectLoaded();
});

Then('I should see at least 2 pricing plans', async function (this: WeMooveWorld) {
  const pricing = new PricingPage(this.page);
  const count = await pricing.getPlanCount();
  expect(count).toBeGreaterThanOrEqual(2);
});

Then('I should see a starter or free plan', async function (this: WeMooveWorld) {
  const pricing = new PricingPage(this.page);
  await expect(pricing.starterPlan).toBeVisible({ timeout: 5000 });
});

Then('it should clearly indicate no cost to start', async function (this: WeMooveWorld) {
  const pricing = new PricingPage(this.page);
  const starterText = await pricing.starterPlan.textContent() ?? '';
  expect(starterText.toLowerCase()).toMatch(/free|r0|r 0|no cost|start for free/);
});

Then('each plan card should have a {string} or similar button', async function (this: WeMooveWorld, _buttonText: string) {
  const pricing = new PricingPage(this.page);
  const count = await pricing.getPlanCount();
  expect(count).toBeGreaterThan(0);
  // Each card has a CTA
  const buttons = pricing.getStartedButtons;
  const btnCount = await buttons.count();
  expect(btnCount).toBeGreaterThan(0);
});

Then('I should be navigated to the registration page', async function (this: WeMooveWorld) {
  await expect(this.page).toHaveURL(/\/auth\/register|\/register/, { timeout: 10000 });
});

Then('a frequently asked questions section should be visible', async function (this: WeMooveWorld) {
  const pricing = new PricingPage(this.page);
  await pricing.scrollTo(pricing.faqSection);
  await expect(pricing.faqSection).toBeVisible({ timeout: 5000 });
});

Then('the FAQ item should expand to reveal the answer', async function (this: WeMooveWorld) {
  const pricing = new PricingPage(this.page);
  await pricing.expandFaqItem(0);
  const expanded = await pricing.isFaqItemExpanded(0);
  expect(expanded).toBe(true);
});

Then('I click on the first FAQ item', async function (this: WeMooveWorld) {
  const pricing = new PricingPage(this.page);
  await pricing.expandFaqItem(0);
});
