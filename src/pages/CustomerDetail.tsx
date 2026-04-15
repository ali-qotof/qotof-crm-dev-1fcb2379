import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Phone, MapPin, Mail, Calendar, Loader2 } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

const orderStatusLabels: Record<string, string> = {
  new: "جديد", confirmed: "مؤكد", processing: "قيد التجهيز",
  shipped: "تم الشحن", delivered: "تم التسليم", cancelled: "ملغى",
};
const paymentLabels: Record<string, string> = {
  unpaid: "غير مدفوع", partial: "جزئي", paid: "مدفوع", refunded: "مرتجع",
};

export default function CustomerDetail() {
  const { id } = useParams();

  const { data: customer, isLoading } = useQuery({
    queryKey: ["customer", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("customers").select("*").eq("id", id!).single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: orders } = useQuery({
    queryKey: ["customer-orders", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("customer_id", id!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (!customer) return <p className="text-muted-foreground">العميل غير موجود</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/customers"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h2 className="text-lg font-semibold">{customer.full_name}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="text-base">بيانات العميل</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> <span className="font-mono">{customer.primary_phone}</span></div>
            {customer.email && <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /> <span>{customer.email}</span></div>}
            <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /> <span>{customer.city || "—"}{customer.address ? ` — ${customer.address}` : ""}</span></div>
            <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" /> <span>{new Date(customer.created_at).toLocaleDateString("ar-EG")}</span></div>
            {customer.notes && <p className="text-muted-foreground border-t pt-2">{customer.notes}</p>}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">سجل الطلبات ({orders?.length ?? 0})</CardTitle></CardHeader>
          <CardContent className="p-0">
            {orders && orders.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم الطلب</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>المبلغ</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الدفع</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((o) => (
                    <TableRow key={o.id} className="cursor-pointer" onClick={() => window.location.href = `/orders/${o.id}`}>
                      <TableCell className="font-mono text-sm">{o.order_number}</TableCell>
                      <TableCell className="text-sm">{new Date(o.created_at).toLocaleDateString("ar-EG")}</TableCell>
                      <TableCell className="font-medium">{o.total_amount} ج.م</TableCell>
                      <TableCell><Badge variant="secondary">{orderStatusLabels[o.order_status] || o.order_status}</Badge></TableCell>
                      <TableCell><Badge variant="outline">{paymentLabels[o.payment_status] || o.payment_status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <p className="text-sm text-muted-foreground p-6">لا توجد طلبات بعد</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
