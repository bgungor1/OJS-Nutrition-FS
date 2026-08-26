import React, { useState } from 'react'
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useAddressStore } from '@/store/addressStore'

const formSchema = z.object({
  title: z.string().min(2, "En az 2 karakter gerekli"),
  first_name: z.string().min(2, "En az 2 karakter gerekli"),
  last_name: z.string().min(2, "En az 2 karakter gerekli"),
  country_id: z.number().min(1, "Ülke seçimi zorunlu"),
  region_id: z.number().min(1, "İl seçimi zorunlu"),
  subregion_id: z.number().min(1, "İlçe seçimi zorunlu"),
  full_address: z.string().min(10, "En az 10 karakter gerekli"),
  phone_number: z.string().min(10, "Geçerli bir telefon numarası girin"),
})

type FormData = z.infer<typeof formSchema>

interface AddAddressModalProps {
  children: React.ReactNode
}

function AddAddressModal({ children }: AddAddressModalProps) {
  const [open, setOpen] = useState(false)
  const { addAddress, isLoading } = useAddressStore()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      first_name: "",
      last_name: "",
      country_id: 226,
      region_id: 0,
      subregion_id: 0,
      full_address: "",
      phone_number: "",
    },
  })

  async function onSubmit(values: FormData) {
    console.log('📤 Gönderilen adres verisi:', values)
    const success = await addAddress(values)

    if (success) {
      setOpen(false)
      form.reset()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
            Yeni Adres Ekle
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

            {/* Adres Başlığı */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adres Başlığı</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Örn: Ev, İş, Yazlık"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Ad ve Soyad */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="first_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ad</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Adınız"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Soyad</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Soyadınız"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="region_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>İl ID</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Örn: 3495"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="subregion_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>İlçe ID</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Örn: 39395"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="full_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tam Adres</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Mahalle, sokak, bina no, daire no"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phone_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefon</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="+905551234567"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isLoading}
              >
                İptal
              </Button>
              <Button
                type="submit"
                className="px-8"
                disabled={isLoading}
              >
                {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default AddAddressModal
