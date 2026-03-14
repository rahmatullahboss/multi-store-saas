import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CheckoutModal } from '~/components/checkout/CheckoutModal';

// Mock useFetcher from Remix
vi.mock('react-router', () => ({
  useFetcher: () => ({
    submit: vi.fn(),
    state: 'idle',
    data: null,
  }),
}));

describe('CheckoutModal', () => {
  const mockProduct = {
    id: 1,
    name: 'টেস্ট প্রোডাক্ট',
    price: 500,
    compareAtPrice: 700,
    image: '',
    variants: [
      { id: 'v1', name: 'ছোট', price: 500 },
      { id: 'v2', name: 'বড়', price: 700 },
    ],
  };

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    product: mockProduct,
    storeId: 1,
    storeName: 'Test Store',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal when open', () => {
    render(<CheckoutModal {...defaultProps} />);

    expect(screen.getByText('অর্ডার করুন')).toBeInTheDocument();
    expect(screen.getByText('টেস্ট প্রোডাক্ট')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<CheckoutModal {...defaultProps} isOpen={false} />);

    expect(screen.queryByText('অর্ডার করুন')).not.toBeInTheDocument();
  });

  it('shows validation errors when required fields are missing', () => {
    render(<CheckoutModal {...defaultProps} />);

    // Submit without filling
    fireEvent.click(screen.getByText('অর্ডার কনফার্ম করুন'));

    expect(screen.getByText('নাম দিন')).toBeInTheDocument();
    expect(screen.getByText('ফোন নম্বর দিন')).toBeInTheDocument();
    expect(screen.getByText('ঠিকানা দিন')).toBeInTheDocument();
  });

  it('validates phone number format', () => {
    render(<CheckoutModal {...defaultProps} />);

    fireEvent.change(screen.getByPlaceholderText('সম্পূর্ণ নাম'), {
      target: { value: 'রহিম' },
    });
    fireEvent.change(screen.getByPlaceholderText('01XXXXXXXXX'), {
      target: { value: '01234' },
    });
    fireEvent.change(screen.getByPlaceholderText('বাসা/ফ্ল্যাট নম্বর, রোড, এলাকা, থানা'), {
      target: { value: 'ঢাকা' },
    });

    fireEvent.click(screen.getByText('অর্ডার কনফার্ম করুন'));

    expect(screen.getByText('সঠিক ফোন নম্বর দিন')).toBeInTheDocument();
  });

  it('renders WhatsApp button when enabled', () => {
    render(<CheckoutModal {...defaultProps} whatsappEnabled whatsappNumber="01712345678" />);

    expect(screen.getByText('WhatsApp এ অর্ডার করুন')).toBeInTheDocument();
  });

  it('renders variant buttons when variants exist', () => {
    render(<CheckoutModal {...defaultProps} />);

    expect(screen.getAllByText('ছোট').length).toBeGreaterThan(0);
    expect(screen.getAllByText('বড়').length).toBeGreaterThan(0);
  });

  it('displays shipping options', () => {
    render(<CheckoutModal {...defaultProps} />);

    // Options render inside <select>, and number formatting can vary by runtime ICU support.
    // Assert on the stable labels instead of exact currency formatting.
    expect(screen.getByRole('option', { name: /ঢাকার ভিতরে/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /ঢাকার বাইরে/i })).toBeInTheDocument();
  });
});
