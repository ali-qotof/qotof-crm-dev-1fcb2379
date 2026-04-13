import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, ShoppingCart, Headphones, ListTodo } from "lucide-react";

const stats = [
  { label: "العملاء", value: "—", icon: Users, color: "text-info" },
  { label: "الطلبات", value: "—", icon: ShoppingCart, color: "text-primary" },
  { label: "تذاكر مفتوحة", value: "—", icon: Headphones, color: "text-warning" },
  { label: "مهام معلقة", value: "—", icon: ListTodo, color: "text-destructive" },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className={`h-4 w-4 ${s.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{s.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Placeholder sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">أحدث الطلبات</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">لا توجد بيانات بعد</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">المتابعات القادمة</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">لا توجد بيانات بعد</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
