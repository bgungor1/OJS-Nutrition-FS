import { useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { MapPin, Plus, Edit, Trash2, Loader2 } from 'lucide-react'
import AddAddressModal from '../../components/modals/add-address-modal'
import { useAddressStore } from '@/store/addressStore'

function Addresses() {
  const {
    addresses,
    isLoading,
    error,
    fetchAddresses,
    removeAddress
  } = useAddressStore()

  useEffect(() => {
    fetchAddresses()
  }, [fetchAddresses])

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu adresi silmek istediğinize emin misiniz?')) {
      await removeAddress(id)
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <h3 className='text-xl sm:text-2xl font-bold'>Adreslerim</h3>
        <AddAddressModal>
          <Button className="flex items-center gap-2 w-full sm:w-auto">
            <Plus size={16} />
            Yeni Adres Ekle
          </Button>
        </AddAddressModal>
      </div>

      {/* Error Mesajı */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      )}

      {/* Adres Listesi */}
      {!isLoading && (
        <div className="space-y-4">
          {addresses.length > 0 ? (
            addresses.map((address) => (
              <div key={address.id} className="border dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-800">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-2">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-gray-500 dark:text-gray-400" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {address.title}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                      <Edit size={14} />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 flex-1 sm:flex-none"
                      onClick={() => handleDelete(address.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
                <div className="text-gray-600 dark:text-gray-300">
                  <p><strong>{address.first_name} {address.last_name}</strong></p>
                  <p>{address.full_address}</p>
                  <p>Tel: {address.phone_number || 'Belirtilmemiş'}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <MapPin size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p className="text-lg font-medium mb-2 text-gray-900 dark:text-white">
                Henüz adres eklenmemiş
              </p>
              <p className="text-sm">
                İlk adresinizi eklemek için yukarıdaki butona tıklayın.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Addresses