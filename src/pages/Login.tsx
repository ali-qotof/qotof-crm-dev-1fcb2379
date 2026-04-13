import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package } from "lucide-react";

export default function Login() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Package className="h-6 w-6" />
            </div>
          </div>
          <CardTitle className="text-xl">قطوف الخير</CardTitle>
          <p className="text-sm text-muted-foreground">تسجيل الدخول إلى النظام</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>البريد الإلكتروني</Label>
            <Input type="email" placeholder="name@qotof.com" />
          </div>
          <div className="space-y-2">
            <Label>كلمة المرور</Label>
            <Input type="password" placeholder="••••••••" />
          </div>
          <Button className="w-full">دخول</Button>
          <p className="text-xs text-center text-muted-foreground">
            سيتم تفعيل تسجيل الدخول بعد ربط قاعدة البيانات
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
