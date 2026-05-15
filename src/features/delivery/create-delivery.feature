@delivery @regression
Feature: Create Delivery
  As a courier admin or dispatcher
  I want to create new delivery records
  So that drivers can collect and deliver items with full evidence capture

  Background:
    Given I am logged in as a courier admin

  @smoke @critical
  Scenario: Create a basic delivery with all required fields
    Given I navigate to the create delivery page
    When I fill in the sender details:
      | field        | value                     |
      | name         | Thabo Nkosi               |
      | phone        | 0821234567                |
      | email        | thabo@example.com         |
      | company      | Nkosi Retail              |
    And I fill in the receiver details:
      | field  | value                  |
      | name   | Sarah Johnson          |
      | phone  | 0731234567             |
      | email  | sarah@example.com      |
    And I fill in the addresses:
      | field          | value                               |
      | pickupAddress  | 10 Long Street, Cape Town           |
      | dropoffAddress | 25 Voortrekker Road, Bellville      |
    And I fill in the item details:
      | field       | value                    |
      | description | Samsung 65" QLED TV      |
      | value       | 24999                    |
    And I enable OTP verification
    And I enable pickup photos
    And I enable delivery photos
    And I submit the delivery form
    Then a new delivery should be created
    And I should see the delivery details page
    And the delivery status should be "Pending"

  @critical
  Scenario: Dispatcher can also create a delivery
    Given I am logged in as a dispatcher
    And I navigate to the create delivery page
    When I fill in a complete delivery form
    And I submit the delivery form
    Then a new delivery should be created

  @normal
  Scenario: Form validation rejects empty required fields
    Given I navigate to the create delivery page
    When I submit the delivery form without filling required fields
    Then I should see validation errors for required fields

  @normal
  Scenario: Form validation rejects invalid phone number
    Given I navigate to the create delivery page
    When I fill in the sender details with an invalid phone "123"
    And I submit the delivery form
    Then I should see a phone number validation error

  @normal
  Scenario: Form validation rejects invalid email
    Given I navigate to the create delivery page
    When I fill in the sender details with email "not-an-email"
    And I submit the delivery form
    Then I should see an email validation error

  @normal
  Scenario: Driver role cannot access create delivery page
    Given I am logged in as a driver
    When I navigate to the create delivery page
    Then I should be redirected away from the page
    Or I should see an access denied message

  @normal
  Scenario: Delivery created with item verification requirement
    Given I navigate to the create delivery page
    When I fill in a complete delivery form
    And I enable item verification
    And I submit the delivery form
    Then the delivery should require item verification
