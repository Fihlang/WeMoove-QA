@delivery @regression
Feature: Delivery Lifecycle
  As a courier admin
  I want to manage the full delivery lifecycle
  So that each delivery is tracked from creation to verified completion

  Background:
    Given I am logged in as a courier admin
    And a delivery has been created via API

  @smoke @critical
  Scenario: Assign a driver to a delivery
    Given I am on the delivery detail page
    When I click "Assign Driver"
    And I select an available driver
    And I confirm the assignment
    Then the delivery should show the assigned driver
    And the delivery status should be "Assigned"

  @smoke @critical
  Scenario: View delivery in list with correct status
    Given a delivery exists with tracking number stored in context
    When I navigate to the deliveries list
    Then I should see the delivery in the list
    And its status badge should match "Pending"

  @critical
  Scenario: Delivery status progresses through lifecycle
    Given I am on the delivery detail page
    And the delivery is assigned to a driver
    When the driver picks up the delivery
    Then the delivery status should be "PickedUp"
    When the driver marks the delivery as in transit
    Then the delivery status should be "InTransit"

  @critical
  Scenario: Delivery list filters by status
    Given multiple deliveries exist in various statuses
    When I filter the deliveries list by "Pending"
    Then I should only see pending deliveries

  @major
  Scenario: Search for a delivery by tracking number
    Given I know the tracking number of a created delivery
    When I search for the tracking number in the deliveries list
    Then I should see exactly one result matching the tracking number

  @major
  Scenario: Search for a delivery by reference number
    Given I know the reference number of a created delivery
    When I search for the reference number
    Then I should see the matching delivery

  @normal
  Scenario: Empty state shown when no deliveries match filter
    When I filter deliveries by a status that has no results
    Then I should see an empty state message

  @normal
  Scenario: Delivery detail page shows full event log
    Given a delivery has been through several status changes
    When I am on the delivery detail page
    Then the event log should contain at least one entry
    And each entry should show a timestamp

  @normal
  Scenario: Generate Proof of Delivery document
    Given the delivery has been marked as delivered
    When I click "Generate POD"
    Then a PDF should be generated or a link should appear
