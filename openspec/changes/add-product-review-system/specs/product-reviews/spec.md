## ADDED Requirements

### Requirement: Authenticated customer can submit a review

A customer who has purchased and received a product SHALL be able to submit a rating (1-5 stars) and optional text comment for that product.

#### Scenario: Submit review for purchased product

- **WHEN** customer visits product page after order delivery
- **THEN** system displays "Write a Review" button

#### Scenario: Submit review with rating and comment

- **WHEN** customer clicks "Write a Review", selects 5 stars, enters "Great product!", and clicks Submit
- **THEN** system saves the review with status "pending" and displays success message

#### Scenario: Submit review without rating

- **WHEN** customer clicks Submit without selecting a star rating
- **THEN** system displays validation error "Please select a rating"

#### Scenario: Submit review without purchasing

- **WHEN** customer who has not purchased the product tries to submit review
- **THEN** system displays "You must purchase this product to leave a review"

### Requirement: Review submission is rate-limited

The system SHALL prevent spam by limiting one review per customer per product.

#### Scenario: Submit duplicate review

- **WHEN** customer tries to submit a second review for the same product
- **THEN** system displays "You have already reviewed this product"

### Requirement: Reviews are moderated by default

All submitted reviews SHALL have status "pending" and require merchant approval before being displayed publicly.

#### Scenario: Review pending approval

- **WHEN** customer submits a review
- **THEN** review status is set to "pending"
- **AND** review is NOT visible on storefront until approved

### Requirement: Review character limits

Text reviews SHALL have minimum 10 characters and maximum 1000 characters.

#### Scenario: Submit too short review

- **WHEN** customer enters "Good" (4 chars) and tries to submit
- **THEN** system displays "Review must be at least 10 characters"

#### Scenario: Submit too long review

- **WHEN** customer enters more than 1000 characters
- **THEN** system displays "Review cannot exceed 1000 characters"
