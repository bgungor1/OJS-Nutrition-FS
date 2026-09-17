import { describe, it, expect, vi, beforeEach } from 'vitest';
import { submitContactAction } from '@/app/(shop)/contact/actions';
import { submitContact } from '@/lib/api/contact';
import { ApiError } from '@/lib/api-client';

vi.mock('@/lib/api/contact', () => ({
  submitContact: vi.fn(),
}));

function createValidContactFormData(): FormData {
  const formData = new FormData();
  formData.set('name', 'Ahmet Yılmaz');
  formData.set('email', 'ahmet@example.com');
  formData.set('message', 'Siparişimin durumu hakkında bilgi alabilir miyim?');
  return formData;
}

describe('submitContactAction', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns field errors when form fields fail validation', async () => {
    const formData = new FormData();
    formData.set('name', 'A');
    formData.set('email', 'invalid-email');
    formData.set('message', 'Kısa');

    const result = await submitContactAction(null, formData);

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/eksik veya hatalı/i);
    expect(result.errors?.name).toBeDefined();
    expect(result.errors?.email).toBeDefined();
    expect(result.errors?.message).toBeDefined();
    expect(submitContact).not.toHaveBeenCalled();
  });

  it('successfully submits valid contact message', async () => {
    vi.mocked(submitContact).mockResolvedValueOnce({
      id: 'contact_msg_1',
      message: 'Mesajınız alındı',
    });

    const formData = createValidContactFormData();
    const result = await submitContactAction(null, formData);

    expect(result.success).toBe(true);
    expect(result.message).toMatch(/başarıyla iletildi/i);
    expect(submitContact).toHaveBeenCalledWith({
      name: 'Ahmet Yılmaz',
      email: 'ahmet@example.com',
      message: 'Siparişimin durumu hakkında bilgi alabilir miyim?',
    });
  });

  it('returns rate limit message when backend responds with 429 Too Many Requests', async () => {
    vi.mocked(submitContact).mockRejectedValueOnce(
      new ApiError('Too Many Requests', 429),
    );

    const formData = createValidContactFormData();
    const result = await submitContactAction(null, formData);

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/çok fazla istek gönderdiniz/i);
  });

  it('returns API error message when standard ApiError is thrown', async () => {
    vi.mocked(submitContact).mockRejectedValueOnce(
      new ApiError('İletişim servisi şu an kullanılamıyor', 503),
    );

    const formData = createValidContactFormData();
    const result = await submitContactAction(null, formData);

    expect(result.success).toBe(false);
    expect(result.message).toBe('İletişim servisi şu an kullanılamıyor');
  });

  it('returns general server error message on unexpected error', async () => {
    vi.mocked(submitContact).mockRejectedValueOnce(new Error('Network error'));

    const formData = createValidContactFormData();
    const result = await submitContactAction(null, formData);

    expect(result.success).toBe(false);
    expect(result.message).toMatch(/sunucu hatası oluştu/i);
  });
});
