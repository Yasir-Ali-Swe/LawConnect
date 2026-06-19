"use client";

import { useQuery } from "@tanstack/react-query";
import { lawyerApi } from "@/lib/api/lawyer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, Calendar, Gavel, Scale, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// import { dummyDashboardStats } from "@/lib/dummy-data/lawyerDashboard";

export default function LawyerDashboardPage() {
  const {
    data: stats,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["lawyerStats"],
    queryFn: lawyerApi.getStats,
    retry: false,
  });

  if (isLoading) {
    return <div className="p-8">Loading dashboard stats...</div>;
  }

  const statsData = stats?.data || {};

  const {
    totalCases = 0,
    activeCases = 0,
    upcomingHearings = 0,
    pendingJudgments = 0,
    recentActivity = [],
  } = statsData;

  return (
    <div className="space-y-6 py-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">
          Dashboard Overview
        </h2>
        <Button asChild>
          <Link href="/dashboard/lawyer/cases">View All Cases</Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCases}</div>
            <p className="text-xs text-muted-foreground">Assigned to you</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCases}</div>
            <p className="text-xs text-muted-foreground">
              Currently in progress
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Upcoming Hearings
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{upcomingHearings}</div>
            <p className="text-xs text-muted-foreground">Scheduled soon</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Judgments
            </CardTitle>
            <Gavel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingJudgments}</div>
            <p className="text-xs text-muted-foreground">Awaiting decision</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity && recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((item) => (
                  <div key={item._id} className="flex items-center">
                    <Clock className="mr-4 h-4 w-4 text-muted-foreground" />
                    <div className="space-y-1 min-w-0 flex-1">
                      <p
                        className="text-sm font-medium leading-none truncate"
                        title={item.title}
                      >
                        {item.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {item.caseNumber || "Draft Case"}
                      </p>
                    </div>
                    <div className="ml-auto font-medium text-xs capitalize">
                      {item.status}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No recent activity.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Placeholder for future widgets or messages */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/dashboard/lawyer/messages">Messages</Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link href="/dashboard/lawyer/proposals">Client Proposals</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
