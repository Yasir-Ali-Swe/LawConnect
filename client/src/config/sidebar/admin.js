import {
  LayoutDashboard,
  Building2,
  UserCog,
  Users,
  UserPen,
} from "lucide-react";

export const adminSidebarItems = [
  {
    title: "Dashboard",
    url: "/dashboard/admin",
    icon: <LayoutDashboard className="mr-2 h-5 w-5" />,
    exact: true,
  },
  {
    title: "Courts",
    url: "/dashboard/admin/courts",
    icon: <Building2 className="mr-2 h-5 w-5" />,
  },
  {
    title: "Users",
    url: "/dashboard/admin/users",
    icon: <Users className="mr-2 h-5 w-5" />,
  },

  {
    title: "Profile",
    url: "/dashboard/admin/profile",
    icon: <UserPen className="mr-2 h-5 w-5" />,
  },
];
