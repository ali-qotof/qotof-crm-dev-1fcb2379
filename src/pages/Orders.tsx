import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Plus, Search } from "lucide-react";
import { Link } from "react-router-dom";

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  "جديد": "secondary",
  "قيد التجهيز": "default",
  "تم الشحن": "outline",
  "ملغى": "destructive",
};

const paymentColors: Record<string, "default" | "secondary" | "destructive"> = {
  "مدفوع": "default",
  "معلق": "secondary",
  "مرتجع": "destructive",
};

const mockOrders = [
  { id: "ORD-001", customer: "أحمد محمد", date: "2025-01-10", total: 850, status: "قيد التجهيز", payment: "مدفوع", source: "واتساب" },
  { id: "ORD-002", customer: "فاطمة علي", date: "2025-01-09", total: 1200, status: "جديد", payment: "معلق", source: "الموقع" },
  { id: "ORD-003", customer: "محمود حسن", date: "2025-01-08", total: 450, status: "تم الشحن", payment: "مدفوع", source: "انستجرام" },
];

export default function Orders() {
  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="بحث بالرقم أو العميل..." className="pl-8" />
        </div>
        <Select>
          <SelectTrigger className="w-36"><SelectValue placeholder="حالة الطلب" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="new">جديد</SelectItem>
            <SelectItem value="processing">قيد التجهيز</SelectItem>
            <SelectItem value="shipped">تم الشحن</SelectItem>
            <SelectItem value="cancelled">ملغى</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-36"><SelectValue placeholder="الدفع" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="paid">مدفوع</SelectItem>
            <SelectItem value="pending">معلق</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex-1" />
        <Button size="sm" asChild>
          <Link to="/orders/new">
            <Plus className="h-4 w-4 mr-1" />
            طلب جديد
          </Link>
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم الطلب</TableHead>
                <TableHead>العميل</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>حالة الطلب</TableHead>
                <TableHead>الدفع</TableHead>
                <TableHead>المصدر</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockOrders.map((o) => (
                <TableRow key={o.id} className="cursor-pointer">
                  <TableCell className="font-mono text-sm font-medium">{o.id}</TableCell>
                  <TableCell>{o.customer}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{o.date}</TableCell>
                  <TableCell className="font-medium">{o.total} ج.م</TableCell>
                  <TableCell><Badge variant={statusColors[o.status]}>{o.status}</Badge></TableCell>
                  <TableCell><Badge variant={paymentColors[o.payment]}>{o.payment}</Badge></TableCell>
                  <TableCell><Badge variant="outline">{o.source}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
