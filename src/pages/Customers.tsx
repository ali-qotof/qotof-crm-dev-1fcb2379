import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type CustomerSource = Database["public"]["Enums"]["customer_source"];

const sourceLabels: Record<CustomerSource, string> = {
  walk_in: "زيارة مباشرة",
  phone: "هاتف",
  whatsapp: "واتساب",
  website: "الموقع",
  woocommerce: "WooCommerce",
  referral: "إحالة",
  other: "أخرى",
};

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("2")) return digits;
  if (digits.startsWith("0")) return "2" + digits;
  return "20" + digits;
}

export default function Customers() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state
  const [form, setForm] = useState({
    full_name: "",
    primary_phone: "",
    city: "",
    email: "",
    address: "",
    source: "phone" as CustomerSource,
    notes: "",
  });

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

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!form.full_name || !form.primary_phone) {
        throw new Error("الاسم ورقم الهاتف مطلوبان");
      }
      const normalized = normalizePhone(form.primary_phone);

      // Check for duplicate phone
      const { data: existing } = await supabase
        .from("customers")
        .select("id")
        .eq("primary_phone_normalized", normalized)
        .maybeSingle();

      if (existing) throw new Error("رقم الهاتف مسجل بالفعل");

      const { data, error } = await supabase
        .from("customers")
        .insert({
          full_name: form.full_name,
          primary_phone: form.primary_phone,
          primary_phone_normalized: normalized,
          city: form.city || null,
          email: form.email || null,
          address: form.address || null,
          source: form.source,
          notes: form.notes || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setDialogOpen(false);
      setForm({ full_name: "", primary_phone: "", city: "", email: "", address: "", source: "phone", notes: "" });
      toast.success("تم إضافة العميل بنجاح");
      navigate(`/customers/${data.id}`);
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
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
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-1" />
              عميل جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>إضافة عميل جديد</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label>الاسم *</Label>
                <Input value={form.full_name} onChange={(e) => setForm(f => ({ ...f, full_name: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>رقم الهاتف *</Label>
                <Input className="font-mono" placeholder="01XXXXXXXXX" value={form.primary_phone} onChange={(e) => setForm(f => ({ ...f, primary_phone: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>المدينة</Label>
                <Input value={form.city} onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>البريد الإلكتروني</Label>
                <Input type="email" value={form.email} onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>العنوان</Label>
                <Input value={form.address} onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>المصدر</Label>
                <Select value={form.source} onValueChange={(v) => setForm(f => ({ ...f, source: v as CustomerSource }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(sourceLabels).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>ملاحظات</Label>
                <Textarea rows={2} value={form.notes} onChange={(e) => setForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
              <Button className="w-full" onClick={() => createMutation.mutate()} disabled={createMutation.isPending}>
                {createMutation.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                حفظ العميل
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>الهاتف</TableHead>
                <TableHead>المدينة</TableHead>
                <TableHead>المصدر</TableHead>
                <TableHead>تاريخ الإضافة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></TableCell></TableRow>
              ) : customers?.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">لا يوجد عملاء</TableCell></TableRow>
              ) : (
                customers?.map((c) => (
                  <TableRow key={c.id} className="cursor-pointer" onClick={() => navigate(`/customers/${c.id}`)}>
                    <TableCell className="font-medium">{c.full_name}</TableCell>
                    <TableCell className="font-mono text-sm">{c.primary_phone}</TableCell>
                    <TableCell>{c.city || "—"}</TableCell>
                    <TableCell><Badge variant="outline">{sourceLabels[c.source]}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(c.created_at).toLocaleDateString("ar-EG")}</TableCell>
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
