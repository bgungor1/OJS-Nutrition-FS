import * as React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/test-utils';
import { ReviewFormModal } from './review-form-modal';
import * as reviewActions from '@/lib/actions/review';
import type { ApiReview } from '@/types';

vi.mock('@/lib/actions/review', () => ({
  submitReviewAction: vi.fn(),
}));

const mockCreatedReview: ApiReview = {
  id: 'rev_new',
  product_id: 'prod_1',
  reviewer_name: 'Berkant Güngör',
  rating: 4,
  is_verified: true,
  title: 'Tadı beklediğimden iyi',
  text: 'Sindirimi gayet kolay, şişkinlik yapmadı.',
  images: [],
  helpful_count: 0,
  created_at: '2026-09-17T12:00:00.000Z',
};

describe('ReviewFormModal Component', () => {
  const handleClose = vi.fn();
  const handleSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders modal with all form controls when isOpen is true', () => {
    render(
      <ReviewFormModal
        slug="whey-protein"
        isOpen={true}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Ürünü Değerlendir' })).toBeInTheDocument();
    expect(screen.getByRole('radiogroup', { name: /puan seçimi/i })).toBeInTheDocument();
    expect(screen.getByLabelText('Başlık')).toBeInTheDocument();
    expect(screen.getByLabelText('Yorumunuz')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Değerlendirmeyi Gönder' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Vazgeç' })).toBeInTheDocument();
  });

  it('calls onClose when clicking Vazgeç button', async () => {
    const { user } = render(
      <ReviewFormModal
        slug="whey-protein"
        isOpen={true}
        onClose={handleClose}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Vazgeç' }));
    expect(handleClose).toHaveBeenCalled();
  });

  it('allows changing star rating, filling inputs and submitting successfully', async () => {
    vi.mocked(reviewActions.submitReviewAction).mockResolvedValueOnce({
      success: true,
      message: 'Değerlendirmeniz başarıyla iletildi.',
      review: mockCreatedReview,
    });

    const { user } = render(
      <ReviewFormModal
        slug="whey-protein"
        isOpen={true}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />,
    );

    const fourStarButton = screen.getByRole('radio', { name: '4 yıldız' });
    await user.click(fourStarButton);

    const titleInput = screen.getByLabelText('Başlık');
    const textInput = screen.getByLabelText('Yorumunuz');

    await user.type(titleInput, 'Tadı beklediğimden iyi');
    await user.type(textInput, 'Sindirimi gayet kolay, şişkinlik yapmadı.');

    const submitButton = screen.getByRole('button', { name: 'Değerlendirmeyi Gönder' });
    await user.click(submitButton);

    expect(reviewActions.submitReviewAction).toHaveBeenCalledWith(
      'whey-protein',
      null,
      expect.any(FormData),
    );

    await waitFor(() => {
      expect(handleSuccess).toHaveBeenCalledWith(mockCreatedReview);
    });
    expect(handleClose).toHaveBeenCalled();
  }, 15000);

  it('displays field errors and global error when submission fails', async () => {
    vi.mocked(reviewActions.submitReviewAction).mockResolvedValueOnce({
      success: false,
      message: 'Lütfen formdaki eksik veya hatalı alanları düzeltin.',
      fieldErrors: {
        title: 'Başlık en az 2 karakter olmalıdır',
        text: 'Değerlendirme metni en az 5 karakter olmalıdır',
      },
    });

    const { user } = render(
      <ReviewFormModal
        slug="whey-protein"
        isOpen={true}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Değerlendirmeyi Gönder' }));

    expect(await screen.findByText('Başlık en az 2 karakter olmalıdır')).toBeInTheDocument();
    expect(screen.getByText('Değerlendirme metni en az 5 karakter olmalıdır')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Lütfen formdaki eksik veya hatalı alanları düzeltin.',
    );
    expect(handleSuccess).not.toHaveBeenCalled();
    expect(handleClose).not.toHaveBeenCalled();
  }, 15000);
});

