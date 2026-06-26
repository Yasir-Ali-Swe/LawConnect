"use client";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { clearUser } from "@/store/slices/auth-slice";
import { authApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import { LogOut, Scale } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { messagesApi } from "@/lib/api/messages";
import { toast } from "sonner";
import { useSocket } from "@/providers/socket-provider";
import { SOCKET_EVENTS } from "@/lib/socket/socket-events";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
} from "./ui/sidebar";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { getSidebarItemsByRole } from "@/lib/sidbar";

const DashboardSidebar = () => {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { socket } = useSocket();
  const { role, user } = useSelector((state) => state.auth);

  const canShowMessageIndicator = role === "client" || role === "lawyer";

  const { data: conversationResult } = useQuery({
    queryKey: ["conversations"],
    queryFn: messagesApi.getConversations,
    enabled: !!user && canShowMessageIndicator,
    retry: false,
    refetchInterval: 15000,
  });

  const unreadCount =
    conversationResult?.data?.reduce(
      (total, conversation) => total + (conversation.unreadCount || 0),
      0,
    ) || 0;

  useEffect(() => {
    if (!socket || !canShowMessageIndicator) return;

    const refreshConversations = () => {
      queryClient.invalidateQueries(["conversations"]);
    };

    socket.on(SOCKET_EVENTS.MESSAGE_RECEIVE, refreshConversations);
    return () => {
      socket.off(SOCKET_EVENTS.MESSAGE_RECEIVE, refreshConversations);
    };
  }, [socket, canShowMessageIndicator, queryClient]);

  // Guard against null role during initial load, though AuthGuard should handle this locally if wrapped.
  const currentRole = role || "";
  const links = getSidebarItemsByRole(currentRole);

  const handleLogout = async () => {
    try {
      await authApi.logout();
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Logout failed, but clearing session");
    } finally {
      // Always clear local session, even if API call fails
      dispatch(clearUser());
      router.push("/login");
    }
  };

  return (
    <Sidebar className="bg-sidebar text-sidebar-foreground border-0" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/home">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary">
                  <Scale className="size-4" />
                </div>

                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    LawConnect
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    Legal Platform
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className={"border-0"}>
        <SidebarGroup>
          <SidebarGroupLabel>
            {currentRole.charAt(0).toUpperCase() + currentRole.slice(1)}{" "}
            Dashboard
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {links.map((item) => {
                const isActive = item.exact
                  ? pathname === item.url
                  : pathname.startsWith(item.url);

                const showRedDot =
                  canShowMessageIndicator &&
                  item.title === "Messages" &&
                  unreadCount > 0;

                return (

                  <SidebarMenuItem key={item.title} className="my-2">

                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                      className="h-11"
                    >

                      <Link
                        href={item.url}
                        className="flex w-full items-center justify-between"
                      >
                        <div className="flex items-center justify-center gap-2">
                          {item.icon}
                          <span>{item.title}</span>
                        </div>

                        {showRedDot && (
                          <span className="group-data-[collapsible=icon]:hidden h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Logout"
              onClick={handleLogout}
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default DashboardSidebar;


// rounded-full [&>svg]:size-5