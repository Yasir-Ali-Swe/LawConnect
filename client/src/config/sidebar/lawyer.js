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
    icon: LayoutDashboard,
    exact: true,
  },
  {
    title: "Proposals",
    url: "/dashboard/lawyer/proposals",
    icon: FileText,
  },
  {
    title: "Cases",
    url: "/dashboard/lawyer/cases",
    icon: Briefcase,
  },
  {
    title: "Messages",
    url: "/dashboard/lawyer/messages",
    icon: MessageCircle,
  },
  {
    title: "Notifications",
    url: "/dashboard/lawyer/notifications",
    icon: Bell,
  },
  {
    title: "Profile",
    url: "/dashboard/lawyer/profile",
    icon: UserPen,
  },
];
