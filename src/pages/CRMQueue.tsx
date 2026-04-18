import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Loader2, X } from "lucide-react";
import { Link } from "react-router-dom";
import type { Database } from "@/integrations/supabase/types";

type ActionType = Database["public"]["Enums"]["crm_action_type"];
type ActionStatus = Database["public"]["Enums"]["crm_action_status"];
type Priority = Database["public"]["Enums"]["priority_level"];

const typeLabels: Record<ActionType, string> = {
  first_order_followup: "متابعة أول طلب",
  post_delivery_check: "تأكيد ما بعد التوصيل",
  cross_sell: "بيع تكميلي",
  upsell: "ترقية بيع",
  winback: "استرجاع عميل",
  reactivation: "إعادة تنشيط",
  review_request: "طلب مراجعة",
  complaint_recovery: "متابعة شكوى",
};
const statusLabels: Record<ActionStatus, string> = {
  pending: "معلق", in_progress: "قيد التنفيذ", completed: "مكتمل",
  skipped: "متخطى", snoozed: "مؤجل",
};
const priorityLabels: Record<Priority, string> = {
  low: "منخفض", normal: "عادي", high: "عالي", urgent: "عاجل",
};

const statusBadge: Record<ActionStatus, "default" | "secondary" | "destructive" | "outline"> = {
  pending: "secondary", in_progress: "default", completed: "outline",
  skipped: "outline", snoozed: "outline",
};
const priorityBadge: Record<Priority, "default" | "secondary" | "destructive" | "outline"> = {
  low: "outline", normal: "secondary", high: "default", urgent: "destructive",
};

export default function CRMQueue() {
  const [statusFilter, setStatusFilter] = useState("pending");
  const [typeFilter, setTypeFilter] = useState("all");
  const [assignedFilter, setAssignedFilter] = useState("all");
  const [dueFrom, setDueFrom] = useState("");
  const [dueTo, setDueTo] = useState("");

  const { data: staffUsers } = useQuery({
    queryKey: ["staff-users-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("staff_users").select("id, full_name").eq("is_active", true).order("full_name");
      if (error) throw error;
      return data;
    },
  });

  const { data: actions, isLoading } = useQuery({
    queryKey: ["crm-actions", statusFilter, typeFilter, assignedFilter, dueFrom, dueTo],
    queryFn: async () => {
      let query = supabase
        .from("crm_actions")
        .select("*, customers(id, full_name, primary_phone), assignee:assigned_to(full_name)")
        .order("due_at", { ascending: true, nullsFirst: false });

      if (statusFilter !== "all") query = query.eq("action_status", statusFilter as ActionStatus);
      if (typeFilter !== "all") query = query.eq("action_type", typeFilter as ActionType);
      if (assignedFilter !== "all") query = query.eq("assigned_to", assignedFilter);
      if (dueFrom) query = query.gte("due_at", dueFrom);
      if (dueTo) query = query.lte("due_at", dueTo + "T23:59:59");

      const { data, error } = await query.limit(200);
      if (error) throw error;
      return data;
    },
  });

  const hasFilters = statusFilter !== "pending" || typeFilter !== "all" || assignedFilter !== "all" || dueFrom || dueTo;
  const clearFilters = () => {
    setStatusFilter("pending"); setTypeFilter("all"); setAssignedFilter("all");
    setDueFrom(""); setDueTo("");
  };

  const isOverdue = (dueAt: string | null, status: ActionStatus) =>
    !!dueAt && new Date(dueAt) < new Date() && (status === "pending" || status === "in_progress");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32"><SelectValue placeholder="الحالة" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            {Object.entries(statusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="نوع المتابعة" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الأنواع</SelectItem>
            {Object.entries(typeLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={assignedFilter} onValueChange={setAssignedFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="المسؤول" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل المسؤولين</SelectItem>
            {staffUsers?.map((s) => <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input type="date" className="w-36" value={dueFrom} onChange={(e) => setDueFrom(e.target.value)} />
        <Input type="date" className="w-36" value={dueTo} onChange={(e) => setDueTo(e.target.value)} />
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}><X className="h-3 w-3 mr-1" />مسح</Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>العميل</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>الأولوية</TableHead>
                <TableHead>الاستحقاق</TableHead>
                <TableHead>المسؤول</TableHead>
                <TableHead>الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></TableCell></TableRow>
              ) : actions?.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">لا توجد متابعات</TableCell></TableRow>
              ) : (
                actions?.map((a) => {
                  const cust = a.customers as any;
                  const overdue = isOverdue(a.due_at, a.action_status);
                  return (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium">
                        {cust ? <Link to={`/customers/${cust.id}`} className="hover:underline">{cust.full_name}</Link> : "—"}
                      </TableCell>
                      <TableCell>{typeLabels[a.action_type]}</TableCell>
                      <TableCell><Badge variant={priorityBadge[a.priority]}>{priorityLabels[a.priority]}</Badge></TableCell>
                      <TableCell className={`text-sm ${overdue ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                        {a.due_at ? new Date(a.due_at).toLocaleDateString("ar-EG") : "—"}
                        {overdue && <span className="mr-1">(متأخر)</span>}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{(a as any).assignee?.full_name || "—"}</TableCell>
                      <TableCell><Badge variant={statusBadge[a.action_status]}>{statusLabels[a.action_status]}</Badge></TableCell>
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
