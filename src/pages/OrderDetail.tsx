import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, Truck, CreditCard } from "lucide-react";

export default function OrderDetail() {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/orders"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h2 className="text-lg font-semibold">طلب {id}</h2>
        <Badge>قيد التجهيز</Badge>
        <Badge variant="outline">مدفوع</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2"><User className="h-4 w-4" /> العميل</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">لا توجد بيانات بعد</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2"><CreditCard className="h-4 w-4" /> الدفع</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">لا توجد بيانات بعد</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2"><Truck className="h-4 w-4" /> الشحن</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">لا توجد بيانات بعد</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">سجل التغييرات</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">لا توجد بيانات بعد</p>
        </CardContent>
      </Card>
    </div>
  );
}
