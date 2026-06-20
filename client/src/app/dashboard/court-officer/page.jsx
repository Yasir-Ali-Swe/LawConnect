"use client";

import { useQuery } from "@tanstack/react-query";
import { courtOfficerApi } from "@/lib/api/court-officer";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Briefcase, Gavel, CalendarClock, Clock } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CourtOfficerDashboardPage() {
  const { data: result, isLoading } = useQuery({
    queryKey: ["officerStats"],
    queryFn: courtOfficerApi.getDashboardStats,
  });

  const stats = result?.stats || {};
  const hearings = result?.upcomingHearings || [];

  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-6 py-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg lg:text-3xl font-bold tracking-tight">
            Court Officer Dashboard
          </h2>
          <p className="text-muted-foreground text-md">
            Manage case proceedings and hearings.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/court-officer/case">View All Cases</Link>
        </Button>
      </div>

      {/* KPI CARDS */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Assigned
            </CardTitle>
            <Briefcase className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAssigned || 0}</div>
            <p className="text-xs text-muted-foreground">Lifetime cases</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeCases || 0}</div>
            <p className="text-xs text-muted-foreground">Ongoing proceedings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Decided</CardTitle>
            <Gavel className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.decidedCases || 0}</div>
            <p className="text-xs text-muted-foreground">Judgments made</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingCases || 0}</div>
            <p className="text-xs text-muted-foreground">Unprocessed</p>
          </CardContent>
        </Card>
      </div>

      {/* UPCOMING HEARINGS */}
      <h3 className="text-lg font-semibold mt-8 mb-4">Upcoming Hearings</h3>
      <div className="border rounded-md">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm text-left">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">
                  Case
                </th>
                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">
                  Date
                </th>
                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">
                  Remarks
                </th>
                <th className="h-12 px-4 align-middle font-medium text-muted-foreground text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {hearings.map((item) => (
                <tr
                  key={item._id}
                  className="border-b transition-colors hover:bg-muted/50"
                >
                  <td className="p-4 align-middle font-medium max-w-[200px]">
                    <div className="flex flex-col min-w-0">
                      <span className="truncate" title={item.caseId?.title}>
                        {item.caseId?.title}
                      </span>
                      <span
                        className="text-xs text-muted-foreground truncate"
                        title={item.caseId?.caseNumber}
                      >
                        {item.caseId?.caseNumber}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 align-middle">
                    {format(new Date(item.date), "PPP - p")}
                  </td>
                  <td
                    className="p-4 align-middle truncate max-w-[200px]"
                    title={item.remarks}
                  >
                    {item.remarks}
                  </td>
                  <td className="p-4 align-middle text-right">
                    <Button asChild variant="outline" size="sm">
                      <Link
                        href={`/dashboard/court-officer/case/${item.caseId?._id}`}
                      >
                        Open Case
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
              {hearings.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="p-4 text-center text-muted-foreground"
                  >
                    No upcoming hearings found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
