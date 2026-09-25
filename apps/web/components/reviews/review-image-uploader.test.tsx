import * as React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/test-utils';
import { ReviewImageUploader } from './review-image-uploader';
import * as reviewActions from '@/lib/actions/review';

vi.mock('@/lib/actions/review', () => ({
  uploadReviewImageAction: vi.fn(),
}));

describe('ReviewImageUploader Component', () => {
  const handleChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders upload dropzone when images list is empty', () => {
    render(
      <ReviewImageUploader
        slug="whey-protein"
        images={[]}
        onChange={handleChange}
      />,
    );

    expect(screen.getByText('Görsel Seçin veya Sürükleyin')).toBeInTheDocument();
    expect(screen.getByText(/JPEG, PNG, WEBP/i)).toBeInTheDocument();
  });

  it('renders thumbnail previews and remove button when images exist', async () => {
    const { user } = render(
      <ReviewImageUploader
        slug="whey-protein"
        images={['https://example.com/photo1.jpg', 'media/uploads/photo2.jpg']}
        onChange={handleChange}
      />,
    );

    const removeButtons = screen.getAllByRole('button', { name: /görseli kaldır/i });
    expect(removeButtons).toHaveLength(2);

    await user.click(removeButtons[0]);
    expect(handleChange).toHaveBeenCalledWith(['media/uploads/photo2.jpg']);
  });

  it('shows error when SVG file is chosen', async () => {
    render(
      <ReviewImageUploader
        slug="whey-protein"
        images={[]}
        onChange={handleChange}
      />,
    );

    const fileInput = screen.getByTestId('review-image-file-input');
    const svgFile = new File(['<svg></svg>'], 'badge.svg', { type: 'image/svg+xml' });

    fireEvent.change(fileInput, { target: { files: [svgFile] } });

    await waitFor(() => {
      expect(screen.getByText('Güvenlik gerekçesiyle SVG dosyaları kabul edilmemektedir.')).toBeInTheDocument();
    });
    expect(reviewActions.uploadReviewImageAction).not.toHaveBeenCalled();
  });

  it('shows error when file size exceeds 5MB', async () => {
    const { user } = render(
      <ReviewImageUploader
        slug="whey-protein"
        images={[]}
        onChange={handleChange}
      />,
    );

    const fileInput = screen.getByTestId('review-image-file-input');
    const largeFile = new File([new ArrayBuffer(6 * 1024 * 1024)], 'large.jpg', {
      type: 'image/jpeg',
    });

    await user.upload(fileInput, largeFile);

    expect(screen.getByText('Görsel boyutu en fazla 5MB olabilir.')).toBeInTheDocument();
    expect(reviewActions.uploadReviewImageAction).not.toHaveBeenCalled();
  });

  it('uploads valid image and calls onChange with new image URL', async () => {
    vi.mocked(reviewActions.uploadReviewImageAction).mockResolvedValueOnce({
      success: true,
      url: 'http://localhost:3000/media/uploads/uploaded.jpg',
      photo_src: 'media/uploads/uploaded.jpg',
    });

    const { user } = render(
      <ReviewImageUploader
        slug="whey-protein"
        images={[]}
        onChange={handleChange}
      />,
    );

    const fileInput = screen.getByTestId('review-image-file-input');
    const validFile = new File([new ArrayBuffer(1024)], 'product.jpg', {
      type: 'image/jpeg',
    });

    await user.upload(fileInput, validFile);

    await waitFor(() => {
      expect(reviewActions.uploadReviewImageAction).toHaveBeenCalledWith(
        'whey-protein',
        expect.any(FormData),
      );
      expect(handleChange).toHaveBeenCalledWith([
        'http://localhost:3000/media/uploads/uploaded.jpg',
      ]);
    });
  });
});
