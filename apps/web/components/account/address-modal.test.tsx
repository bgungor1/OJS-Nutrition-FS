import { render, screen } from '@/test/test-utils';
import { AddressModal } from './address-modal';
import * as addressActions from '@/app/(shop)/account/addresses/actions';
import * as locationsApi from '@/lib/api/locations';
import {
  mockCountries,
  mockRegions,
  mockSubregions,
  mockExistingAddress,
} from '@/test/fixtures';

vi.mock('@/app/(shop)/account/addresses/actions', () => ({
  createAddressAction: vi.fn(),
  updateAddressAction: vi.fn(),
}));

vi.mock('@/lib/api/locations', () => ({
  getRegions: vi.fn(),
  getSubregions: vi.fn(),
}));

describe('AddressModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(locationsApi.getRegions).mockResolvedValue(mockRegions);
    vi.mocked(locationsApi.getSubregions).mockResolvedValue(mockSubregions);
  });

  it('does not render modal content when isOpen is false', () => {
    render(
      <AddressModal
        isOpen={false}
        onClose={vi.fn()}
        initialData={null}
        countries={mockCountries}
      />,
    );

    expect(screen.queryByText('Yeni Adres Ekle')).not.toBeInTheDocument();
  });

  it('renders modal in creation mode with empty fields and "Kaydet" button', async () => {
    render(
      <AddressModal
        isOpen={true}
        onClose={vi.fn()}
        initialData={null}
        countries={mockCountries}
      />,
    );

    expect(screen.getByText('Yeni Adres Ekle')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /kaydet/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/adres başlığı/i)).toHaveValue('');
    expect(screen.getByLabelText(/alıcı adı/i)).toHaveValue('');
    expect(screen.getByLabelText(/alıcı soyadı/i)).toHaveValue('');
    expect(screen.getByLabelText(/telefon numarası/i)).toHaveValue('');
    expect(screen.getByLabelText(/açık adres/i)).toHaveValue('');

    expect(await screen.findByRole('option', { name: 'İstanbul' })).toBeInTheDocument();
  });

  it('renders modal in edit mode with prefilled address data and "Güncelle" button', async () => {
    render(
      <AddressModal
        isOpen={true}
        onClose={vi.fn()}
        initialData={mockExistingAddress}
        countries={mockCountries}
      />,
    );

    expect(screen.getByText('Adresi Düzenle')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /güncelle/i })).toBeInTheDocument();

    expect(screen.getByLabelText(/adres başlığı/i)).toHaveValue('Ev Adresi');
    expect(screen.getByLabelText(/alıcı adı/i)).toHaveValue('Berkant');
    expect(screen.getByLabelText(/alıcı soyadı/i)).toHaveValue('Güngör');
    expect(screen.getByLabelText(/telefon numarası/i)).toHaveValue('05551234567');
    expect(screen.getByLabelText(/açık adres/i)).toHaveValue('Moda Cad. No: 5 Daire: 4 Kadıköy');

    expect(await screen.findByRole('option', { name: 'İstanbul' })).toBeInTheDocument();
    expect(await screen.findByRole('option', { name: 'Kadıköy' })).toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', async () => {
    const handleClose = vi.fn();
    const { user } = render(
      <AddressModal
        isOpen={true}
        onClose={handleClose}
        initialData={null}
        countries={mockCountries}
      />,
    );

    await screen.findByRole('option', { name: 'İstanbul' });

    const cancelButton = screen.getByRole('button', { name: /[iİ]ptal/i });
    await user.click(cancelButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('displays client-side Zod validation errors when submitting empty form', async () => {
    const { user } = render(
      <AddressModal
        isOpen={true}
        onClose={vi.fn()}
        initialData={null}
        countries={mockCountries}
      />,
    );

    await screen.findByRole('option', { name: 'İstanbul' });

    const submitButton = screen.getByRole('button', { name: /kaydet/i });
    await user.click(submitButton);

    expect(await screen.findByText('Adres başlığı en az 2 karakter olmalıdır.')).toBeInTheDocument();
    expect(screen.getByText('Alıcı adı en az 2 karakter olmalıdır.')).toBeInTheDocument();
    expect(screen.getByText('Alıcı soyadı en az 2 karakter olmalıdır.')).toBeInTheDocument();
    expect(screen.getByText(/geçerli bir telefon numarası giriniz/i)).toBeInTheDocument();
    expect(screen.getByText('Açık adres en az 10 karakter olmalıdır.')).toBeInTheDocument();

    expect(addressActions.createAddressAction).not.toHaveBeenCalled();
  });

  it('submits valid address data and calls onClose on success', async () => {
    vi.mocked(addressActions.createAddressAction).mockResolvedValueOnce({
      success: true,
    });

    const handleClose = vi.fn();
    const { user } = render(
      <AddressModal
        isOpen={true}
        onClose={handleClose}
        initialData={null}
        countries={mockCountries}
      />,
    );

    await user.type(screen.getByLabelText(/adres başlığı/i), 'İş Adresi');
    await user.type(screen.getByLabelText(/alıcı adı/i), 'Ahmet');
    await user.type(screen.getByLabelText(/alıcı soyadı/i), 'Yılmaz');
    await user.type(screen.getByLabelText(/telefon numarası/i), '05559876543');
    await user.type(screen.getByLabelText(/açık adres/i), 'Büyükdere Cad. No: 10 Levent İstanbul');

    // Select region and subregion
    const regionSelect = screen.getByLabelText(/^[İi]l$/i);
    await user.selectOptions(regionSelect, '10');

    // Wait for subregions to load and select
    const subregionSelect = await screen.findByLabelText(/^[İi]lçe$/i);
    await user.selectOptions(subregionSelect, '100');

    const submitButton = screen.getByRole('button', { name: /kaydet/i });
    await user.click(submitButton);

    expect(addressActions.createAddressAction).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'İş Adresi',
        first_name: 'Ahmet',
        last_name: 'Yılmaz',
        phone_number: '05559876543',
        country_id: 1,
        region_id: 10,
        subregion_id: 100,
        full_address: 'Büyükdere Cad. No: 10 Levent İstanbul',
      }),
    );

    expect(handleClose).toHaveBeenCalled();
  }, 15000);

  it('displays global error when server action returns an error', async () => {
    vi.mocked(addressActions.updateAddressAction).mockResolvedValueOnce({
      success: false,
      error: 'Adres güncellenirken bir sunucu hatası oluştu.',
    });

    const { user } = render(
      <AddressModal
        isOpen={true}
        onClose={vi.fn()}
        initialData={mockExistingAddress}
        countries={mockCountries}
      />,
    );

    const submitButton = screen.getByRole('button', { name: /güncelle/i });
    await user.click(submitButton);

    expect(await screen.findByText('Adres güncellenirken bir sunucu hatası oluştu.')).toBeInTheDocument();
  });
});
