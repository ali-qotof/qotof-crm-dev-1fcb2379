import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type OrderSource = Database["public"]["Enums"]["order_source"];

const sourceChannels: { value: OrderSource; label: string }[] = [
  { value: "manual", label: "يدوي" },
  { value: "phone", label: "هاتف" },
  { value: "whatsapp", label: "واتساب" },
  { value: "woocommerce", label: "WooCommerce" },
  { value: "other", label: "أخرى" },
];

interface LineItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
}

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("2")) return digits;
  if (digits.startsWith("0")) return "2" + digits;
  return "20" + digits;
}

export default function OrderNew() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [source, setSource] = useState<OrderSource>("manual");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<LineItem[]>([]);

  // Products list
  const { data: products } = useQuery({
    queryKey: ["products-active"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").eq("is_active", true).order("name");
      if (error) throw error;
      return data;
    },
  });

  // Customer lookup
  const lookupCustomer = async () => {
    if (!phone.trim()) return;
    const normalized = normalizePhone(phone.trim());
    const { data } = await supabase
      .from("customers")
      .select("id, full_name")
      .eq("primary_phone_normalized", normalized)
      .maybeSingle();
    if (data) {
      setCustomerId(data.id);
      setCustomerName(data.full_name);
      toast.success(`تم العثور على: ${data.full_name}`);
    } else {
      setCustomerId(null);
      setCustomerName("");
      toast.error("العميل غير موجود — يرجى إضافته أولاً من صفحة العملاء");
    }
  };

  const addItem = () => {
    setItems([...items, { product_id: "", product_name: "", quantity: 1, unit_price: 0 }]);
  };

  const updateItem = (idx: number, field: keyof LineItem, value: any) => {
    setItems(items.map((it, i) => {
      if (i !== idx) return it;
      const updated = { ...it, [field]: value };
      // Auto-fill from products
      if (field === "product_id" && products) {
        const p = products.find((pr) => pr.id === value);
        if (p) {
          updated.product_name = p.name;
          updated.unit_price = p.price;
        }
      }
      return updated;
    }));
  };

  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));

  const total = items.reduce((sum, it) => sum + it.quantity * it.unit_price, 0);

  const createOrder = useMutation({
    mutationFn: async () => {
      if (!customerId) throw new Error("يرجى تحديد العميل أولاً");
      if (items.length === 0) throw new Error("يرجى إضافة منتج واحد على الأقل");

      const { data: order, error } = await supabase
        .from("orders")
        .insert({
          customer_id: customerId,
          source,
          notes: notes || null,
          total_amount: total,
          order_number: "", // trigger will generate
        })
        .select()
        .single();
      if (error) throw error;

      const orderItems = items.map((it) => ({
        order_id: order.id,
        product_id: it.product_id || null,
        product_name: it.product_name,
        quantity: it.quantity,
        unit_price: it.unit_price,
        total_price: it.quantity * it.unit_price,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
      if (itemsError) throw itemsError;

      return order;
    },
    onSuccess: (order) => {
      toast.success("تم إنشاء الطلب بنجاح");
      navigate(`/orders/${order.id}`);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/orders"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h2 className="text-lg font-semibold">طلب جديد</h2>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">بيانات الطلب</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {/* Customer lookup */}
          <div className="space-y-2">
            <Label>رقم هاتف العميل</Label>
            <div className="flex gap-2">
              <Input placeholder="01XXXXXXXXX" className="font-mono flex-1" value={phone} onChange={(e) => setPhone(e.target.value)} onKeyDown={(e) => e.key === "Enter" && lookupCustomer()} />
              <Button variant="outline" onClick={lookupCustomer}>بحث</Button>
            </div>
            {customerName && <p className="text-sm text-green-600 font-medium">✓ {customerName}</p>}
          </div>

          {/* Source */}
          <div className="space-y-2">
            <Label>مصدر الطلب</Label>
            <Select value={source} onValueChange={(v) => setSource(v as OrderSource)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {sourceChannels.map((ch) => (
                  <SelectItem key={ch.value} value={ch.value}>{ch.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Products */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>المنتجات</Label>
              <Button variant="outline" size="sm" onClick={addItem}><Plus className="h-3 w-3 mr-1" />إضافة</Button>
            </div>
            {items.length === 0 ? (
              <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
                اضغط "إضافة" لإضافة منتجات الطلب
              </div>
            ) : (
              <div className="space-y-2">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 border rounded-md p-2">
                    <Select value={item.product_id} onValueChange={(v) => updateItem(idx, "product_id", v)}>
                      <SelectTrigger className="flex-1"><SelectValue placeholder="اختر منتج" /></SelectTrigger>
                      <SelectContent>
                        {products?.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.name} — {p.price} ج.م/{p.unit}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input type="number" min={1} className="w-20" placeholder="الكمية" value={item.quantity} onChange={(e) => updateItem(idx, "quantity", Number(e.target.value))} />
                    <Input type="number" className="w-24 font-mono" placeholder="السعر" value={item.unit_price} onChange={(e) => updateItem(idx, "unit_price", Number(e.target.value))} />
                    <Button variant="ghost" size="icon" onClick={() => removeItem(idx)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                ))}
                <p className="text-sm font-medium text-left">الإجمالي: {total} ج.م</p>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label>ملاحظات</Label>
            <Textarea placeholder="ملاحظات إضافية..." rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          <div className="flex gap-3 pt-2">
            <Button onClick={() => createOrder.mutate()} disabled={createOrder.isPending}>
              {createOrder.isPending && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              حفظ الطلب
            </Button>
            <Button variant="outline" asChild><Link to="/orders">إلغاء</Link></Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
