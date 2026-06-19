import {
  LayoutDashboard,
  Briefcase,
  UserCheck,
  User,
  Gavel
} from "lucide-react";

export const clerkSidebarItems = [
  {
    title: "Dashboard",
    url: "/dashboard/clerk",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    title: "Submitted Cases",
    url: "/dashboard/clerk/cases",
    icon: Gavel,
  },
  {
    title: "Court Officers",
    url: "/dashboard/clerk/court-officer",
    icon: UserCheck,
  },
  {
    title: "Profile",
    url: "/dashboard/clerk/profile",
    icon: User,
  },
];
