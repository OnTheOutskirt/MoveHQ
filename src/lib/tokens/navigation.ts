import type { LucideIcon } from "lucide-react";
import {
  Building2,
  Calendar,
  ClipboardList,
  FileSignature,
  FileText,
  Inbox,
  LayoutDashboard,
  ListChecks,
  MapPin,
  Package,
  Route,
  BarChart2,
  Settings,
  Sliders,
  Truck,
  UserCog,
  Users,
} from "lucide-react";

export type NavLink = {
  type: "link";
  label: string;
  href: string;
  icon: LucideIcon;
};

export type NavDropdown = {
  type: "dropdown";
  label: string;
  icon: LucideIcon;
  items: NavLink[];
};

export type NavEntry = NavLink | NavDropdown;

export const navigation: NavEntry[] = [
  {
    type: "link",
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    type: "link",
    label: "Calendar",
    href: "/calendar",
    icon: Calendar,
  },
  {
    type: "link",
    label: "Inbox",
    href: "/inbox",
    icon: Inbox,
  },
  {
    type: "dropdown",
    label: "Sales",
    icon: MapPin,
    items: [
      { type: "link", label: "Moves", href: "/moves", icon: Package },
      { type: "link", label: "Directory", href: "/people", icon: Users },
      { type: "link", label: "Follow-Ups", href: "/follow-ups", icon: ListChecks },
      { type: "link", label: "Documents", href: "/documents", icon: FileText },
    ],
  },
  {
    type: "dropdown",
    label: "Operations",
    icon: Truck,
    items: [
      { type: "link", label: "Jobs", href: "/operations/jobs", icon: ClipboardList },
      { type: "link", label: "Dispatch", href: "/operations/dispatch", icon: Route },
      { type: "link", label: "Crew", href: "/operations/crew", icon: Users },
      { type: "link", label: "Trucks", href: "/operations/trucks", icon: Truck },
      {
        type: "link",
        label: "Forms & Fieldwork",
        href: "/operations/forms",
        icon: FileSignature,
      },
    ],
  },
  {
    type: "link",
    label: "Reports",
    href: "/operations/reports",
    icon: BarChart2,
  },
  {
    type: "link",
    label: "Planning",
    href: "/planning",
    icon: ClipboardList,
  },
  {
    type: "dropdown",
    label: "Admin",
    icon: Settings,
    items: [
      { type: "link", label: "Staff", href: "/admin/staff", icon: UserCog },
      { type: "link", label: "Company", href: "/admin/company", icon: Building2 },
      { type: "link", label: "Templates", href: "/admin/templates", icon: FileText },
      { type: "link", label: "Setup", href: "/admin/setup", icon: Sliders },
    ],
  },
];

export const appConfig = {
  name: "Jonah's Movers",
  productName: "MoveHQ",
  tagline: "Moving operations dashboard",
};
