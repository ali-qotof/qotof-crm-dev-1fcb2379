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
import { Plus, Search, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CustomerForm from "@/components/customers/CustomerForm";

const stageLabels: Record<string, string> = {
  lead: "محتمل", active: "نشط", inactive: "غير نشط", vip: "VIP", blocked: "محظور",
};
const stageColors: Record<string, string> = {
  lead: "secondary", active: "default", inactive: "outline", vip: "default", blocked: "destructive",
};

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("2")) return digits;
  if (digits.startsWith("0")) return "2" + digits;
  return "20" + digits;
}

export default function Customers() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: customers, isLoading } = useQuery({
    queryKey: ["customers", search],
    queryFn: async () => {
      let query = supabase
        .from("customers")
        .select("*")
        .order("created_at", { ascending: false });

      if (search.trim()) {
        const normalized = normalizePhone(search.trim());
        query = query.or(
          `full_name.ilike.%${search.trim()}%,primary_phone_normalized.like.%${normalized}%,primary_phone.like.%${search.trim()}%`
        );
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;
      return data;
    },
  });

  // Fetch order stats per customer
  const customerIds = customers?.map(c => c.id) || [];
  const { data: orderStats } = useQuery({
    queryKey: ["customer-order-stats", customerIds],
    queryFn: async () => {
      if (customerIds.length === 0) return {};
      const { data, error } = await supabase
        .from("orders")
        .select("customer_id, created_at")
        .in("customer_id", customerIds);
      if (error) throw error;

      const stats: Record<string, { count: number; last_order_at: string | null }> = {};
      for (const o of data || []) {
        if (!stats[o.customer_id]) stats[o.customer_id] = { count: 0, last_order_at: null };
        stats[o.customer_id].count++;
        if (!stats[o.customer_id].last_order_at || o.created_at > stats[o.customer_id].last_order_at!)
          stats[o.customer_id].last_order_at = o.created_at;
      }
      return stats;
    },
    enabled: customerIds.length > 0,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث بالهاتف أو الاسم..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button size="sm" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          عميل جديد
        </Button>
      </div>

      <CustomerForm
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={(id) => navigate(`/customers/${id}`)}
      />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>الهاتف</TableHead>
                <TableHead>المحافظة</TableHead>
                <TableHead>المرحلة</TableHead>
                <TableHead>عدد الطلبات</TableHead>
                <TableHead>آخر طلب</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></TableCell></TableRow>
              ) : customers?.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">لا يوجد عملاء</TableCell></TableRow>
              ) : (
                customers?.map((c) => {
                  const stats = orderStats?.[c.id];
                  const stage = (c as any).customer_stage || "lead";
                  return (
                    <TableRow key={c.id} className="cursor-pointer" onClick={() => navigate(`/customers/${c.id}`)}>
                      <TableCell className="font-medium">{c.full_name}</TableCell>
                      <TableCell className="font-mono text-sm">{c.primary_phone}</TableCell>
                      <TableCell>{(c as any).governorate || "—"}</TableCell>
                      <TableCell>
                        <Badge variant={stageColors[stage] as any}>{stageLabels[stage] || stage}</Badge>
                      </TableCell>
                      <TableCell className="text-center">{stats?.count || 0}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {stats?.last_order_at ? new Date(stats.last_order_at).toLocaleDateString("ar-EG") : "—"}
                      </TableCell>
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
