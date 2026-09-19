import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test/test-utils';
import { MediaUploader } from './media-uploader';
import * as productActions from '@/app/(dashboard)/products/actions';

vi.mock('@/app/(dashboard)/products/actions', () => ({
  uploadMediaAction: vi.fn(),
}));

describe('components/products/media-uploader', () => {
  it('renders upload prompt when no value is provided', () => {
    render(<MediaUploader onChange={vi.fn()} />);

    expect(
      screen.getByText('Görsel Seçin veya Sürükleyin'),
    ).toBeInTheDocument();
  });

  it('renders image preview and change button when value is provided', () => {
    render(<MediaUploader value="media/products/whey.jpg" onChange={vi.fn()} />);

    const img = screen.getByAltText('Varyant Görseli');
    expect(img).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /değiştir/i })).toBeInTheDocument();
  });

  it('rejects SVG file uploads with security error message', async () => {
    render(<MediaUploader onChange={vi.fn()} />);

    const input = screen.getByTestId('media-file-input');
    const svgFile = new File(['<svg></svg>'], 'icon.svg', { type: 'image/svg+xml' });

    fireEvent.change(input, { target: { files: [svgFile] } });

    await waitFor(() => {
      expect(
        screen.getByText('Güvenlik gerekçesiyle SVG dosyaları kabul edilmemektedir.'),
      ).toBeInTheDocument();
    });
  });

  it('uploads valid image file and calls onChange with returned photo_src', async () => {
    const mockOnChange = vi.fn();
    vi.mocked(productActions.uploadMediaAction).mockResolvedValueOnce({
      photo_src: 'media/uploads/photo.jpg',
      url: 'http://localhost/media/uploads/photo.jpg',
      filename: 'photo.jpg',
      size: 1024,
      mimetype: 'image/jpeg',
    });

    render(<MediaUploader onChange={mockOnChange} />);

    const input = screen.getByTestId('media-file-input');
    const validFile = new File(['dummy content'], 'photo.jpg', { type: 'image/jpeg' });

    fireEvent.change(input, { target: { files: [validFile] } });

    await waitFor(() => {
      expect(productActions.uploadMediaAction).toHaveBeenCalled();
      expect(mockOnChange).toHaveBeenCalledWith('media/uploads/photo.jpg');
    });
  });
});
