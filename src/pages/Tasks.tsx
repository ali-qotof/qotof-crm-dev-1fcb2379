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
import type { Database } from "@/integrations/supabase/types";

type TaskStatus = Database["public"]["Enums"]["task_status"];
type TaskType = Database["public"]["Enums"]["task_type"];
type Priority = Database["public"]["Enums"]["priority_level"];

const statusLabels: Record<TaskStatus, string> = {
  todo: "للتنفيذ", in_progress: "قيد التنفيذ", blocked: "متوقف",
  done: "تم", cancelled: "ملغى",
};
const typeLabels: Record<TaskType, string> = {
  call_customer: "اتصال بعميل",
  confirm_order: "تأكيد طلب",
  confirm_address: "تأكيد عنوان",
  followup_shipment: "متابعة شحنة",
  resolve_complaint: "حل شكوى",
  reactivation_call: "اتصال إعادة تنشيط",
  general_task: "مهمة عامة",
};
const priorityLabels: Record<Priority, string> = {
  low: "منخفض", normal: "عادي", high: "عالي", urgent: "عاجل",
};

const statusBadge: Record<TaskStatus, "default" | "secondary" | "destructive" | "outline"> = {
  todo: "secondary", in_progress: "default", blocked: "destructive",
  done: "outline", cancelled: "outline",
};
const priorityBadge: Record<Priority, "default" | "secondary" | "destructive" | "outline"> = {
  low: "outline", normal: "secondary", high: "default", urgent: "destructive",
};

export default function Tasks() {
  const [statusFilter, setStatusFilter] = useState("active");
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

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["tasks", statusFilter, assignedFilter, dueFrom, dueTo],
    queryFn: async () => {
      let query = supabase
        .from("tasks")
        .select("*, assignee:assigned_to(full_name)")
        .order("due_at", { ascending: true, nullsFirst: false });

      if (statusFilter === "active") {
        query = query.in("status", ["todo", "in_progress", "blocked"]);
      } else if (statusFilter !== "all") {
        query = query.eq("status", statusFilter as TaskStatus);
      }
      if (assignedFilter !== "all") query = query.eq("assigned_to", assignedFilter);
      if (dueFrom) query = query.gte("due_at", dueFrom);
      if (dueTo) query = query.lte("due_at", dueTo + "T23:59:59");

      const { data, error } = await query.limit(200);
      if (error) throw error;
      return data;
    },
  });

  const hasFilters = statusFilter !== "active" || assignedFilter !== "all" || dueFrom || dueTo;
  const clearFilters = () => {
    setStatusFilter("active"); setAssignedFilter("all");
    setDueFrom(""); setDueTo("");
  };

  const isOverdue = (dueAt: string | null, status: TaskStatus) =>
    !!dueAt && new Date(dueAt) < new Date() && (status === "todo" || status === "in_progress");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="الحالة" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="active">النشطة</SelectItem>
            <SelectItem value="all">الكل</SelectItem>
            {Object.entries(statusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
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
                <TableHead>المهمة</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>المسؤول</TableHead>
                <TableHead>الأولوية</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الاستحقاق</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></TableCell></TableRow>
              ) : tasks?.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">لا توجد مهام</TableCell></TableRow>
              ) : (
                tasks?.map((t) => {
                  const overdue = isOverdue(t.due_at, t.status);
                  return (
                    <TableRow key={t.id}>
                      <TableCell className="font-medium">{t.title}</TableCell>
                      <TableCell className="text-sm">{typeLabels[t.task_type]}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{(t as any).assignee?.full_name || "—"}</TableCell>
                      <TableCell><Badge variant={priorityBadge[t.priority]}>{priorityLabels[t.priority]}</Badge></TableCell>
                      <TableCell><Badge variant={statusBadge[t.status]}>{statusLabels[t.status]}</Badge></TableCell>
                      <TableCell className={`text-sm ${overdue ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                        {t.due_at ? new Date(t.due_at).toLocaleDateString("ar-EG") : "—"}
                        {overdue && <span className="mr-1">(متأخر)</span>}
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
