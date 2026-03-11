## ADDED Requirements

### Requirement: Product cards display average rating

Product listing cards SHALL display the average star rating and review count.

#### Scenario: Display rating on product card

- **WHEN** product has 10 approved reviews with average 4.5 stars
- **THEN** product card displays: ★ 4.5 (10)
- **AND** clicking the rating navigates to reviews section on product page

### Requirement: Products without reviews show no rating

Products with no approved reviews SHALL not display any rating on cards.

#### Scenario: No rating display

- **WHEN** product has 0 approved reviews
- **THEN** product card shows no rating stars

### Requirement: Rating updates in real-time

When a new review is approved, the aggregate rating SHALL update immediately.

#### Scenario: Rating updates after approval

- **WHEN** merchant approves a 5-star review for product with 4.0 average
- **THEN** product's average rating recalculates
- **AND** product card and detail page reflect new average

### Requirement: Display distribution chart

Product detail page SHALL show a rating distribution chart (how many 5-star, 4-star, etc. reviews).

#### Scenario: Display distribution

- **WHEN** product has reviews
- **THEN** system displays horizontal bar chart showing count for each star level
