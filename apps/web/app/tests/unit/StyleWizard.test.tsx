import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { StyleWizard } from '~/components/landing-builder/StyleWizard';

const baseSettings = {
  brandColor: '#10b981',
  buttonStyle: 'rounded' as const,
  fontFamily: 'system' as const,
  darkMode: false,
};

describe('StyleWizard', () => {
  it('renders all main sections', () => {
    render(
      <StyleWizard
        value={baseSettings}
        onChange={vi.fn()}
      />
    );

    expect(screen.getByText('ব্র্যান্ড কালার')).toBeInTheDocument();
    expect(screen.getByText('বাটন স্টাইল')).toBeInTheDocument();
    expect(screen.getByText('ফন্ট স্টাইল')).toBeInTheDocument();
    expect(screen.getByText('থিম')).toBeInTheDocument();
  });

  it('calls onChange when color is selected', () => {
    const onChange = vi.fn();
    render(<StyleWizard value={baseSettings} onChange={onChange} />);

    const colorButton = screen.getAllByTitle('এমারেল্ড')[0];
    fireEvent.click(colorButton);

    expect(onChange).toHaveBeenCalled();
  });

  it('updates button style when selecting', () => {
    const onChange = vi.fn();
    render(<StyleWizard value={baseSettings} onChange={onChange} />);

    fireEvent.click(screen.getByText('শার্প'));

    expect(onChange).toHaveBeenCalledWith({
      ...baseSettings,
      buttonStyle: 'sharp',
    });
  });

  it('updates font family when selecting', () => {
    const onChange = vi.fn();
    render(<StyleWizard value={baseSettings} onChange={onChange} />);

    fireEvent.click(screen.getByText('সেরিফ'));

    expect(onChange).toHaveBeenCalledWith({
      ...baseSettings,
      fontFamily: 'serif',
    });
  });

  it('toggles dark mode', () => {
    const onChange = vi.fn();
    render(<StyleWizard value={baseSettings} onChange={onChange} />);

    const themeSection = screen.getByText('থিম').closest('div');
    const buttons = themeSection?.querySelectorAll('button');
    const toggleButton = buttons?.[0];
    if (!toggleButton) {
      throw new Error('Toggle button not found');
    }
    fireEvent.click(toggleButton);

    expect(onChange).toHaveBeenCalledWith({
      ...baseSettings,
      darkMode: true,
    });
  });

  it('renders compact mode', () => {
    render(
      <StyleWizard
        value={baseSettings}
        onChange={vi.fn()}
        compact
      />
    );

    expect(screen.getByText('ব্র্যান্ড কালার')).toBeInTheDocument();
    expect(screen.getByText('বাটন স্টাইল')).toBeInTheDocument();
    expect(screen.getByText('ফন্ট')).toBeInTheDocument();
  });
});
