

import { useEffect } from 'react'
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Outlet, useLocation } from "react-router-dom"
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
import AccountSidebar from "../../components/common/account-sidebar"
import { useAuthStore } from "@/store/authStore"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
  firstName: z.string().min(2, "En az 2 karakter"),
  lastName: z.string().min(2, "En az 2 karakter"),
  phone: z.string().min(10, "En az 10 karakter"),
  email: z.string().email("Geçerli email"),
})


type FormData = z.infer<typeof formSchema>

function Account() {
  const location = useLocation()
  const isAccountPage = location.pathname === "/account"

  const {
    user,
    isLoading,
    error,
    fetchProfile,
    updateProfile
  } = useAuthStore()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
    },
  })


  useEffect(() => {
    if (isAccountPage) {
      fetchProfile()
    }
  }, [isAccountPage, fetchProfile])


  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.first_name || "",
        lastName: user.last_name || "",
        phone: user.phone_number || "",
        email: user.email || "",
      })
    }
  }, [user, form])

  async function onSubmit(values: FormData) {

    const success = await updateProfile({
      first_name: values.firstName,
      last_name: values.lastName,
      phone_number: values.phone,
    })

    if (success) {
    }
  }

  return (
    <div className='container mx-auto max-w-6xl px-4 py-8'>
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 items-start'>
        <AccountSidebar />

        <div className='lg:col-span-2'>
          {isAccountPage ? (
            <>
              <h3 className='text-xl sm:text-2xl font-bold mb-6 text-gray-900 dark:text-white'>Hesap Bilgileri</h3>
              {error && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}
              {isLoading && (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              )}

              {!isLoading && (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ad</FormLabel>
                            <FormControl>
                              <Input placeholder="Adınız" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Soyad</FormLabel>
                            <FormControl>
                              <Input placeholder="Soyadınız" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefon</FormLabel>
                          <FormControl>
                            <Input type="tel" placeholder="+905551234567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="email@example.com"
                              {...field}
                              disabled
                              className="bg-gray-100 dark:bg-gray-800"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className='flex justify-end pt-4'>
                      <Button
                        type="submit"
                        className='px-8 py-2'
                        disabled={isLoading}
                      >
                        {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
            </>
          ) : (
            <Outlet />
          )}
        </div>
      </div>
    </div>
  )
}

export default Account