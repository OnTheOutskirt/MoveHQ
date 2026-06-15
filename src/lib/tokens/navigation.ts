import { ROUTES } from "@/lib/navigation/routes";
import type { LucideIcon } from "lucide-react";
import {
  Building2,
  Calendar,
  CalendarClock,
  ClipboardList,
  FileText,
  Inbox,
  LayoutDashboard,
  Footprints,
  Globe,
  ListChecks,
  MapPin,
  Package,
  Route,
  Scale,
  BarChart2,
  Plug,
  Settings,
  Sliders,
  Timer,
  Truck,
  UserCog,
  Users,
} from "lucide-react";

export type NavLink = {
  type: "link";
  label: string;
  href: string;
  icon: LucideIcon;
  /** Sidebar marker — module still in active development. */
  devIncomplete?: boolean;
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
    devIncomplete: true,
  },
  {
    type: "link",
    label: "Calendar",
    href: "/calendar",
    icon: Calendar,
  },
  {
    type: "link",
    label: "Schedule",
    href: "/schedule",
    icon: CalendarClock,
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
      { type: "link", label: "Dashboard", href: ROUTES.salesDashboard, icon: LayoutDashboard },
      { type: "link", label: "Moves", href: ROUTES.salesMoves, icon: Package },
      { type: "link", label: "AI Web Quotes", href: ROUTES.salesWebQuotes, icon: Globe },
      { type: "link", label: "Walkthroughs", href: ROUTES.salesWalkthroughs, icon: Footprints },
      { type: "link", label: "Follow-Ups", href: ROUTES.salesFollowUps, icon: ListChecks },
      { type: "link", label: "Documents", href: ROUTES.salesDocuments, icon: FileText },
      { type: "link", label: "Directory", href: ROUTES.salesDirectory, icon: Users },
    ],
  },
  {
    type: "dropdown",
    label: "Operations",
    icon: Truck,
    items: [
      { type: "link", label: "Dashboard", href: "/operations/dashboard", icon: LayoutDashboard },
      { type: "link", label: "Jobs", href: "/operations/jobs", icon: ClipboardList },
      { type: "link", label: "Dispatch", href: "/operations/dispatch", icon: Route },
      { type: "link", label: "Claims", href: "/operations/claims", icon: Scale, devIncomplete: true },
      { type: "link", label: "Crew", href: "/operations/crew", icon: Users },
      { type: "link", label: "Fleet", href: "/operations/fleet", icon: Truck },
      { type: "link", label: "Inventory", href: "/operations/inventory", icon: Package, devIncomplete: true },
      {
        type: "link",
        label: "Payroll & Time",
        href: "/operations/payroll",
        icon: Timer,
      },
    ],
  },
  {
    type: "link",
    label: "Reports",
    href: "/operations/reports",
    icon: BarChart2,
    devIncomplete: true,
  },
  {
    type: "link",
    label: "MoveHQ Planning",
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
      { type: "link", label: "Integrations", href: "/admin/integrations", icon: Plug },
      { type: "link", label: "Setup", href: "/admin/setup", icon: Sliders, devIncomplete: true },
    ],
  },
];

export const appConfig = {
  name: "Jonah's Movers",
  productName: "MoveHQ",
  tagline: "Moving operations dashboard",
};
