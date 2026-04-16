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
import { Plus, Search, Loader2, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import type { Database } from "@/integrations/supabase/types";

type OrderStatus = Database["public"]["Enums"]["order_status"];
type PaymentStatus = Database["public"]["Enums"]["payment_status"];
type FulfillmentStatus = Database["public"]["Enums"]["fulfillment_status"];
type OrderSource = Database["public"]["Enums"]["order_source"];

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
const sourceLabels: Record<OrderSource, string> = {
  manual: "يدوي", woocommerce: "WooCommerce", phone: "هاتف", whatsapp: "واتساب", other: "أخرى",
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

export default function Orders() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [fulfillmentFilter, setFulfillmentFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [assignedFilter, setAssignedFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const { data: staffUsers } = useQuery({
    queryKey: ["staff-users-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("staff_users").select("id, full_name").eq("is_active", true).order("full_name");
      if (error) throw error;
      return data;
    },
  });

  const { data: orders, isLoading } = useQuery({
    queryKey: ["orders", search, statusFilter, paymentFilter, fulfillmentFilter, sourceFilter, assignedFilter, dateFrom, dateTo],
    queryFn: async () => {
      let query = supabase
        .from("orders")
        .select("*, customers(full_name, primary_phone, city, governorate)")
        .order("created_at", { ascending: false });

      if (search.trim()) {
        query = query.or(`order_number.ilike.%${search.trim()}%`);
      }
      if (statusFilter !== "all") query = query.eq("order_status", statusFilter as OrderStatus);
      if (paymentFilter !== "all") query = query.eq("payment_status", paymentFilter as PaymentStatus);
      if (fulfillmentFilter !== "all") query = query.eq("fulfillment_status", fulfillmentFilter as FulfillmentStatus);
      if (sourceFilter !== "all") query = query.eq("source", sourceFilter as OrderSource);
      if (assignedFilter !== "all") query = query.eq("assigned_to", assignedFilter);
      if (dateFrom) query = query.gte("created_at", dateFrom);
      if (dateTo) query = query.lte("created_at", dateTo + "T23:59:59");

      const { data, error } = await query.limit(200);
      if (error) throw error;
      return data;
    },
  });

  const hasFilters = statusFilter !== "all" || paymentFilter !== "all" || fulfillmentFilter !== "all" || sourceFilter !== "all" || assignedFilter !== "all" || dateFrom || dateTo;

  const clearFilters = () => {
    setStatusFilter("all"); setPaymentFilter("all"); setFulfillmentFilter("all");
    setSourceFilter("all"); setAssignedFilter("all"); setDateFrom(""); setDateTo("");
  };

  return (
    <div className="space-y-4">
      {/* Search + New Order */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="بحث برقم الطلب..." className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex-1" />
        <Button size="sm" asChild>
          <Link to="/orders/new"><Plus className="h-4 w-4 mr-1" />طلب جديد</Link>
        </Button>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap items-center gap-2">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="حالة الطلب" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الحالات</SelectItem>
            {Object.entries(orderStatusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={fulfillmentFilter} onValueChange={setFulfillmentFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="التوصيل" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل التوصيل</SelectItem>
            {Object.entries(fulfillmentLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={paymentFilter} onValueChange={setPaymentFilter}>
          <SelectTrigger className="w-32"><SelectValue placeholder="الدفع" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الدفع</SelectItem>
            {Object.entries(paymentLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="المصدر" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل المصادر</SelectItem>
            {Object.entries(sourceLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={assignedFilter} onValueChange={setAssignedFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="المسؤول" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل المسؤولين</SelectItem>
            {staffUsers?.map((s) => <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input type="date" className="w-36" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} placeholder="من" />
        <Input type="date" className="w-36" value={dateTo} onChange={(e) => setDateTo(e.target.value)} placeholder="إلى" />
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}><X className="h-3 w-3 mr-1" />مسح</Button>
        )}
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>رقم الطلب</TableHead>
                <TableHead>العميل</TableHead>
                <TableHead>المحافظة</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>المبلغ</TableHead>
                <TableHead>حالة الطلب</TableHead>
                <TableHead>الدفع</TableHead>
                <TableHead>التوصيل</TableHead>
                <TableHead>المصدر</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={9} className="text-center py-8"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></TableCell></TableRow>
              ) : orders?.length === 0 ? (
                <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">لا توجد طلبات</TableCell></TableRow>
              ) : (
                orders?.map((o) => {
                  const cust = o.customers as any;
                  return (
                    <TableRow key={o.id} className="cursor-pointer" onClick={() => navigate(`/orders/${o.id}`)}>
                      <TableCell className="font-mono text-sm font-medium">{o.order_number}</TableCell>
                      <TableCell>{cust?.full_name || "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{cust?.governorate || cust?.city || "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{new Date(o.created_at).toLocaleDateString("ar-EG")}</TableCell>
                      <TableCell className="font-medium">{o.total_amount} ج.م</TableCell>
                      <TableCell><Badge variant={orderStatusBadge[o.order_status]}>{orderStatusLabels[o.order_status]}</Badge></TableCell>
                      <TableCell><Badge variant={paymentBadge[o.payment_status]}>{paymentLabels[o.payment_status]}</Badge></TableCell>
                      <TableCell><Badge variant={fulfillmentBadge[o.fulfillment_status]}>{fulfillmentLabels[o.fulfillment_status]}</Badge></TableCell>
                      <TableCell><Badge variant="outline">{sourceLabels[o.source] || o.source}</Badge></TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
