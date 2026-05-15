@public @regression
Feature: Pricing Page
  As a potential customer
  I want to understand the pricing structure
  So that I can choose the right plan for my business

  @smoke @normal
  Scenario: Pricing page loads and shows plan cards
    Given I am an anonymous visitor
    When I navigate to the pricing page
    Then the pricing page should load
    And I should see at least 2 pricing plans

  @normal
  Scenario: Starter plan is available and shows R0 or free
    Given I am on the pricing page
    Then I should see a starter or free plan
    And it should clearly indicate no cost to start

  @normal
  Scenario: Each plan shows a call-to-action button
    Given I am on the pricing page
    Then each plan card should have a "Get Started" or similar button

  @normal
  Scenario: Clicking a plan CTA navigates to registration
    Given I am on the pricing page
    When I click the CTA on the starter plan
    Then I should be navigated to the registration page

  @normal
  Scenario: FAQ section is present on pricing page
    Given I am on the pricing page
    Then a frequently asked questions section should be visible

  @minor
  Scenario: FAQ items can be expanded
    Given I am on the pricing page
    When I click on the first FAQ item
    Then the FAQ item should expand to reveal the answer
