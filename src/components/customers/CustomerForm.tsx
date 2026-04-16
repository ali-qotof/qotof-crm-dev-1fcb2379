import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type CustomerSource = Database["public"]["Enums"]["customer_source"];
type CustomerStage = Database["public"]["Enums"]["customer_stage"];
type CustomerRow = Database["public"]["Tables"]["customers"]["Row"];

const sourceLabels: Record<CustomerSource, string> = {
  walk_in: "زيارة مباشرة", phone: "هاتف", whatsapp: "واتساب",
  website: "الموقع", woocommerce: "WooCommerce", referral: "إحالة", other: "أخرى",
};

const stageLabels: Record<CustomerStage, string> = {
  lead: "محتمل", active: "نشط", inactive: "غير نشط", vip: "VIP", blocked: "محظور",
};

const egyptGovernorates = [
  "القاهرة", "الجيزة", "الإسكندرية", "الدقهلية", "البحر الأحمر", "البحيرة",
  "الفيوم", "الغربية", "الإسماعيلية", "المنوفية", "المنيا", "القليوبية",
  "الوادي الجديد", "السويس", "أسوان", "أسيوط", "بني سويف", "بورسعيد",
  "دمياط", "الشرقية", "جنوب سيناء", "كفر الشيخ", "مطروح", "الأقصر",
  "قنا", "شمال سيناء", "سوهاج",
];

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("2")) return digits;
  if (digits.startsWith("0")) return "2" + digits;
  return "20" + digits;
}

const emptyForm = {
  full_name: "", primary_phone: "", city: "", email: "",
  address: "", source: "phone" as CustomerSource, notes: "",
  governorate: "", customer_stage: "lead" as CustomerStage,
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: CustomerRow | null;
  onSuccess?: (id: string) => void;
}

export default function CustomerForm({ open, onOpenChange, customer, onSuccess }: Props) {
  const queryClient = useQueryClient();
  const isEdit = !!customer;

  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (customer) {
      setForm({
        full_name: customer.full_name,
        primary_phone: customer.primary_phone,
        city: customer.city || "",
        email: customer.email || "",
        address: customer.address || "",
        source: customer.source,
        notes: customer.notes || "",
        governorate: (customer as any).governorate || "",
        customer_stage: (customer as any).customer_stage || "lead",
      });
    } else {
      setForm(emptyForm);
    }
  }, [customer, open]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!form.full_name || !form.primary_phone) throw new Error("الاسم ورقم الهاتف مطلوبان");
      const normalized = normalizePhone(form.primary_phone);

      // Duplicate check (skip for edits if phone unchanged)
      if (!isEdit || normalized !== customer?.primary_phone_normalized) {
        const { data: existing } = await supabase
          .from("customers")
          .select("id")
          .eq("primary_phone_normalized", normalized)
          .maybeSingle();
        if (existing && existing.id !== customer?.id) throw new Error("رقم الهاتف مسجل بالفعل");
      }

      const payload = {
        full_name: form.full_name,
        primary_phone: form.primary_phone,
        primary_phone_normalized: normalized,
        city: form.city || null,
        email: form.email || null,
        address: form.address || null,
        source: form.source,
        notes: form.notes || null,
        governorate: form.governorate || null,
        customer_stage: form.customer_stage,
      };

      if (isEdit) {
        const { data, error } = await supabase
          .from("customers").update(payload as any).eq("id", customer!.id).select().single();
        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from("customers").insert(payload as any).select().single();
        if (error) throw error;
        return data;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      queryClient.invalidateQueries({ queryKey: ["customer", data.id] });
      onOpenChange(false);
      toast.success(isEdit ? "تم تحديث بيانات العميل" : "تم إضافة العميل بنجاح");
      onSuccess?.(data.id);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "تعديل بيانات العميل" : "إضافة عميل جديد"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>الاسم *</Label>
            <Input value={form.full_name} onChange={e => set("full_name", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>رقم الهاتف *</Label>
            <Input className="font-mono" placeholder="01XXXXXXXXX" value={form.primary_phone} onChange={e => set("primary_phone", e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>المحافظة</Label>
              <Select value={form.governorate} onValueChange={v => set("governorate", v)}>
                <SelectTrigger><SelectValue placeholder="اختر المحافظة" /></SelectTrigger>
                <SelectContent>
                  {egyptGovernorates.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>المرحلة</Label>
              <Select value={form.customer_stage} onValueChange={v => set("customer_stage", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(stageLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1">
            <Label>المدينة / المنطقة</Label>
            <Input value={form.city} onChange={e => set("city", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>البريد الإلكتروني</Label>
            <Input type="email" value={form.email} onChange={e => set("email", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>العنوان</Label>
            <Input value={form.address} onChange={e => set("address", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>المصدر</Label>
            <Select value={form.source} onValueChange={v => set("source", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(sourceLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>ملاحظات</Label>
            <Textarea rows={2} value={form.notes} onChange={e => set("notes", e.target.value)} />
          </div>
          <Button className="w-full" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            {mutation.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
            {isEdit ? "حفظ التعديلات" : "حفظ العميل"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
