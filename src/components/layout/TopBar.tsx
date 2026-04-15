import { useLocation } from "react-router-dom";
import { Search, Bell, ChevronDown, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";

const pageTitles: Record<string, string> = {
  "/dashboard": "لوحة التحكم",
  "/customers": "العملاء",
  "/orders": "الطلبات",
  "/orders/new": "طلب جديد",
  "/support": "الدعم",
  "/crm-queue": "المتابعات",
  "/tasks": "المهام",
  "/admin/users": "إدارة المستخدمين",
};

const roleLabels: Record<string, string> = {
  admin: "مدير",
  sales: "مبيعات",
  customer_service: "خدمة عملاء",
  operations: "عمليات",
  manager: "مشرف",
};

export default function TopBar() {
  const location = useLocation();
  const { staffUser, signOut } = useAuth();

  const title =
    pageTitles[location.pathname] ??
    Object.entries(pageTitles).find(([path]) =>
      location.pathname.startsWith(path + "/")
    )?.[1] ??
    "";

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 px-6">
      <h1 className="text-lg font-semibold text-foreground">{title}</h1>

      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="بحث..." className="w-56 pl-8 h-9 text-sm" readOnly />
        </div>

        <Button variant="ghost" size="icon" className="h-9 w-9 relative">
          <Bell className="h-4 w-4" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 gap-2 px-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
                <User className="h-3.5 w-3.5" />
              </div>
              <div className="hidden lg:block text-right">
                <span className="text-sm font-medium block leading-tight">
                  {staffUser?.full_name ?? "مستخدم"}
                </span>
                <span className="text-[10px] text-muted-foreground block leading-tight">
                  {roleLabels[staffUser?.role ?? ""] ?? staffUser?.role}
                </span>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem disabled className="text-xs text-muted-foreground">
              {staffUser?.email}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => signOut()}>
              تسجيل الخروج
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
