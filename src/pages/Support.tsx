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
import { Search, Loader2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Database } from "@/integrations/supabase/types";

type TStatus = Database["public"]["Enums"]["ticket_status"];
type TIssue = Database["public"]["Enums"]["ticket_issue_type"];
type TPriority = Database["public"]["Enums"]["ticket_priority"];

const statusLabels: Record<TStatus, string> = {
  new: "جديد", open: "مفتوح", waiting_customer: "بانتظار العميل",
  waiting_internal: "بانتظار داخلي", escalated: "متصاعد",
  resolved: "تم الحل", closed: "مغلق", reopened: "أعيد فتحه",
};
const issueLabels: Record<TIssue, string> = {
  late_delivery: "تأخر التوصيل", wrong_item: "صنف خاطئ", missing_item: "صنف ناقص",
  damaged_item: "صنف تالف", quality_issue: "مشكلة جودة", refund_request: "طلب استرداد",
  exchange_request: "طلب استبدال", courier_issue: "مشكلة شحن",
  general_complaint: "شكوى عامة", inquiry: "استفسار",
};
const priorityLabels: Record<TPriority, string> = {
  low: "منخفض", normal: "عادي", high: "عالي", urgent: "عاجل",
};

const statusBadge: Record<TStatus, "default" | "secondary" | "destructive" | "outline"> = {
  new: "secondary", open: "default", waiting_customer: "outline", waiting_internal: "outline",
  escalated: "destructive", resolved: "default", closed: "outline", reopened: "secondary",
};
const priorityBadge: Record<TPriority, "default" | "secondary" | "destructive" | "outline"> = {
  low: "outline", normal: "secondary", high: "default", urgent: "destructive",
};

export default function Support() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [issueFilter, setIssueFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [assignedFilter, setAssignedFilter] = useState("all");

  const { data: staffUsers } = useQuery({
    queryKey: ["staff-users-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("staff_users").select("id, full_name").eq("is_active", true).order("full_name");
      if (error) throw error;
      return data;
    },
  });

  const { data: tickets, isLoading } = useQuery({
    queryKey: ["tickets", search, statusFilter, issueFilter, priorityFilter, assignedFilter],
    queryFn: async () => {
      let query = supabase
        .from("support_tickets")
        .select("*, customers(full_name, primary_phone), assignee:assigned_to(full_name)")
        .order("created_at", { ascending: false });

      if (search.trim()) query = query.or(`ticket_number.ilike.%${search.trim()}%,subject.ilike.%${search.trim()}%`);
      if (statusFilter !== "all") query = query.eq("ticket_status", statusFilter as TStatus);
      if (issueFilter !== "all") query = query.eq("issue_type", issueFilter as TIssue);
      if (priorityFilter !== "all") query = query.eq("priority", priorityFilter as TPriority);
      if (assignedFilter !== "all") query = query.eq("assigned_to", assignedFilter);

      const { data, error } = await query.limit(200);
      if (error) throw error;
      return data;
    },
  });

  const hasFilters = statusFilter !== "all" || issueFilter !== "all" || priorityFilter !== "all" || assignedFilter !== "all";
  const clearFilters = () => {
    setStatusFilter("all"); setIssueFilter("all"); setPriorityFilter("all"); setAssignedFilter("all");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="بحث برقم التذكرة أو الموضوع..." className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="الحالة" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الحالات</SelectItem>
            {Object.entries(statusLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={issueFilter} onValueChange={setIssueFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="نوع المشكلة" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الأنواع</SelectItem>
            {Object.entries(issueLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-32"><SelectValue placeholder="الأولوية" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل الأولويات</SelectItem>
            {Object.entries(priorityLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={assignedFilter} onValueChange={setAssignedFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="المسؤول" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل المسؤولين</SelectItem>
            {staffUsers?.map((s) => <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>)}
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}><X className="h-3 w-3 mr-1" />مسح</Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الرقم</TableHead>
                <TableHead>الموضوع</TableHead>
                <TableHead>العميل</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>الأولوية</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>المسؤول</TableHead>
                <TableHead>التاريخ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8"><Loader2 className="h-5 w-5 animate-spin mx-auto" /></TableCell></TableRow>
              ) : tickets?.length === 0 ? (
                <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">لا توجد تذاكر</TableCell></TableRow>
              ) : (
                tickets?.map((t) => {
                  const cust = t.customers as any;
                  const assignee = (t as any).assignee;
                  return (
                    <TableRow key={t.id} className="cursor-pointer" onClick={() => navigate(`/support/${t.id}`)}>
                      <TableCell className="font-mono text-sm">{t.ticket_number}</TableCell>
                      <TableCell className="font-medium">{t.subject}</TableCell>
                      <TableCell>{cust?.full_name || "—"}</TableCell>
                      <TableCell className="text-sm">{issueLabels[t.issue_type]}</TableCell>
                      <TableCell><Badge variant={priorityBadge[t.priority]}>{priorityLabels[t.priority]}</Badge></TableCell>
                      <TableCell><Badge variant={statusBadge[t.ticket_status]}>{statusLabels[t.ticket_status]}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{assignee?.full_name || "—"}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{new Date(t.created_at).toLocaleDateString("ar-EG")}</TableCell>
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
