import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Check,
  CheckCircle2,
  Bell,
  Gavel,
  Calendar,
  FileText,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { toast } from "sonner";

import { notificationsApi } from "@/lib/api/notifications";

export default function NotificationsPage({ role }) {
  // role prop for potential role-specific tweaks
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState(null);

  const {
    data: response,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["notifications", role || "default"],
    queryFn: notificationsApi.getAll,
  });

  const notifications = response?.data || [];

  const markReadMutation = useMutation({
    mutationFn: notificationsApi.markAsRead,
    onSuccess: (_, notificationId) => {
      queryClient.setQueryData(["notifications", role || "default"], (prev) => {
        if (!prev?.data) return prev;
        return {
          ...prev,
          data: prev.data.map((item) =>
            item._id === notificationId ? { ...item, isRead: true } : item,
          ),
        };
      });
      queryClient.invalidateQueries(["notifications", role || "default"]);
      queryClient.invalidateQueries(["unreadCount"]);
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => {
      toast.success("All notifications marked as read");
      queryClient.invalidateQueries(["notifications", role || "default"]);
      queryClient.invalidateQueries(["unreadCount"]);
    },
  });

  // Toggle expansion and mark as read if opening
  const handleNotificationClick = (n) => {
    const isExpanding = expandedId !== n._id;
    setExpandedId(isExpanding ? n._id : null);

    if (isExpanding && !n.isRead) {
      markReadMutation.mutate(n._id);
    }
  };

  if (isLoading)
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  if (isError)
    return <div className="p-8 text-red-500">Failed to load notifications</div>;

  // Helpers for Icons & Colors
  const getIcon = (type) => {
    switch (type) {
      case "hearing":
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case "judgment":
        return <Gavel className="h-5 w-5 text-purple-600" />;
      case "status":
        return <FileText className="h-5 w-5 text-orange-500" />;
      case "submission":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="container py-8 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            Updates on your cases and hearings.
          </p>
        </div>
        {notifications.some((n) => !n.isRead) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
          >
            <Check className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Bell className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p>No notifications yet.</p>
          </div>
        ) : (
          notifications.map((n) => {
            const isExpanded = expandedId === n._id;
            return (
              <div
                key={n._id}
                onClick={() => handleNotificationClick(n)}
                className="relative group block"
              >
                <Card
                  className={`transition-all hover:shadow-md cursor-pointer ${
                    !n.isRead ? "bg-primary/5 border-primary/20" : "opacity-90"
                  }`}
                >
                  <CardHeader className="flex flex-row items-start gap-4 pb-2">
                    <div
                      className={`p-2 rounded-full bg-background border shrink-0 ${
                        !n.isRead ? "shadow-sm" : ""
                      }`}
                    >
                      {getIcon(n.type)}
                    </div>
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <CardTitle className="text-base flex items-center gap-2 wrap-break-word">
                          {n.title}
                          {!n.isRead && (
                            <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                          )}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-muted-foreground shrink-0">
                          <span className="text-xs">
                            {format(new Date(n.createdAt), "PP p")}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </div>
                      </div>
                      <CardDescription className="wrap-break-word ">
                        Case:{" "}
                        <span className="font-medium text-foreground">
                          {n.caseId?.caseNumber || "Unknown"}
                        </span>
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="pl-18 pr-4 pt-0">
                    {/* Collapsed/Expanded Message */}
                    <div
                      className={`text-sm text-foreground/80 wrap-break-word  ${
                        isExpanded
                          ? "whitespace-pre-wrap"
                          : "line-clamp-2 overflow-hidden text-ellipsis"
                      }`}
                    >
                      {n.message}
                    </div>

                    {/* Metadata & Actions - ONLY visible when expanded */}
                    {isExpanded && (
                      <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                        {n.metadata && (
                          <div className="text-xs bg-background/50 p-3 rounded border inline-block max-w-full mb-4">
                            {n.metadata.hearingDate && (
                              <div className="flex gap-2">
                                <span className="font-semibold">
                                  Hearing Date:
                                </span>{" "}
                                {format(
                                  new Date(n.metadata.hearingDate),
                                  "PPP",
                                )}
                              </div>
                            )}
                            {n.metadata.updatedReason && (
                              <div className="flex gap-2 mt-1 wrap-break-word whitespace-pre-wrap">
                                <span className="font-semibold">Reason:</span>{" "}
                                {n.metadata.updatedReason}
                              </div>
                            )}
                            {n.metadata.status && (
                              <Badge variant="outline" className="mt-2">
                                {n.metadata.status.toUpperCase()}
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* View Case Details Button */}
                        <div className="flex justify-start">
                          <Button
                            variant="secondary"
                            size="sm"
                            asChild
                            className="text-xs"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Link
                              href={
                                n.role === "lawyer"
                                  ? `/dashboard/lawyer/cases/${
                                      n.caseId?._id || n.caseId
                                    }`
                                  : `/dashboard/client/cases/${
                                      n.caseId?._id || n.caseId
                                    }`
                              }
                            >
                              View Case Details
                            </Link>
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
