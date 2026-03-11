## ADDED Requirements

### Requirement: Product page displays approved reviews

The product detail page SHALL display all approved reviews for that product.

#### Scenario: View reviews on product page

- **WHEN** customer visits product detail page with approved reviews
- **THEN** system displays list of reviews sorted by most recent
- **AND** each review shows: customer name (or "Verified Purchase"), star rating, date, review text, merchant reply (if any)

#### Scenario: No reviews yet

- **WHEN** customer visits product detail page with no reviews
- **THEN** system displays "No reviews yet. Be the first to review!"

### Requirement: Reviews are paginated

The review list SHALL be paginated with 10 reviews per page.

#### Scenario: Navigate to next page

- **WHEN** customer clicks "Next" or page number 2
- **THEN** system displays reviews 11-20

### Requirement: Reviews can be sorted

Customers SHALL be able to sort reviews by Most Recent, Highest Rated, or Lowest Rated.

#### Scenario: Sort by highest rated

- **WHEN** customer selects "Highest Rated" from sort dropdown
- **THEN** reviews are reordered with 5-star reviews first

### Requirement: Display review count

The product page SHALL display the total number of approved reviews.

#### Scenario: Display review count

- **WHEN** product has 15 approved reviews
- **THEN** system displays "15 Reviews" on the product page
