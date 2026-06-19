import {
  LayoutDashboard,
  HandHelping,
  UserPen,
  MessageCircle,
  Gavel,
  Bell,
} from "lucide-react";

export const clientSidebarItems = [
  {
    title: "Dashboard",
    url: "/dashboard/client",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    title: "Cases",
    url: "/dashboard/client/cases",
    icon: Gavel,
  },
  {
    title: "Proposals",
    url: "/dashboard/client/proposals",
    icon: HandHelping,
  },
  {
    title: "Messages",
    url: "/dashboard/client/messages",
    icon: MessageCircle,
  },
  {
    title: "Notifications",
    url: "/dashboard/client/notifications",
    icon: Bell,
  },
  {
    title: "Profile",
    url: "/dashboard/client/profile",
    icon: UserPen,
  },
];
