import {
  Before, After, BeforeAll, AfterAll,
  BeforeStep, AfterStep,
  Status, ITestCaseHookParameter, ITestStepHookParameter,
} from '@cucumber/cucumber';
import { WeMooveWorld } from './world';
import { AllureHelper } from './allure-helper';
import * as allure from 'allure-js-commons';

// ── Suite-level setup ─────────────────────────────────────────────────────────
BeforeAll(async function () {
  // Playwright browsers are launched per scenario; nothing to do globally
});

AfterAll(async function () {
  // Global teardown if needed
});

// ── Scenario setup ────────────────────────────────────────────────────────────
Before(async function (this: WeMooveWorld, scenario: ITestCaseHookParameter) {
  await this.init();

  // Attach Allure metadata from scenario tags
  const tags = scenario.pickle.tags.map(t => t.name);
  AllureHelper.applyScenarioLabels(scenario.pickle.name, tags);
});

// ── Scenario teardown ─────────────────────────────────────────────────────────
After(async function (this: WeMooveWorld, scenario: ITestCaseHookParameter) {
  const failed = scenario.result?.status === Status.FAILED;
  await this.teardown(failed);
});

// ── Step-level hooks for Allure step wrapping ────────────────────────────────
BeforeStep(async function (this: WeMooveWorld, step: ITestStepHookParameter) {
  // Step name is automatically captured by allure-cucumberjs formatter
});

AfterStep(async function (this: WeMooveWorld, step: ITestStepHookParameter) {
  if (step.result.status === Status.FAILED) {
    // Additional page HTML on step failure for debugging
    try {
      const html = await this.page.content();
      this.attach(Buffer.from(html), 'text/html');
    } catch {
      // page may already be closed
    }
  }
});

// ── Role-based setup hooks ────────────────────────────────────────────────────
Before({ tags: '@as-courier-admin' }, async function (this: WeMooveWorld) {
  const { LoginPage } = await import('../pages/auth/login.page');
  const loginPage = new LoginPage(this.page);
  const { ENV } = await import('./env');
  await loginPage.loginAs(ENV.users.courierAdmin);
});

Before({ tags: '@as-dispatcher' }, async function (this: WeMooveWorld) {
  const { LoginPage } = await import('../pages/auth/login.page');
  const loginPage = new LoginPage(this.page);
  const { ENV } = await import('./env');
  await loginPage.loginAs(ENV.users.dispatcher);
});

Before({ tags: '@as-driver' }, async function (this: WeMooveWorld) {
  const { LoginPage } = await import('../pages/auth/login.page');
  const loginPage = new LoginPage(this.page);
  const { ENV } = await import('./env');
  await loginPage.loginAs(ENV.users.driver);
});

Before({ tags: '@as-sender' }, async function (this: WeMooveWorld) {
  const { LoginPage } = await import('../pages/auth/login.page');
  const loginPage = new LoginPage(this.page);
  const { ENV } = await import('./env');
  await loginPage.loginAs(ENV.users.sender);
});
