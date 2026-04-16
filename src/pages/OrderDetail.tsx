import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, User, Truck, CreditCard, Loader2, MapPin } from "lucide-react";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type OrderStatus = Database["public"]["Enums"]["order_status"];
type PaymentStatus = Database["public"]["Enums"]["payment_status"];
type FulfillmentStatus = Database["public"]["Enums"]["fulfillment_status"];

const orderStatusLabels: Record<OrderStatus, string> = {
  new: "جديد", confirmed: "مؤكد", processing: "قيد التجهيز",
  shipped: "تم الشحن", delivered: "تم التسليم", cancelled: "ملغى",
};
const paymentLabels: Record<PaymentStatus, string> = {
  unpaid: "غير مدفوع", partial: "جزئي", paid: "مدفوع", refunded: "مرتجع",
};
const fulfillmentLabels: Record<FulfillmentStatus, string> = {
  pending: "قيد الانتظار", packing: "تعبئة", shipped: "تم الشحن", delivered: "تم التسليم", returned: "مرتجع",
};

const orderStatusBadge: Record<OrderStatus, "default" | "secondary" | "destructive" | "outline"> = {
  new: "secondary", confirmed: "default", processing: "default",
  shipped: "outline", delivered: "outline", cancelled: "destructive",
};
const paymentBadge: Record<PaymentStatus, "default" | "secondary" | "destructive" | "outline"> = {
  unpaid: "secondary", partial: "outline", paid: "default", refunded: "destructive",
};
const fulfillmentBadge: Record<FulfillmentStatus, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary", packing: "outline", shipped: "default", delivered: "default", returned: "destructive",
};

const sourceLabels: Record<string, string> = {
  manual: "يدوي", woocommerce: "WooCommerce", phone: "هاتف", whatsapp: "واتساب", other: "أخرى",
};

export default function OrderDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, customers(full_name, primary_phone, city, governorate, address)")
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

  // Status change mutation
  const changeStatus = useMutation({
    mutationFn: async ({ field, newValue }: { field: string; newValue: string }) => {
      const oldValue = field === "order_status" ? order!.order_status
        : field === "payment_status" ? order!.payment_status
        : order!.fulfillment_status;

      if (oldValue === newValue) return;

      // Update order
      const updatePayload: Record<string, string> = { [field]: newValue };
      const { error } = await supabase.from("orders").update(updatePayload as any).eq("id", id!);
      if (error) throw error;

      // Log history
      const { data: { user } } = await supabase.auth.getUser();
      let staffId: string | null = null;
      if (user) {
        const { data: staff } = await supabase.from("staff_users").select("id").eq("auth_user_id", user.id).maybeSingle();
        staffId = staff?.id || null;
      }

      await supabase.from("order_status_history").insert({
        order_id: id!,
        field_name: field,
        old_value: oldValue,
        new_value: newValue,
        changed_by: staffId,
      });
    },
    onSuccess: () => {
      toast.success("تم تحديث الحالة");
      queryClient.invalidateQueries({ queryKey: ["order", id] });
      queryClient.invalidateQueries({ queryKey: ["order-history", id] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  if (!order) return <p className="text-muted-foreground">الطلب غير موجود</p>;

  const customer = order.customers as any;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/orders"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h2 className="text-lg font-semibold">طلب {order.order_number}</h2>
        <Badge variant={orderStatusBadge[order.order_status]}>{orderStatusLabels[order.order_status]}</Badge>
        <Badge variant={paymentBadge[order.payment_status]}>{paymentLabels[order.payment_status]}</Badge>
        <Badge variant={fulfillmentBadge[order.fulfillment_status]}>{fulfillmentLabels[order.fulfillment_status]}</Badge>
        <Badge variant="outline">{sourceLabels[order.source] || order.source}</Badge>
      </div>

      {/* Status Controls */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">تغيير الحالات</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">حالة الطلب</p>
              <Select value={order.order_status} onValueChange={(v) => changeStatus.mutate({ field: "order_status", newValue: v })}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(orderStatusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">الدفع</p>
              <Select value={order.payment_status} onValueChange={(v) => changeStatus.mutate({ field: "payment_status", newValue: v })}>
                <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(paymentLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">التوصيل</p>
              <Select value={order.fulfillment_status} onValueChange={(v) => changeStatus.mutate({ field: "fulfillment_status", newValue: v })}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(fulfillmentLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2"><User className="h-4 w-4" /> العميل</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <p className="font-medium">{customer?.full_name || "—"}</p>
            <p className="font-mono text-muted-foreground">{customer?.primary_phone || "—"}</p>
            <p className="text-muted-foreground">{customer?.governorate || "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2"><CreditCard className="h-4 w-4" /> الدفع</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <p className="text-2xl font-bold">{order.total_amount} ج.م</p>
            <p><Badge variant={paymentBadge[order.payment_status]}>{paymentLabels[order.payment_status]}</Badge></p>
            {(order as any).source_detail && <p className="text-xs text-muted-foreground">المصدر: {(order as any).source_detail}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2"><MapPin className="h-4 w-4" /> الشحن</CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-1">
            <p><Badge variant={fulfillmentBadge[order.fulfillment_status]}>{fulfillmentLabels[order.fulfillment_status]}</Badge></p>
            <p className="text-muted-foreground">{customer?.governorate || "—"}{customer?.city ? ` — ${customer.city}` : ""}</p>
            {customer?.address && <p className="text-muted-foreground text-xs">{customer.address}</p>}
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
              {history.map((h) => {
                const fieldLabels: Record<string, string> = {
                  order_status: "حالة الطلب",
                  payment_status: "الدفع",
                  fulfillment_status: "التوصيل",
                };
                return (
                  <div key={h.id} className="flex items-center gap-3 text-sm border-b pb-2 last:border-0">
                    <span className="text-muted-foreground text-xs whitespace-nowrap">{new Date(h.created_at).toLocaleString("ar-EG")}</span>
                    <Badge variant="outline">{fieldLabels[h.field_name] || h.field_name}</Badge>
                    <span>{h.old_value || "—"} → {h.new_value}</span>
                    <span className="text-muted-foreground text-xs mr-auto">{(h.staff_users as any)?.full_name || ""}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">لا توجد تغييرات بعد</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
