@evidence @regression
Feature: Pickup and Delivery Photo Evidence
  As a courier admin
  I want to see photo evidence captured at pickup and delivery
  So that I can defend against item damage or missing item disputes

  Background:
    Given I am logged in as a courier admin
    And a delivery requiring pickup photos has been created via API

  @smoke @critical
  Scenario: Delivery requiring pickup photos shows pending photo evidence
    Given I am on the delivery detail page
    When I look at the evidence section
    Then pickup photo evidence should show as pending

  @critical
  Scenario: Evidence section shows all required evidence types
    Given a delivery with all evidence requirements enabled
    When I am on the delivery detail page
    Then the evidence section should list:
      | evidence type    | status   |
      | Pickup Photos    | pending  |
      | Delivery Photos  | pending  |
      | OTP Verification | pending  |

  @major
  Scenario: Completed pickup evidence shows as captured
    Given a delivery where the driver has submitted pickup photos via API
    When I am on the delivery detail page
    Then pickup photos should show as captured or present
    And a count or thumbnail should be visible

  @major
  Scenario: Dispute risk icon shown for delivery missing evidence
    Given a delivery that is in transit with no photos captured
    When I view the delivery in the deliveries list
    Then a warning or risk indicator should be visible on the row

  @normal
  Scenario: Evidence panel is not shown for deliveries not requiring evidence
    Given a delivery was created without any evidence requirements
    When I am on the delivery detail page
    Then no mandatory evidence panel should be shown
