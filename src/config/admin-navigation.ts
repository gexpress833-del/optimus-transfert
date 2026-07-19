import {
  LayoutDashboard,
  Users,
  Building2,
  CreditCard,
  ArrowDownToLine,
  Percent,
  ScrollText,
  type LucideIcon,
} from "lucide-react";
import type { NavItem } from "./navigation";

export const ADMIN_NAV: NavItem[] = [
  { label: "Tableau de bord", href: "/admin", icon: LayoutDashboard },
  { label: "Utilisateurs", href: "/admin/users", icon: Users },
  { label: "Entreprises", href: "/admin/businesses", icon: Building2 },
  { label: "Paiements", href: "/admin/payments", icon: CreditCard },
  { label: "Retraits", href: "/admin/withdrawals", icon: ArrowDownToLine },
  { label: "Commissions", href: "/admin/commissions", icon: Percent },
  { label: "Audit Logs", href: "/admin/audit-logs", icon: ScrollText },
];
