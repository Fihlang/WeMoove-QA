@auth @regression
Feature: User Login
  As a registered user
  I want to log in to the platform
  So that I can access role-appropriate functionality

  Background:
    Given I am on the login page

  @smoke @critical
  Scenario: Courier admin logs in successfully
    When I enter email "<COURIER_ADMIN_EMAIL>" and password "<COURIER_ADMIN_PASSWORD>"
    And I submit the login form
    Then I should be redirected to the courier dashboard
    And I should see the main navigation sidebar

  @smoke @critical
  Scenario: Dispatcher logs in and sees correct dashboard
    When I enter valid dispatcher credentials
    And I submit the login form
    Then I should be redirected to the courier dashboard

  @smoke @critical
  Scenario: Driver logs in and sees driver portal
    When I enter valid driver credentials
    And I submit the login form
    Then I should be redirected to the driver portal

  @normal
  Scenario: Sender logs in and sees sender portal
    When I enter valid sender credentials
    And I submit the login form
    Then I should be redirected to the sender portal

  @critical
  Scenario: Login fails with wrong password
    When I enter email "<COURIER_ADMIN_EMAIL>" and password "WrongPassword123!"
    And I submit the login form
    Then I should see a login error message
    And I should remain on the login page

  @normal
  Scenario: Login fails with unregistered email
    When I enter email "nobody@doesnotexist.invalid" and password "SomePass123!"
    And I submit the login form
    Then I should see a login error message

  @normal
  Scenario: Login fails with invalid email format
    When I enter email "not-an-email" and password "SomePass123!"
    And I submit the login form
    Then I should see an email validation error

  @normal
  Scenario: Login fails with empty fields
    When I submit the login form without filling any fields
    Then I should see validation errors for required fields

  @normal
  Scenario: User can navigate to forgot password from login
    When I click the "Forgot password?" link
    Then I should be on the forgot password page

  @normal
  Scenario: User can navigate to register from login
    When I click the "Register" link
    Then I should be on the registration page
