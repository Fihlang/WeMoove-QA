import { World, IWorldOptions, setWorldConstructor } from '@cucumber/cucumber';
import { Browser, BrowserContext, Page, chromium, firefox, webkit } from 'playwright';
import { ENV } from './env';
import { FixtureFactory } from '../api/fixture-factory';

export interface ScenarioContext {
  deliveryId?: string;
  trackingNumber?: string;
  disputeId?: string;
  authToken?: string;
  createdUserEmail?: string;
}

export class WeMooveWorld extends World {
  browser!: Browser;
  context!: BrowserContext;
  page!: Page;
  fixtures!: FixtureFactory;

  // Shared state passed between steps within a scenario
  scenarioCtx: ScenarioContext = {};

  constructor(options: IWorldOptions) {
    super(options);
  }

  async init(): Promise<void> {
    const browserType =
      ENV.browser === 'firefox' ? firefox :
      ENV.browser === 'webkit' ? webkit :
      chromium;

    this.browser = await browserType.launch({
      headless: ENV.headless,
      slowMo: ENV.slowMo,
    });

    this.context = await this.browser.newContext({
      baseURL: ENV.baseUrl,
      viewport: { width: ENV.viewportWidth, height: ENV.viewportHeight },
      recordVideo: ENV.videoOnFailure ? { dir: 'test-results/videos' } : undefined,
      ignoreHTTPSErrors: ENV.environment !== 'prod',
    });

    this.context.setDefaultTimeout(ENV.defaultTimeout);
    this.context.setDefaultNavigationTimeout(ENV.navigationTimeout);

    if (ENV.traceOnFailure) {
      await this.context.tracing.start({ screenshots: true, snapshots: true });
    }

    this.page = await this.context.newPage();
    this.fixtures = new FixtureFactory();
  }

  async teardown(scenarioFailed: boolean): Promise<void> {
    if (scenarioFailed) {
      if (ENV.screenshotOnFailure) {
        const screenshot = await this.page.screenshot({ fullPage: true });
        this.attach(screenshot, 'image/png');
      }

      if (ENV.traceOnFailure) {
        await this.context.tracing.stop({
          path: `test-results/traces/${Date.now()}.zip`,
        });
      }
    }

    await this.context.close();
    await this.browser.close();
    await this.fixtures.cleanup();
  }
}

setWorldConstructor(WeMooveWorld);
