import { Page, expect } from 'playwright';
import { BasePage } from '../base.page';

export interface DeliveryFormData {
  senderName: string;
  senderPhone: string;
  senderEmail: string;
  senderCompany?: string;
  receiverName: string;
  receiverPhone: string;
  receiverEmail: string;
  pickupAddress: string;
  dropoffAddress: string;
  itemDescription: string;
  itemValue: number;
  referenceNumber?: string;
  requireOtp?: boolean;
  requirePickupPhotos?: boolean;
  requireDeliveryPhotos?: boolean;
}

export class CreateDeliveryPage extends BasePage {
  // Sender section
  readonly senderNameInput = this.getByLabel(/sender.*name|name.*sender/i);
  readonly senderPhoneInput = this.getByLabel(/sender.*phone|phone.*sender/i);
  readonly senderEmailInput = this.getByLabel(/sender.*email|email.*sender/i);
  readonly senderCompanyInput = this.getByLabel(/sender.*company|company/i);

  // Receiver section
  readonly receiverNameInput = this.getByLabel(/receiver.*name|recipient.*name/i);
  readonly receiverPhoneInput = this.getByLabel(/receiver.*phone|recipient.*phone/i);
  readonly receiverEmailInput = this.getByLabel(/receiver.*email|recipient.*email/i);

  // Address section
  readonly pickupAddressInput = this.getByLabel(/pickup.*address|collection.*address/i);
  readonly dropoffAddressInput = this.getByLabel(/drop.*off.*address|delivery.*address/i);

  // Item section
  readonly itemDescriptionInput = this.getByLabel(/item.*description|description/i);
  readonly itemValueInput = this.getByLabel(/item.*value|declared.*value/i);
  readonly referenceNumberInput = this.getByLabel(/reference.*number|ref.*no/i);

  // Requirements toggles / checkboxes
  readonly requireOtpToggle = this.getByLabel(/require.*otp|otp.*verification/i);
  readonly requirePickupPhotosToggle = this.getByLabel(/pickup.*photos|require.*pickup/i);
  readonly requireDeliveryPhotosToggle = this.getByLabel(/delivery.*photos|require.*delivery/i);
  readonly requireItemVerificationToggle = this.getByLabel(/item.*verification|verify.*items/i);

  // Submit
  readonly submitButton = this.getByRole('button', { name: /create.*delivery|submit|save/i });
  readonly cancelButton = this.getByRole('button', { name: /cancel/i });

  // Validation
  readonly formErrors = this.loc('[class*="error"], .field-error, [aria-invalid="true"]');

  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.navigate('/courier/deliveries/create');
  }

  async fill(data: DeliveryFormData): Promise<void> {
    await this.fillField(this.senderNameInput, data.senderName);
    await this.fillField(this.senderPhoneInput, data.senderPhone);
    await this.fillField(this.senderEmailInput, data.senderEmail);

    if (data.senderCompany) {
      await this.fillField(this.senderCompanyInput, data.senderCompany);
    }

    await this.fillField(this.receiverNameInput, data.receiverName);
    await this.fillField(this.receiverPhoneInput, data.receiverPhone);
    await this.fillField(this.receiverEmailInput, data.receiverEmail);

    await this.fillField(this.pickupAddressInput, data.pickupAddress);
    await this.fillField(this.dropoffAddressInput, data.dropoffAddress);

    await this.fillField(this.itemDescriptionInput, data.itemDescription);
    await this.fillField(this.itemValueInput, String(data.itemValue));

    if (data.referenceNumber) {
      await this.fillField(this.referenceNumberInput, data.referenceNumber);
    }

    if (data.requireOtp !== undefined) {
      await this.setToggle(this.requireOtpToggle, data.requireOtp);
    }
    if (data.requirePickupPhotos !== undefined) {
      await this.setToggle(this.requirePickupPhotosToggle, data.requirePickupPhotos);
    }
    if (data.requireDeliveryPhotos !== undefined) {
      await this.setToggle(this.requireDeliveryPhotosToggle, data.requireDeliveryPhotos);
    }
  }

  private async setToggle(locator: ReturnType<typeof this.getByLabel>, desired: boolean): Promise<void> {
    const checked = await locator.isChecked().catch(() => false);
    if (checked !== desired) {
      await locator.click();
    }
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }

  async fillAndSubmit(data: DeliveryFormData): Promise<void> {
    await this.fill(data);
    await this.submit();
  }

  async expectValidationErrors(): Promise<void> {
    await expect(this.formErrors.first()).toBeVisible({ timeout: 5000 });
  }

  async expectSuccessRedirect(): Promise<void> {
    await this.page.waitForURL(/\/courier\/deliveries\/[a-zA-Z0-9-]+|\/courier\/deliveries/, { timeout: 15000 });
  }
}
