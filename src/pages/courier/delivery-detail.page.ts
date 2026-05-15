import { Page, expect } from 'playwright';
import { BasePage } from '../base.page';

export class DeliveryDetailPage extends BasePage {
  readonly trackingNumber = this.loc('[data-testid="tracking-number"], .tracking-number, h1, h2').first();
  readonly statusBadge = this.loc('[data-testid="status-badge"], [class*="status-badge"], .status-chip').first();
  readonly senderName = this.loc('[data-testid="sender-name"], [class*="sender"]').first();
  readonly receiverName = this.loc('[data-testid="receiver-name"], [class*="receiver"]').first();
  readonly pickupAddress = this.loc('[data-testid="pickup-address"], [class*="pickup"]').first();
  readonly dropoffAddress = this.loc('[data-testid="dropoff-address"], [class*="dropoff"]').first();

  // Action buttons
  readonly assignDriverButton = this.getByRole('button', { name: /assign.*driver/i });
  readonly openDisputeButton = this.getByRole('button', { name: /open.*dispute|raise.*dispute/i });
  readonly generatePodButton = this.getByRole('button', { name: /generate.*pod|proof.*delivery/i });
  readonly updateStatusButton = this.getByRole('button', { name: /update.*status|change.*status/i });

  // Evidence section
  readonly evidenceSection = this.loc('[data-testid="evidence"], [class*="evidence"]');
  readonly pickupPhotos = this.loc('[data-testid="pickup-photos"], [class*="pickup-photo"]');
  readonly deliveryPhotos = this.loc('[data-testid="delivery-photos"], [class*="delivery-photo"]');
  readonly otpStatus = this.loc('[data-testid="otp-status"], [class*="otp"]');
  readonly itemsTable = this.loc('[data-testid="items-table"], table[class*="item"]');

  // Timeline / event log
  readonly eventLog = this.loc('[data-testid="event-log"], [class*="timeline"], [class*="event-log"]');
  readonly eventEntries = this.eventLog.locator('li, [class*="event-entry"], [class*="timeline-item"]');

  // Dispute modal
  readonly disputeModal = this.loc('[role="dialog"], .modal').filter({ hasText: /dispute/i });
  readonly disputeTypeSelect = this.disputeModal.locator('select, [class*="select"]').first();
  readonly disputeDescriptionInput = this.disputeModal.locator('textarea');
  readonly submitDisputeButton = this.disputeModal.locator('button').filter({ hasText: /submit|open|confirm/i });

  // Assign driver modal
  readonly assignDriverModal = this.loc('[role="dialog"], .modal').filter({ hasText: /assign.*driver/i });
  readonly driverSelect = this.assignDriverModal.locator('select, [class*="select"]').first();
  readonly confirmAssignButton = this.assignDriverModal.locator('button').filter({ hasText: /assign|confirm/i });

  constructor(page: Page) {
    super(page);
  }

  async gotoById(deliveryId: string): Promise<void> {
    await this.navigate(`/courier/deliveries/${deliveryId}`);
  }

  async expectStatus(status: string): Promise<void> {
    await expect(this.statusBadge).toContainText(status, { ignoreCase: true });
  }

  async openDisputeDialog(disputeType: string, description: string): Promise<void> {
    await this.openDisputeButton.click();
    await expect(this.disputeModal).toBeVisible({ timeout: 5000 });
    await this.disputeModal.locator('select, [class*="select"]').first().selectOption(disputeType);
    await this.fillField(this.disputeDescriptionInput, description);
    await this.submitDisputeButton.click();
  }

  async generatePod(): Promise<string | null> {
    const [download] = await Promise.all([
      this.page.waitForEvent('download').catch(() => null),
      this.generatePodButton.click(),
    ]);
    return download ? download.path() : null;
  }

  async getEventCount(): Promise<number> {
    return this.eventEntries.count();
  }

  async getLatestEventText(): Promise<string> {
    return (await this.eventEntries.first().textContent()) ?? '';
  }

  async expectEvidencePresent(type: 'otp' | 'pickup-photos' | 'delivery-photos'): Promise<void> {
    const map = {
      otp: this.otpStatus,
      'pickup-photos': this.pickupPhotos,
      'delivery-photos': this.deliveryPhotos,
    };
    await expect(map[type]).toBeVisible();
  }
}
