import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ArrowLeft, User, Truck, CreditCard, Loader2 } from "lucide-react";

const orderStatusLabels: Record<string, string> = {
  new: "جديد", confirmed: "مؤكد", processing: "قيد التجهيز",
  shipped: "تم الشحن", delivered: "تم التسليم", cancelled: "ملغى",
};
const paymentLabels: Record<string, string> = {
  unpaid: "غير مدفوع", partial: "جزئي", paid: "مدفوع", refunded: "مرتجع",
};
const fulfillmentLabels: Record<string, string> = {
  pending: "قيد الانتظار", packing: "تعبئة", shipped: "تم الشحن", delivered: "تم التسليم", returned: "مرتجع",
};

export default function OrderDetail() {
  const { id } = useParams();

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, customers(full_name, primary_phone, city)")
        .eq("id", id!)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: items } = useQuery({
    queryKey: ["order-items", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("order_items").select("*").eq("order_id", id!);
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: history } = useQuery({
    queryKey: ["order-history", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order_status_history")
        .select("*, staff_users:changed_by(full_name)")
        .eq("order_id", id!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (!order) return <p className="text-muted-foreground">الطلب غير موجود</p>;

  const customer = order.customers as any;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/orders"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h2 className="text-lg font-semibold">طلب {order.order_number}</h2>
        <Badge>{orderStatusLabels[order.order_status]}</Badge>
        <Badge variant="outline">{paymentLabels[order.payment_status]}</Badge>
        <Badge variant="secondary">{fulfillmentLabels[order.fulfillment_status]}</Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2"><User className="h-4 w-4" /> العميل</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <p className="font-medium">{customer?.full_name || "—"}</p>
            <p className="font-mono text-muted-foreground">{customer?.primary_phone || "—"}</p>
            <p className="text-muted-foreground">{customer?.city || "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2"><CreditCard className="h-4 w-4" /> الدفع</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <p className="text-2xl font-bold">{order.total_amount} ج.م</p>
            <p>{paymentLabels[order.payment_status]}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2"><Truck className="h-4 w-4" /> التوصيل</CardTitle>
          </CardHeader>
          <CardContent className="text-sm">
            <p>{fulfillmentLabels[order.fulfillment_status]}</p>
          </CardContent>
        </Card>
      </div>

      {/* Order Items */}
      <Card>
        <CardHeader><CardTitle className="text-base">المنتجات</CardTitle></CardHeader>
        <CardContent className="p-0">
          {items && items.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>المنتج</TableHead>
                  <TableHead>الكمية</TableHead>
                  <TableHead>سعر الوحدة</TableHead>
                  <TableHead>الإجمالي</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.product_name}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.unit_price} ج.م</TableCell>
                    <TableCell className="font-medium">{item.total_price} ج.م</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground p-6">لا توجد منتجات</p>
          )}
        </CardContent>
      </Card>

      {/* History */}
      <Card>
        <CardHeader><CardTitle className="text-base">سجل التغييرات</CardTitle></CardHeader>
        <CardContent>
          {history && history.length > 0 ? (
            <div className="space-y-2">
              {history.map((h) => (
                <div key={h.id} className="flex items-center gap-3 text-sm border-b pb-2 last:border-0">
                  <span className="text-muted-foreground text-xs">{new Date(h.created_at).toLocaleString("ar-EG")}</span>
                  <Badge variant="outline">{h.field_name}</Badge>
                  <span>{h.old_value || "—"} → {h.new_value}</span>
                  <span className="text-muted-foreground text-xs mr-auto">{(h.staff_users as any)?.full_name || ""}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">لا توجد تغييرات بعد</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
