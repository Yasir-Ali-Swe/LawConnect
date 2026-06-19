import {
  LayoutDashboard,
  Briefcase,
  User,
  Gavel
} from "lucide-react";

export const courtOfficerSidebarItems = [
  {
    title: "Dashboard",
    url: "/dashboard/court-officer",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    title: "My Cases",
    url: "/dashboard/court-officer/case",
    icon: Briefcase,
  },
  {
    title: "Profile",
    url: "/dashboard/court-officer/profile",
    icon: User,
  },
];
