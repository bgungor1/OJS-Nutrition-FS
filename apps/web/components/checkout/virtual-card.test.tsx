import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { VirtualCard } from './virtual-card';

describe('VirtualCard', () => {
  it('renders default placeholders when no props are passed', () => {
    render(<VirtualCard />);

    expect(screen.getByText('•••• •••• •••• ••••')).toBeInTheDocument();
    expect(screen.getByText('AD SOYAD')).toBeInTheDocument();
    expect(screen.getByText('••/••')).toBeInTheDocument();
  });

  it('renders cardholder name and formatted card number', () => {
    render(
      <VirtualCard
        cardHolder="Mert Yilmaz"
        cardNumber="4532015112830366"
        expireMonth="10"
        expireYear="28"
      />,
    );

    expect(screen.getByText('MERT YILMAZ')).toBeInTheDocument();
    expect(screen.getByText('4532 0151 1283 0366')).toBeInTheDocument();
    expect(screen.getByText('10/28')).toBeInTheDocument();
    expect(screen.getByText('VISA')).toBeInTheDocument();
  });

  it('detects and displays Mastercard and Troy brands', () => {
    const { rerender } = render(<VirtualCard cardNumber="5425233430109903" />);
    expect(screen.getByText('Mastercard')).toBeInTheDocument();

    rerender(<VirtualCard cardNumber="9792000000000000" />);
    expect(screen.getByText('TROY')).toBeInTheDocument();
  });
});
