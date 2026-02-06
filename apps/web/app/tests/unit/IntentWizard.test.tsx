import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { IntentWizard } from '~/components/landing-builder/IntentWizard';

describe('IntentWizard', () => {
  it('renders step 1 by default', () => {
    render(
      <IntentWizard
        existingProducts={[]}
        onComplete={vi.fn()}
      />
    );

    expect(screen.getByText('আপনি কী বিক্রি করতে চান?')).toBeInTheDocument();
    expect(screen.getByText('একটি প্রোডাক্ট')).toBeInTheDocument();
    expect(screen.getByText('একাধিক প্রোডাক্ট')).toBeInTheDocument();
  });

  it('moves to step 2 when clicking Next', () => {
    render(
      <IntentWizard
        existingProducts={[]}
        onComplete={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('পরবর্তী'));

    expect(screen.getByText('দ্রুত প্রোডাক্ট তৈরি করুন:')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('যেমন: প্রিমিয়াম গ্রিন টি')).toBeInTheDocument();
  });

  it('requires product name and price before moving to step 3', () => {
    render(
      <IntentWizard
        existingProducts={[]}
        onComplete={vi.fn()}
      />
    );

    // Step 1 -> Step 2
    fireEvent.click(screen.getByText('পরবর্তী'));

    // Next should be disabled without product info
    const nextButton = screen.getByText('পরবর্তী');
    expect(nextButton).toBeDisabled();

    // Fill product info
    fireEvent.change(screen.getByPlaceholderText('যেমন: প্রিমিয়াম গ্রিন টি'), {
      target: { value: 'টেস্ট প্রোডাক্ট' },
    });
    fireEvent.change(screen.getByPlaceholderText('৫৫০'), {
      target: { value: '500' },
    });

    // Next should be enabled
    expect(screen.getByText('পরবর্তী')).not.toBeDisabled();
  });

  it('calls onComplete with intent and product when finishing', () => {
    const onComplete = vi.fn();

    render(
      <IntentWizard
        existingProducts={[]}
        onComplete={onComplete}
      />
    );

    // Step 1 -> Step 2
    fireEvent.click(screen.getByText('পরবর্তী'));

    // Fill product info
    fireEvent.change(screen.getByPlaceholderText('যেমন: প্রিমিয়াম গ্রিন টি'), {
      target: { value: 'টেস্ট প্রোডাক্ট' },
    });
    fireEvent.change(screen.getByPlaceholderText('৫৫০'), {
      target: { value: '500' },
    });

    // Step 2 -> Step 3 (Template Selection)
    fireEvent.click(screen.getByText('পরবর্তী'));

    // Step 3 shows template selection
    expect(screen.getByText('আপনার জন্য সেরা টেমপ্লেট')).toBeInTheDocument();

    // Finish wizard
    fireEvent.click(screen.getByText('ল্যান্ডিং পেইজ তৈরি করুন'));

    expect(onComplete).toHaveBeenCalledOnce();
    const payload = onComplete.mock.calls[0][0];

    expect(payload.intent).toMatchObject({
      productType: 'single',
      goal: 'direct_sales',
      trafficSource: 'facebook',
    });
    expect(payload.product?.name).toBe('টেস্ট প্রোডাক্ট');
    expect(payload.product?.price).toBe(500);
    expect(payload.templateId).toBeTruthy();
  });

  it('allows selecting existing product', () => {
    const onComplete = vi.fn();
    const products = [
      { id: 1, title: 'প্রোডাক্ট A', price: 300, imageUrl: '' },
      { id: 2, title: 'প্রোডাক্ট B', price: 500, imageUrl: '' },
    ];

    render(
      <IntentWizard
        existingProducts={products}
        onComplete={onComplete}
      />
    );

    // Step 1 -> Step 2
    fireEvent.click(screen.getByText('পরবর্তী'));

    // Select product
    fireEvent.click(screen.getByText('প্রোডাক্ট A'));

    // Step 2 -> Step 3 (Template Selection)
    fireEvent.click(screen.getByText('পরবর্তী'));

    // Verify template step
    expect(screen.getByText('আপনার জন্য সেরা টেমপ্লেট')).toBeInTheDocument();

    // Finish wizard
    fireEvent.click(screen.getByText('ল্যান্ডিং পেইজ তৈরি করুন'));

    expect(onComplete).toHaveBeenCalledOnce();
    const payload = onComplete.mock.calls[0][0];

    expect(payload.productId).toBe(1);
    expect(payload.product).toBeNull();
  });
});
