import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const priorityVariant: Record<string, "default" | "secondary" | "destructive"> = {
  "عالي": "destructive",
  "متوسط": "default",
  "منخفض": "secondary",
};

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
  "جديد": "secondary",
  "قيد التنفيذ": "default",
  "مكتمل": "outline",
};

const mockTasks = [
  { id: 1, title: "تجهيز شحنة القاهرة", assignee: "محمد", priority: "عالي", status: "قيد التنفيذ", due: "2025-01-11" },
  { id: 2, title: "تحديث أسعار المنتجات", assignee: "سارة", priority: "متوسط", status: "جديد", due: "2025-01-13" },
  { id: 3, title: "مراجعة المخزون", assignee: "أحمد", priority: "منخفض", status: "مكتمل", due: "2025-01-09" },
];

export default function Tasks() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Select>
          <SelectTrigger className="w-32"><SelectValue placeholder="الحالة" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="new">جديد</SelectItem>
            <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
            <SelectItem value="done">مكتمل</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-32"><SelectValue placeholder="الأولوية" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="high">عالي</SelectItem>
            <SelectItem value="medium">متوسط</SelectItem>
            <SelectItem value="low">منخفض</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex-1" />
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1" />
          مهمة جديدة
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>المهمة</TableHead>
                <TableHead>المسؤول</TableHead>
                <TableHead>الأولوية</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>الاستحقاق</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTasks.map((t) => (
                <TableRow key={t.id} className="cursor-pointer">
                  <TableCell className="font-medium">{t.title}</TableCell>
                  <TableCell>{t.assignee}</TableCell>
                  <TableCell><Badge variant={priorityVariant[t.priority]}>{t.priority}</Badge></TableCell>
                  <TableCell><Badge variant={statusVariant[t.status]}>{t.status}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{t.due}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
