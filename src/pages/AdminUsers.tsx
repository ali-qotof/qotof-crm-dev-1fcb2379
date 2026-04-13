import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const mockUsers = [
  { id: 1, name: "محمد أحمد", email: "mohamed@qotof.com", role: "admin", status: "نشط" },
  { id: 2, name: "سارة علي", email: "sara@qotof.com", role: "sales", status: "نشط" },
  { id: 3, name: "أحمد حسن", email: "ahmed@qotof.com", role: "operations", status: "نشط" },
];

const roleLabels: Record<string, string> = {
  admin: "مدير",
  sales: "مبيعات",
  customer_service: "خدمة عملاء",
  operations: "عمليات",
  manager: "مشرف",
};

export default function AdminUsers() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex-1" />
        <Button size="sm">
          <Plus className="h-4 w-4 mr-1" />
          مستخدم جديد
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الاسم</TableHead>
                <TableHead>البريد</TableHead>
                <TableHead>الدور</TableHead>
                <TableHead>الحالة</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockUsers.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                  <TableCell><Badge variant="outline">{roleLabels[u.role] ?? u.role}</Badge></TableCell>
                  <TableCell><Badge variant="default">{u.status}</Badge></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
