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
    icon: <LayoutDashboard className="mr-2 h-5 w-5" />,
    exact: true,
  },
  {
    title: "Cases",
    url: "/dashboard/client/cases",
    icon: <Gavel className="mr-2 h-5 w-5" />,
  },
  {
    title: "Proposals",
    url: "/dashboard/client/proposals",
    icon: <HandHelping className="mr-2 h-5 w-5" />,
  },
  {
    title: "Messages",
    url: "/dashboard/client/messages",
    icon: <MessageCircle className="mr-2 h-5 w-5" />,
  },
  {
    title: "Notifications",
    url: "/dashboard/client/notifications",
    icon: <Bell className="mr-2 h-5 w-5" />,
  },
  {
    title: "Profile",
    url: "/dashboard/client/profile",
    icon: <UserPen className="mr-2 h-5 w-5" />,
  },
];
