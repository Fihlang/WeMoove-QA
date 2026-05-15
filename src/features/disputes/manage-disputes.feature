@dispute @regression
Feature: Dispute Management
  As a courier admin
  I want to manage delivery disputes
  So that I can resolve issues and protect the business with evidence

  Background:
    Given I am logged in as a courier admin
    And a delivered delivery exists via API

  @smoke @critical
  Scenario: Open a dispute from a delivery detail page
    Given I am on the delivery detail page
    When I click "Open Dispute"
    And I select dispute type "ItemDamaged"
    And I enter a description "The TV screen was cracked on arrival"
    And I submit the dispute
    Then the dispute should be opened
    And the delivery detail should show an open dispute

  @smoke @critical
  Scenario: Disputes list shows all open disputes
    Given a dispute has been opened via API
    When I navigate to the disputes page
    Then I should see at least one dispute in the list

  @critical
  Scenario: Filter disputes by status
    Given multiple disputes exist in various statuses
    When I filter disputes by "Open"
    Then I should only see open disputes

  @critical
  Scenario: Dispute row shows evidence indicators
    Given a dispute has been opened on a delivery with OTP and photos
    When I view the dispute in the disputes list
    Then evidence icons should indicate what proof is available

  @major
  Scenario: Resolve a dispute with a resolution
    Given an open dispute is selected
    When I open the resolution drawer
    And I select resolution "DeliveredWithDamage"
    And I enter resolution notes "Driver confirmed damage occurred in transit"
    And I save the resolution
    Then the dispute status should change to "Resolved"

  @major
  Scenario: Dispute header shows correct open count
    Given there are 3 open disputes
    When I am on the disputes page
    Then the open count badge should show "3"

  @normal
  Scenario: Open dispute type "NotDelivered" on a pending delivery
    Given I am on the delivery detail page
    When I click "Open Dispute"
    And I select dispute type "NotDelivered"
    And I enter a description "Package never arrived"
    And I submit the dispute
    Then the dispute should be created with type "NotDelivered"

  @normal
  Scenario Outline: All dispute types can be submitted
    Given I am on the delivery detail page
    When I open a dispute with type "<disputeType>"
    Then the dispute should be created successfully

    Examples:
      | disputeType    |
      | NotDelivered   |
      | ItemDamaged    |
      | ItemMissing    |
      | WrongAddress   |
      | LateDelivery   |
      | Other          |

  @normal
  Scenario: Dispute without any evidence shows warning
    Given a dispute is opened on a delivery with no photos or OTP
    When I view the dispute in the disputes list
    Then I should see a "no evidence" warning or missing indicator

  @minor
  Scenario: Courier admin can search disputes by tracking number
    Given a dispute exists for a known tracking number
    When I search for the tracking number on the disputes page
    Then the matching dispute should appear in results
