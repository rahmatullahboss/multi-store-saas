## ADDED Requirements

### Requirement: Merchant can view all reviews for their products

The merchant SHALL be able to view a list of all reviews for their products in the admin dashboard, including pending, approved, and rejected reviews.

#### Scenario: View review list

- **WHEN** merchant navigates to Products > Reviews
- **THEN** system displays list of all reviews with product name, customer name, rating, date, and status
- **AND** supports filtering by status (All, Pending, Approved, Rejected)

### Requirement: Merchant can approve reviews

The merchant SHALL be able to approve pending reviews, making them visible on the storefront.

#### Scenario: Approve review

- **WHEN** merchant clicks "Approve" on a pending review
- **THEN** review status changes to "approved"
- **AND** review becomes visible on storefront

### Requirement: Merchant can reject reviews

The merchant SHALL be able to reject reviews, hiding them from the storefront.

#### Scenario: Reject review

- **WHEN** merchant clicks "Reject" on a pending review
- **THEN** review status changes to "rejected"
- **AND** review is hidden from storefront

### Requirement: Merchant can delete reviews

The merchant SHALL be able to permanently delete reviews.

#### Scenario: Delete review

- **WHEN** merchant clicks "Delete" on any review
- **THEN** system shows confirmation dialog
- **AND** upon confirmation, review is permanently deleted from database

### Requirement: Merchant can reply to reviews

The merchant SHALL be able to reply to reviews, which will be displayed publicly with the review.

#### Scenario: Reply to review

- **WHEN** merchant enters a reply and clicks "Submit Reply"
- **THEN** reply is saved and displayed below the customer review
