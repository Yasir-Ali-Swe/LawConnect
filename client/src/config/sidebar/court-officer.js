import { LayoutDashboard, Briefcase, User, Gavel } from "lucide-react";

export const courtOfficerSidebarItems = [
  {
    title: "Dashboard",
    url: "/dashboard/court-officer",
    icon: <LayoutDashboard className="mr-2 h-5 w-5" />,
    exact: true,
  },
  {
    title: "My Cases",
    url: "/dashboard/court-officer/case",
    icon: <Briefcase className="mr-2 h-5 w-5" />,
  },
  {
    title: "Profile",
    url: "/dashboard/court-officer/profile",
    icon: <User className="mr-2 h-5 w-5" />,
  },
];
