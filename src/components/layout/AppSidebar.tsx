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
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";

const navSections = [
  {
    label: "الرئيسية",
    items: [
      { to: "/dashboard", label: "لوحة التحكم", icon: LayoutDashboard },
    ],
  },
  {
    label: "المبيعات",
    items: [
      { to: "/customers", label: "العملاء", icon: Users },
      { to: "/orders", label: "الطلبات", icon: ShoppingCart },
    ],
  },
  {
    label: "العمليات",
    items: [
      { to: "/support", label: "الدعم", icon: Headphones },
      { to: "/crm-queue", label: "المتابعات", icon: PhoneCall },
      { to: "/tasks", label: "المهام", icon: ListTodo },
    ],
  },
  {
    label: "الإدارة",
    items: [
      { to: "/admin/users", label: "المستخدمين", icon: Shield, adminOnly: true },
    ],
  },
];

export default function AppSidebar() {
  const { signOut, staffUser } = useAuth();

  return (
    <aside className="fixed inset-y-0 left-0 z-30 flex w-56 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
      {/* Logo */}
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
        <Package className="h-6 w-6 text-sidebar-primary" />
        <span className="text-base font-bold tracking-tight">قطوف الخير</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        {navSections.map((section) => {
          const visibleItems = section.items.filter(
            (item) => !('adminOnly' in item && item.adminOnly) || staffUser?.role === 'admin'
          );
          if (visibleItems.length === 0) return null;
          return (
            <div key={section.label}>
              <p className="px-3 mb-1 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/40">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {visibleItems.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                      )
                    }
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-2">
        {staffUser && (
          <div className="px-3 py-1.5 mb-1">
            <p className="text-xs font-medium truncate">{staffUser.full_name}</p>
            <p className="text-[10px] text-sidebar-foreground/50 truncate">{staffUser.email}</p>
          </div>
        )}
        <button
          onClick={() => signOut()}
          className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
}
