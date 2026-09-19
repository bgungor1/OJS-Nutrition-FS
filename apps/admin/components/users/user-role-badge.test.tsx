import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { UserRoleBadge } from './user-role-badge';

describe('UserRoleBadge', () => {
  it('renders "Yönetici" for admin role', () => {
    render(<UserRoleBadge role="admin" />);
    expect(screen.getByText('Yönetici')).toBeInTheDocument();
  });

  it('renders "Müşteri" for customer role', () => {
    render(<UserRoleBadge role="customer" />);
    expect(screen.getByText('Müşteri')).toBeInTheDocument();
  });

  it('applies admin-specific styling', () => {
    render(<UserRoleBadge role="admin" />);
    const badge = screen.getByText('Yönetici');
    expect(badge.className).toContain('violet');
  });

  it('applies customer-specific styling', () => {
    render(<UserRoleBadge role="customer" />);
    const badge = screen.getByText('Müşteri');
    expect(badge.className).toContain('sky');
  });
});
