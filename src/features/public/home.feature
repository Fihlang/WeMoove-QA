@public @regression
Feature: Public Homepage
  As a potential customer
  I want to understand what FurnMovers does
  So that I can decide whether to sign up

  @smoke @normal
  Scenario: Homepage loads with correct hero heading
    Given I am an anonymous visitor
    When I visit the homepage
    Then the page should load successfully
    And the hero section should be visible
    And the heading should communicate dispute prevention value

  @normal
  Scenario: Homepage does not contain fake statistics
    Given I am on the homepage
    Then no fraudulent statistics should be present on the page

  @normal
  Scenario: CTA button navigates to registration
    Given I am on the homepage
    When I click the primary call-to-action button
    Then I should be navigated to the registration page

  @normal
  Scenario: Navigation to pricing from homepage
    Given I am on the homepage
    When I click "Pricing" in the navigation
    Then I should be on the pricing page

  @normal
  Scenario: Login link visible in navigation
    Given I am on the homepage
    Then I should see a "Log In" link in the navigation

  @normal
  Scenario: Features/How it works section is present
    Given I am on the homepage
    Then the features or how-it-works section should be visible

  @minor
  Scenario: Footer links are present
    Given I am on the homepage
    Then the footer should contain at least one navigation link

  @minor
  Scenario: Page title is SEO-relevant
    Given I am on the homepage
    Then the page title should mention dispute or delivery proof
