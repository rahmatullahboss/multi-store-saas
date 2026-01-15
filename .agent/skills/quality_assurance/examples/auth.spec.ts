import { test, expect } from '@playwright/test';

// Best Practice: Use Page Object Models (POM) in real apps.
// This example is simplified for clarity but shows best practices for locators/assertions.

test.describe('Authentication Flow', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
    });

    test('should allow user to login with valid credentials', async ({ page }) => {
        // Arrange
        const email = 'test@example.com';
        const password = 'password123';

        // Act
        // Best Practice: Use user-visible locators (getByRole, getByLabel)
        await page.getByLabel('Email').fill(email);
        await page.getByLabel('Password').fill(password);
        await page.getByRole('button', { name: /sign in/i }).click();

        // Assert
        // Wait for navigation and verify URL or UI element that confirms login
        await expect(page).toHaveURL('/dashboard');
        await expect(page.getByText(`Welcome, ${email}`)).toBeVisible();
    });

    test('should show error with invalid credentials', async ({ page }) => {
        // Act
        await page.getByLabel('Email').fill('wrong@example.com');
        await page.getByLabel('Password').fill('wrongpass');
        await page.getByRole('button', { name: /sign in/i }).click();

        // Assert
        await expect(page.getByRole('alert')).toContainText(/invalid credentials/i);
    });
});
