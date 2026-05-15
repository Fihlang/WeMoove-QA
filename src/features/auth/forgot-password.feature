@auth @regression
Feature: Forgot Password
  As a user who has forgotten their password
  I want to request a password reset
  So that I can regain access to my account

  Background:
    Given I am on the forgot password page

  @smoke @major
  Scenario: User submits forgot password request with valid email
    When I enter a registered email address
    And I submit the forgot password form
    Then I should see a success message about the reset link

  @normal
  Scenario: Forgot password with unregistered email still shows success
    When I enter "nooneatthisaddress@example.invalid"
    And I submit the forgot password form
    Then I should see a success message
    And the response should not reveal whether the email exists

  @normal
  Scenario: Forgot password form validates email format
    When I enter "notanemail"
    And I submit the forgot password form
    Then I should see an email format validation error

  @normal
  Scenario: Forgot password form requires email
    When I submit the forgot password form without entering an email
    Then I should see a required field error

  @normal
  Scenario: User can navigate back to login
    When I click the "Back to login" link
    Then I should be on the login page
