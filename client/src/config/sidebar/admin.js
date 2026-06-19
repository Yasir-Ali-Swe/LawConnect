import {
  LayoutDashboard,
  Building2,
  UserCog,
  Users,
  UserPen
} from "lucide-react";

export const adminSidebarItems = [
  {
    title: "Dashboard",
    url: "/dashboard/admin",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    title: "Courts",
    url: "/dashboard/admin/courts",
    icon: Building2,
  },
  {
    title: "Users",
    url: "/dashboard/admin/users",
    icon: Users,
  },

  {
    title: "Profile",
    url: "/dashboard/admin/profile",
    icon: UserPen,
  },
];
