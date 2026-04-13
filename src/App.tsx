import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import CustomerDetail from "./pages/CustomerDetail";
import Orders from "./pages/Orders";
import OrderNew from "./pages/OrderNew";
import OrderDetail from "./pages/OrderDetail";
import Support from "./pages/Support";
import TicketDetail from "./pages/TicketDetail";
import CRMQueue from "./pages/CRMQueue";
import Tasks from "./pages/Tasks";
import AdminUsers from "./pages/AdminUsers";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="customers" element={<Customers />} />
            <Route path="customers/:id" element={<CustomerDetail />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/new" element={<OrderNew />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="support" element={<Support />} />
            <Route path="support/:id" element={<TicketDetail />} />
            <Route path="crm-queue" element={<CRMQueue />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="admin/users" element={<AdminUsers />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
