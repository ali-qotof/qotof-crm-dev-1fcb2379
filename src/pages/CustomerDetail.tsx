import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Phone, MapPin, ShoppingCart } from "lucide-react";

export default function CustomerDetail() {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/customers"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h2 className="text-lg font-semibold">تفاصيل العميل</h2>
        <Badge>نشط</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">بيانات العميل</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> <span className="font-mono">—</span></div>
            <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /> <span>—</span></div>
            <div className="flex items-center gap-2"><ShoppingCart className="h-4 w-4 text-muted-foreground" /> <span>— طلب</span></div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">سجل الطلبات</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">لا توجد بيانات بعد</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
