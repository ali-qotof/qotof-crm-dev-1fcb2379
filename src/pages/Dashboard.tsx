import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  ShoppingCart, AlertCircle, Headphones, ListTodo, PhoneCall, Loader2, X,
} from "lucide-react";

type Range = { from: string; to: string };

function todayRange(): Range {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const day = `${yyyy}-${mm}-${dd}`;
  return { from: day, to: day };
}

export default function Dashboard() {
  const [{ from, to }, setRange] = useState<Range>(todayRange());
  const [staffOwner, setStaffOwner] = useState("all");

  const fromIso = from ? `${from}T00:00:00` : null;
  const toIso = to ? `${to}T23:59:59` : null;
  const nowIso = new Date().toISOString();

  const { data: staffUsers } = useQuery({
    queryKey: ["staff-users-list"],
    queryFn: async () => {
      const { data, error } = await supabase.from("staff_users").select("id, full_name").eq("is_active", true).order("full_name");
      if (error) throw error;
      return data;
    },
  });

  // New orders (within range)
  const { data: newOrders, isLoading: l1 } = useQuery({
    queryKey: ["dash-new-orders", from, to, staffOwner],
    queryFn: async () => {
      let q = supabase.from("orders").select("id,order_number,total_amount,created_at,order_status,customers(full_name)", { count: "exact" })
        .eq("order_status", "new")
        .order("created_at", { ascending: false });
      if (fromIso) q = q.gte("created_at", fromIso);
      if (toIso) q = q.lte("created_at", toIso);
      if (staffOwner !== "all") q = q.eq("assigned_to", staffOwner);
      const { data, count, error } = await q.limit(5);
      if (error) throw error;
      return { rows: data, count: count ?? 0 };
    },
  });

  // Pending confirmations (status pending_confirmation OR new + age>24h). Keep simple: pending_confirmation only, no date filter (today + overdue)
  const { data: pendingConf, isLoading: l2 } = useQuery({
    queryKey: ["dash-pending-conf", staffOwner],
    queryFn: async () => {
      let q = supabase.from("orders").select("id,order_number,created_at,customers(full_name)", { count: "exact" })
        .eq("order_status", "pending_confirmation")
        .order("created_at", { ascending: true });
      if (staffOwner !== "all") q = q.eq("assigned_to", staffOwner);
      const { data, count, error } = await q.limit(5);
      if (error) throw error;
      return { rows: data, count: count ?? 0 };
    },
  });

  // Open tickets (any status not closed/resolved). Today + overdue = all currently open.
  const { data: openTickets, isLoading: l3 } = useQuery({
    queryKey: ["dash-open-tickets", staffOwner],
    queryFn: async () => {
      let q = supabase.from("support_tickets").select("id,ticket_number,subject,priority,ticket_status,created_at,customers(full_name)", { count: "exact" })
        .in("ticket_status", ["new", "open", "waiting_customer", "waiting_internal", "escalated", "reopened"])
        .order("created_at", { ascending: false });
      if (staffOwner !== "all") q = q.eq("assigned_to", staffOwner);
      const { data, count, error } = await q.limit(5);
      if (error) throw error;
      return { rows: data, count: count ?? 0 };
    },
  });

  // Due tasks (today + overdue): active status, due_at <= end of selected day
  const { data: dueTasks, isLoading: l4 } = useQuery({
    queryKey: ["dash-due-tasks", to, staffOwner],
    queryFn: async () => {
      const cutoff = toIso ?? nowIso;
      let q = supabase.from("tasks").select("id,title,task_type,priority,due_at,assignee:assigned_to(full_name)", { count: "exact" })
        .in("status", ["todo", "in_progress"])
        .lte("due_at", cutoff)
        .order("due_at", { ascending: true });
      if (staffOwner !== "all") q = q.eq("assigned_to", staffOwner);
      const { data, count, error } = await q.limit(5);
      if (error) throw error;
      return { rows: data, count: count ?? 0 };
    },
  });

  // Due CRM actions
  const { data: dueCrm, isLoading: l5 } = useQuery({
    queryKey: ["dash-due-crm", to, staffOwner],
    queryFn: async () => {
      const cutoff = toIso ?? nowIso;
      let q = supabase.from("crm_actions").select("id,action_type,priority,due_at,customers(id,full_name),assignee:assigned_to(full_name)", { count: "exact" })
        .in("action_status", ["pending", "in_progress"])
        .lte("due_at", cutoff)
        .order("due_at", { ascending: true });
      if (staffOwner !== "all") q = q.eq("assigned_to", staffOwner);
      const { data, count, error } = await q.limit(5);
      if (error) throw error;
      return { rows: data, count: count ?? 0 };
    },
  });

  const cards = [
    { label: "طلبات جديدة", value: newOrders?.count ?? 0, icon: ShoppingCart, color: "text-primary", to: "/orders", loading: l1 },
    { label: "بانتظار التأكيد", value: pendingConf?.count ?? 0, icon: AlertCircle, color: "text-warning", to: "/orders", loading: l2 },
    { label: "تذاكر مفتوحة", value: openTickets?.count ?? 0, icon: Headphones, color: "text-info", to: "/support", loading: l3 },
    { label: "مهام مستحقة", value: dueTasks?.count ?? 0, icon: ListTodo, color: "text-destructive", to: "/tasks", loading: l4 },
    { label: "متابعات مستحقة", value: dueCrm?.count ?? 0, icon: PhoneCall, color: "text-accent-foreground", to: "/crm-queue", loading: l5 },
  ];

  const hasFilters = staffOwner !== "all" || from !== todayRange().from || to !== todayRange().to;
  const clearFilters = () => { setRange(todayRange()); setStaffOwner("all"); };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">من</span>
        <Input type="date" className="w-36" value={from} onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))} />
        <span className="text-sm text-muted-foreground">إلى</span>
        <Input type="date" className="w-36" value={to} onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))} />
        <Select value={staffOwner} onValueChange={setStaffOwner}>
          <SelectTrigger className="w-44"><SelectValue placeholder="المسؤول" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">كل المسؤولين</SelectItem>
            {staffUsers?.map((s) => <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>)}
          </SelectContent>
        </Select>
        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters}><X className="h-3 w-3 mr-1" />إعادة ضبط</Button>
        )}
        <span className="text-xs text-muted-foreground mr-auto">المهام والمتابعات تشمل المتأخرة حتى نهاية «إلى»</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map((c) => (
          <Link key={c.label} to={c.to}>
            <Card className="hover:bg-accent/40 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
                <c.icon className={`h-4 w-4 ${c.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {c.loading ? <Loader2 className="h-5 w-5 animate-spin" /> : c.value}
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Detail lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base">أحدث الطلبات الجديدة</CardTitle></CardHeader>
          <CardContent>
            {newOrders?.rows?.length ? (
              <div className="space-y-2">
                {newOrders.rows.map((o: any) => (
                  <Link key={o.id} to={`/orders/${o.id}`} className="flex items-center justify-between text-sm border-b last:border-0 pb-2 hover:bg-accent/30 -mx-2 px-2 rounded">
                    <span className="font-mono">{o.order_number}</span>
                    <span className="text-muted-foreground">{o.customers?.full_name || "—"}</span>
                    <span className="font-medium">{o.total_amount} ج.م</span>
                  </Link>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground">لا توجد طلبات جديدة</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">بانتظار التأكيد</CardTitle></CardHeader>
          <CardContent>
            {pendingConf?.rows?.length ? (
              <div className="space-y-2">
                {pendingConf.rows.map((o: any) => (
                  <Link key={o.id} to={`/orders/${o.id}`} className="flex items-center justify-between text-sm border-b last:border-0 pb-2 hover:bg-accent/30 -mx-2 px-2 rounded">
                    <span className="font-mono">{o.order_number}</span>
                    <span className="text-muted-foreground">{o.customers?.full_name || "—"}</span>
                    <span className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleDateString("ar-EG")}</span>
                  </Link>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground">لا يوجد طلبات بانتظار التأكيد</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">تذاكر مفتوحة</CardTitle></CardHeader>
          <CardContent>
            {openTickets?.rows?.length ? (
              <div className="space-y-2">
                {openTickets.rows.map((t: any) => (
                  <Link key={t.id} to={`/support/${t.id}`} className="flex items-center justify-between text-sm border-b last:border-0 pb-2 hover:bg-accent/30 -mx-2 px-2 rounded">
                    <span className="font-mono">{t.ticket_number}</span>
                    <span className="truncate flex-1 mx-2">{t.subject}</span>
                    <span className="text-xs text-muted-foreground">{t.customers?.full_name || "—"}</span>
                  </Link>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground">لا توجد تذاكر مفتوحة</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">مهام ومتابعات مستحقة</CardTitle></CardHeader>
          <CardContent>
            {(dueTasks?.rows?.length || dueCrm?.rows?.length) ? (
              <div className="space-y-2">
                {dueTasks?.rows?.map((t: any) => (
                  <Link key={`task-${t.id}`} to="/tasks" className="flex items-center justify-between text-sm border-b last:border-0 pb-2 hover:bg-accent/30 -mx-2 px-2 rounded">
                    <span className="text-xs text-muted-foreground">مهمة</span>
                    <span className="truncate flex-1 mx-2 font-medium">{t.title}</span>
                    <span className="text-xs text-muted-foreground">{t.due_at ? new Date(t.due_at).toLocaleDateString("ar-EG") : "—"}</span>
                  </Link>
                ))}
                {dueCrm?.rows?.map((a: any) => (
                  <Link key={`crm-${a.id}`} to="/crm-queue" className="flex items-center justify-between text-sm border-b last:border-0 pb-2 hover:bg-accent/30 -mx-2 px-2 rounded">
                    <span className="text-xs text-muted-foreground">متابعة</span>
                    <span className="truncate flex-1 mx-2">{a.customers?.full_name || "—"}</span>
                    <span className="text-xs text-muted-foreground">{a.due_at ? new Date(a.due_at).toLocaleDateString("ar-EG") : "—"}</span>
                  </Link>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground">لا يوجد عناصر مستحقة</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
