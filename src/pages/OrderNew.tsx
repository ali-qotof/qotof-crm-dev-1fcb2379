import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const sourceChannels = [
  { value: "whatsapp", label: "واتساب" },
  { value: "messenger", label: "ماسنجر" },
  { value: "instagram", label: "انستجرام" },
  { value: "hotline", label: "الخط الساخن" },
  { value: "website", label: "الموقع" },
  { value: "woocommerce", label: "WooCommerce" },
];

export default function OrderNew() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/orders"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h2 className="text-lg font-semibold">طلب جديد</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">بيانات الطلب</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Customer lookup */}
          <div className="space-y-2">
            <Label>رقم هاتف العميل</Label>
            <Input placeholder="01XXXXXXXXX" className="font-mono" />
            <p className="text-xs text-muted-foreground">سيتم البحث تلقائياً عن العميل</p>
          </div>

          {/* Source */}
          <div className="space-y-2">
            <Label>مصدر الطلب</Label>
            <Select>
              <SelectTrigger><SelectValue placeholder="اختر المصدر" /></SelectTrigger>
              <SelectContent>
                {sourceChannels.map((ch) => (
                  <SelectItem key={ch.value} value={ch.value}>{ch.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Products placeholder */}
          <div className="space-y-2">
            <Label>المنتجات</Label>
            <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
              سيتم إضافة منتجات الطلب هنا
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>ملاحظات</Label>
            <Textarea placeholder="ملاحظات إضافية..." rows={3} />
          </div>

          <div className="flex gap-3 pt-2">
            <Button>حفظ الطلب</Button>
            <Button variant="outline" asChild>
              <Link to="/orders">إلغاء</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
