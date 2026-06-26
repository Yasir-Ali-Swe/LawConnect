import {
  LayoutDashboard,
  FileText,
  Briefcase,
  UserPen,
  MessageCircle,
  Bell,
} from "lucide-react";

export const lawyerSidebarItems = [
  {
    title: "Dashboard",
    url: "/dashboard/lawyer",
    icon: <LayoutDashboard className="mr-2 h-5 w-5" />,
    exact: true,
  },
  {
    title: "Proposals",
    url: "/dashboard/lawyer/proposals",
    icon: <FileText className="mr-2 h-5 w-5" />,
  },
  {
    title: "Cases",
    url: "/dashboard/lawyer/cases",
    icon: <Briefcase className="mr-2 h-5 w-5" />,
  },
  {
    title: "Messages",
    url: "/dashboard/lawyer/messages",
    icon: <MessageCircle className="mr-2 h-5 w-5" />,
  },
  {
    title: "Notifications",
    url: "/dashboard/lawyer/notifications",
    icon: <Bell className="mr-2 h-5 w-5" />,
  },
  {
    title: "Profile",
    url: "/dashboard/lawyer/profile",
    icon: <UserPen className="mr-2 h-5 w-5" />,
  },
];
