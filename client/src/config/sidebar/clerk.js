import {
  LayoutDashboard,
  Briefcase,
  UserCheck,
  User,
  Gavel,
} from "lucide-react";

export const clerkSidebarItems = [
  {
    title: "Dashboard",
    url: "/dashboard/clerk",
    icon: <LayoutDashboard className="mr-2 h-5 w-5" />,
    exact: true,
  },
  {
    title: "Submitted Cases",
    url: "/dashboard/clerk/cases",
    icon: <Gavel className="mr-2 h-5 w-5" />,
  },
  {
    title: "Court Officers",
    url: "/dashboard/clerk/court-officer",
    icon: <UserCheck className="mr-2 h-5 w-5" />,
  },
  {
    title: "Profile",
    url: "/dashboard/clerk/profile",
    icon: <User className="mr-2 h-5 w-5" />,
  },
];
