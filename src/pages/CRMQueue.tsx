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

const mockActions = [
  { id: 1, customer: "أحمد محمد", type: "متابعة طلب", due: "2025-01-12", status: "معلق", assignee: "محمد" },
  { id: 2, customer: "فاطمة علي", type: "اتصال", due: "2025-01-10", status: "متأخر", assignee: "سارة" },
  { id: 3, customer: "محمود حسن", type: "عرض سعر", due: "2025-01-15", status: "مكتمل", assignee: "محمد" },
];

const statusVariant: Record<string, "default" | "secondary" | "destructive"> = {
  "معلق": "secondary",
  "متأخر": "destructive",
  "مكتمل": "default",
};

export default function CRMQueue() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Select>
          <SelectTrigger className="w-32"><SelectValue placeholder="الحالة" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="pending">معلق</SelectItem>
            <SelectItem value="overdue">متأخر</SelectItem>
            <SelectItem value="done">مكتمل</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger className="w-32"><SelectValue placeholder="المسؤول" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex-1" />
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1" />
          متابعة جديدة
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>العميل</TableHead>
                <TableHead>النوع</TableHead>
                <TableHead>تاريخ الاستحقاق</TableHead>
                <TableHead>المسؤول</TableHead>
                <TableHead>الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockActions.map((a) => (
                <TableRow key={a.id} className="cursor-pointer">
                  <TableCell className="font-medium">{a.customer}</TableCell>
                  <TableCell>{a.type}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{a.due}</TableCell>
                  <TableCell>{a.assignee}</TableCell>
                  <TableCell><Badge variant={statusVariant[a.status]}>{a.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
