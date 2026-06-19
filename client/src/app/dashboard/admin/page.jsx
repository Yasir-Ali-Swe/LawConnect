"use client";

import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api/admin";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Users,
  Building2,
  UserCog,
  UserCheck,
  Activity,
  PlusCircle,
  AlertCircle,
  CheckCircle2,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export default function AdminDashboardPage() {
  const { data: result, isLoading } = useQuery({
    queryKey: ["adminDashboardStats"],
    queryFn: adminApi.getDashboardStats,
  });

  const stats = result?.stats || {};
  const recent = result?.recentActivity || {};
  const charts = result?.charts || {};

  if (isLoading) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading dashboard insights...
      </div>
    );
  }

  return (
    <div className="space-y-8 py-6 max-w-7xl mx-auto w-full pb-12">
      {/* HERADER */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
          <p className="text-muted-foreground">
            Overview of system performance and resources.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard/admin/courts">
              <Building2 className="mr-2 h-4 w-4" /> View Courts
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/admin/users">
              <PlusCircle className="mr-2 h-4 w-4" /> Manage Users
            </Link>
          </Button>
        </div>
      </div>

      {/* 1. KPI CARDS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courts</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourts || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats.courtsWithoutClerk > 0
                ? `${stats.courtsWithoutClerk} unassigned`
                : "All assigned"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clerks</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClerks || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active registry staff
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Court Officers
            </CardTitle>
            <UserCog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOfficers || 0}</div>
            <p className="text-xs text-muted-foreground">Security & support</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {stats.courtsWithoutClerk > 0 ? (
                <span className="text-red-500 font-bold flex items-center text-sm">
                  <AlertCircle className="w-4 h-4 mr-1" /> Action Needed
                </span>
              ) : (
                <span className="text-green-600 font-bold flex items-center text-sm">
                  <CheckCircle2 className="w-4 h-4 mr-1" /> Healthy
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.courtsWithoutOfficers} courts w/o officers
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* 2. RECENT ACTIVITY & CHARTS */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Simple Chart: Courts by Province */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">
                Courts by Province
              </h4>
              <div className="space-y-3">
                {charts.courtsByProvince?.map((item) => (
                  <div key={item._id} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{item._id}</span>
                      <span className="font-bold">{item.count}</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{
                          width: `${(item.count / stats.totalCourts) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
                {charts.courtsByProvince?.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">
                    No courts available for visualization.
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {/* Recent Users */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-4">
                Recently Added Staff
              </h4>
              <div className="space-y-4">
                {recent.recentUsers?.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-9 w-9 rounded-full flex items-center justify-center ${user.role === "clerk" ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"}`}
                      >
                        {user.role === "clerk" ? (
                          <UserCheck className="h-5 w-5" />
                        ) : (
                          <UserCog className="h-5 w-5" />
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {user.fullName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={user.role === "clerk" ? "default" : "secondary"}
                    >
                      {user.role === "clerk" ? "Clerk" : "Officer"}
                    </Badge>
                  </div>
                ))}
                {recent.recentUsers?.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">
                    No recent users.
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. RECENT ACTIVITY (COURTS) */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Recent Courts</CardTitle>
            <CardDescription>
              Latest registered judicial entities.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[350px] pr-4">
              <div className="space-y-6">
                {recent.recentCourts?.map((court) => (
                  <div key={court._id} className="flex items-start space-x-4">
                    <div className="mt-1 bg-primary/10 p-2 rounded-full">
                      <Briefcase className="h-4 w-4 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {court.name}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1 py-0"
                        >
                          {court.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {court.city}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground pt-1">
                        Created {new Date(court.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                {recent.recentCourts?.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">
                    No courts created yet.
                  </p>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
