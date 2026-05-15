import * as allure from 'allure-js-commons';

const TAG_SUITE_MAP: Record<string, string> = {
  '@auth': 'Authentication',
  '@delivery': 'Delivery Lifecycle',
  '@evidence': 'Evidence Capture',
  '@dispute': 'Dispute Management',
  '@public': 'Public Pages',
  '@smoke': 'Smoke',
  '@regression': 'Regression',
};

const TAG_SEVERITY_MAP: Record<string, allure.Severity> = {
  '@critical': allure.Severity.CRITICAL,
  '@major': allure.Severity.MAJOR,
  '@normal': allure.Severity.NORMAL,
  '@minor': allure.Severity.MINOR,
  '@trivial': allure.Severity.TRIVIAL,
};

export class AllureHelper {
  static applyScenarioLabels(scenarioName: string, tags: string[]): void {
    for (const tag of tags) {
      const suite = TAG_SUITE_MAP[tag];
      if (suite) allure.suite(suite);

      const severity = TAG_SEVERITY_MAP[tag];
      if (severity) allure.severity(severity);

      if (tag.startsWith('@jira:')) {
        const ticket = tag.replace('@jira:', '');
        allure.issue(ticket, `https://jira.example.com/browse/${ticket}`);
        allure.tms(ticket, `https://jira.example.com/browse/${ticket}`);
      }
    }
  }

  static async step<T>(name: string, fn: () => Promise<T>): Promise<T> {
    return allure.step(name, fn);
  }

  static attachText(name: string, content: string): void {
    allure.attachment(name, content, { contentType: allure.ContentType.TEXT });
  }

  static attachJson(name: string, data: unknown): void {
    allure.attachment(name, JSON.stringify(data, null, 2), {
      contentType: allure.ContentType.JSON,
    });
  }
}
