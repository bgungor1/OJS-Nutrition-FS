import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { loginSchema, registerSchema, type LoginFormData, type RegisterFormData } from "@/schemas/auth"
import { useNavigate, useLocation } from "react-router-dom"
import { authApi } from "@/services/auth"
import { useAuthStore } from "@/store/authStore"

export function Login() {
  const [isLogin, setIsLogin] = useState(true)


  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string })?.from || '/'


  const { setAuth, setLoading, setError, clearError, isLoading, error } = useAuthStore()


  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  })


  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  })


  const onLoginSubmit = async (data: LoginFormData) => {
    clearError()
    setLoading(true)

    try {
      console.log('🔄 Login isteği gönderiliyor...')
      const response = await authApi.login(data.email, data.password)


      const accessToken =
        (response as any).access_token ||
        (response as any).access ||
        (response as any).data?.access_token ||
        (response as any).data?.access ||
        (response as any).token

      const refreshToken =
        (response as any).refresh_token ||
        (response as any).refresh ||
        (response as any).data?.refresh_token ||
        (response as any).data?.refresh ||
        ''

      if (accessToken) {
        // Başarılı giriş
        const user = {
          id: 'temp-id',
          email: data.email,
          first_name: 'Kullanıcı',
          last_name: ''
        }

        setAuth(user, accessToken, refreshToken)
        navigate(from, { replace: true })
      } else if ((response as any).status === 'error' && (response as any).reason) {
        // Hata response'u
        const errorMessage = Object.values((response as any).reason).flat().join(', ')
        setError(errorMessage || 'Giriş yapılamadı')
      } else {
        // Beklenmeyen format
        console.error('Beklenmeyen API yanıt formatı:', response)
        setError('Giriş yapılamadı')
      }
    } catch (err) {
      console.error('❌ Login error:', err)
      setError('Bir hata oluştu, lütfen tekrar deneyin')
    } finally {
      setLoading(false)
    }
  }

  // Register submit handler
  const onRegisterSubmit = async (data: RegisterFormData) => {
    clearError()
    setLoading(true)

    try {
      console.log('🔄 Register isteği gönderiliyor...')
      const response = await authApi.register({
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        firstName: data.firstName,
        lastName: data.lastName
      })
      console.log('📡 API Response:', response)

      if (response.status === 'success') {
        registerForm.reset()
        setIsLogin(true)
        alert('Kayıt başarılı! Şimdi giriş yapabilirsiniz.')
      } else {
        const errorResponse = response as { status: 'error'; reason: { [key: string]: string[] } }
        const errorMessage = Object.values(errorResponse.reason).flat().join(', ')
        setError(errorMessage || 'Kayıt yapılamadı')
      }
    } catch (err) {
      console.error('❌ Register error:', err)
      setError('Bir hata oluştu, lütfen tekrar deneyin')
    } finally {
      setLoading(false)
    }
  }


  const handleTabChange = (login: boolean) => {
    setIsLogin(login)
    loginForm.reset()
    registerForm.reset()
    clearError()
  }

  return (
    <div className="w-full max-w-sm">
      <div className="flex mb-4 bg-muted rounded-lg p-1">
        <Button
          variant={isLogin ? "default" : "ghost"}
          className="flex-1"
          onClick={() => handleTabChange(true)}
        >
          Giriş Yap
        </Button>
        <Button
          variant={!isLogin ? "default" : "ghost"}
          className="flex-1"
          onClick={() => handleTabChange(false)}
        >
          Üye Ol
        </Button>
      </div>

      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{isLogin ? "Hesabınıza Giriş Yapın" : "Yeni Hesap Oluşturun"}</CardTitle>
          <CardDescription>
            {isLogin ? "Giriş Yapmak İçin Email ve Şifrenizi Giriniz" : "Hesap oluşturmak için bilgilerinizi girin"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Error mesajı gösterimi */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
          {isLogin ? (
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">E-posta</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    {...loginForm.register('email')}
                  />
                  {loginForm.formState.errors.email && (
                    <p className="text-sm text-red-500">{loginForm.formState.errors.email.message}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Şifre</Label>
                    <a
                      href="#"
                      className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                    >
                      Şifremi Unuttum?
                    </a>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    {...loginForm.register('password')}
                  />
                  {loginForm.formState.errors.password && (
                    <p className="text-sm text-red-500">{loginForm.formState.errors.password.message}</p>
                  )}
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="firstName">Ad</Label>
                  <Input
                    id="firstName"
                    type="text"
                    {...registerForm.register('firstName')}
                  />
                  {registerForm.formState.errors.firstName && (
                    <p className="text-sm text-red-500">{registerForm.formState.errors.firstName.message}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastName">Soyad</Label>
                  <Input
                    id="lastName"
                    type="text"
                    {...registerForm.register('lastName')}
                  />
                  {registerForm.formState.errors.lastName && (
                    <p className="text-sm text-red-500">{registerForm.formState.errors.lastName.message}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">E-posta</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    {...registerForm.register('email')}
                  />
                  {registerForm.formState.errors.email && (
                    <p className="text-sm text-red-500">{registerForm.formState.errors.email.message}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Şifre</Label>
                  <Input
                    id="password"
                    type="password"
                    {...registerForm.register('password')}
                  />
                  {registerForm.formState.errors.password && (
                    <p className="text-sm text-red-500">{registerForm.formState.errors.password.message}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Şifre Tekrar</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...registerForm.register('confirmPassword')}
                  />
                  {registerForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-red-500">{registerForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>
            </form>
          )}
        </CardContent>
        <CardFooter className="flex-col gap-2">
          {isLogin ? (
            <>
              <Button
                type="submit"
                className="w-full"
                onClick={loginForm.handleSubmit(onLoginSubmit)}
                disabled={isLoading}
              >
                {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
              </Button>
              <Button variant="outline" className="w-full" disabled={isLoading}>
                Google ile Giriş Yap
              </Button>
            </>
          ) : (
            <>
              <Button
                type="submit"
                className="w-full"
                onClick={registerForm.handleSubmit(onRegisterSubmit)}
                disabled={isLoading}
              >
                {isLoading ? 'Hesap Oluşturuluyor...' : 'Hesap Oluştur'}
              </Button>
              <Button variant="outline" className="w-full" disabled={isLoading}>
                Google ile Hesap Oluştur
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
