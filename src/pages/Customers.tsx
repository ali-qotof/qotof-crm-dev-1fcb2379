import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Search } from "lucide-react";

const mockCustomers = [
  { id: 1, name: "أحمد محمد", phone: "01012345678", city: "القاهرة", orders: 5, status: "نشط" },
  { id: 2, name: "فاطمة علي", phone: "01198765432", city: "الإسكندرية", orders: 2, status: "نشط" },
  { id: 3, name: "محمود حسن", phone: "01234567890", city: "المنصورة", orders: 0, status: "جديد" },
];

export default function Customers() {
  return (
    <div className="space-y-4">
      {/* Actions bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="بحث بالهاتف أو الاسم..." className="pl-8" />
        </div>
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1" />
          عميل جديد
        </Button>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>الهاتف</TableHead>
                <TableHead>المدينة</TableHead>
                <TableHead>الطلبات</TableHead>
                <TableHead>الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockCustomers.map((c) => (
                <TableRow key={c.id} className="cursor-pointer">
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="font-mono text-sm">{c.phone}</TableCell>
                  <TableCell>{c.city}</TableCell>
                  <TableCell>{c.orders}</TableCell>
                  <TableCell>
                    <Badge variant={c.status === "نشط" ? "default" : "secondary"}>
                      {c.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
