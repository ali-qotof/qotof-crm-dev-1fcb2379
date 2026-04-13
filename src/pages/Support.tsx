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
import { Plus, Search } from "lucide-react";

const priorityColors: Record<string, "default" | "secondary" | "destructive"> = {
  "عالي": "destructive",
  "متوسط": "default",
  "منخفض": "secondary",
};

const mockTickets = [
  { id: "TKT-001", customer: "أحمد محمد", subject: "مشكلة في الشحن", priority: "عالي", status: "مفتوح", date: "2025-01-10" },
  { id: "TKT-002", customer: "فاطمة علي", subject: "استفسار عن منتج", priority: "منخفض", status: "مغلق", date: "2025-01-09" },
];

export default function Support() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="بحث..." className="pl-8" />
        </div>
        <Select>
          <SelectTrigger className="w-32"><SelectValue placeholder="الحالة" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="open">مفتوح</SelectItem>
            <SelectItem value="closed">مغلق</SelectItem>
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
          تذكرة جديدة
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الرقم</TableHead>
                <TableHead>العميل</TableHead>
                <TableHead>الموضوع</TableHead>
                <TableHead>الأولوية</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>التاريخ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTickets.map((t) => (
                <TableRow key={t.id} className="cursor-pointer">
                  <TableCell className="font-mono text-sm">{t.id}</TableCell>
                  <TableCell>{t.customer}</TableCell>
                  <TableCell>{t.subject}</TableCell>
                  <TableCell><Badge variant={priorityColors[t.priority]}>{t.priority}</Badge></TableCell>
                  <TableCell><Badge variant={t.status === "مفتوح" ? "default" : "secondary"}>{t.status}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{t.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
