// import { useState } from "react";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { format } from "date-fns";
// import {
//   Check,
//   CheckCircle2,
//   Bell,
//   Gavel,
//   Calendar,
//   FileText,
//   Loader2,
//   ChevronDown,
//   ChevronUp,
// } from "lucide-react";
// import { Badge } from "@/components/ui/badge";
// import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import Link from "next/link";
// import { toast } from "sonner";

// import { notificationsApi } from "@/lib/api/notifications";

// export default function NotificationsPage({ role }) {
//   // role prop for potential role-specific tweaks
//   const queryClient = useQueryClient();
//   const [expandedId, setExpandedId] = useState(null);

//   const {
//     data: response,
//     isLoading,
//     isError,
//   } = useQuery({
//     queryKey: ["notifications", role || "default"],
//     queryFn: notificationsApi.getAll,
//   });

//   const notifications = response?.data || [];

//   const markReadMutation = useMutation({
//     mutationFn: notificationsApi.markAsRead,
//     onSuccess: (_, notificationId) => {
//       queryClient.setQueryData(["notifications", role || "default"], (prev) => {
//         if (!prev?.data) return prev;
//         return {
//           ...prev,
//           data: prev.data.map((item) =>
//             item._id === notificationId ? { ...item, isRead: true } : item,
//           ),
//         };
//       });
//       queryClient.invalidateQueries(["notifications", role || "default"]);
//       queryClient.invalidateQueries(["unreadCount"]);
//     },
//   });

//   const markAllReadMutation = useMutation({
//     mutationFn: notificationsApi.markAllRead,
//     onSuccess: () => {
//       toast.success("All notifications marked as read");
//       queryClient.invalidateQueries(["notifications", role || "default"]);
//       queryClient.invalidateQueries(["unreadCount"]);
//     },
//   });

//   // Toggle expansion and mark as read if opening
//   const handleNotificationClick = (n) => {
//     const isExpanding = expandedId !== n._id;
//     setExpandedId(isExpanding ? n._id : null);

//     if (isExpanding && !n.isRead) {
//       markReadMutation.mutate(n._id);
//     }
//   };

//   if (isLoading)
//     return (
//       <div className="p-8 flex justify-center">
//         <Loader2 className="animate-spin" />
//       </div>
//     );
//   if (isError)
//     return <div className="p-8 text-red-500">Failed to load notifications</div>;

//   // Helpers for Icons & Colors
//   const getIcon = (type) => {
//     switch (type) {
//       case "hearing":
//         return <Calendar className="h-5 w-5 text-blue-500" />;
//       case "judgment":
//         return <Gavel className="h-5 w-5 text-purple-600" />;
//       case "status":
//         return <FileText className="h-5 w-5 text-orange-500" />;
//       case "submission":
//         return <CheckCircle2 className="h-5 w-5 text-green-500" />;
//       default:
//         return <Bell className="h-5 w-5 text-gray-500" />;
//     }
//   };

//   return (
//     <div className="container py-8 max-w-4xl mx-auto space-y-6">
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
//           <p className="text-muted-foreground">
//             Updates on your cases and hearings.
//           </p>
//         </div>
//         {notifications.some((n) => !n.isRead) && (
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={() => markAllReadMutation.mutate()}
//             disabled={markAllReadMutation.isPending}
//           >
//             <Check className="mr-2 h-4 w-4" />
//             Mark all as read
//           </Button>
//         )}
//       </div>

//       <div className="space-y-4">
//         {notifications.length === 0 ? (
//           <div className="text-center py-12 text-muted-foreground">
//             <Bell className="h-10 w-10 mx-auto mb-3 opacity-20" />
//             <p>No notifications yet.</p>
//           </div>
//         ) : (
//           notifications.map((n) => {
//             const isExpanded = expandedId === n._id;
//             return (
//               <div
//                 key={n._id}
//                 onClick={() => handleNotificationClick(n)}
//                 className="relative group block"
//               >
//                 <Card
//                   className={`transition-all hover:shadow-md cursor-pointer ${
//                     !n.isRead ? "bg-primary/5 border-primary/20" : "opacity-90"
//                   }`}
//                 >
//                   <CardHeader className="flex flex-row items-start gap-4 pb-2">
//                     <div
//                       className={`p-2 rounded-full bg-background border shrink-0 ${
//                         !n.isRead ? "shadow-sm" : ""
//                       }`}
//                     >
//                       {getIcon(n.type)}
//                     </div>
//                     <div className="space-y-1 flex-1 min-w-0">
//                       <div className="flex justify-between items-start gap-2">
//                         <CardTitle className="text-base flex items-center gap-2 wrap-break-word">
//                           {n.title}
//                           {!n.isRead && (
//                             <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse shrink-0" />
//                           )}
//                         </CardTitle>
//                         <div className="flex items-center gap-2 text-muted-foreground shrink-0">
//                           <span className="text-xs">
//                             {format(new Date(n.createdAt), "PP p")}
//                           </span>
//                           {isExpanded ? (
//                             <ChevronUp className="h-4 w-4" />
//                           ) : (
//                             <ChevronDown className="h-4 w-4" />
//                           )}
//                         </div>
//                       </div>
//                       <CardDescription className="wrap-break-word ">
//                         Case:{" "}
//                         <span className="font-medium text-foreground">
//                           {n.caseId?.caseNumber || "Unknown"}
//                         </span>
//                       </CardDescription>
//                     </div>
//                   </CardHeader>
//                   <CardContent className="pl-18 pr-4 pt-0">
//                     {/* Collapsed/Expanded Message */}
//                     <div
//                       className={`text-sm text-foreground/80 wrap-break-word  ${
//                         isExpanded
//                           ? "whitespace-pre-wrap"
//                           : "line-clamp-2 overflow-hidden text-ellipsis"
//                       }`}
//                     >
//                       {n.message}
//                     </div>

//                     {/* Metadata & Actions - ONLY visible when expanded */}
//                     {isExpanded && (
//                       <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
//                         {n.metadata && (
//                           <div className="text-xs bg-background/50 p-3 rounded border inline-block max-w-full mb-4">
//                             {n.metadata.hearingDate && (
//                               <div className="flex gap-2">
//                                 <span className="font-semibold">
//                                   Hearing Date:
//                                 </span>{" "}
//                                 {format(
//                                   new Date(n.metadata.hearingDate),
//                                   "PPP",
//                                 )}
//                               </div>
//                             )}
//                             {n.metadata.updatedReason && (
//                               <div className="flex gap-2 mt-1 wrap-break-word whitespace-pre-wrap">
//                                 <span className="font-semibold">Reason:</span>{" "}
//                                 {n.metadata.updatedReason}
//                               </div>
//                             )}
//                             {n.metadata.status && (
//                               <Badge variant="outline" className="mt-2">
//                                 {n.metadata.status.toUpperCase()}
//                               </Badge>
//                             )}
//                           </div>
//                         )}

//                         {/* View Case Details Button */}
//                         <div className="flex justify-start">
//                           <Button
//                             variant="secondary"
//                             size="sm"
//                             asChild
//                             className="text-xs"
//                             onClick={(e) => e.stopPropagation()}
//                           >
//                             <Link
//                               href={
//                                 n.role === "lawyer"
//                                   ? `/dashboard/lawyer/cases/${
//                                       n.caseId?._id || n.caseId
//                                     }`
//                                   : `/dashboard/client/cases/${
//                                       n.caseId?._id || n.caseId
//                                     }`
//                               }
//                             >
//                               View Case Details
//                             </Link>
//                           </Button>
//                         </div>
//                       </div>
//                     )}
//                   </CardContent>
//                 </Card>
//               </div>
//             );
//           })
//         )}
//       </div>
//     </div>
//   );
// }

"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, isToday, isYesterday } from "date-fns";
import {
  Check,
  CheckCircle2,
  Bell,
  Gavel,
  Calendar,
  FileText,
  UserPlus,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { toast } from "sonner";

import { notificationsApi } from "@/lib/api/notifications";

// ---------------------------------------------------------------------------
// Static lookup tables (kept outside the component so they aren't rebuilt
// on every render)
// ---------------------------------------------------------------------------

const TYPE_META = {
  hearing: {
    label: "Hearing",
    icon: Calendar,
    classes: "bg-blue-50 text-blue-600 border-blue-200",
  },
  judgment: {
    label: "Judgment",
    icon: Gavel,
    classes: "bg-purple-50 text-purple-600 border-purple-200",
  },
  status: {
    label: "Status",
    icon: FileText,
    classes: "bg-orange-50 text-orange-600 border-orange-200",
  },
  submission: {
    label: "Submission",
    icon: CheckCircle2,
    classes: "bg-green-50 text-green-600 border-green-200",
  },
  assignment: {
    label: "Assignment",
    icon: UserPlus,
    classes: "bg-cyan-50 text-cyan-600 border-cyan-200",
  },
  default: {
    label: "Update",
    icon: Bell,
    classes: "bg-gray-50 text-gray-600 border-gray-200",
  },
};

const FILTERS = [
  { value: "all", label: "All" },
  { value: "hearing", label: "Hearings" },
  { value: "judgment", label: "Judgments" },
  { value: "status", label: "Status" },
  { value: "submission", label: "Submissions" },
  { value: "assignment", label: "Assignments" },
];

function getTypeMeta(type) {
  return TYPE_META[type] || TYPE_META.default;
}

// Groups a flat, already-sorted (newest first) notification list into
// Today / Yesterday / Earlier buckets for easier scanning.
function groupByDate(notifications) {
  const groups = { Today: [], Yesterday: [], Earlier: [] };
  for (const n of notifications) {
    const d = new Date(n.createdAt);
    if (isToday(d)) groups.Today.push(n);
    else if (isYesterday(d)) groups.Yesterday.push(n);
    else groups.Earlier.push(n);
  }
  return Object.entries(groups).filter(([, items]) => items.length > 0);
}

export default function NotificationsPage({ role }) {
  const queryClient = useQueryClient();
  const [expandedId, setExpandedId] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");

  const {
    data: response,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["notifications", role || "default"],
    queryFn: notificationsApi.getAll,
  });

  const notifications = response?.data || [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const filtered = useMemo(() => {
    if (activeFilter === "all") return notifications;
    return notifications.filter((n) => n.type === activeFilter);
  }, [notifications, activeFilter]);

  const grouped = useMemo(() => groupByDate(filtered), [filtered]);

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

  const handleNotificationClick = (n) => {
    const isExpanding = expandedId !== n._id;
    setExpandedId(isExpanding ? n._id : null);
    if (isExpanding && !n.isRead) {
      markReadMutation.mutate(n._id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16 sm:py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:py-24">
        <p className="text-sm font-medium text-red-600">
          Couldn&apos;t load notifications
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Check your connection and try again.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-5 px-3 py-5 sm:space-y-6 sm:px-4 sm:py-8">
      {/* ---------------------------------------------------------------- */}
      {/* Header                                                          */}
      {/* ---------------------------------------------------------------- */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl lg:text-3xl">
            Notifications
          </h1>
          {unreadCount > 0 && (
            <Badge className="h-5 shrink-0 rounded-full bg-primary px-2 text-[11px] leading-none">
              {unreadCount} new
            </Badge>
          )}
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
            className="w-full shrink-0 sm:w-auto"
          >
            {markAllReadMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Check className="mr-2 h-4 w-4" />
            )}
            Mark all as read
          </Button>
        )}
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Filter chips — scrollable on small screens, static on larger     */}
      {/* ---------------------------------------------------------------- */}
      {notifications.length > 0 && (
        <div className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-1 scrollbar-hide sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
          {FILTERS.map((f) => {
            const count =
              f.value === "all"
                ? notifications.length
                : notifications.filter((n) => n.type === f.value).length;
            if (f.value !== "all" && count === 0) return null;
            const isActive = activeFilter === f.value;
            return (
              <button
                key={f.value}
                onClick={() => setActiveFilter(f.value)}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm ${
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:bg-muted"
                }`}
              >
                {f.label}
                <span
                  className={`ml-1.5 ${isActive ? "text-primary-foreground/80" : "text-muted-foreground/70"}`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* ---------------------------------------------------------------- */}
      {/* List                                                             */}
      {/* ---------------------------------------------------------------- */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center text-muted-foreground sm:py-24">
          <Bell className="mb-3 h-9 w-9 opacity-20" />
          <p className="text-sm font-medium">
            {notifications.length === 0
              ? "No notifications yet"
              : "Nothing in this filter"}
          </p>
          <p className="mt-1 max-w-xs text-xs">
            {notifications.length === 0
              ? "Updates about hearings, judgments, and case status will show up here."
              : "Try a different filter to see your other notifications."}
          </p>
        </div>
      ) : (
        <div className="space-y-6 sm:space-y-8">
          {grouped.map(([label, items]) => (
            <div key={label} className="space-y-2.5 sm:space-y-3">
              <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {label}
              </h2>
              <div className="space-y-2 sm:space-y-2.5">
                {items.map((n) => (
                  <NotificationCard
                    key={n._id}
                    notification={n}
                    isExpanded={expandedId === n._id}
                    onToggle={() => handleNotificationClick(n)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Single notification card
// ---------------------------------------------------------------------------

function NotificationCard({ notification: n, isExpanded, onToggle }) {
  const meta = getTypeMeta(n.type);
  const Icon = meta.icon;
  const createdAt = new Date(n.createdAt);

  const caseHref =
    n.role === "lawyer"
      ? `/dashboard/lawyer/cases/${n.caseId?._id || n.caseId}`
      : `/dashboard/client/cases/${n.caseId?._id || n.caseId}`;

  return (
    <Card
      onClick={onToggle}
      className={`relative cursor-pointer overflow-hidden py-0 transition-shadow hover:shadow-sm ${
        !n.isRead ? "bg-primary/[0.03]" : ""
      }`}
    >
      {/* Unread accent bar */}
      {!n.isRead && (
        <span
          className="absolute inset-y-0 left-0 w-1 bg-primary"
          aria-hidden="true"
        />
      )}

      <div className="flex gap-3 p-3 pl-4 sm:gap-4 sm:p-4 sm:pl-5">
        {/* Icon chip */}
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border sm:h-10 sm:w-10 ${meta.classes}`}
        >
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>

        {/* Body */}
        <div className="min-w-0 flex-1 space-y-1">
          {/* Title row */}
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="min-w-0 break-words text-sm font-semibold leading-snug sm:text-base">
              {n.title}
            </CardTitle>
            <ChevronDown
              className={`mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </div>

          {/* Meta row: case number + timestamp */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <span className="truncate">
              Case{" "}
              <span className="font-medium text-foreground">
                {n.caseId?.caseNumber || "Unknown"}
              </span>
            </span>
            <span className="text-muted-foreground/40">•</span>
            {/* full timestamp on sm+, short relative-ish date on xs */}
            <span className="hidden sm:inline">
              {format(createdAt, "PP · p")}
            </span>
            <span className="sm:hidden">{format(createdAt, "MMM d, p")}</span>
          </div>

          {/* Message preview / full message */}
          <CardDescription
            className={`text-sm leading-relaxed text-foreground/80 ${
              isExpanded ? "whitespace-pre-wrap" : "line-clamp-2"
            }`}
          >
            {n.message}
          </CardDescription>

          {/* Expanded content */}
          {isExpanded && (
            <div
              className="animate-in fade-in slide-in-from-top-1 space-y-3 pt-2 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              {n.metadata &&
                (n.metadata.hearingDate ||
                  n.metadata.updatedReason ||
                  n.metadata.status) && (
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-2 rounded-md border bg-muted/30 p-3 text-xs sm:grid-cols-2 sm:text-sm">
                    {n.metadata.hearingDate && (
                      <div className="space-y-0.5">
                        <dt className="font-medium text-muted-foreground">
                          Hearing date
                        </dt>
                        <dd className="text-foreground">
                          {format(new Date(n.metadata.hearingDate), "PPP")}
                        </dd>
                      </div>
                    )}
                    {n.metadata.status && (
                      <div className="space-y-0.5">
                        <dt className="font-medium text-muted-foreground">
                          Status
                        </dt>
                        <dd>
                          <Badge variant="outline" className="text-xs">
                            {n.metadata.status.toUpperCase()}
                          </Badge>
                        </dd>
                      </div>
                    )}
                    {n.metadata.updatedReason && (
                      <div className="col-span-full space-y-0.5">
                        <dt className="font-medium text-muted-foreground">
                          Reason
                        </dt>
                        <dd className="whitespace-pre-wrap text-foreground">
                          {n.metadata.updatedReason}
                        </dd>
                      </div>
                    )}
                  </dl>
                )}

              <Button variant="secondary" size="sm" asChild className="text-xs">
                <Link href={caseHref}>View case details</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
