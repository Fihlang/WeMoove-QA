@auth @regression
Feature: User Registration
  As a new user
  I want to register an account
  So that I can use the delivery management platform

  Background:
    Given I am on the registration page

  @smoke @major
  Scenario: Courier admin registers a new company account
    When I fill in the registration form with:
      | field            | value                  |
      | name             | John                   |
      | surname          | Smith                  |
      | email            | <UNIQUE_EMAIL>         |
      | password         | Test@1234!             |
      | role             | CourierAdmin           |
      | courierCompany   | SmithCouriers Pty Ltd  |
    And I submit the registration form
    Then I should be registered and redirected to the dashboard

  @major
  Scenario: Sender registers without company name
    When I fill in the registration form with:
      | field    | value          |
      | name     | Jane           |
      | surname  | Doe            |
      | email    | <UNIQUE_EMAIL> |
      | password | Test@1234!     |
      | role     | Sender         |
    And I submit the registration form
    Then I should be registered and redirected to the dashboard

  @normal
  Scenario: Registration fails with duplicate email
    When I fill in the registration form using an existing email
    And I submit the registration form
    Then I should see an error indicating the email is already registered

  @normal
  Scenario: Registration fails with weak password
    When I fill in the registration form with a password "weakpass"
    And I submit the registration form
    Then I should see a password strength error

  @normal
  Scenario: Registration fails when passwords do not match
    When I fill in the registration form with mismatched passwords
    And I submit the registration form
    Then I should see a password mismatch error

  @normal
  Scenario: CourierAdmin role shows company name field
    When I select the "CourierAdmin" role
    Then the company name field should be visible

  @normal
  Scenario: Sender role hides company name field
    When I select the "Sender" role
    Then the company name field should not be visible
