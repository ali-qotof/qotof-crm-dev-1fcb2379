import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Headphones,
  PhoneCall,
  ListTodo,
  Shield,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
  { to: "/customers", label: "العملاء", icon: Users },
  { to: "/orders", label: "الطلبات", icon: ShoppingCart },
  { to: "/support", label: "الدعم", icon: Headphones },
  { to: "/crm-queue", label: "المتابعات", icon: PhoneCall },
  { to: "/tasks", label: "المهام", icon: ListTodo },
  { to: "/admin/users", label: "إدارة المستخدمين", icon: Shield },
];

export default function AppSidebar() {
  return (
    <aside className="fixed inset-y-0 right-0 z-30 flex w-60 flex-col bg-sidebar text-sidebar-foreground border-l border-sidebar-border">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b border-sidebar-border px-4">
        <h1 className="text-lg font-bold tracking-tight">قطوف الخير</h1>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )
            }
          >
            <item.icon className="h-5 w-5 shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3">
        <button className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors">
          <LogOut className="h-5 w-5 shrink-0" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
}
