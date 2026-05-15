@evidence @regression
Feature: OTP Verification
  As a courier admin
  I want deliveries to require OTP confirmation
  So that I have proof the receiver accepted the goods

  Background:
    Given I am logged in as a courier admin
    And a delivery requiring OTP has been created via API

  @smoke @critical
  Scenario: Delivery requiring OTP shows OTP pending status
    Given I am on the delivery detail page
    When I look at the evidence section
    Then the OTP status should show as pending or not yet verified

  @critical
  Scenario: Delivery with completed OTP shows verified status
    Given a delivery where OTP has been confirmed via API
    When I am on the delivery detail page
    Then the OTP status should show as verified

  @major
  Scenario: Delivery cannot be marked delivered without OTP when required
    Given the delivery requires OTP verification
    And OTP has not been confirmed
    When I attempt to update the status to "Delivered"
    Then I should see a message that OTP is required first

  @normal
  Scenario: OTP evidence is listed in the event log
    Given a delivery where OTP has been confirmed
    When I am on the delivery detail page
    Then the event log should contain an OTP confirmation entry

  @normal
  Scenario: Delivery not requiring OTP shows OTP as not applicable
    Given a delivery was created without OTP requirement
    When I am on the delivery detail page
    Then the OTP section should show as "Not Required" or be absent
