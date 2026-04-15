import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
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
import { Plus, Search, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import type { Database } from "@/integrations/supabase/types";

type OrderStatus = Database["public"]["Enums"]["order_status"];
type PaymentStatus = Database["public"]["Enums"]["payment_status"];

const orderStatusLabels: Record<OrderStatus, string> = {
  new: "جديد", confirmed: "مؤكد", processing: "قيد التجهيز",
  shipped: "تم الشحن", delivered: "تم التسليم", cancelled: "ملغى",
};
const paymentLabels: Record<PaymentStatus, string> = {
  unpaid: "غير مدفوع", partial: "جزئي", paid: "مدفوع", refunded: "مرتجع",
};
const orderStatusBadge: Record<OrderStatus, "default" | "secondary" | "destructive" | "outline"> = {
  new: "secondary", confirmed: "default", processing: "default",
  shipped: "outline", delivered: "outline", cancelled: "destructive",
};
const paymentBadge: Record<PaymentStatus, "default" | "secondary" | "destructive" | "outline"> = {
  unpaid: "secondary", partial: "outline", paid: "default", refunded: "destructive",
};
const sourceLabels: Record<string, string> = {
  manual: "يدوي", woocommerce: "WooCommerce", phone: "هاتف", whatsapp: "واتساب", other: "أخرى",
};

export default function Orders() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  const { data: orders, isLoading } = useQuery({
    queryKey: ["orders", search, statusFilter, paymentFilter],
    queryFn: async () => {
      let query = supabase
        .from("orders")
        .select("*, customers(full_name)")
        .order("created_at", { ascending: false });

      if (search.trim()) {
        query = query.or(`order_number.ilike.%${search.trim()}%`);
      }
      if (statusFilter !== "all") {
        query = query.eq("order_status", statusFilter as OrderStatus);
      }
      if (paymentFilter !== "all") {
        query = query.eq("payment_status", paymentFilter as PaymentStatus);
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="بحث برقم الطلب..." className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="حالة الطلب" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            {Object.entries(orderStatusLabels).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={paymentFilter} onValueChange={setPaymentFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="الدفع" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            {Object.entries(paymentLabels).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex-1" />
        <Button size="sm" asChild>
          <Link to="/orders/new"><Plus className="h-4 w-4 mr-1" />طلب جديد</Link>
        </Button>
      </div>

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
              {isLoading ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></TableCell></TableRow>
              ) : orders?.length === 0 ? (
                <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">لا توجد طلبات</TableCell></TableRow>
              ) : (
                orders?.map((o) => (
                  <TableRow key={o.id} className="cursor-pointer" onClick={() => navigate(`/orders/${o.id}`)}>
                    <TableCell className="font-mono text-sm font-medium">{o.order_number}</TableCell>
                    <TableCell>{(o.customers as any)?.full_name || "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(o.created_at).toLocaleDateString("ar-EG")}</TableCell>
                    <TableCell className="font-medium">{o.total_amount} ج.م</TableCell>
                    <TableCell><Badge variant={orderStatusBadge[o.order_status]}>{orderStatusLabels[o.order_status]}</Badge></TableCell>
                    <TableCell><Badge variant={paymentBadge[o.payment_status]}>{paymentLabels[o.payment_status]}</Badge></TableCell>
                    <TableCell><Badge variant="outline">{sourceLabels[o.source] || o.source}</Badge></TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
