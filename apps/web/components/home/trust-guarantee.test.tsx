import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';
import { TrustGuarantee } from './trust-guarantee';

describe('TrustGuarantee Component', () => {
  it('renders default trust guarantees and consistent store metrics', () => {
    render(<TrustGuarantee />);

    expect(screen.getByText('(198.000+ Değerlendirme)')).toBeInTheDocument();
    expect(screen.getByText('200K+')).toBeInTheDocument();
    expect(screen.getByText('Mutlu Müşteri')).toBeInTheDocument();
    expect(screen.getByText('%99')).toBeInTheDocument();
    expect(screen.getByText('Memnuniyet Oranı')).toBeInTheDocument();

    expect(screen.getByText('LABORATUVAR TESTLİ ÜRÜNLER')).toBeInTheDocument();
    expect(screen.getByText('AYNI GÜN & ÜCRETSİZ KARGO')).toBeInTheDocument();
    expect(screen.getByText('MEMNUNİYET GARANTİSİ')).toBeInTheDocument();
  });

  it('renders custom store metrics when passed via props', () => {
    render(
      <TrustGuarantee
        metrics={{
          totalReviewsDisplay: '250.000+',
          activeCustomersDisplay: '300K+',
          satisfactionRateDisplay: '%100',
        }}
      />,
    );

    expect(screen.getByText('(250.000+ Değerlendirme)')).toBeInTheDocument();
    expect(screen.getByText('300K+')).toBeInTheDocument();
    expect(screen.getByText('%100')).toBeInTheDocument();
  });
});
