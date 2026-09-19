import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="OJS Nutrition mağaza performansı, sipariş özetleri ve analitik genel bakış."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Toplam Gelir</CardDescription>
            <CardTitle className="text-2xl font-bold">₺0,00</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Faz 5.3 ile analitik veriler bağlanacak</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Toplam Sipariş</CardDescription>
            <CardTitle className="text-2xl font-bold">0</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">İşlem gören sipariş adedi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Aktif Müşteri</CardDescription>
            <CardTitle className="text-2xl font-bold">0</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Kayıtlı kullanıcı tabanı</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Kritik Stok</CardDescription>
            <CardTitle className="text-2xl font-bold">0</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Azalan ürün varyantları</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
