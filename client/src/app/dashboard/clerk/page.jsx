"use client";

import { useQuery } from "@tanstack/react-query";
import { clerkApi } from "@/lib/api/clerk";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Gavel, FileCheck, UserCheck, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ClerkDashboardPage() {
  const { data: result, isLoading } = useQuery({
    queryKey: ["clerkStats"],
    queryFn: clerkApi.getDashboardStats,
  });

  const stats = result?.stats || {};
  const recent = result?.recentActivity || [];

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
          <h2 className="text-3xl font-bold tracking-tight">Clerk Dashboard</h2>
          <p className="text-muted-foreground">
            Manage court submissions and assignments.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/clerk/cases">View Submitted Cases</Link>
        </Button>
      </div>

      {/* KPI CARDS */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Submission
            </CardTitle>
            <Gavel className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.submittedCases || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Cases waiting for registration
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Registered Cases
            </CardTitle>
            <FileCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.registeredCases || 0}
            </div>
            <p className="text-xs text-muted-foreground">Already processed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Available Officers
            </CardTitle>
            <UserCheck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.availableOfficers || 0}
            </div>
            <p className="text-xs text-muted-foreground">In your court</p>
          </CardContent>
        </Card>
      </div>

      {/* RECENT ACTIVITY */}
      <h3 className="text-lg font-semibold mt-8 mb-4">Recently Registered</h3>
      <div className="border rounded-md">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm text-left">
            <thead className="[&_tr]:border-b">
              <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">
                  Case Number
                </th>
                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">
                  Title
                </th>
                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">
                  Officer
                </th>
                <th className="h-12 px-4 align-middle font-medium text-muted-foreground">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {recent.map((item) => (
                <tr
                  key={item._id}
                  className="border-b transition-colors hover:bg-muted/50"
                >
                  <td className="p-4 align-middle font-medium">
                    {item.caseNumber}
                  </td>
                  <td className="p-4 align-middle">{item.title}</td>
                  <td className="p-4 align-middle">
                    {/* Only showing name if object populated, else Fallback */}
                    {/* Note: I populated courtOfficerId in backend */}
                    {/* Ideally courtOfficerId is an object now */}
                    {/* But if populate failed or simple ID, handle carefully */}
                    {item.courtOfficerId?.fullName || "Assigned"}
                  </td>
                  <td className="p-4 align-middle">
                    {new Date(item.registeredByClerkAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="p-4 text-center text-muted-foreground"
                  >
                    No recently registered cases.
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
