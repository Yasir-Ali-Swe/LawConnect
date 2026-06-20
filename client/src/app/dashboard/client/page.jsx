"use client";

import { useQuery } from "@tanstack/react-query";
import { clientApi } from "@/lib/api/client";
import { useSelector } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HandHelping, Gavel, MessageCircle, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ClientDashboardPage() {
  const { user } = useSelector((state) => state.auth);

  const { data: proposalsResult, isLoading: loadingProposals } = useQuery({
    queryKey: ["clientProposals"],
    queryFn: () => clientApi.getProposals(),
  });

  const { data: casesResult, isLoading: loadingCases } = useQuery({
    queryKey: ["clientCases"],
    queryFn: () => clientApi.getCases(),
  });

  const proposals = proposalsResult?.data || [];
  const cases = casesResult?.data || [];

  const pendingProposals = proposals.filter(
    (p) => p.status === "pending",
  ).length;
  const acceptedProposals = proposals.filter(
    (p) => p.status === "accepted",
  ).length;
  const activeCases = cases.filter((c) => c.status === "active").length;

  return (
    <div className="space-y-6 py-6 max-w-7xl mx-auto w-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.fullName?.split(" ")[0]}!
          </h2>
          <p className="text-muted-foreground">
            Here is an overview of your legal matters.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Active Cases"
          value={loadingCases ? "..." : activeCases}
          icon={Gavel}
          description="Ongoing legal cases"
        />
        <StatsCard
          title="Pending Proposals"
          value={loadingProposals ? "..." : pendingProposals}
          icon={Clock}
          description="Waiting for lawyer response"
        />
        <StatsCard
          title="Accepted Proposals"
          value={loadingProposals ? "..." : acceptedProposals}
          icon={HandHelping}
          description="Engagements confirmed"
        />
        <StatsCard
          title="Total Proposals"
          value={loadingProposals ? "..." : proposals.length}
          icon={MessageCircle}
          description="Total requests sent"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Recent Proposals</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingProposals ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : proposals.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No recent activity.
              </p>
            ) : (
              <div className="space-y-4">
                {proposals.slice(0, 5).map((p) => (
                  <div
                    key={p._id}
                    className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0"
                  >
                    <div className="min-w-0 flex-1 mr-2">
                      <p
                        className="font-medium text-sm truncate"
                        title={p.title}
                      >
                        {p.title}
                      </p>
                      <p
                        className="text-xs text-muted-foreground truncate"
                        title={p.lawyerId?.fullName}
                      >
                        To: {p.lawyerId?.fullName || "Lawyer"}
                      </p>
                    </div>
                    <div
                      className={`px-2 py-1 rounded text-xs font-medium capitalize 
                                    ${
                                      p.status === "accepted"
                                        ? "bg-green-100 text-green-700"
                                        : p.status === "rejected"
                                          ? "bg-red-100 text-red-700"
                                          : "bg-yellow-100 text-yellow-700"
                                    }`}
                    >
                      {p.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Active Cases</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingCases ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : cases.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active cases.</p>
            ) : (
              <div className="space-y-4">
                {cases.slice(0, 5).map((c) => (
                  <div
                    key={c._id}
                    className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium text-sm truncate max-w-37.5">
                        {c.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {c.caseNumber || "Processing..."}
                      </p>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {c.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatsCard({ title, value, icon: Icon, description }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
